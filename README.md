# AI-Powered Resume Screening & Candidate Ranking System

**Task 2 — TEYZIX Internship Project**

An intelligent recruitment assistant that automatically screens resumes, extracts candidate information, and ranks applicants against job descriptions using Groq LLM and semantic search.

---

## Features

| Feature | Description |
|---------|-------------|
| **PDF Resume Upload** | Drag-and-drop multi-file PDF uploader |
| **AI Extraction** | Groq `llama-3.3-70b-versatile` extracts name, email, skills, experience, education |
| **JD Analysis** | AI parses job descriptions into structured requirements |
| **Candidate Ranking** | 100-point explainable scoring across 5 dimensions |
| **Semantic Skills** | ChromaDB vector search matches "React" to "ReactJS" |
| **Score Breakdown** | Per-dimension scores with AI reasoning shown in UI |
| **Interview Questions** | AI generates 5 tailored interview questions per candidate |
| **Skill Gap Analysis** | Highlights missing required and preferred skills |
| **Candidate Compare** | Side-by-side comparison view |
| **CSV Export** | Download full rankings as spreadsheet |
| **AI Chat** | Ask natural language questions about your candidates |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11) |
| AI / LLM | Groq API — `llama-3.3-70b-versatile` |
| PDF Processing | pdfplumber |
| Vector Search | ChromaDB + sentence-transformers |
| Database | SQLite via SQLModel |
| Frontend | Next.js 15 + TypeScript |
| UI Components | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| File Upload | react-dropzone |

---

## Scoring Methodology

Candidates are scored on **100 points** across five explainable dimensions:

```
Skills Match      35 pts  — Exact + semantic similarity (ChromaDB)
Experience        25 pts  — Years vs. minimum required
Education         15 pts  — Degree level vs. requirement
Certifications    10 pts  — Keyword match against JD
AI Assessment     15 pts  — Groq holistic fit rating (0-10)
─────────────────────────
Total            100 pts
```

Each dimension includes a reasoning string shown in the UI. See [docs/scoring_methodology.md](docs/scoring_methodology.md).

---

## Project Structure

```
task 2/
├── backend/
│   ├── app/
│   │   ├── main.py               FastAPI app entry
│   │   ├── config.py             Settings (Groq API key, upload dir)
│   │   ├── models/
│   │   │   ├── candidate.py      Pydantic + SQLModel schemas
│   │   │   └── job.py
│   │   ├── services/
│   │   │   ├── pdf_processor.py  pdfplumber text extraction
│   │   │   ├── ai_extractor.py   Groq-powered info extraction
│   │   │   ├── matching_engine.py Scoring + ranking logic
│   │   │   └── vector_store.py   ChromaDB semantic search
│   │   ├── api/
│   │   │   ├── resumes.py        Upload + CRUD endpoints
│   │   │   ├── jobs.py           Job description endpoints
│   │   │   └── analysis.py       Rank, compare, export, chat
│   │   └── storage/
│   │       └── database.py       SQLite engine + session
│   ├── generate_samples.py       Script to generate sample PDFs
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx              Dashboard
│   │   ├── upload/page.tsx       Resume uploader
│   │   ├── jobs/page.tsx         Job descriptions
│   │   ├── candidates/page.tsx   Rankings + interview Qs
│   │   └── compare/page.tsx      Side-by-side comparison
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── ui/                   shadcn components
│   └── lib/
│       ├── api.ts                API client wrappers
│       └── types.ts              TypeScript types
├── samples/
│   ├── resumes/                  5 sample PDF resumes
│   └── job_descriptions/         2 sample JD text files
├── docs/
│   ├── architecture.md
│   ├── api_reference.md
│   └── scoring_methodology.md
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend Setup

```bash
cd "task 2/backend"

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Generate sample data (optional)
python generate_samples.py

# Start server
python run.py
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

### Frontend Setup

```bash
cd "task 2/frontend"

npm install
npm run dev
# → http://localhost:3000
```

---

## Quick Start

1. Open `http://localhost:3000`
2. Go to **Upload** → drag and drop PDF resumes
3. Go to **Jobs** → create a job description
4. Go to **Rankings** → select the job → click **Rank All**
5. Expand any candidate to see score breakdown and generate interview questions
6. Go to **Compare** → select two candidates for side-by-side analysis

---

## Sample Data

Five realistic PDF resumes are included in `samples/resumes/`:

| File | Profile |
|------|---------|
| `ali_hassan_resume.pdf` | Senior Full-Stack Developer, 6 yrs, AWS certified |
| `fatima_malik_resume.pdf` | ML Engineer, 4 yrs, Google ML certified |
| `umar_farooq_resume.pdf` | Frontend Developer, 2 yrs, React/Next.js |
| `zara_ahmed_resume.pdf` | DevOps Engineer, 5 yrs, CKA certified |
| `hamza_iqbal_resume.pdf` | Junior Backend Developer, fresh grad |

Two job descriptions in `samples/job_descriptions/`:
- `senior_full_stack_developer.txt`
- `machine_learning_engineer.txt`

---

## API Documentation

Full API reference: [docs/api_reference.md](docs/api_reference.md)

Interactive Swagger UI: `http://localhost:8000/docs`

---

## Documentation

- [Architecture](docs/architecture.md) — system design and data flow
- [Scoring Methodology](docs/scoring_methodology.md) — how candidates are scored
- [API Reference](docs/api_reference.md) — all endpoints with examples

---

## Author

**Developer** — Muhammad Maheem  
Intern — TEYZIX  
Email: mirza.muhammad.maheem@gmail.com
# RecruitAI
