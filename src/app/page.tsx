"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FilterBar } from "@/components/FilterBar";
import { StatsBar } from "@/components/StatsBar";
import { OutbreakSidebar } from "@/components/OutbreakSidebar";
import { MapLegend } from "@/components/MapLegend";
import { LatestReportsFeed } from "@/components/LatestReportsFeed";
import type { Outbreak, OutbreakFilters, CountryCapacity, IndexScore, ReadinessScore, Country } from "@/types";

const OutbreakMap = dynamic(() => import("@/components/OutbreakMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-gray-100 flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  ),
});

export default function HomePage() {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [selectedOutbreak, setSelectedOutbreak] = useState<Outbreak | null>(
    null
  );
  const [countryCapacity, setCountryCapacity] =
    useState<CountryCapacity | null>(null);
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [countryIndices, setCountryIndices] = useState<IndexScore[]>([]);
  const [allReadiness, setAllReadiness] = useState<Record<string, ReadinessScore>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [filters, setFilters] = useState<OutbreakFilters>({
    diseaseCategory: "all",
    dateRange: "all",
    region: "all",
    activeOnly: false,
  });

  useEffect(() => {
    fetch("/api/outbreaks")
      .then((res) => res.json())
      .then((data) => setOutbreaks(data))
      .catch((err) => console.error("Failed to fetch outbreaks:", err));

    fetch("/api/readiness/all")
      .then((res) => res.ok ? res.json() : {})
      .then((data) => setAllReadiness(data))
      .catch(() => {});

    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedOutbreak) {
      setCountryCapacity(null);
      setReadinessScore(null);
      setCountryIndices([]);
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
      <StatsBar
        outbreakCount={filteredOutbreaks.length}
        countryCount={uniqueCountries.size}
      />
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
            onClose={() => setSelectedOutbreak(null)}
          />
        ) : (
          <div className="hidden lg:block w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
            <LatestReportsFeed outbreaks={filteredOutbreaks} />
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
