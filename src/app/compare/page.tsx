"use client";

import { useState, useEffect } from "react";
import { ComparisonChart } from "@/components/ComparisonChart";
import type { CountryCapacity, IndexScore } from "@/types";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .map((c: { iso3: string; name: string }) => ({
            iso3: c.iso3,
            name: c.name,
          }))
          .sort((a: CountryOption, b: CountryOption) =>
            a.name.localeCompare(b.name)
          );
        setCountries(sorted);
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
        const [capacityRes, readinessRes, indicesRes, outbreaksRes] =
          await Promise.all([
            fetch(`/api/capacity/${iso3}`).then((r) =>
              r.ok ? r.json() : null
            ),
            fetch(`/api/readiness/${iso3}`).then((r) =>
              r.ok ? r.json() : null
            ),
            fetch(`/api/indices/${iso3}`).then((r) =>
              r.ok ? r.json() : []
            ),
            fetch("/api/outbreaks").then((r) => r.ok ? r.json() : []),
          ]);

        const name =
          capacityRes?.name ||
          countries.find((c) => c.iso3 === iso3)?.name ||
          iso3;
        const outbreakCount = outbreaksRes.filter(
          (o: { countryIso3: string }) => o.countryIso3 === iso3
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
  }, [activeSelections.join(",")]);

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
          <div key={i}>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Country {i + 1}
              {i < 2 && <span className="text-red-400 ml-1">*</span>}
            </label>
            <select
              value={selected[i]}
              onChange={(e) => handleSelect(i, e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white"
            >
              <option value="">
                {i < 2 ? "Select a country" : "Optional"}
              </option>
              {countries.map((c) => (
                <option
                  key={c.iso3}
                  value={c.iso3}
                  disabled={selected.includes(c.iso3) && selected[i] !== c.iso3}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>
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
