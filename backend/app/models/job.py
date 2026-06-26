from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime
import json


class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    required_skills: str = "[]"    # JSON
    preferred_skills: str = "[]"   # JSON
    min_experience_years: float = 0.0
    required_education: str = ""
    keywords: str = "[]"           # JSON
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def get_required_skills(self) -> list[str]:
        return json.loads(self.required_skills)

    def get_preferred_skills(self) -> list[str]:
        return json.loads(self.preferred_skills)

    def get_keywords(self) -> list[str]:
        return json.loads(self.keywords)
