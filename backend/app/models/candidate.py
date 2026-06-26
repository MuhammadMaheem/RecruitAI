from typing import Optional
from sqlmodel import SQLModel, Field, JSON, Column
from datetime import datetime
import json


class WorkExperience(SQLModel):
    company: str
    role: str
    duration: str
    description: str
    years: float = 0.0


class Education(SQLModel):
    degree: str
    institution: str
    field: str = ""
    year: Optional[int] = None


class ScoreDimension(SQLModel):
    score: float
    max_score: float
    reasoning: str


class CandidateScore(SQLModel):
    total: float = 0.0
    skills_match: ScoreDimension = ScoreDimension(score=0, max_score=35, reasoning="")
    experience_match: ScoreDimension = ScoreDimension(score=0, max_score=25, reasoning="")
    education_match: ScoreDimension = ScoreDimension(score=0, max_score=15, reasoning="")
    certifications_match: ScoreDimension = ScoreDimension(score=0, max_score=10, reasoning="")
    ai_holistic: ScoreDimension = ScoreDimension(score=0, max_score=15, reasoning="")
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendation: str = ""


class Candidate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    name: str = ""
    email: str = ""
    phone: str = ""
    skills: str = "[]"           # JSON
    education: str = "[]"        # JSON
    work_experience: str = "[]"  # JSON
    certifications: str = "[]"   # JSON
    projects: str = "[]"         # JSON
    summary: str = ""
    raw_text: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def get_skills(self) -> list[str]:
        return json.loads(self.skills)

    def get_education(self) -> list[dict]:
        return json.loads(self.education)

    def get_work_experience(self) -> list[dict]:
        return json.loads(self.work_experience)

    def get_certifications(self) -> list[str]:
        return json.loads(self.certifications)

    def get_projects(self) -> list[dict]:
        return json.loads(self.projects)


class CandidateRanking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    candidate_id: int = Field(foreign_key="candidate.id")
    job_id: int = Field(foreign_key="job.id")
    score_data: str = "{}"  # JSON CandidateScore
    rank: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def get_score(self) -> dict:
        return json.loads(self.score_data)
