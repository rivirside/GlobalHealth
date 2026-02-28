"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";

export function HeaderSearch() {
  const [countries, setCountries] = useState<{ iso3: string; name: string }[]>(
    []
  );
  const [diseases, setDiseases] = useState<{ slug: string; name: string }[]>(
    []
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/countries").then((r) => r.json()),
      fetch("/api/diseases").then((r) => r.json()),
    ])
      .then(([c, d]) => {
        setCountries(
          c.map((x: { iso3: string; name: string }) => ({
            iso3: x.iso3,
            name: x.name,
          }))
        );
        setDiseases(
          d.map((x: { slug: string; name: string }) => ({
            slug: x.slug,
            name: x.name,
          }))
        );
        setLoaded(true);
      })
      .catch(() => {});
  }, []);

  if (!loaded) {
    return (
      <input
        type="text"
        disabled
        placeholder="Search..."
        className="w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
      />
    );
  }

  return <SearchBar countries={countries} diseases={diseases} />;
}
