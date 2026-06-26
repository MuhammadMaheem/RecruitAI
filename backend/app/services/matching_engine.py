import json
from groq import Groq
from app.config import settings
from app.models.candidate import Candidate, CandidateScore, ScoreDimension
from app.models.job import Job
from app.services.vector_store import semantic_skill_match

client = Groq(api_key=settings.groq_api_key)


def _exact_skill_match(required: list[str], candidate: list[str]) -> float:
    if not required:
        return 1.0
    req_lower = {s.lower() for s in required}
    cand_lower = {s.lower() for s in candidate}
    matched = req_lower & cand_lower
    return len(matched) / len(req_lower)


def _education_score(candidate_edu: list[dict], required_edu: str) -> tuple[float, str]:
    degree_rank = {
        "phd": 4, "doctorate": 4,
        "master": 3, "ms": 3, "msc": 3, "mba": 3, "me": 3,
        "bachelor": 2, "bs": 2, "be": 2, "bsc": 2, "btech": 2, "ba": 2,
        "associate": 1, "diploma": 1,
    }
    if not candidate_edu:
        return 0.5, "No education data found in resume."

    top_rank = 0
    top_degree = ""
    for edu in candidate_edu:
        deg = edu.get("degree", "").lower()
        for key, rank in degree_rank.items():
            if key in deg:
                if rank > top_rank:
                    top_rank = rank
                    top_degree = edu.get("degree", "")

    required_lower = required_edu.lower()
    required_rank = 2  # default bachelor
    for key, rank in degree_rank.items():
        if key in required_lower:
            required_rank = rank
            break

    if top_rank >= required_rank:
        score = 1.0
        reasoning = f"Meets education requirement ({top_degree})."
    elif top_rank == required_rank - 1:
        score = 0.6
        reasoning = f"Slightly below required education ({top_degree} vs {required_edu})."
    else:
        score = 0.3
        reasoning = f"Education below requirement ({top_degree} vs {required_edu})."

    return score, reasoning


def _experience_score(work_exp: list[dict], min_years: float) -> tuple[float, str]:
    total_years = sum(float(exp.get("years", 0)) for exp in work_exp)
    if min_years <= 0:
        return 1.0, f"No minimum experience required. Candidate has {total_years:.1f} years."
    ratio = min(total_years / min_years, 1.0)
    reasoning = f"Has {total_years:.1f} years experience vs {min_years:.1f} required."
    return ratio, reasoning


def _certification_score(candidate_certs: list[str], terms: list[str]) -> tuple[float, str]:
    if not candidate_certs:
        return 0.0, "No certifications found in resume."
    if not terms:
        return 0.5, "No requirements to match certifications against."
    cert_text = " ".join(c.lower() for c in candidate_certs)
    matched = [t for t in terms if t.lower() in cert_text]
    ratio = min(len(matched) / max(len(terms), 1), 1.0)
    reasoning = f"Certifications cover {len(matched)}/{len(terms)} required terms: {', '.join(matched[:3]) or 'none'}."
    return ratio, reasoning


def _groq_holistic_score(candidate: Candidate, job: Job) -> tuple[float, str]:
    prompt = f"""Rate this candidate's overall fit for the job on a scale of 0 to 10.

Job Title: {job.title}
Required Skills: {job.get_required_skills()}
Min Experience: {job.min_experience_years} years
Required Education: {job.required_education}

Candidate Name: {candidate.name}
Candidate Skills: {candidate.get_skills()}
Candidate Summary: {candidate.summary}
Work Experience: {json.dumps(candidate.get_work_experience()[:2])}
Education: {json.dumps(candidate.get_education()[:1])}

Return ONLY a JSON object: {{"score": 7.5, "reasoning": "explanation in 1-2 sentences"}}"""

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=256,
        )
        text = response.choices[0].message.content
        import re
        match = re.search(r"\{[\s\S]+\}", text)
        if match:
            data = json.loads(match.group())
            return float(data.get("score", 5)) / 10, data.get("reasoning", "")
    except Exception:
        pass
    return 0.5, "AI assessment unavailable."


