"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { FilterBar } from "@/components/FilterBar";
import { StatsBar } from "@/components/StatsBar";
import { OutbreakSidebar } from "@/components/OutbreakSidebar";
import { OutbreakTable } from "@/components/OutbreakTable";
import { MapLegend } from "@/components/MapLegend";
import { LatestReportsFeed } from "@/components/LatestReportsFeed";
import { ExportButton } from "@/components/ExportButton";
import { Watchlist } from "@/components/Watchlist";
import { Skeleton } from "@/components/Skeleton";
import { downloadCsv } from "@/lib/utils";
import type {
  Outbreak,
  OutbreakFilters,
  CountryCapacity,
  IndexScore,
  ReadinessScore,
  RiskScore,
  Country,
} from "@/types";

const OutbreakMap = dynamic(() => import("@/components/OutbreakMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-2" />
        <p className="text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

// --- URL param helpers ---
function readFiltersFromUrl(): {
  filters: OutbreakFilters;
  viewMode: "map" | "table";
} {
  if (typeof window === "undefined") {
    return {
      filters: { diseaseCategory: "all", dateRange: "all", region: "all", activeOnly: false },
      viewMode: "map",
    };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    filters: {
      diseaseCategory:
        (params.get("disease") as OutbreakFilters["diseaseCategory"]) || "all",
      dateRange:
        (params.get("period") as OutbreakFilters["dateRange"]) || "all",
      region: params.get("region") || "all",
      activeOnly: params.get("active") === "1",
    },
    viewMode: params.get("view") === "table" ? "table" : "map",
  };
}

function writeFiltersToUrl(
  filters: OutbreakFilters,
  viewMode: "map" | "table"
) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (filters.diseaseCategory !== "all")
    params.set("disease", filters.diseaseCategory);
  if (filters.dateRange !== "all") params.set("period", filters.dateRange);
  if (filters.region !== "all") params.set("region", filters.region);
  if (filters.activeOnly) params.set("active", "1");
  if (viewMode === "table") params.set("view", "table");
  const qs = params.toString();
  window.history.replaceState({}, "", qs ? `/?${qs}` : "/");
}

export default function HomePage() {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedOutbreak, setSelectedOutbreak] = useState<Outbreak | null>(
    null
  );
  const [countryCapacity, setCountryCapacity] =
    useState<CountryCapacity | null>(null);
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [countryIndices, setCountryIndices] = useState<IndexScore[]>([]);
  const [countryRisk, setCountryRisk] = useState<RiskScore | null>(null);
  const [allReadiness, setAllReadiness] = useState<
    Record<string, ReadinessScore>
  >({});
  const [allRisk, setAllRisk] = useState<Record<string, RiskScore>>({});
  const [countries, setCountries] = useState<Country[]>([]);

  // Read initial state from URL
  const [filters, setFilters] = useState<OutbreakFilters>(() => readFiltersFromUrl().filters);
  const [viewMode, setViewMode] = useState<"map" | "table">(() => readFiltersFromUrl().viewMode);

  // Sync filters/viewMode to URL
  useEffect(() => {
    writeFiltersToUrl(filters, viewMode);
  }, [filters, viewMode]);

  useEffect(() => {
    Promise.all([
      fetch("/api/outbreaks").then((res) => res.json()),
      fetch("/api/readiness/all").then((res) =>
        res.ok ? res.json() : {}
      ),
      fetch("/api/countries").then((res) => res.json()),
      fetch("/api/risk/all").then((res) =>
        res.ok ? res.json() : {}
      ),
    ])
      .then(([outbreakData, readinessData, countryData, riskData]) => {
        setOutbreaks(outbreakData);
        setAllReadiness(readinessData);
        setCountries(countryData);
        setAllRisk(riskData);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedOutbreak) {
      setCountryCapacity(null);
      setReadinessScore(null);
      setCountryIndices([]);
      setCountryRisk(null);
      return;
    }
    const iso3 = selectedOutbreak.countryIso3;
    fetch(`/api/capacity/${iso3}`)
      .then((res) => res.json())
      .then((data) => setCountryCapacity(data))
      .catch((err) => console.error("Failed to fetch capacity:", err));
    fetch(`/api/readiness/${iso3}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setReadinessScore(data?.score ?? null))
      .catch(() => setReadinessScore(null));
    fetch(`/api/indices/${iso3}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCountryIndices(data))
      .catch(() => setCountryIndices([]));
    fetch(`/api/risk/${iso3}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCountryRisk(data))
      .catch(() => setCountryRisk(null));
  }, [selectedOutbreak]);

  const filteredOutbreaks = outbreaks.filter((o) => {
    if (
      filters.diseaseCategory !== "all" &&
      o.diseaseCategory !== filters.diseaseCategory
    )
      return false;
    if (filters.activeOnly && o.status !== "active") return false;
    if (
      filters.region !== "all" &&
      !matchesRegion(o.countryIso3, filters.region, countries)
    )
      return false;
    if (filters.dateRange !== "all") {
      const daysAgo = getDaysAgo(filters.dateRange);
      // Append T00:00:00Z to treat date strings as UTC, avoiding timezone shifts
      const outbreakDate = new Date(o.date + "T00:00:00Z");
      const cutoff = new Date();
      cutoff.setUTCDate(cutoff.getUTCDate() - daysAgo);
      cutoff.setUTCHours(0, 0, 0, 0);
      if (outbreakDate < cutoff) return false;
    }
    return true;
  });

  const uniqueCountries = new Set(
    filteredOutbreaks.map((o) => o.countryIso3)
  );

  const handleExportCsv = useCallback(() => {
    const rows = filteredOutbreaks.map((o) => ({
      disease: o.disease,
      category: o.diseaseCategory,
      country: o.country,
      countryIso3: o.countryIso3,
      date: o.date,
      cases: o.cases,
      deaths: o.deaths,
      status: o.status,
      source: o.source,
      sourceUrl: o.sourceUrl,
    }));
    downloadCsv(
      rows,
      `outbreaks-${new Date().toISOString().slice(0, 10)}.csv`
    );
  }, [filteredOutbreaks]);

  // Find income group for selected outbreak's country
  const selectedCountry = selectedOutbreak
    ? countries.find((c) => c.iso3 === selectedOutbreak.countryIso3)
    : null;

  return (
    <div className="flex flex-col h-[calc(100dvh-53px)]">
      {fetchError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between">
          <p className="text-sm text-red-700">
            Unable to load outbreak data. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-medium text-red-700 hover:text-red-900 underline"
          >
            Refresh
          </button>
        </div>
      )}
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      {!loading && (
        <Watchlist
          outbreaks={outbreaks}
          countries={countries}
          allReadiness={allReadiness}
          allRisk={allRisk}
        />
      )}
      <div className="bg-gray-50 px-4 py-1.5 border-b border-gray-200 flex items-center justify-between">
        {loading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <StatsBar
            outbreakCount={filteredOutbreaks.length}
            countryCount={uniqueCountries.size}
          />
        )}
        <div className="flex items-center gap-2">
          <ExportButton onClick={handleExportCsv} />
          <div className="flex rounded-md overflow-hidden border border-gray-200">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-200 ${
                viewMode === "table"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative">
          {viewMode === "map" ? (
            <>
              <OutbreakMap
                outbreaks={filteredOutbreaks}
                selectedOutbreak={selectedOutbreak}
                onSelectOutbreak={setSelectedOutbreak}
                readinessScores={allReadiness}
              />
              <MapLegend />
            </>
          ) : (
            <OutbreakTable
              outbreaks={filteredOutbreaks}
              selectedOutbreak={selectedOutbreak}
              onSelectOutbreak={setSelectedOutbreak}
            />
          )}
        </div>
        {selectedOutbreak ? (
          <OutbreakSidebar
            outbreak={selectedOutbreak}
            capacity={countryCapacity}
            readinessScore={readinessScore}
            indices={countryIndices}
            riskScore={countryRisk}
            incomeGroup={selectedCountry?.incomeGroup}
            onClose={() => setSelectedOutbreak(null)}
          />
        ) : (
          <div className="hidden lg:block w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <LatestReportsFeed
                outbreaks={filteredOutbreaks}
                onSelectOutbreak={setSelectedOutbreak}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getDaysAgo(range: string): number {
  switch (range) {
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "1y":
      return 365;
    default:
      return Infinity;
  }
}

function matchesRegion(
  iso3: string,
  region: string,
  countries: Country[]
): boolean {
  const country = countries.find((c) => c.iso3 === iso3);
  if (!country) return true;
  return country.whoRegion === region;
}
