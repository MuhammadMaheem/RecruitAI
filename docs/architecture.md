# System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                     │
│   Dashboard │ Upload │ Jobs │ Rankings │ Compare                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP (axios)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                              │
│                                                                  │
│  /api/resumes  ──►  PDF Processor  ──►  AI Extractor           │
│  /api/jobs     ──►  AI Extractor                                │
│  /api/analysis ──►  Matching Engine                             │
└──────────┬──────────────────┬───────────────────────────────────┘
           │                  │
    ┌──────▼──────┐    ┌──────▼──────┐
    │   SQLite    │    │  ChromaDB   │
    │  (SQLModel) │    │  (Vectors)  │
    └─────────────┘    └──────┬──────┘
                              │
                       ┌──────▼──────┐
                       │  Groq API   │
                       │ llama-3.3   │
                       └─────────────┘
```

## Data Flow

### Resume Upload
1. User drops PDF → `POST /api/resumes/upload`
2. `pdf_processor.py` extracts raw text via pdfplumber
3. `ai_extractor.extract_resume_info()` calls Groq with structured JSON prompt
4. Candidate saved to SQLite
5. Skills indexed in ChromaDB via `sentence-transformers` embeddings

### Job Description
1. Recruiter pastes JD text → `POST /api/jobs/`
2. `ai_extractor.extract_job_requirements()` calls Groq
3. Extracts: required_skills, preferred_skills, min_experience_years, required_education, keywords
4. Saved to SQLite

### Ranking
1. `POST /api/analysis/rank` with job_id
2. For each candidate, `matching_engine.score_candidate()` computes:
   - Rule-based scores (skills exact match, experience years, education level)
   - ChromaDB semantic skill similarity
   - Groq holistic assessment
3. Results sorted by total score descending
4. Rankings persisted to SQLite, returned as JSON

## Database Schema

```
candidate(id, filename, name, email, phone, skills[JSON],
          education[JSON], work_experience[JSON], certifications[JSON],
          projects[JSON], summary, raw_text, created_at)

job(id, title, description, required_skills[JSON], preferred_skills[JSON],
    min_experience_years, required_education, keywords[JSON], created_at)

candidateranking(id, candidate_id, job_id, score_data[JSON], rank, created_at)
```
