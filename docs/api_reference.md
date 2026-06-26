# API Reference

Base URL: `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

---

## Resumes

### `POST /api/resumes/upload`
Upload one or more PDF resumes. AI extracts candidate information.

**Body:** `multipart/form-data` — `files[]` (PDF files)

**Response:**
```json
{
  "results": [
    {"filename": "john_doe.pdf", "candidate_id": 1, "name": "John Doe", "status": "success"}
  ],
  "total": 1
}
```

---

### `GET /api/resumes/`
List all candidates.

### `GET /api/resumes/{id}`
Get full candidate details including skills, experience, education.

### `DELETE /api/resumes/{id}`
Delete candidate and their PDF.

---

## Jobs

### `POST /api/jobs/`
Create a job description. AI extracts requirements automatically.

**Body:**
```json
{"title": "Senior Developer", "description": "Full job description text..."}
```

### `GET /api/jobs/`
List all jobs.

### `GET /api/jobs/{id}`
Get job with extracted requirements.

### `DELETE /api/jobs/{id}`

---

## Analysis

### `POST /api/analysis/rank`
Score and rank candidates for a job.

**Body:**
```json
{"job_id": 1, "candidate_ids": []}
```
Empty `candidate_ids` ranks all candidates.

**Response:**
```json
{
  "job_id": 1,
  "job_title": "Senior Developer",
  "results": [{
    "rank": 1,
    "candidate_id": 2,
    "name": "Ali Hassan",
    "total_score": 82.5,
    "score_breakdown": {
      "total": 82.5,
      "skills_match": {"score": 28, "max_score": 35, "reasoning": "..."},
      "experience_match": {"score": 22, "max_score": 25, "reasoning": "..."},
      "education_match": {"score": 15, "max_score": 15, "reasoning": "..."},
      "certifications_match": {"score": 7, "max_score": 10, "reasoning": "..."},
      "ai_holistic": {"score": 10.5, "max_score": 15, "reasoning": "..."},
      "strengths": ["Strong skills match", "6 years experience"],
      "weaknesses": ["Missing GraphQL"],
      "recommendation": "Highly recommended — strong fit for this role."
    }
  }]
}
```

---

### `GET /api/analysis/rankings/{job_id}`
Get saved rankings for a job (no AI call — reads from DB).

### `GET /api/analysis/candidate/{id}/interview-questions?job_id=1`
Generate 5 interview questions for candidate using Groq.

### `GET /api/analysis/candidate/{id}/skill-gap/{job_id}`
Get skill gap analysis: matched, missing required, missing preferred.

### `POST /api/analysis/chat`
AI chat about candidates.

**Body:**
```json
{"message": "Who is the best fit for this role?", "candidate_ids": [1, 2, 3]}
```

### `GET /api/analysis/export/{job_id}`
Download rankings as CSV.

---

## Health

### `GET /api/health`
```json
{"status": "ok", "service": "AI Resume Screener"}
```
