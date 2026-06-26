from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.storage.database import create_db
from app.api import resumes, jobs, analysis


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    yield


app = FastAPI(
    title="AI Resume Screener API",
    description="AI-powered resume screening and candidate ranking system using Groq LLM",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resumes.router)
app.include_router(jobs.router)
app.include_router(analysis.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "AI Resume Screener"}
