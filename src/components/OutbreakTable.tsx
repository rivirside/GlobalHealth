"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import {
  DISEASE_CATEGORY_COLORS,
  DISEASE_CATEGORY_LABELS,
} from "@/types";
import type { Outbreak, DiseaseCategory } from "@/types";

interface Props {
  outbreaks: Outbreak[];
  selectedOutbreak: Outbreak | null;
  onSelectOutbreak: (outbreak: Outbreak) => void;
}

type SortColumn =
  | "disease"
  | "country"
  | "date"
  | "category"
  | "cases"
  | "deaths"
  | "status";

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  return (
    <svg
      className={`w-3 h-3 inline-block ml-1 ${active ? "text-gray-900" : "text-gray-300"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={
          active && direction === "asc"
            ? "M5 15l7-7 7 7"
            : "M19 9l-7 7-7-7"
        }
      />
    </svg>
  );
}

export function OutbreakTable({
  outbreaks,
  selectedOutbreak,
  onSelectOutbreak,
}: Props) {
  const [sortCol, setSortCol] = useState<SortColumn>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...outbreaks].sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case "disease":
          cmp = a.disease.localeCompare(b.disease);
          break;
        case "country":
          cmp = a.country.localeCompare(b.country);
          break;
        case "date":
          cmp =
            new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "category":
          cmp = a.diseaseCategory.localeCompare(b.diseaseCategory);
          break;
        case "cases":
          cmp = (a.cases ?? -1) - (b.cases ?? -1);
          break;
        case "deaths":
          cmp = (a.deaths ?? -1) - (b.deaths ?? -1);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [outbreaks, sortCol, sortDir]);

  const toggleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const columns: { key: SortColumn; label: string; className?: string }[] = [
    { key: "disease", label: "Disease" },
    { key: "country", label: "Country" },
    { key: "date", label: "Date" },
    { key: "category", label: "Category" },
    { key: "cases", label: "Cases", className: "text-right" },
    { key: "deaths", label: "Deaths", className: "text-right" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none whitespace-nowrap ${col.className || "text-left"}`}
              >
                {col.label}
                <SortIcon
                  active={sortCol === col.key}
                  direction={sortDir}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((o) => {
            const catColor =
              DISEASE_CATEGORY_COLORS[
                o.diseaseCategory as DiseaseCategory
              ] || "#6B7280";
            const catLabel =
              DISEASE_CATEGORY_LABELS[
                o.diseaseCategory as DiseaseCategory
              ] || "Other";
            const isSelected = selectedOutbreak?.id === o.id;

            return (
              <tr
                key={o.id}
                onClick={() => onSelectOutbreak(o)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-blue-50 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-3 py-2.5 max-w-[200px]">
                  <Link
                    href={`/diseases/${slugify(o.disease)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-900 font-medium hover:text-blue-600 truncate block"
                  >
                    {o.disease}
                  </Link>
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/country/${o.countryIso3}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {o.country}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                  {new Date(o.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: catColor }}
                    />
                    <span className="text-gray-600 text-xs">
                      {catLabel}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-700">
                  {o.cases !== null
                    ? o.cases.toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-700">
                  {o.deaths !== null
                    ? o.deaths.toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      o.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {o.status === "active" ? "Active" : "Resolved"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">
            No outbreaks match your current filters
          </p>
        </div>
      )}
    </div>
  );
}
