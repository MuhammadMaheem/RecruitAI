"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listCandidates, listJobs, healthCheck } from "@/lib/api";
import type { Candidate, Job } from "@/lib/types";
import { Users, Briefcase, Upload, TrendingUp, ArrowRight, Clock, Zap, ChevronRight } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  valueColor: string;
}

function RankBadge({ rank }: { rank: number }) {
  const cls = rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "rank-n";
  return <span className={`rank-badge ${cls}`}>#{rank}</span>;
}


export default function DashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listCandidates(), listJobs(), healthCheck()])
      .then(([c, j]) => { setCandidates(c); setJobs(j); setOnline(true); })
      .catch(() => setOnline(false))
      .finally(() => setLoading(false));
  }, []);

  const avgScore = 0; // populated via ranking results, not base candidate list

  const stats: StatItem[] = [
    { label: "Candidates",  value: loading ? "—" : String(candidates.length), icon: Users,      iconBg: "stat-icon-blue",  valueColor: "stat-value-blue" },
    { label: "Active Jobs", value: loading ? "—" : String(jobs.length),        icon: Briefcase,  iconBg: "stat-icon-green", valueColor: "stat-value-green" },
    { label: "Avg Score",   value: loading ? "—" : `${avgScore.toFixed(0)}`,   icon: TrendingUp, iconBg: "stat-icon-amber", valueColor: "stat-value-amber" },
    { label: "AI Status",   value: loading ? "—" : (online ? "Online" : "Off"),icon: Zap,        iconBg: online ? "stat-icon-green" : "stat-icon-red", valueColor: online ? "stat-value-green" : "stat-value-red" },
  ];

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="section-label mb-2">Command Center</p>
          <h1 className="page-title">
            Recruitment <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="page-subtitle">AI-powered screening &amp; candidate ranking</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/upload" className="btn-glow text-sm">
            <Upload className="w-4 h-4" /> Upload Resumes
          </Link>
          <Link href="/jobs" className="btn-ghost text-sm">
            <Briefcase className="w-4 h-4" /> New Job
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card-icon ${s.iconBg}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className={`stat-card-value mono ${s.valueColor}`}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent candidates */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title flex items-center gap-2">
              <Users className="w-4 h-4 panel-icon-blue" />
              Recent Candidates
            </h2>
            <Link href="/candidates" className="nav-view-link">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="panel-body flex flex-col gap-3">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : candidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Upload className="w-6 h-6 text-muted-c" /></div>
              <p className="empty-state-title">No candidates yet</p>
              <p className="empty-state-desc">Upload PDFs to begin screening</p>
            </div>
          ) : (
            <div>
              {candidates.slice(0, 5).map((c, i) => (
                <div key={c.id} className="cand-row">
                  <RankBadge rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="cand-name">{c.name}</p>
                    <p className="cand-email">{c.email || "No email"}</p>
                  </div>
                  {/* score shown on Rankings page */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active jobs */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title flex items-center gap-2">
              <Briefcase className="w-4 h-4 panel-icon-green" />
              Active Job Descriptions
            </h2>
            <Link href="/jobs" className="nav-view-link">
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="panel-body flex flex-col gap-3">
              {[1,2].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Briefcase className="w-6 h-6 text-muted-c" /></div>
              <p className="empty-state-title">No jobs posted</p>
              <p className="empty-state-desc">Create a JD to start ranking</p>
            </div>
          ) : (
            <div className="panel-body flex flex-col gap-3">
              {jobs.map((j) => (
                <div key={j.id} className="job-card">
                  <div className="job-card-icon">
                    <Briefcase className="w-4 h-4 panel-icon-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="job-card-title">{j.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {j.required_skills?.slice(0, 3).map((s: string) => (
                        <span key={s} className="chip chip-blue">{s}</span>
                      ))}
                      {(j.required_skills?.length ?? 0) > 3 && (
                        <span className="chip chip-gray">+{(j.required_skills?.length ?? 0) - 3}</span>
                      )}
                    </div>
                  </div>
                  <Link href="/candidates" className="job-card-link">
                    Rank <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA banner */}
      <div className="cta-banner">
        <div>
          <p className="section-label mb-1">Workflow</p>
          <h3 className="cta-title">Ready to screen candidates?</h3>
          <p className="cta-desc">Upload resumes → create a JD → run AI ranking in seconds</p>
        </div>
        <div className="flex gap-3 flex-wrap min-w-0">
          <Link href="/upload" className="btn-glow"><Upload className="w-4 h-4" /> Start Uploading</Link>
          <Link href="/candidates" className="btn-ghost"><Clock className="w-4 h-4" /> View Rankings</Link>
        </div>
      </div>
    </div>
  );
}
