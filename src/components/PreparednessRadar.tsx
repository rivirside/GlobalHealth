"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { IndexScore } from "@/types";

interface PreparednessRadarProps {
  indices: IndexScore[];
}

const COLORS = {
  GHSI: "#3B82F6",
  INFORM: "#EF4444",
  SPAR: "#10B981",
};

function getScoreColor(score: number, inverted: boolean): string {
  const effective = inverted ? 100 - score : score;
  if (effective >= 60) return "#10B981";
  if (effective >= 40) return "#F59E0B";
  return "#EF4444";
}

function IndexHeader({ index }: { index: IndexScore }) {
  const color = COLORS[index.indexName as keyof typeof COLORS] || "#6B7280";
  const effectiveScore = index.invertedScale ? 100 - index.score : index.score;

  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-900">{index.indexName}</h4>
          {index.year < new Date().getFullYear() - 2 && (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              {index.year} data
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {index.indexName === "GHSI" && "Global Health Security Index"}
          {index.indexName === "INFORM" && "INFORM Risk Index"}
          {index.indexName === "SPAR" && "IHR State Party Self-Assessment"}
          {" ("}{index.year})
        </p>
      </div>
      <div className="text-right">
        <p
          className="text-lg font-bold font-mono"
          style={{ color }}
        >
          {index.score.toFixed(1)}
        </p>
        {index.invertedScale && (
          <p className="text-[10px] text-gray-400">lower = better</p>
        )}
      </div>
    </div>
  );
}

function GHSIRadar({ index }: { index: IndexScore }) {
  if (!index.categories) return null;

  const data = Object.entries(index.categories).map(([key, value]) => ({
    category: key.length > 12 ? key.slice(0, 12) + "..." : key,
    fullName: key,
    value,
    fullMark: 100,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <IndexHeader index={index} />
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 9, fill: "#6B7280" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 8, fill: "#9CA3AF" }}
            tickCount={4}
          />
          <Radar
            dataKey="value"
            stroke={COLORS.GHSI}
            fill={COLORS.GHSI}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(value) => [`${Number(value).toFixed(1)}/100`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function INFORMRadar({ index }: { index: IndexScore }) {
  if (!index.categories) return null;

  const data = Object.entries(index.categories).map(([key, value]) => ({
    category: key.length > 18 ? key.slice(0, 18) + "..." : key,
    fullName: key,
    value,
    fullMark: 100,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <IndexHeader index={index} />
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 10, fill: "#6B7280" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 8, fill: "#9CA3AF" }}
            tickCount={4}
          />
          <Radar
            dataKey="value"
            stroke={COLORS.INFORM}
            fill={COLORS.INFORM}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(value) => [`${Number(value).toFixed(1)}/100 (higher = more risk)`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SPARBars({ index }: { index: IndexScore }) {
  if (!index.categories) return null;

  const data = Object.entries(index.categories).map(([key, value]) => ({
    name: key,
    shortName: key.length > 20 ? key.slice(0, 20) + "..." : key,
    value,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <IndexHeader index={index} />
      <div className="space-y-1.5 mt-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600 w-28 flex-shrink-0 truncate" title={item.name}>
              {item.shortName}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-2.5 relative">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(item.value, 100)}%`,
                  backgroundColor: getScoreColor(item.value, false),
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-gray-500 w-7 text-right">
              {item.value.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PreparednessRadar({ indices }: PreparednessRadarProps) {
  if (indices.length === 0) return null;

  const ghsi = indices.find((i) => i.indexName === "GHSI");
  const inform = indices.find((i) => i.indexName === "INFORM");
  const spar = indices.find((i) => i.indexName === "SPAR");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ghsi && <GHSIRadar index={ghsi} />}
        {inform && <INFORMRadar index={inform} />}
      </div>
      {spar && <SPARBars index={spar} />}
    </div>
  );
}
