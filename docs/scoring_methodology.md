# Scoring Methodology

## Overview

The scoring system evaluates candidates on a **100-point scale** across five explainable dimensions. Each dimension returns `score`, `max_score`, and a human-readable `reasoning` string displayed in the dashboard.

---

## Score Dimensions

| Dimension | Weight | Method |
|-----------|--------|--------|
| Skills Match | 35 pts | Exact + semantic similarity via ChromaDB |
| Experience Match | 25 pts | Years of experience vs. minimum required |
| Education Match | 15 pts | Degree level relative to requirement |
| Certifications | 10 pts | Keyword match against JD keywords |
| AI Holistic | 15 pts | Groq LLM overall fit assessment |

---

## 1. Skills Match (35 pts)

**Formula:**
```
skills_ratio = exact_match * 0.5 + semantic_match * 0.4 + preferred_match * 0.1
score = skills_ratio * 35
```

- **Exact match**: Set intersection between `candidate.skills` and `job.required_skills` (case-insensitive)
- **Semantic match**: ChromaDB cosine similarity — "ReactJS" matches "React", "ML" matches "Machine Learning"
- **Preferred match**: Bonus weight for matching preferred (nice-to-have) skills

**Output includes**: matched skills list, missing required skills list

---

## 2. Experience Match (25 pts)

**Formula:**
```
total_years = sum(exp.years for exp in work_experience)
ratio = min(total_years / min_experience_years, 1.0)
score = ratio * 25
```

Capped at 1.0 (25 pts) — exceeding years doesn't inflate the score.

---

## 3. Education Match (15 pts)

Degree hierarchy:
```
PhD/Doctorate = 4
Master's/MBA/MS = 3
Bachelor's/BS/BE = 2
Associate/Diploma = 1
```

- Meets requirement → 100% (15 pts)
- One level below → 60% (9 pts)
- Two+ levels below → 30% (4.5 pts)

---

## 4. Certifications Match (10 pts)

```
ratio = count(matched_keywords_in_certifications) / count(total_keywords)
score = ratio * 10
```

Matches JD keywords against candidate certification text.

---

## 5. AI Holistic Assessment (15 pts)

Groq `llama-3.3-70b-versatile` rates the candidate 0–10 based on overall fit, considering context beyond keyword matching (role relevance, career trajectory, project relevance).

```
score = (groq_rating / 10) * 15
```

---

## Final Score Interpretation

| Score Range | Label | Recommendation |
|-------------|-------|---------------|
| 75–100 | Excellent | Highly recommended |
| 55–74 | Good | Recommended |
| 35–54 | Fair | Consider with caveats |
| 0–34 | Poor | Not recommended |
