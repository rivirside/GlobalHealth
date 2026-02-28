"use client";

import {
  DISEASE_CATEGORY_LABELS,
  type DiseaseCategory,
  type OutbreakFilters,
} from "@/types";

interface FilterBarProps {
  filters: OutbreakFilters;
  onFiltersChange: (filters: OutbreakFilters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 sm:flex-wrap">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Disease:</span>
        <select
          value={filters.diseaseCategory}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              diseaseCategory: e.target.value as DiseaseCategory | "all",
            })
          }
          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        >
          <option value="all">All diseases</option>
          {Object.entries(DISEASE_CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Period:</span>
        <select
          value={filters.dateRange}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              dateRange: e.target.value as OutbreakFilters["dateRange"],
            })
          }
          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        >
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
          <option value="all">All time</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={filters.activeOnly}
          onChange={(e) =>
            onFiltersChange({ ...filters, activeOnly: e.target.checked })
          }
          className="rounded border-gray-300"
        />
        <span className="text-gray-600">Active only</span>
      </label>
    </div>
  );
}
