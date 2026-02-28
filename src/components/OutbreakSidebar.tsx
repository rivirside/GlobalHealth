"use client";

import { useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import {
  DISEASE_CATEGORY_COLORS,
  DISEASE_CATEGORY_LABELS,
  type Outbreak,
  type CountryCapacity,
  type IndexScore,
  type RiskScore,
} from "@/types";
import { CapacityBar } from "./CapacityBar";
import { ReadinessScoreBadge } from "./ReadinessScoreBadge";
import { RiskBadge } from "./RiskBadge";
import { Skeleton, SkeletonBar } from "./Skeleton";

interface OutbreakSidebarProps {
  outbreak: Outbreak;
  capacity: CountryCapacity | null;
  readinessScore: number | null;
  indices: IndexScore[];
  riskScore: RiskScore | null;
  incomeGroup?: string;
  onClose: () => void;
}

export function OutbreakSidebar({
  outbreak,
  capacity,
  readinessScore,
  indices,
  riskScore,
  incomeGroup,
  onClose,
}: OutbreakSidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const categoryColor =
    DISEASE_CATEGORY_COLORS[outbreak.diseaseCategory] || "#6B7280";
  const categoryLabel =
    DISEASE_CATEGORY_LABELS[outbreak.diseaseCategory] || "Other";

  return (
    <>
      {/* Backdrop for mobile/tablet overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-30 lg:hidden"
        onClick={onClose}
      />

      <div
        className={`
          bg-white overflow-y-auto z-40
          fixed bottom-0 inset-x-0 rounded-t-xl shadow-2xl
          ${expanded ? "max-h-[70vh]" : "max-h-[180px]"}
          transition-[max-height] duration-300 ease-in-out
          md:absolute md:right-0 md:top-0 md:bottom-0 md:left-auto md:w-80 md:max-h-full md:rounded-none md:shadow-xl
          lg:relative lg:w-96 lg:shadow-none lg:border-l lg:border-gray-200 lg:flex-shrink-0 lg:h-full
        `}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-10 h-1 rounded-full bg-gray-300"
            aria-label={expanded ? "Collapse panel" : "Expand panel"}
          />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: categoryColor }}
            />
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {outbreak.disease} — {outbreak.country}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-gray-600 md:hidden"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              <svg className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Close sidebar"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`${expanded ? "block" : "hidden"} md:block`}>
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
              {outbreak.status === "resolved" && (
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  Resolved
                </span>
              )}
              {incomeGroup && (
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-auto">
                  {incomeGroup}
                </span>
              )}
            </div>
            <Link
              href={`/diseases/${slugify(outbreak.disease)}`}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-1 block"
            >
              {outbreak.disease}
            </Link>
            <Link
              href={`/country/${outbreak.countryIso3}`}
              className="text-sm text-gray-600 hover:text-blue-600 mb-3 block"
            >
              {outbreak.country}
            </Link>
            <p className="text-xs text-gray-500 mb-3">
              Reported:{" "}
              {new Date(outbreak.date).toLocaleDateString("en-US", {
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

          {/* Risk + Readiness + Index Summary */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 flex-wrap">
              {riskScore && (
                <RiskBadge score={riskScore.score} level={riskScore.level} size="sm" />
              )}
              {readinessScore !== null && (
                <ReadinessScoreBadge score={readinessScore} size="sm" />
              )}
              {indices.length > 0 && (
                <div className="flex gap-3">
                  {indices.map((idx) => (
                    <div key={idx.indexName} className="text-center">
                      <p className="text-sm font-semibold font-mono text-gray-900">
                        {idx.score.toFixed(0)}
                      </p>
                      <p className="text-[10px] text-gray-500">{idx.indexName}</p>
                    </div>
                  ))}
                </div>
              )}
              {!riskScore && readinessScore === null && indices.length === 0 && (
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              )}
            </div>
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
              <div className="space-y-3">
                <SkeletonBar />
                <SkeletonBar />
                <SkeletonBar />
                <SkeletonBar />
              </div>
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
      </div>
    </>
  );
}
