"use client";
import { useEffect, useState } from "react";
import {
  listCandidates, listJobs, rankCandidates, getRankings,
  getInterviewQuestions, exportCSV, deleteCandidate,
} from "@/lib/api";
import type { Candidate, Job, RankedCandidate, InterviewQuestions } from "@/lib/types";
import ScoreDimensionBar from "@/components/ScoreDimensionBar";
import {
  Users, Briefcase, Loader2, Download, RefreshCw,
  ChevronDown, ChevronUp, MessageSquare, Trash2, TrendingUp, Cpu,
} from "lucide-react";

function RecTag({ text }: { text: string }) {
  const cls = text.toLowerCase().includes("highly")
    ? "rec-tag rec-high"
    : text.toLowerCase().includes("recommend")
    ? "rec-tag rec-good"
    : text.toLowerCase().includes("consider")
    ? "rec-tag rec-medium"
    : "rec-tag rec-low";
  return <span className={cls}>{text.split("—")[0].trim()}</span>;
}

function Avatar({ name, rank }: { name: string; rank: number }) {
  const cls = rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "rank-n";
  return (
    <div className={`rank-badge ${cls} w-9 h-9 text-base`}>
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 75 ? "score-n-green" : score >= 55 ? "score-n-blue" : score >= 35 ? "score-n-amber" : "score-n-red";
  return (
    <div className={`score-num-box ${cls}`}>
      <span className="score-num-value mono font-bold leading-none">{Math.round(score)}</span>
      <span className="score-num-denom font-heading opacity-60">/100</span>
    </div>
  );
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [rankings, setRankings] = useState<RankedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Record<number, InterviewQuestions>>({});
  const [loadingQs, setLoadingQs] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([listCandidates(), listJobs()])
      .then(([c, j]) => {
        setCandidates(c);
        setJobs(j);
        if (j.length > 0) {
          setSelectedJob(j[0].id);
          getRankings(j[0].id).then((r) => setRankings(r.results)).catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJobChange = async (jobId: number) => {
    setSelectedJob(jobId);
    setRankings([]);
    try { const r = await getRankings(jobId); setRankings(r.results); } catch { /* no prior rankings */ }
  };

  const handleRank = async () => {
    if (!selectedJob) return;
    setRanking(true);
    try { const result = await rankCandidates(selectedJob); setRankings(result.results); }
    catch (e) { console.error(e); }
    finally { setRanking(false); }
  };

  const handleGetQuestions = async (candidateId: number) => {
    if (!selectedJob || questions[candidateId]) return;
    setLoadingQs(candidateId);
    try {
      const q = await getInterviewQuestions(candidateId, selectedJob);
      setQuestions((prev) => ({ ...prev, [candidateId]: q }));
    } catch (e) { console.error(e); }
    finally { setLoadingQs(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this candidate?")) return;
    try {
      await deleteCandidate(id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      setRankings((prev) => prev.filter((r) => r.candidate_id !== id));
    } catch { /* ignore */ }
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
    <div className="animate-fade-up max-w-5xl mx-auto">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="section-label mb-2">Analysis</p>
          <h1 className="page-title">Candidate <span className="gradient-text">Rankings</span></h1>
          <p className="page-subtitle">AI-scored with explainable 100-point breakdowns.</p>
        </div>
      </div>

      {/* Controls bar */}
      <div className="panel mb-6">
        <div className="panel-body flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Briefcase className="w-4 h-4 text-secondary-c shrink-0" />
            <select
              value={selectedJob ?? ""}
              onChange={(e) => handleJobChange(Number(e.target.value))}
              className="field min-w-0"
              aria-label="Select job"
            >
              {jobs.length === 0 && <option value="">No jobs — create one first</option>}
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRank}
              disabled={ranking || !selectedJob || candidates.length === 0}
              className="btn-glow"
            >
              {ranking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {ranking ? "Ranking…" : "Rank All"}
            </button>
            {selectedJob && rankings.length > 0 && (
              <button
                type="button"
                onClick={() => exportCSV(selectedJob)}
                className="btn-ghost"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            )}
          </div>
          <span className="section-label shrink-0">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} · {rankings.length} ranked
          </span>
        </div>
      </div>

      {/* Rankings list */}
      {rankings.length === 0 ? (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-state-icon"><Users className="w-6 h-6 text-muted-c" /></div>
            <p className="empty-state-title">No rankings yet</p>
            <p className="empty-state-desc">
              {candidates.length === 0
                ? "Upload resumes first, then click Rank All."
                : "Select a job and click \"Rank All\" to score candidates."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rankings.map((r, idx) => {
            const isExpanded = expandedId === r.candidate_id;
            const sb = r.score_breakdown;

            return (
              <div key={r.candidate_id} className={`rank-card${idx === 0 ? " top" : ""}`}>
                {/* Header */}
                <div
                  className="rank-card-header cursor-pointer flex-wrap"
                  onClick={() => setExpandedId(isExpanded ? null : r.candidate_id)}
                >
                  <Avatar name={r.name ?? "?"} rank={r.rank} />
                  <div className="flex-1 min-w-0">
                    <p className="rank-candidate-name">#{r.rank} {r.name}</p>
                    <p className="rank-candidate-email">{r.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.skills.slice(0, 3).map((s) => (
                        <span key={s} className="chip chip-gray">{s}</span>
                      ))}
                      {r.skills.length > 3 && (
                        <span className="chip chip-gray">+{r.skills.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <ScoreBadge score={r.total_score} />
                    <RecTag text={r.recommendation ?? ""} />
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-secondary-c" />
                      : <ChevronDown className="w-4 h-4 text-secondary-c" />}
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="animate-fade-in">
                    {/* Score breakdown */}
                    <div className="detail-section">
                      <p className="detail-title flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-c" /> Score Breakdown
                      </p>
                      <div className="flex flex-col gap-3">
                        <ScoreDimensionBar label="Skills Match"    score={sb.skills_match?.score ?? 0}         maxScore={35} reasoning={sb.skills_match?.reasoning} />
                        <ScoreDimensionBar label="Experience"      score={sb.experience_match?.score ?? 0}     maxScore={25} reasoning={sb.experience_match?.reasoning} />
                        <ScoreDimensionBar label="Education"       score={sb.education_match?.score ?? 0}      maxScore={15} reasoning={sb.education_match?.reasoning} />
                        <ScoreDimensionBar label="Certifications"  score={sb.certifications_match?.score ?? 0} maxScore={10} reasoning={sb.certifications_match?.reasoning} />
                        <ScoreDimensionBar label="AI Assessment"   score={sb.ai_holistic?.score ?? 0}          maxScore={15} reasoning={sb.ai_holistic?.reasoning} />
                      </div>
                    </div>

                    {/* Strengths & gaps */}
                    {((sb.strengths?.length ?? 0) > 0 || (sb.weaknesses?.length ?? 0) > 0) && (
                      <div className="detail-section grid sm:grid-cols-2 gap-6">
                        {sb.strengths && sb.strengths.length > 0 && (
                          <div>
                            <p className="detail-title text-green-c">Strengths</p>
                            {sb.strengths.map((s: string, i: number) => (
                              <div key={i} className="sw-item">
                                <span className="sw-dot-green" />
                                <span className="text-secondary-c">{s}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {sb.weaknesses && sb.weaknesses.length > 0 && (
                          <div>
                            <p className="detail-title text-red-c">Gaps</p>
                            {sb.weaknesses.map((w: string, i: number) => (
                              <div key={i} className="sw-item">
                                <span className="sw-dot-red" />
                                <span className="text-secondary-c">{w}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interview questions */}
                    <div className="detail-section">
                      <div className="flex items-center justify-between mb-3">
                        <p className="detail-title flex items-center gap-1.5 mb-0">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-c" /> Interview Questions
                        </p>
                        {!questions[r.candidate_id] && (
                          <button
                            type="button"
                            onClick={() => handleGetQuestions(r.candidate_id)}
                            disabled={loadingQs === r.candidate_id}
                            className="btn-ghost"
                          >
                            {loadingQs === r.candidate_id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Cpu className="w-4 h-4" />}
                            Generate Questions
                          </button>
                        )}
                      </div>
                      {questions[r.candidate_id] ? (
                        <div className="flex flex-col gap-2">
                          {questions[r.candidate_id].questions.map((q, i) => (
                            <div key={i} className="iq-item">
                              <span className="iq-num">{i + 1}</span>
                              <p className="iq-text">{q}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-c">
                          Click &quot;Generate with AI&quot; for tailored interview questions.
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="detail-section flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.candidate_id)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-red-c font-heading hover:underline"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Candidate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
