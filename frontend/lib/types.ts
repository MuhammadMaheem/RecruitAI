export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
  years: number;
}

export interface Education {
  degree: string;
  institution: string;
  field: string;
  year?: number;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
}

export interface ScoreDimension {
  score: number;
  max_score: number;
  reasoning: string;
}

export interface CandidateScore {
  total: number;
  skills_match: ScoreDimension;
  experience_match: ScoreDimension;
  education_match: ScoreDimension;
  certifications_match: ScoreDimension;
  ai_holistic: ScoreDimension;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  filename: string;
  skills: string[];
  education?: Education[];
  work_experience?: WorkExperience[];
  certifications?: string[];
  projects?: Project[];
  summary: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  description?: string;
  required_skills: string[];
  preferred_skills?: string[];
  min_experience_years: number;
  required_education?: string;
  keywords?: string[];
  created_at: string;
}

export interface RankedCandidate {
  rank: number;
  candidate_id: number;
  name: string;
  email: string;
  skills: string[];
  total_score: number;
  score_breakdown: CandidateScore;
  recommendation: string;
}

export interface RankingResult {
  job_id: number;
  job_title: string;
  results: RankedCandidate[];
}

export interface SkillGap {
  candidate_id: number;
  candidate_name: string;
  job_title: string;
  matched_skills: string[];
  missing_required: string[];
  missing_preferred: string[];
  gap_score: number;
}

export interface InterviewQuestions {
  candidate_id: number;
  job_title: string;
  questions: string[];
}
