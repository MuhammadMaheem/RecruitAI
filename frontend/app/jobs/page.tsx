"use client";
import { useEffect, useState } from "react";
import { createJob, listJobs, deleteJob } from "@/lib/api";
import type { Job } from "@/lib/types";
import { Briefcase, Plus, Trash2, Loader2, ChevronDown, ChevronUp, CheckCircle, Clock, GraduationCap } from "lucide-react";

const SAMPLE_JD = `Senior Full-Stack Developer

We are looking for an experienced Full-Stack Developer to join our engineering team.

Requirements:
- 4+ years of professional software development experience
- Proficiency in Python and JavaScript/TypeScript
- Experience with React or Next.js for frontend development
- Backend experience with FastAPI or Django
- Database experience with PostgreSQL
- Experience with Docker and containerization
- Familiarity with AWS or cloud platforms

Preferred Qualifications:
- Experience with microservices architecture
- Knowledge of Redis, GraphQL
- AWS certifications

Education: Bachelor's degree in Computer Science or equivalent`;

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async () => {
    try { setJobs(await listJobs()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) return;
    setCreating(true);
    try {
      await createJob(title.trim(), description.trim());
      setTitle(""); setDescription(""); setShowForm(false);
      await load();
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this job?")) return;
    try { await deleteJob(id); setJobs((prev) => prev.filter((j) => j.id !== id)); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="animate-fade-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="section-label mb-2">Configure</p>
          <h1 className="page-title">Job <span className="gradient-text">Descriptions</span></h1>
          <p className="page-subtitle">AI extracts required skills and requirements automatically.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-glow">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="panel mb-6 animate-fade-up">
          <div className="panel-header">
            <h2 className="panel-title">New Job Opening</h2>
          </div>
          <div className="panel-body flex flex-col gap-4">
            <div>
              <label className="form-label">Job Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Developer"
                className="field"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label form-label-inline">Job Description</label>
                <button
                  type="button"
                  onClick={() => setDescription(SAMPLE_JD)}
                  className="text-sm font-semibold text-blue-c font-heading hover:underline"
                >
                  Use sample
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste your full job description here..."
                rows={10}
                className="form-textarea font-mono-data"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={creating || !title.trim() || !description.trim()}
                className="btn-glow"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? "Analyzing with AI…" : "Create Job"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <div className="spinner" />
          <span className="text-secondary-c font-heading text-sm">Loading jobs…</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-state-icon"><Briefcase className="w-6 h-6 text-muted-c" /></div>
            <p className="empty-state-title">No jobs yet</p>
            <p className="empty-state-desc">Create your first job opening above.</p>
          </div>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-detail-card">
              <div
                className="job-detail-header"
                onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                  <div className="job-card-icon">
                    <Briefcase className="w-4 h-4 text-green-c" />
                  </div>
                  <div className="min-w-0">
                    <p className="job-detail-title">{job.title}</p>
                    <p className="text-sm text-secondary-c mt-0.5 truncate">
                      {job.required_skills.slice(0, 4).join(" · ")}
                      {job.required_skills.length > 4 && ` +${job.required_skills.length - 4} more`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="chip chip-gray flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {job.min_experience_years}y+
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                    className="text-muted-c hover:text-red-c transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expandedId === job.id
                    ? <ChevronUp className="w-4 h-4 text-secondary-c" />
                    : <ChevronDown className="w-4 h-4 text-secondary-c" />}
                </div>
              </div>

              {expandedId === job.id && (
                <div className="job-detail-body animate-fade-in">
                  <div className="grid sm:grid-cols-3 gap-6 pt-4">
                    <div>
                      <p className="detail-title flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-c" /> Required Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.required_skills.map((s) => (
                          <span key={s} className="chip chip-green">{s}</span>
                        ))}
                      </div>
                    </div>
                    {job.preferred_skills && job.preferred_skills.length > 0 && (
                      <div>
                        <p className="detail-title flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-c" /> Preferred
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.preferred_skills.map((s) => (
                            <span key={s} className="chip chip-amber">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="detail-title flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-c" /> Education
                      </p>
                      <p className="text-base text-secondary-c">{job.required_education || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
