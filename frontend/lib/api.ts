import axios from "axios";
import type {
  Candidate, Job, RankingResult, SkillGap, InterviewQuestions,
} from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 120000,
});

// Resumes
export const uploadResumes = async (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await api.post("/api/resumes/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const listCandidates = async (): Promise<Candidate[]> => {
  const res = await api.get("/api/resumes/");
  return res.data;
};

export const getCandidate = async (id: number): Promise<Candidate> => {
  const res = await api.get(`/api/resumes/${id}`);
  return res.data;
};

export const deleteCandidate = async (id: number) => {
  const res = await api.delete(`/api/resumes/${id}`);
  return res.data;
};

// Jobs
export const createJob = async (title: string, description: string): Promise<Job> => {
  const res = await api.post("/api/jobs/", { title, description });
  return res.data;
};

export const listJobs = async (): Promise<Job[]> => {
  const res = await api.get("/api/jobs/");
  return res.data;
};

export const getJob = async (id: number): Promise<Job> => {
  const res = await api.get(`/api/jobs/${id}`);
  return res.data;
};

export const deleteJob = async (id: number) => {
  const res = await api.delete(`/api/jobs/${id}`);
  return res.data;
};

// Analysis
export const rankCandidates = async (
  jobId: number,
  candidateIds: number[] = []
): Promise<RankingResult> => {
  const res = await api.post("/api/analysis/rank", {
    job_id: jobId,
    candidate_ids: candidateIds,
  });
  return res.data;
};

export const getRankings = async (jobId: number): Promise<RankingResult> => {
  const res = await api.get(`/api/analysis/rankings/${jobId}`);
  return res.data;
};

export const getInterviewQuestions = async (
  candidateId: number,
  jobId: number
): Promise<InterviewQuestions> => {
  const res = await api.get(
    `/api/analysis/candidate/${candidateId}/interview-questions`,
    { params: { job_id: jobId } }
  );
  return res.data;
};

export const getSkillGap = async (
  candidateId: number,
  jobId: number
): Promise<SkillGap> => {
  const res = await api.get(
    `/api/analysis/candidate/${candidateId}/skill-gap/${jobId}`
  );
  return res.data;
};

export const chatWithAI = async (
  message: string,
  candidateIds: number[] = []
): Promise<{ answer: string }> => {
  const res = await api.post("/api/analysis/chat", {
    message,
    candidate_ids: candidateIds,
  });
  return res.data;
};

export const exportCSV = (jobId: number) => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  window.open(`${base}/api/analysis/export/${jobId}`, "_blank");
};

export const healthCheck = async () => {
  const res = await api.get("/api/health");
  return res.data;
};
