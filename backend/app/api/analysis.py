import json
import io
import csv
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, select
from app.models.candidate import Candidate, CandidateRanking
from app.models.job import Job
from app.storage.database import get_session
from app.services.matching_engine import rank_candidates, score_candidate
from app.services.ai_extractor import (
    generate_interview_questions,
    generate_candidate_summary,
    chat_with_recruiter,
)

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class RankRequest(BaseModel):
    job_id: int
    candidate_ids: list[int] = []


class ChatRequest(BaseModel):
    message: str
    candidate_ids: list[int] = []


@router.post("/rank")
def rank_candidates_endpoint(payload: RankRequest, session: Session = Depends(get_session)):
    job = session.get(Job, payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if payload.candidate_ids:
        candidates = [session.get(Candidate, cid) for cid in payload.candidate_ids]
        candidates = [c for c in candidates if c]
    else:
        candidates = list(session.exec(select(Candidate)).all())

    if not candidates:
        raise HTTPException(status_code=400, detail="No candidates found")

    ranked = rank_candidates(candidates, job)

    # persist rankings
    results = []
    for rank, (candidate, score) in enumerate(ranked, 1):
        existing = session.exec(
            select(CandidateRanking)
            .where(CandidateRanking.candidate_id == candidate.id)
            .where(CandidateRanking.job_id == job.id)
        ).first()
        if existing:
            existing.score_data = json.dumps(score.model_dump())
            existing.rank = rank
            session.add(existing)
        else:
            ranking = CandidateRanking(
                candidate_id=candidate.id,
                job_id=job.id,
                score_data=json.dumps(score.model_dump()),
                rank=rank,
            )
            session.add(ranking)

        results.append({
            "rank": rank,
            "candidate_id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "skills": candidate.get_skills(),
            "total_score": score.total,
            "score_breakdown": score.model_dump(),
            "recommendation": score.recommendation,
        })

    session.commit()
    return {"job_id": job.id, "job_title": job.title, "results": results}


@router.get("/rankings/{job_id}")
def get_rankings(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    rankings = session.exec(
        select(CandidateRanking)
        .where(CandidateRanking.job_id == job_id)
        .order_by(CandidateRanking.rank)
    ).all()

    results = []
    for r in rankings:
        candidate = session.get(Candidate, r.candidate_id)
        if candidate:
            results.append({
                "rank": r.rank,
                "candidate_id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "skills": candidate.get_skills(),
                "total_score": r.get_score().get("total", 0),
                "score_breakdown": r.get_score(),
                "recommendation": r.get_score().get("recommendation", ""),
            })

    return {"job_id": job_id, "job_title": job.title, "results": results}


@router.get("/candidate/{candidate_id}/interview-questions")
def get_interview_questions(
    candidate_id: int,
    job_id: int,
    session: Session = Depends(get_session)
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    candidate_info = {
        "name": candidate.name,
        "skills": candidate.get_skills(),
        "work_experience": candidate.get_work_experience(),
        "education": candidate.get_education(),
    }
    questions = generate_interview_questions(candidate_info, job.title)
    return {"candidate_id": candidate_id, "job_title": job.title, "questions": questions}


@router.get("/candidate/{candidate_id}/skill-gap/{job_id}")
def get_skill_gap(
    candidate_id: int,
    job_id: int,
    session: Session = Depends(get_session)
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    cand_skills_lower = {s.lower() for s in candidate.get_skills()}
    required = job.get_required_skills()
    preferred = job.get_preferred_skills()

    missing_required = [s for s in required if s.lower() not in cand_skills_lower]
    missing_preferred = [s for s in preferred if s.lower() not in cand_skills_lower]
    matched = [s for s in required if s.lower() in cand_skills_lower]

    return {
        "candidate_id": candidate_id,
        "candidate_name": candidate.name,
        "job_title": job.title,
        "matched_skills": matched,
        "missing_required": missing_required,
        "missing_preferred": missing_preferred,
        "gap_score": len(missing_required),
    }


@router.post("/chat")
def recruiter_chat(payload: ChatRequest, session: Session = Depends(get_session)):
    if payload.candidate_ids:
        candidates = [session.get(Candidate, cid) for cid in payload.candidate_ids]
        candidates = [c for c in candidates if c]
    else:
        candidates = list(session.exec(select(Candidate)).all())[:5]

    context_parts = []
    for c in candidates:
        context_parts.append(
            f"Name: {c.name}\nSkills: {', '.join(c.get_skills()[:10])}\n"
            f"Experience: {len(c.get_work_experience())} roles\nSummary: {c.summary[:200]}"
        )
    context = "\n---\n".join(context_parts)

    answer = chat_with_recruiter(payload.message, context)
    return {"answer": answer}


@router.get("/export/{job_id}")
def export_rankings_csv(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    rankings = session.exec(
        select(CandidateRanking)
        .where(CandidateRanking.job_id == job_id)
        .order_by(CandidateRanking.rank)
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Rank", "Name", "Email", "Total Score",
        "Skills Score", "Experience Score", "Education Score",
        "Certifications Score", "AI Score", "Recommendation"
    ])

    for r in rankings:
        candidate = session.get(Candidate, r.candidate_id)
        score = r.get_score()
        writer.writerow([
            r.rank,
            candidate.name if candidate else "",
            candidate.email if candidate else "",
            score.get("total", 0),
            score.get("skills_match", {}).get("score", 0),
            score.get("experience_match", {}).get("score", 0),
            score.get("education_match", {}).get("score", 0),
            score.get("certifications_match", {}).get("score", 0),
            score.get("ai_holistic", {}).get("score", 0),
            score.get("recommendation", ""),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=rankings_{job_id}.csv"}
    )
