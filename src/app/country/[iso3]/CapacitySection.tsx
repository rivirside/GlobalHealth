"use client";

import type { CapacityIndicator } from "@/types";

interface Props {
  indicators: CapacityIndicator[];
}

export function CapacitySection({ indicators }: Props) {
  if (indicators.length === 0) {
    return (
      <p className="text-sm text-gray-400">No capacity data available.</p>
    );
  }

  return (
    <div className="space-y-5">
      {indicators.map((ind) => (
        <CapacityRow key={ind.code} indicator={ind} />
      ))}
    </div>
  );
}

function CapacityRow({ indicator }: { indicator: CapacityIndicator }) {
  const { name, value, benchmark, benchmarkLabel, unit, year, source } =
    indicator;

  if (value === null) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-medium text-gray-700">{name}</span>
          <span className="text-xs text-gray-400">No data</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full" />
      </div>
    );
  }

  const ratio = benchmark ? value / benchmark : 0;
  const percentage = benchmark ? Math.min(ratio * 100, 100) : 0;
  const status = getStatus(ratio);
  const barColor =
    status === "good"
      ? "bg-emerald-500"
      : status === "warning"
        ? "bg-amber-500"
        : "bg-red-500";
  const statusText =
    status === "good"
      ? "Meets benchmark"
      : status === "warning"
        ? "Below benchmark"
        : "Far below benchmark";
  const statusDot =
    status === "good"
      ? "bg-emerald-500"
      : status === "warning"
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-1">
        <div>
          <span className="text-sm font-medium text-gray-700">{name}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            <span className="text-xs text-gray-500">{statusText}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold font-mono text-gray-900">
            {formatValue(value, unit)}
          </span>
          {year && (
            <p className="text-xs text-gray-400">{year}</p>
          )}
        </div>
      </div>
      <div className="mt-3 relative">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {benchmark && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">{benchmarkLabel}</span>
            <span className="text-xs text-gray-400">{source}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatus(ratio: number): "good" | "warning" | "critical" {
  if (ratio >= 0.75) return "good";
  if (ratio >= 0.4) return "warning";
  return "critical";
}

function formatValue(value: number, unit: string): string {
  if (unit === "%") return `${value.toFixed(0)}%`;
  if (unit === "% of GDP") return `${value.toFixed(1)}%`;
  if (unit === "USD per capita") return `$${Math.round(value).toLocaleString()}`;
  if (unit === "USD") return `$${Math.round(value).toLocaleString()}`;
  if (unit === "people") return Math.round(value).toLocaleString();
  if (unit.includes("index")) return value.toFixed(0);
  return value.toFixed(1);
}
