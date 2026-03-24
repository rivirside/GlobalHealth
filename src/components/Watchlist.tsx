"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";
import { CountryTypeahead } from "./CountryTypeahead";
import { RiskBadge } from "./RiskBadge";
import type { Outbreak, Country, ReadinessScore, RiskScore } from "@/types";

interface WatchlistProps {
  outbreaks: Outbreak[];
  countries: Country[];
  allReadiness: Record<string, ReadinessScore>;
  allRisk: Record<string, RiskScore>;
  onFlyTo?: (iso3: string) => void;
}

export function Watchlist({
  outbreaks,
  countries,
  allReadiness,
  allRisk,
  onFlyTo,
}: WatchlistProps) {
  const [watched, setWatched] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [addValue, setAddValue] = useState("");

  useEffect(() => {
    setWatched(getWatchlist());
  }, []);

  const handleAdd = useCallback(
    (iso3: string) => {
      if (!iso3) return;
      const updated = addToWatchlist(iso3);
      setWatched(updated);
      setAddValue("");
      setAdding(false);
    },
    []
  );

  const handleRemove = useCallback((iso3: string) => {
    const updated = removeFromWatchlist(iso3);
    setWatched(updated);
  }, []);

  // Don't render anything if empty and not in add mode
  if (watched.length === 0 && !adding) {
    return (
      <div className="bg-blue-50/50 border-b border-blue-100 px-4 py-2 flex items-center gap-3">
        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p className="text-xs text-blue-600">
          Pin countries to track them here.
        </p>
        <button
          onClick={() => setAdding(true)}
          className="text-xs font-medium text-blue-700 hover:text-blue-900 underline"
        >
          Add country
        </button>
      </div>
    );
  }

  const countryOptions = countries.map((c) => ({ iso3: c.iso3, name: c.name }));

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-3 overflow-x-auto">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>

        {watched.map((iso3) => {
          const country = countries.find((c) => c.iso3 === iso3);
          const risk = allRisk[iso3];
          const readiness = allReadiness[iso3];
          const activeCount = outbreaks.filter(
            (o) => o.countryIso3 === iso3 && o.status === "active"
          ).length;

          return (
            <div
              key={iso3}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 flex-shrink-0 group cursor-pointer hover:border-blue-300 transition-colors"
              onClick={() => onFlyTo?.(iso3)}
            >
              <Link
                href={`/country/${iso3}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-gray-900 hover:text-blue-600"
              >
                {country?.name || iso3}
              </Link>
              {risk && <RiskBadge score={risk.score} level={risk.level} size="sm" />}
              {readiness && (
                <span className="text-[10px] font-mono text-gray-500">
                  R:{Math.round(readiness.score)}
                </span>
              )}
              {activeCount > 0 && (
                <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  {activeCount} active
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(iso3);
                }}
                className="text-gray-300 hover:text-red-500 text-sm leading-none ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${country?.name || iso3} from watchlist`}
              >
                &times;
              </button>
            </div>
          );
        })}

        {adding ? (
          <div className="w-48 flex-shrink-0">
            <CountryTypeahead
              countries={countryOptions}
              value={addValue}
              onChange={handleAdd}
              disabledIso3s={watched}
              placeholder="Add country..."
            />
          </div>
        ) : watched.length < 5 ? (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 flex-shrink-0 px-2 py-1.5 rounded hover:bg-blue-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        ) : null}
      </div>
    </div>
  );
}
