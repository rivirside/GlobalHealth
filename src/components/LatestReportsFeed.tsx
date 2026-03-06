"use client";

import Link from "next/link";
import { slugify } from "@/lib/utils";
import type { Outbreak, DiseaseCategory } from "@/types";
import { DISEASE_CATEGORY_COLORS, DISEASE_CATEGORY_LABELS } from "@/types";

interface Props {
  outbreaks: Outbreak[];
  onSelectOutbreak?: (outbreak: Outbreak) => void;
}

export function LatestReportsFeed({ outbreaks, onSelectOutbreak }: Props) {
  const latest = outbreaks
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  if (latest.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl" role="img" aria-hidden="true">🔍</span>
        <p className="text-sm font-medium text-gray-600 mt-2">No outbreaks match filters</p>
        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters to see more results</p>
      </div>
    );
  }

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
            <button
              key={o.id}
              onClick={() => onSelectOutbreak?.(o)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                <span className="text-xs text-gray-400 uppercase tracking-wider">{catLabel}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <Link
                href={`/diseases/${slugify(o.disease)}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-gray-900 font-medium hover:text-blue-600"
              >
                {o.disease}
              </Link>
              <p className="text-xs text-gray-500">{o.country}</p>
              <a
                href={o.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
              >
                WHO DON Report &rarr;
              </a>
            </button>
          );
        })}
      </div>
    </div>
  );
}
