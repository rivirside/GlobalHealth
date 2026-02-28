"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface CountryOption {
  iso3: string;
  name: string;
}

interface Props {
  countries: CountryOption[];
  value: string;
  onChange: (iso3: string) => void;
  disabledIso3s?: string[];
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export function CountryTypeahead({
  countries,
  value,
  onChange,
  disabledIso3s = [],
  placeholder = "Search countries...",
  label,
  required,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedName = countries.find((c) => c.iso3 === value)?.name || "";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.iso3.toLowerCase().includes(query.toLowerCase())
      )
    : countries;

  const handleSelect = useCallback(
    (iso3: string) => {
      onChange(iso3);
      setQuery("");
      setOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setQuery("");
    setOpen(false);
  }, [onChange]);

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {value && !open ? (
        <div className="flex items-center gap-2 w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white">
          <span className="flex-1 text-gray-900">{selectedName}</span>
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 text-sm leading-none"
            aria-label="Clear selection"
          >
            &times;
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={value ? selectedName : placeholder}
          className="w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
        />
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {value && (
            <button
              onClick={handleClear}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 border-b border-gray-100"
            >
              Clear selection
            </button>
          )}
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">
              No countries match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.slice(0, 50).map((c) => {
              const isDisabled =
                disabledIso3s.includes(c.iso3) && c.iso3 !== value;
              return (
                <button
                  key={c.iso3}
                  onClick={() => !isDisabled && handleSelect(c.iso3)}
                  disabled={isDisabled}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    c.iso3 === value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : isDisabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {c.name}
                  <span className="text-gray-400 ml-2 text-xs">{c.iso3}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