def score_candidate(candidate: Candidate, job: Job) -> CandidateScore:
    cand_skills = candidate.get_skills()
    req_skills = job.get_required_skills()
    pref_skills = job.get_preferred_skills()
    work_exp = candidate.get_work_experience()
    education = candidate.get_education()
    certifications = candidate.get_certifications()
    keywords = job.get_keywords()

    # Skills score (35 pts)
    exact_ratio = _exact_skill_match(req_skills, cand_skills)
    try:
        semantic_ratio = semantic_skill_match(req_skills, cand_skills)
    except Exception:
        semantic_ratio = exact_ratio
    pref_ratio = _exact_skill_match(pref_skills, cand_skills) if pref_skills else 0.5

    skills_ratio = (exact_ratio * 0.5 + semantic_ratio * 0.4 + pref_ratio * 0.1)
    matched_req = [s for s in req_skills if s.lower() in {c.lower() for c in cand_skills}]
    missing_req = [s for s in req_skills if s.lower() not in {c.lower() for c in cand_skills}]
    skills_score = ScoreDimension(
        score=round(skills_ratio * 35, 2),
        max_score=35,
        reasoning=f"Matched {len(matched_req)}/{len(req_skills)} required skills. Missing: {', '.join(missing_req[:5]) or 'none'}."
    )

    # Experience score (25 pts)
    exp_ratio, exp_reasoning = _experience_score(work_exp, job.min_experience_years)
    experience_score = ScoreDimension(
        score=round(exp_ratio * 25, 2),
        max_score=25,
        reasoning=exp_reasoning
    )

    # Education score (15 pts)
    edu_ratio, edu_reasoning = _education_score(education, job.required_education)
    education_score = ScoreDimension(
        score=round(edu_ratio * 15, 2),
        max_score=15,
        reasoning=edu_reasoning
    )

    # Certifications score (10 pts) — match against req_skills + keywords
    cert_match_terms = list(set(req_skills + keywords))
    cert_ratio, cert_reasoning = _certification_score(certifications, cert_match_terms)
    cert_score = ScoreDimension(
        score=round(cert_ratio * 10, 2),
        max_score=10,
        reasoning=cert_reasoning
    )

    # AI holistic score (15 pts)
    ai_ratio, ai_reasoning = _groq_holistic_score(candidate, job)
    ai_score = ScoreDimension(
        score=round(ai_ratio * 15, 2),
        max_score=15,
        reasoning=ai_reasoning
    )

    total = (skills_score.score + experience_score.score +
             education_score.score + cert_score.score + ai_score.score)

    strengths = []
    weaknesses = []

    if skills_ratio >= 0.7:
        strengths.append(f"Strong skills match ({len(matched_req)}/{len(req_skills)} required)")
    else:
        weaknesses.append(f"Skills gap: missing {', '.join(missing_req[:3])}")

    total_exp_years = sum(float(e.get("years", 0)) for e in work_exp)
    if total_exp_years >= job.min_experience_years:
        strengths.append(f"{total_exp_years:.1f} years relevant experience")
    else:
        weaknesses.append(f"Below minimum experience ({total_exp_years:.1f} vs {job.min_experience_years} years)")

    if edu_ratio >= 0.8:
        strengths.append("Meets education requirement")
    else:
        weaknesses.append("Education below requirement")

    if total >= 75:
        recommendation = "Highly recommended — strong fit for this role."
    elif total >= 55:
        recommendation = "Recommended — good fit with minor gaps."
    elif total >= 35:
        recommendation = "Consider — meets some requirements, notable gaps exist."
    else:
        recommendation = "Not recommended — significant gaps in requirements."

    return CandidateScore(
        total=round(total, 2),
        skills_match=skills_score,
        experience_match=experience_score,
        education_match=education_score,
        certifications_match=cert_score,
        ai_holistic=ai_score,
        strengths=strengths,
        weaknesses=weaknesses,
        recommendation=recommendation,
    )


def rank_candidates(candidates: list[Candidate], job: Job) -> list[tuple[Candidate, CandidateScore]]:
    scored = []
    for candidate in candidates:
        score = score_candidate(candidate, job)
        scored.append((candidate, score))
    scored.sort(key=lambda x: x[1].total, reverse=True)
    return scored
