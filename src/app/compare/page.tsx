"use client";

import { useState, useEffect } from "react";
import { ComparisonChart } from "@/components/ComparisonChart";
import { CountryTypeahead } from "@/components/CountryTypeahead";
import type { CountryCapacity, IndexScore, Outbreak } from "@/types";

interface CountryOption {
  iso3: string;
  name: string;
}

interface CountryData {
  iso3: string;
  name: string;
  capacity: CountryCapacity | null;
  readinessScore: number | null;
  indices: IndexScore[];
  outbreakCount: number;
}

export default function ComparePage() {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selected, setSelected] = useState<string[]>(["", "", ""]);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [allOutbreaks, setAllOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch countries + outbreaks once on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/countries").then((res) => res.json()),
      fetch("/api/outbreaks").then((res) => res.json()),
    ])
      .then(([countryList, outbreakList]) => {
        const sorted = countryList
          .map((c: { iso3: string; name: string }) => ({
            iso3: c.iso3,
            name: c.name,
          }))
          .sort((a: CountryOption, b: CountryOption) =>
            a.name.localeCompare(b.name)
          );
        setCountries(sorted);
        setAllOutbreaks(outbreakList);
      })
      .catch(() => {});
  }, []);

  const handleSelect = (index: number, iso3: string) => {
    const next = [...selected];
    next[index] = iso3;
    setSelected(next);
  };

  const activeSelections = selected.filter((s) => s !== "");

  useEffect(() => {
    if (activeSelections.length < 2) {
      setCountryData([]);
      return;
    }

    setLoading(true);
    Promise.all(
      activeSelections.map(async (iso3) => {
        const [capacityRes, readinessRes, indicesRes] = await Promise.all([
          fetch(`/api/capacity/${iso3}`).then((r) =>
            r.ok ? r.json() : null
          ),
          fetch(`/api/readiness/${iso3}`).then((r) =>
            r.ok ? r.json() : null
          ),
          fetch(`/api/indices/${iso3}`).then((r) =>
            r.ok ? r.json() : []
          ),
        ]);

        const name =
          capacityRes?.name ||
          countries.find((c) => c.iso3 === iso3)?.name ||
          iso3;
        const outbreakCount = allOutbreaks.filter(
          (o) => o.countryIso3 === iso3
        ).length;

        return {
          iso3,
          name,
          capacity: capacityRes,
          readinessScore: readinessRes?.score ?? null,
          indices: indicesRes,
          outbreakCount,
        } as CountryData;
      })
    )
      .then(setCountryData)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSelections.join(","), allOutbreaks]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Country Comparison
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Select 2-3 countries to compare health system capacity, preparedness
        indices, and outbreak history side by side.
      </p>

      {/* Country Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <CountryTypeahead
            key={i}
            countries={countries}
            value={selected[i]}
            onChange={(iso3) => handleSelect(i, iso3)}
            disabledIso3s={selected.filter((s, idx) => idx !== i && s !== "")}
            label={`Country ${i + 1}`}
            required={i < 2}
            placeholder={i < 2 ? "Search countries..." : "Optional"}
          />
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading comparison data...
        </div>
      ) : countryData.length >= 2 ? (
        <ComparisonChart countries={countryData} />
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500">
            Select at least 2 countries above to compare.
          </p>
        </div>
      )}
    </div>
  );
}
