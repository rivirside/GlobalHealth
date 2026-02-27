"use client";

import Link from "next/link";
import {
  DISEASE_CATEGORY_COLORS,
  DISEASE_CATEGORY_LABELS,
  type Outbreak,
  type CountryCapacity,
} from "@/types";
import { CapacityBar } from "./CapacityBar";

interface OutbreakSidebarProps {
  outbreak: Outbreak;
  capacity: CountryCapacity | null;
  onClose: () => void;
}

export function OutbreakSidebar({
  outbreak,
  capacity,
  onClose,
}: OutbreakSidebarProps) {
  const categoryColor =
    DISEASE_CATEGORY_COLORS[outbreak.diseaseCategory] || "#6B7280";
  const categoryLabel =
    DISEASE_CATEGORY_LABELS[outbreak.diseaseCategory] || "Other";

  return (
    <div className="w-96 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0 h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Outbreak Details
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </div>

      {/* Outbreak Info */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: categoryColor }}
          />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {categoryLabel}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {outbreak.disease}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {outbreak.country}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Reported: {new Date(outbreak.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="flex gap-6 mb-3">
          {outbreak.cases !== null && (
            <div>
              <p className="text-xs text-gray-500">Cases</p>
              <p className="text-lg font-semibold font-mono text-gray-900">
                {outbreak.cases.toLocaleString()}
              </p>
            </div>
          )}
          {outbreak.deaths !== null && (
            <div>
              <p className="text-xs text-gray-500">Deaths</p>
              <p className="text-lg font-semibold font-mono text-red-600">
                {outbreak.deaths.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <a
          href={outbreak.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {outbreak.source} Report &rarr;
        </a>
      </div>

      {/* Health System Capacity */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Health System Capacity
        </h4>
        {capacity ? (
          <div className="space-y-3">
            {capacity.indicators.map((indicator) => (
              <CapacityBar key={indicator.code} indicator={indicator} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Loading capacity data...</p>
        )}

        <Link
          href={`/country/${outbreak.countryIso3}`}
          className="block mt-4 text-xs text-blue-600 hover:text-blue-800 underline"
        >
          View Full Country Profile &rarr;
        </Link>
      </div>

      {/* Summary */}
      {outbreak.summary && (
        <div className="px-4 py-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Summary
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {outbreak.summary}
          </p>
        </div>
      )}
    </div>
  );
}
