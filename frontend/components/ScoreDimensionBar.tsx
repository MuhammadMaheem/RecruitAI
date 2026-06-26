interface ScoreDimensionBarProps {
  label: string;
  score: number;
  maxScore: number;
  reasoning?: string;
}

function barGradient(pct: number) {
  if (pct >= 0.75) return "linear-gradient(90deg,#059669,#10b981)";
  if (pct >= 0.55) return "linear-gradient(90deg,#2563eb,#3b82f6)";
  if (pct >= 0.35) return "linear-gradient(90deg,#d97706,#f59e0b)";
  return "linear-gradient(90deg,#e11d48,#f43f5e)";
}

function scoreClass(pct: number) {
  if (pct >= 0.75) return "dim-score-green";
  if (pct >= 0.55) return "dim-score-blue";
  if (pct >= 0.35) return "dim-score-amber";
  return "dim-score-red";
}

export default function ScoreDimensionBar({ label, score, maxScore, reasoning }: ScoreDimensionBarProps) {
  const pct = Math.min(score / maxScore, 1);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="section-label dim-bar-label">{label}</span>
        <span className={`mono font-bold dim-score-val ${scoreClass(pct)}`}>
          {score.toFixed(1)}/{maxScore}
        </span>
      </div>
      <div className="dim-bar-track">
        {/* width and gradient are computed from JS props — inline style unavoidable */}
        <div className="dim-bar-fill" style={{ width: `${pct * 100}%`, background: barGradient(pct) }} />
      </div>
      {reasoning && <p className="dim-bar-reasoning">{reasoning}</p>}
    </div>
  );
}
