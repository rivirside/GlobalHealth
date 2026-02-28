"use client";

import { useState, useEffect } from "react";
import {
  DISEASE_CATEGORY_COLORS,
  DISEASE_CATEGORY_LABELS,
  type DiseaseCategory,
} from "@/types";

export function MapLegend() {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setCollapsed(!mq.matches);
  }, []);

  const categories = Object.keys(DISEASE_CATEGORY_LABELS) as DiseaseCategory[];

  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-md border border-gray-200 max-w-[180px]">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 w-full"
      >
        <span>Legend</span>
        <span className="ml-auto text-gray-400">{collapsed ? "+" : "\u2212"}</span>
      </button>
      {!collapsed && (
        <div className="px-3 pb-3 space-y-1.5">
          {categories.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: DISEASE_CATEGORY_COLORS[key] }}
              />
              <span className="text-xs text-gray-600">
                {DISEASE_CATEGORY_LABELS[key]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
