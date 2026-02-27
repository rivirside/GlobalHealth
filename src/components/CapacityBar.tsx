import type { CapacityIndicator } from "@/types";

interface CapacityBarProps {
  indicator: CapacityIndicator;
}

export function CapacityBar({ indicator }: CapacityBarProps) {
  if (indicator.value === null) {
    return (
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm text-gray-700">{indicator.name}</span>
          <span className="text-xs text-gray-400">No data</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full" />
      </div>
    );
  }

  const benchmark = indicator.benchmark;

  // For indicators without benchmarks, show just the value (no bar)
  if (!benchmark) {
    return (
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm text-gray-700">{indicator.name}</span>
          <span className="text-sm font-mono font-semibold text-gray-900">
            {formatValue(indicator.value, indicator.unit)}
          </span>
        </div>
      </div>
    );
  }

  const percentage = Math.min((indicator.value / benchmark) * 100, 100);
  const status = getStatus(indicator.value, benchmark);
  const barColor =
    status === "good"
      ? "bg-emerald-500"
      : status === "warning"
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm text-gray-700">{indicator.name}</span>
        <span className="text-sm font-mono font-semibold text-gray-900">
          {formatValue(indicator.value, indicator.unit)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {indicator.benchmarkLabel && (
        <p className="text-xs text-gray-400 mt-0.5">
          {indicator.benchmarkLabel}
        </p>
      )}
    </div>
  );
}

function getStatus(
  value: number,
  benchmark: number
): "good" | "warning" | "critical" {
  const ratio = value / benchmark;
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
