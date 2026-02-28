"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  DISEASE_CATEGORY_COLORS,
  DISEASE_CATEGORY_LABELS,
  type Outbreak,
  type DiseaseCategory,
} from "@/types";

interface OutbreakTimelineProps {
  outbreaks: Outbreak[];
}

type GroupBy = "total" | "category";

export function OutbreakTimeline({ outbreaks }: OutbreakTimelineProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>("total");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filtered = useMemo(() => {
    if (selectedRegion === "all") return outbreaks;
    return outbreaks.filter((o) => o.countryIso3 === selectedRegion);
  }, [outbreaks, selectedRegion]);

  const categories = Object.keys(DISEASE_CATEGORY_COLORS) as DiseaseCategory[];

  const monthlyData = useMemo(() => {
    const buckets: Record<string, Record<string, number>> = {};

    for (const o of filtered) {
      const d = new Date(o.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (!buckets[key]) {
        buckets[key] = { total: 0 };
        for (const cat of categories) {
          buckets[key][cat] = 0;
        }
      }
      buckets[key].total++;
      buckets[key][o.diseaseCategory] = (buckets[key][o.diseaseCategory] || 0) + 1;
    }

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({
        month,
        label: formatMonth(month),
        ...counts,
      }));
  }, [filtered, categories]);

  const countries = useMemo(() => {
    const set = new Map<string, string>();
    for (const o of outbreaks) {
      set.set(o.countryIso3, o.country);
    }
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [outbreaks]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setGroupBy("total")}
            className={`px-3 py-1.5 rounded text-sm ${
              groupBy === "total"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setGroupBy("category")}
            className={`px-3 py-1.5 rounded text-sm ${
              groupBy === "category"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            By Category
          </button>
        </div>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-white"
        >
          <option value="all">All Countries</option>
          {countries.map(([iso3, name]) => (
            <option key={iso3} value={iso3}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      {monthlyData.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500">No outbreak data available for the selected filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={400}>
            {groupBy === "total" ? (
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Outbreaks"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  iconType="circle"
                />
                {categories.map((cat) => (
                  <Area
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    name={DISEASE_CATEGORY_LABELS[cat]}
                    stackId="1"
                    stroke={DISEASE_CATEGORY_COLORS[cat]}
                    fill={DISEASE_CATEGORY_COLORS[cat]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold font-mono text-gray-900">
            {filtered.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Countries</p>
          <p className="text-2xl font-bold font-mono text-gray-900">
            {new Set(filtered.map((o) => o.countryIso3)).size}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Diseases</p>
          <p className="text-2xl font-bold font-mono text-gray-900">
            {new Set(filtered.map((o) => o.disease)).size}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Date Range</p>
          <p className="text-sm font-mono text-gray-900 mt-1">
            {filtered.length > 0
              ? `${filtered[filtered.length - 1].date.slice(0, 7)} to ${filtered[0].date.slice(0, 7)}`
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatMonth(key: string): string {
  const [year, month] = key.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
}
