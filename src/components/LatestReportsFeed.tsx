"use client";

import type { Outbreak, DiseaseCategory } from "@/types";
import { DISEASE_CATEGORY_COLORS, DISEASE_CATEGORY_LABELS } from "@/types";

interface Props {
  outbreaks: Outbreak[];
}

export function LatestReportsFeed({ outbreaks }: Props) {
  const latest = outbreaks
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  if (latest.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Latest WHO DON Reports</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {latest.map((o) => {
          const catColor = DISEASE_CATEGORY_COLORS[o.diseaseCategory as DiseaseCategory] || "#6B7280";
          const catLabel = DISEASE_CATEGORY_LABELS[o.diseaseCategory as DiseaseCategory] || "Other";
          return (
            <div key={o.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                <span className="text-xs text-gray-400 uppercase tracking-wider">{catLabel}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-sm text-gray-900 font-medium">{o.disease}</p>
              <p className="text-xs text-gray-500">{o.country}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
