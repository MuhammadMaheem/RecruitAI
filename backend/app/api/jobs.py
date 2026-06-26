import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session, select
from app.models.job import Job
from app.storage.database import get_session
from app.services.ai_extractor import extract_job_requirements

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


class JobCreate(BaseModel):
    title: str
    description: str


@router.post("/")
def create_job(payload: JobCreate, session: Session = Depends(get_session)):
    requirements = extract_job_requirements(payload.description)
    job = Job(
        title=payload.title,
        description=payload.description,
        required_skills=json.dumps(requirements.get("required_skills", [])),
        preferred_skills=json.dumps(requirements.get("preferred_skills", [])),
        min_experience_years=float(requirements.get("min_experience_years", 0)),
        required_education=requirements.get("required_education", ""),
        keywords=json.dumps(requirements.get("keywords", [])),
    )
    session.add(job)
    session.commit()
    session.refresh(job)
    return {
        "id": job.id,
        "title": job.title,
        "required_skills": job.get_required_skills(),
        "preferred_skills": job.get_preferred_skills(),
        "min_experience_years": job.min_experience_years,
        "required_education": job.required_education,
        "keywords": job.get_keywords(),
        "created_at": job.created_at.isoformat(),
    }


@router.get("/")
def list_jobs(session: Session = Depends(get_session)):
    jobs = session.exec(select(Job)).all()
    return [
        {
            "id": j.id,
            "title": j.title,
            "required_skills": j.get_required_skills(),
            "min_experience_years": j.min_experience_years,
            "created_at": j.created_at.isoformat(),
        }
        for j in jobs
    ]


@router.get("/{job_id}")
def get_job(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "required_skills": job.get_required_skills(),
        "preferred_skills": job.get_preferred_skills(),
        "min_experience_years": job.min_experience_years,
        "required_education": job.required_education,
        "keywords": job.get_keywords(),
        "created_at": job.created_at.isoformat(),
    }


@router.delete("/{job_id}")
def delete_job(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    session.delete(job)
    session.commit()
    return {"message": "Job deleted"}
