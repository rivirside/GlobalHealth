"use client";

import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS, type RiskLevel } from "@/types";

interface RiskBadgeProps {
  score: number;
  level: RiskLevel;
  size?: "sm" | "lg";
  showLabel?: boolean;
}

export function RiskBadge({ score, level, size = "sm", showLabel = true }: RiskBadgeProps) {
  const color = RISK_LEVEL_COLORS[level];
  const label = RISK_LEVEL_LABELS[level];

  if (size === "lg") {
    return (
      <div className="flex items-center gap-3">
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 97.4} 97.4`}
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm font-bold" style={{ color }}>
            {Math.round(score)}
          </span>
        </div>
        {showLabel && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Risk</p>
            <p className="text-sm font-semibold" style={{ color }}>{label}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}15`,
        color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label} ({Math.round(score)})
    </span>
  );
}
