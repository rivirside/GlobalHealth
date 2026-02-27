"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FilterBar } from "@/components/FilterBar";
import { StatsBar } from "@/components/StatsBar";
import { OutbreakSidebar } from "@/components/OutbreakSidebar";
import type { Outbreak, OutbreakFilters, CountryCapacity } from "@/types";

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
  }, []);

  useEffect(() => {
    if (!selectedOutbreak) {
      setCountryCapacity(null);
      return;
    }
    fetch(`/api/capacity/${selectedOutbreak.countryIso3}`)
      .then((res) => res.json())
      .then((data) => setCountryCapacity(data))
      .catch((err) => console.error("Failed to fetch capacity:", err));
  }, [selectedOutbreak]);

  const filteredOutbreaks = outbreaks.filter((o) => {
    if (
      filters.diseaseCategory !== "all" &&
      o.diseaseCategory !== filters.diseaseCategory
    )
      return false;
    if (filters.activeOnly && o.status !== "active") return false;
    if (filters.region !== "all" && !matchesRegion(o.countryIso3, filters.region))
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
    <div className="flex flex-col" style={{ height: "calc(100vh - 53px)" }}>
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      <StatsBar
        outbreakCount={filteredOutbreaks.length}
        countryCount={uniqueCountries.size}
      />
      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1">
          <OutbreakMap
            outbreaks={filteredOutbreaks}
            selectedOutbreak={selectedOutbreak}
            onSelectOutbreak={setSelectedOutbreak}
          />
        </div>
        {selectedOutbreak && (
          <OutbreakSidebar
            outbreak={selectedOutbreak}
            capacity={countryCapacity}
            onClose={() => setSelectedOutbreak(null)}
          />
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

function matchesRegion(_iso3: string, _region: string): boolean {
  // TODO: implement region matching using country metadata
  return true;
}
