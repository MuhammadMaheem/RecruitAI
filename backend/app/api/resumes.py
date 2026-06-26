import json
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlmodel import Session, select
from app.models.candidate import Candidate
from app.storage.database import get_session
from app.services.pdf_processor import extract_text_from_pdf, validate_pdf
from app.services.ai_extractor import extract_resume_info
from app.services.vector_store import index_candidate_skills
from app.config import UPLOAD_PATH

router = APIRouter(prefix="/api/resumes", tags=["resumes"])


@router.post("/upload")
async def upload_resumes(
    files: list[UploadFile] = File(...),
    session: Session = Depends(get_session)
):
    results = []
    for file in files:
        if not file.filename.endswith(".pdf"):
            results.append({"filename": file.filename, "error": "Only PDF files allowed"})
            continue

        save_path = UPLOAD_PATH / file.filename
        with open(save_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        if not validate_pdf(save_path):
            save_path.unlink(missing_ok=True)
            results.append({"filename": file.filename, "error": "Invalid PDF"})
            continue

        try:
            raw_text = extract_text_from_pdf(save_path)
            info = extract_resume_info(raw_text)

            candidate = Candidate(
                filename=file.filename,
                name=info.get("name", ""),
                email=info.get("email", ""),
                phone=info.get("phone", ""),
                skills=json.dumps(info.get("skills", [])),
                education=json.dumps(info.get("education", [])),
                work_experience=json.dumps(info.get("work_experience", [])),
                certifications=json.dumps(info.get("certifications", [])),
                projects=json.dumps(info.get("projects", [])),
                summary=info.get("summary", ""),
                raw_text=raw_text[:10000],
            )
            session.add(candidate)
            session.commit()
            session.refresh(candidate)

            try:
                index_candidate_skills(candidate.id, info.get("skills", []))
            except Exception:
                pass

            results.append({
                "filename": file.filename,
                "candidate_id": candidate.id,
                "name": candidate.name,
                "status": "success"
            })
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})

    return {"results": results, "total": len(results)}


@router.get("/")
def list_candidates(session: Session = Depends(get_session)):
    candidates = session.exec(select(Candidate)).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "filename": c.filename,
            "skills": c.get_skills(),
            "summary": c.summary,
            "created_at": c.created_at.isoformat(),
        }
        for c in candidates
    ]


@router.get("/{candidate_id}")
def get_candidate(candidate_id: int, session: Session = Depends(get_session)):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {
        "id": candidate.id,
        "name": candidate.name,
        "email": candidate.email,
        "phone": candidate.phone,
        "filename": candidate.filename,
        "skills": candidate.get_skills(),
        "education": candidate.get_education(),
        "work_experience": candidate.get_work_experience(),
        "certifications": candidate.get_certifications(),
        "projects": candidate.get_projects(),
        "summary": candidate.summary,
        "created_at": candidate.created_at.isoformat(),
    }


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, session: Session = Depends(get_session)):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    pdf_path = UPLOAD_PATH / candidate.filename
    pdf_path.unlink(missing_ok=True)
    session.delete(candidate)
    session.commit()
    return {"message": "Candidate deleted"}
