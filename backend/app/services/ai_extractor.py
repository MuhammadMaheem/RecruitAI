import json
import re
from groq import Groq
from app.config import settings

client = Groq(api_key=settings.groq_api_key)


def _call_groq(prompt: str, system: str = "") -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=messages,
        temperature=0.1,
        max_tokens=4096,
    )
    return response.choices[0].message.content


def _extract_json(text: str) -> dict:
    # Strip markdown code fences if present
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        text = match.group(1)
    return json.loads(text.strip())


def extract_resume_info(raw_text: str) -> dict:
    system = (
        "You are an expert resume parser. Extract structured information from resumes. "
        "Always respond with valid JSON only — no explanation, no markdown."
    )
    prompt = f"""Extract the following information from this resume and return ONLY a JSON object:

{{
  "name": "full name",
  "email": "email address or empty string",
  "phone": "phone number or empty string",
  "skills": ["list", "of", "technical", "and", "soft", "skills"],
  "education": [
    {{"degree": "BS/MS/PhD etc", "institution": "university name", "field": "major/field", "year": 2022}}
  ],
  "work_experience": [
    {{"company": "company name", "role": "job title", "duration": "2 years", "description": "brief description", "years": 2.0}}
  ],
  "certifications": ["list of certifications"],
  "projects": [
    {{"name": "project name", "description": "what it does", "technologies": ["tech1", "tech2"]}}
  ],
  "summary": "2-3 sentence professional summary of this candidate"
}}

Resume text:
{raw_text[:6000]}"""

    result = _call_groq(prompt, system)
    try:
        return _extract_json(result)
    except Exception:
        return {
            "name": "", "email": "", "phone": "",
            "skills": [], "education": [], "work_experience": [],
            "certifications": [], "projects": [], "summary": result[:500]
        }


def extract_job_requirements(description: str) -> dict:
    system = (
        "You are an expert HR analyst. Extract structured job requirements from job descriptions. "
        "Always respond with valid JSON only — no explanation, no markdown."
    )
    prompt = f"""Extract the following from this job description and return ONLY a JSON object:

{{
  "required_skills": ["list of must-have skills"],
  "preferred_skills": ["list of nice-to-have skills"],
  "min_experience_years": 3.0,
  "required_education": "Bachelor's in Computer Science or equivalent",
  "keywords": ["important", "domain", "keywords"]
}}

Job description:
{description[:4000]}"""

    result = _call_groq(prompt, system)
    try:
        return _extract_json(result)
    except Exception:
        return {
            "required_skills": [], "preferred_skills": [],
            "min_experience_years": 0.0, "required_education": "",
            "keywords": []
        }


def generate_interview_questions(candidate_info: dict, job_title: str) -> list[str]:
    prompt = f"""Generate 5 targeted interview questions for this candidate applying for the role of {job_title}.

Candidate skills: {', '.join(candidate_info.get('skills', [])[:15])}
Experience: {json.dumps(candidate_info.get('work_experience', [])[:2])}
Education: {json.dumps(candidate_info.get('education', [])[:1])}

Return ONLY a JSON array of 5 question strings. No explanation."""

    result = _call_groq(prompt)
    try:
        parsed = _extract_json(result)
        return parsed if isinstance(parsed, list) else []
    except Exception:
        lines = [l.strip("0123456789. ").strip() for l in result.split("\n") if l.strip()]
        return [l for l in lines if len(l) > 10][:5]


def generate_candidate_summary(candidate_info: dict, job_title: str, score: float) -> str:
    prompt = f"""Write a 2-3 sentence recruiter summary for this candidate applying for {job_title}.
Score: {score:.1f}/100
Name: {candidate_info.get('name', 'Candidate')}
Skills: {', '.join(candidate_info.get('skills', [])[:10])}
Experience summary: {candidate_info.get('summary', '')}

Be concise and professional."""
    return _call_groq(prompt)


def chat_with_recruiter(message: str, candidates_context: str) -> str:
    system = (
        "You are an AI recruitment assistant. Answer questions about candidates based on the provided data. "
        "Be concise, data-driven, and helpful to recruiters."
    )
    prompt = f"""Candidate data:
{candidates_context}

Recruiter question: {message}"""
    return _call_groq(prompt, system)
