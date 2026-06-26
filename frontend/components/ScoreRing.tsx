"use client";
import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function scoreColor(pct: number) {
  if (pct >= 0.75) return "#10b981";
  if (pct >= 0.55) return "#3b82f6";
  if (pct >= 0.35) return "#f59e0b";
  return "#f43f5e";
}

export default function ScoreRing({ score, max = 100, size = 96, strokeWidth = 7, label }: ScoreRingProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const pct = Math.min(score / max, 1);
  const color = scoreColor(pct);
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - (animated ? pct : 0));

  /* Dimensions and computed animation values must be inline — they derive from JS props */
  return (
    <div className="flex flex-col items-center gap-1" aria-label={`Score: ${score} of ${max}`}>
      {/* eslint-disable-next-line react/forbid-dom-props */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="score-ring-svg"
        >
          <circle cx={cx} cy={cx} r={r} fill="none" strokeWidth={strokeWidth} className="score-ring-track" />
          <circle
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease",
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>
        <div className="score-ring-center">
          <span className="mono font-bold leading-none" style={{ fontSize: size * 0.22, color }}>
            {Math.round(score)}
          </span>
          <span className="score-ring-label-small leading-none mt-0.5">
            /{max}
          </span>
        </div>
      </div>
      {label && <span className="score-ring-label-small text-center">{label}</span>}
    </div>
  );
}
