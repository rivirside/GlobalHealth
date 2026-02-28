"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  type: "country" | "disease";
  label: string;
  href: string;
}

interface Props {
  countries: { iso3: string; name: string }[];
  diseases: { slug: string; name: string }[];
}

export function SearchBar({ countries, diseases }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results: SearchResult[] = [];
  if (query.length >= 2) {
    const q = query.toLowerCase();
    for (const c of countries) {
      if (c.name.toLowerCase().includes(q) || c.iso3.toLowerCase().includes(q)) {
        results.push({ type: "country", label: c.name, href: `/country/${c.iso3}` });
      }
      if (results.length >= 8) break;
    }
    for (const d of diseases) {
      if (d.name.toLowerCase().includes(q) || d.slug.includes(q)) {
        results.push({ type: "disease", label: d.name, href: `/diseases/${d.slug}` });
      }
      if (results.length >= 12) break;
    }
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search countries, diseases..."
        className="w-full sm:w-64 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={`${r.href}-${i}`}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
              onClick={() => {
                router.push(r.href);
                setOpen(false);
                setQuery("");
              }}
            >
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                r.type === "country" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
              }`}>
                {r.type === "country" ? "Country" : "Disease"}
              </span>
              <span className="text-gray-900">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
