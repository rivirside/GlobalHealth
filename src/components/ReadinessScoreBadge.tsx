"use client";

interface ReadinessScoreBadgeProps {
  score: number;
  size?: "sm" | "lg";
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#10B981"; // emerald-500
  if (score >= 40) return "#F59E0B"; // amber-500
  return "#EF4444"; // red-500
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Strong";
  if (score >= 40) return "Moderate";
  return "Limited";
}

export function ReadinessScoreBadge({ score, size = "lg" }: ReadinessScoreBadgeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  if (size === "sm") {
    return (
      <div className="flex items-center gap-2 group relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: color }}
        >
          {Math.round(score)}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-900">{label}</p>
          <p className="text-[10px] text-gray-500">Readiness</p>
        </div>
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-lg z-50 leading-relaxed">
          Custom composite of 6 WHO indicators. Not a validated index.{" "}
          <a href="/about#readiness" className="underline">Methodology</a>
        </div>
      </div>
    );
  }

  // Large SVG ring
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / 100, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke="#E5E7EB" strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        {/* Score number */}
        <text
          x="50" y="46" textAnchor="middle"
          className="text-2xl font-bold" fill="#111827"
          style={{ fontSize: "24px", fontWeight: 700 }}
        >
          {Math.round(score)}
        </text>
        {/* Label */}
        <text
          x="50" y="62" textAnchor="middle"
          fill="#6B7280"
          style={{ fontSize: "10px" }}
        >
          {label}
        </text>
      </svg>
      <p className="text-xs font-semibold text-gray-700 mt-1 group relative cursor-help">
        Readiness Score
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-lg z-50 leading-relaxed font-normal">
          Custom composite of 6 WHO indicators. Not a validated index.{" "}
          <a href="/about" className="underline">Methodology</a>
        </span>
      </p>
    </div>
  );
}
