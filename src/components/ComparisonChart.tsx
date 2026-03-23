"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { CountryCapacity, IndexScore } from "@/types";
import { CAPACITY_INDICATORS } from "@/types";
import { ReadinessScoreBadge } from "./ReadinessScoreBadge";

interface ComparisonChartProps {
  countries: {
    iso3: string;
    name: string;
    capacity: CountryCapacity | null;
    readinessScore: number | null;
    indices: IndexScore[];
    outbreakCount: number;
  }[];
}

const COLORS = ["#3B82F6", "#EF4444", "#10B981"];
const CURRENT_YEAR = new Date().getFullYear();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CapacityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg p-2 text-xs">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string; payload: Record<string, number | null> }, i: number) => {
        const iso3 = Object.keys(p.payload).find(k => !k.includes("_") && k !== "name" && k !== "benchmark" && p.payload[k] === p.value);
        const year = iso3 ? p.payload[`${iso3}_year`] : null;
        const stale = year && year < CURRENT_YEAR - 2;
        return (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value?.toLocaleString() ?? "N/A"}
            {year && (
              <span className={stale ? "text-amber-600 ml-1" : "text-gray-400 ml-1"}>
                ({year})
              </span>
            )}
          </p>
        );
      })}
    </div>
  );
}

export function ComparisonChart({ countries }: ComparisonChartProps) {
  const capacityData = useMemo(() => {
    return CAPACITY_INDICATORS.map((ind) => {
      const entry: Record<string, string | number | null> = {
        name: ind.name,
        benchmark: ind.benchmark,
      };
      for (const c of countries) {
        const found = c.capacity?.indicators.find((i) => i.code === ind.code);
        entry[c.iso3] = found?.value ?? null;
        entry[`${c.iso3}_year`] = found?.year ?? null;
      }
      return entry;
    });
  }, [countries]);

  const indexData = useMemo(() => {
    const indexNames = ["GHSI", "SPAR"];
    return indexNames.map((name) => {
      // Show year in label to surface data staleness (e.g. "GHSI (2021)")
      let label = name;
      for (const c of countries) {
        const idx = c.indices.find((i) => i.indexName === name);
        if (idx && idx.year < CURRENT_YEAR - 1) {
          label = `${name} (${idx.year})`;
          break;
        }
      }
      const entry: Record<string, string | number | null> = { name: label };
      for (const c of countries) {
        const idx = c.indices.find((i) => i.indexName === name);
        entry[c.iso3] = idx?.score ?? null;
      }
      return entry;
    });
  }, [countries]);

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {countries.map((c, i) => (
          <div
            key={c.iso3}
            className="bg-white border-2 rounded-lg p-4"
            style={{ borderColor: COLORS[i] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i] }}
              />
              <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
            </div>
            <div className="flex items-center gap-4">
              {c.readinessScore !== null && (
                <ReadinessScoreBadge score={c.readinessScore} size="sm" />
              )}
              <div className="text-sm text-gray-600">
                <p>{c.outbreakCount} outbreaks</p>
                <p>{c.indices.length} index scores</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Capacity Comparison */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Health System Capacity
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={capacityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <YAxis
                dataKey="name"
                type="category"
                width={130}
                tick={{ fontSize: 11, fill: "#6B7280" }}
              />
              <Tooltip content={<CapacityTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {countries.map((c, i) => (
                <Bar
                  key={c.iso3}
                  dataKey={c.iso3}
                  name={c.name}
                  fill={COLORS[i]}
                  fillOpacity={0.8}
                  radius={[0, 2, 2, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-gray-400 mt-2">
            Data years vary by country and indicator. Hover bars to see vintage.
          </p>
        </div>
      </section>

      {/* Index Comparison */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Preparedness Indices
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={indexData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#6B7280" }}
              />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {countries.map((c, i) => (
                <Bar
                  key={c.iso3}
                  dataKey={c.iso3}
                  name={c.name}
                  fill={COLORS[i]}
                  fillOpacity={0.8}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
