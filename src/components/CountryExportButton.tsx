"use client";

import { downloadCsv } from "@/lib/utils";

interface IndicatorRow {
  name: string;
  value: number | null;
  unit: string;
  benchmark: number | null;
  year: number | null;
}

interface Props {
  countryName: string;
  iso3: string;
  indicators: IndicatorRow[];
}

export function CountryExportButton({
  countryName,
  iso3,
  indicators,
}: Props) {
  const handleExport = () => {
    const rows = indicators.map((i) => ({
      country: countryName,
      iso3,
      indicator: i.name,
      value: i.value,
      unit: i.unit,
      whoBenchmark: i.benchmark,
      year: i.year,
    }));
    downloadCsv(rows, `${iso3.toLowerCase()}-health-indicators.csv`);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors print:hidden"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export CSV
    </button>
  );
}
