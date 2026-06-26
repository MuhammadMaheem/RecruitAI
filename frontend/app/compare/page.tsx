"use client";
import { useEffect, useState } from "react";
import { listCandidates, listJobs, getCandidate, getSkillGap } from "@/lib/api";
import type { Candidate, Job, SkillGap } from "@/lib/types";
import {
  GitCompare, Loader2, CheckCircle, XCircle, AlertCircle,
  GraduationCap, Briefcase, Code2, Award, User,
} from "lucide-react";

function SkillChip({ skill, matched }: { skill: string; matched: boolean }) {
  return (
    <span className={`chip ${matched ? "chip-green" : "chip-red"}`}>{skill}</span>
  );
}

function CandidateCol({
  candidate,
  gap,
  label,
}: {
  candidate: Candidate | null;
  gap: SkillGap | null;
  label: string;
}) {
  if (!candidate) {
    return (
      <div className="compare-col compare-col-placeholder">
        <div className="empty-state">
          <div className="empty-state-icon">
            <User className="w-6 h-6 text-muted-c" />
          </div>
          <p className="empty-state-title">Select {label}</p>
          <p className="empty-state-desc">Choose from the dropdown above</p>
        </div>
      </div>
    );
  }

  const matchedSet = new Set((gap?.matched_skills ?? []).map((s) => s.toLowerCase()));

  return (
    <div className="compare-col">
      <div className="compare-col-header">
        <div className="compare-col-avatar">
          {candidate.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <p className="font-heading font-bold text-base text-white-c mb-0.5">{candidate.name}</p>
        <p className="compare-col-email">{candidate.email}</p>
      </div>

      <div className="compare-col-body flex flex-col gap-5">
        {/* Skills */}
        <div>
          <p className="detail-title flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-blue-c" /> Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((s) => (
              <SkillChip key={s} skill={s} matched={matchedSet.has(s.toLowerCase())} />
            ))}
          </div>
        </div>

        {/* Skill gap */}
        {gap && (
          <>
            {gap.missing_required.length > 0 && (
              <div>
                <p className="detail-title flex items-center gap-1.5 text-red-c">
                  <XCircle className="w-3.5 h-3.5" /> Missing Required
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {gap.missing_required.map((s) => (
                    <span key={s} className="chip chip-red">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {gap.missing_preferred.length > 0 && (
              <div>
                <p className="detail-title flex items-center gap-1.5 text-amber-c">
                  <AlertCircle className="w-3.5 h-3.5" /> Missing Preferred
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {gap.missing_preferred.map((s) => (
                    <span key={s} className="chip chip-amber">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Education */}
        {candidate.education && candidate.education.length > 0 && (
          <div>
            <p className="detail-title flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-c" /> Education
            </p>
            {candidate.education.map((e, i) => (
              <p key={i} className="text-base text-secondary-c">
                {e.degree} — {e.institution}
                {e.year && <span className="text-muted-c"> ({e.year})</span>}
              </p>
            ))}
          </div>
        )}

        {/* Experience */}
        {candidate.work_experience && candidate.work_experience.length > 0 && (
          <div>
            <p className="detail-title flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-c" /> Experience
            </p>
            {candidate.work_experience.slice(0, 2).map((exp, i) => (
              <p key={i} className="text-sm text-secondary-c mb-1">
                <span className="font-semibold text-primary-c">{exp.role}</span>
                {" at "}{exp.company}
                <span className="text-muted-c text-sm ml-1">({exp.duration})</span>
              </p>
            ))}
          </div>
        )}

        {/* Certifications */}
        {candidate.certifications && candidate.certifications.length > 0 && (
          <div>
            <p className="detail-title flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-c" /> Certifications
            </p>
            {candidate.certifications.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm text-secondary-c mb-1">
                <CheckCircle className="w-3 h-3 text-green-c shrink-0" /> {c}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {candidate.summary && (
          <div className="compare-summary">{candidate.summary}</div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [id1, setId1] = useState<number | null>(null);
  const [id2, setId2] = useState<number | null>(null);
  const [detail1, setDetail1] = useState<Candidate | null>(null);
  const [detail2, setDetail2] = useState<Candidate | null>(null);
  const [gap1, setGap1] = useState<SkillGap | null>(null);
  const [gap2, setGap2] = useState<SkillGap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listCandidates(), listJobs()])
      .then(([c, j]) => {
        setCandidates(c);
        setJobs(j);
        if (j.length > 0) setSelectedJob(j[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadCandidate = async (id: number, slot: 1 | 2) => {
    const detail = await getCandidate(id);
    if (slot === 1) setDetail1(detail); else setDetail2(detail);
    if (selectedJob) {
      const gap = await getSkillGap(id, selectedJob);
      if (slot === 1) setGap1(gap); else setGap2(gap);
    }
  };

  const handleSelect = (id: number, slot: 1 | 2) => {
    if (slot === 1) { setId1(id); setDetail1(null); setGap1(null); }
    else { setId2(id); setDetail2(null); setGap2(null); }
    loadCandidate(id, slot);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <div className="spinner" />
        <span className="text-secondary-c font-heading text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <p className="section-label mb-2">Deep Dive</p>
        <h1 className="page-title">Compare <span className="gradient-text">Candidates</span></h1>
        <p className="page-subtitle">Side-by-side comparison with skill gap analysis.</p>
      </div>

      {/* Controls */}
      <div className="panel mb-6">
        <div className="panel-body grid sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label" htmlFor="cmp-job">Job Role</label>
            <select
              id="cmp-job"
              value={selectedJob ?? ""}
              onChange={(e) => setSelectedJob(Number(e.target.value))}
              className="field"
            >
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label flex items-center gap-1" htmlFor="cmp-a">
              <User className="w-3 h-3" /> Candidate A
            </label>
            <select
              id="cmp-a"
              value={id1 ?? ""}
              onChange={(e) => handleSelect(Number(e.target.value), 1)}
              className="field"
            >
              <option value="">Select candidate…</option>
              {candidates.filter((c) => c.id !== id2).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label flex items-center gap-1" htmlFor="cmp-b">
              <User className="w-3 h-3" /> Candidate B
            </label>
            <select
              id="cmp-b"
              value={id2 ?? ""}
              onChange={(e) => handleSelect(Number(e.target.value), 2)}
              className="field"
            >
              <option value="">Select candidate…</option>
              {candidates.filter((c) => c.id !== id1).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="compare-legend flex items-center mb-6">
        <span className="flex items-center gap-1.5 text-sm text-secondary-c font-heading">
          <span className="chip chip-green">Skill</span> Matched skill
        </span>
        <span className="flex items-center gap-1.5 text-sm text-secondary-c font-heading">
          <span className="chip chip-red">Skill</span> Unmatched
        </span>
        <span className="flex items-center gap-1.5 text-sm text-secondary-c font-heading">
          <XCircle className="w-3 h-3 text-red-c" /> Missing required
        </span>
        <span className="flex items-center gap-1.5 text-sm text-secondary-c font-heading">
          <AlertCircle className="w-3 h-3 text-amber-c" /> Missing preferred
        </span>
        <span className="flex items-center gap-1.5 text-sm text-secondary-c font-heading">
          <GitCompare className="w-3 h-3 text-blue-c" /> Skill gap loaded automatically
        </span>
      </div>

      {/* Comparison columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <p className="section-label mb-3 flex items-center gap-2">
            <GitCompare className="w-3.5 h-3.5 text-blue-c" /> Candidate A
          </p>
          <CandidateCol candidate={detail1} gap={gap1} label="Candidate A" />
        </div>
        <div>
          <p className="section-label mb-3 flex items-center gap-2">
            <GitCompare className="w-3.5 h-3.5 text-blue-c" /> Candidate B
          </p>
          <CandidateCol candidate={detail2} gap={gap2} label="Candidate B" />
        </div>
      </div>
    </div>
  );
}
