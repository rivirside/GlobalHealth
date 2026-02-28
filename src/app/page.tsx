"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FilterBar } from "@/components/FilterBar";
import { StatsBar } from "@/components/StatsBar";
import { OutbreakSidebar } from "@/components/OutbreakSidebar";
import { MapLegend } from "@/components/MapLegend";
import { LatestReportsFeed } from "@/components/LatestReportsFeed";
import { Skeleton } from "@/components/Skeleton";
import type { Outbreak, OutbreakFilters, CountryCapacity, IndexScore, ReadinessScore, RiskScore, Country } from "@/types";

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

export default function HomePage() {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutbreak, setSelectedOutbreak] = useState<Outbreak | null>(null);
  const [countryCapacity, setCountryCapacity] = useState<CountryCapacity | null>(null);
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [countryIndices, setCountryIndices] = useState<IndexScore[]>([]);
  const [countryRisk, setCountryRisk] = useState<RiskScore | null>(null);
  const [allReadiness, setAllReadiness] = useState<Record<string, ReadinessScore>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [filters, setFilters] = useState<OutbreakFilters>({
    diseaseCategory: "all",
    dateRange: "all",
    region: "all",
    activeOnly: false,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/outbreaks").then((res) => res.json()),
      fetch("/api/readiness/all").then((res) => res.ok ? res.json() : {}),
      fetch("/api/countries").then((res) => res.json()),
    ])
      .then(([outbreakData, readinessData, countryData]) => {
        setOutbreaks(outbreakData);
        setAllReadiness(readinessData);
        setCountries(countryData);
      })
      .catch((err) => console.error("Failed to fetch data:", err))
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
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setReadinessScore(data?.score ?? null))
      .catch(() => setReadinessScore(null));
    fetch(`/api/indices/${iso3}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setCountryIndices(data))
      .catch(() => setCountryIndices([]));
    fetch(`/api/risk/${iso3}`)
      .then((res) => res.ok ? res.json() : null)
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
    if (filters.region !== "all" && !matchesRegion(o.countryIso3, filters.region, countries))
      return false;
    if (filters.dateRange !== "all") {
      const daysAgo = getDaysAgo(filters.dateRange);
      const outbreakDate = new Date(o.date);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysAgo);
      if (outbreakDate < cutoff) return false;
    }
    return true;
  });

  const uniqueCountries = new Set(filteredOutbreaks.map((o) => o.countryIso3));

  return (
    <div className="flex flex-col h-[calc(100dvh-53px)]">
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      {loading ? (
        <div className="bg-gray-50 px-4 py-1.5 border-b border-gray-200 flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <StatsBar
          outbreakCount={filteredOutbreaks.length}
          countryCount={uniqueCountries.size}
        />
      )}
      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative">
          <OutbreakMap
            outbreaks={filteredOutbreaks}
            selectedOutbreak={selectedOutbreak}
            onSelectOutbreak={setSelectedOutbreak}
            readinessScores={allReadiness}
          />
          <MapLegend />
        </div>
        {selectedOutbreak ? (
          <OutbreakSidebar
            outbreak={selectedOutbreak}
            capacity={countryCapacity}
            readinessScore={readinessScore}
            indices={countryIndices}
            riskScore={countryRisk}
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
              <LatestReportsFeed outbreaks={filteredOutbreaks} />
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

function matchesRegion(iso3: string, region: string, countries: Country[]): boolean {
  const country = countries.find((c) => c.iso3 === iso3);
  if (!country) return true;
  return country.whoRegion === region;
}
