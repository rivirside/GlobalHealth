import Link from "next/link";
import type { Metadata } from "next";
import { getRegions } from "@/lib/data";

export const metadata: Metadata = {
  title: "WHO Regions",
  description: "Health profiles for 6 WHO regions: Africa, Americas, Eastern Mediterranean, Europe, South-East Asia, and Western Pacific.",
};

const REGION_COLORS: Record<string, string> = {
  AFRO: "#F59E0B",
  AMRO: "#3B82F6",
  EMRO: "#F97316",
  EURO: "#8B5CF6",
  SEARO: "#10B981",
  WPRO: "#06B6D4",
};

export default function RegionsPage() {
  const regions = getRegions();
  const totalOutbreaks = regions.reduce((s, r) => s + r.outbreakCount, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">WHO Regions</h1>
      <p className="text-gray-500 mb-8">
        {totalOutbreaks} outbreak reports across 6 WHO regions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((r) => {
          const color = REGION_COLORS[r.code] || "#6B7280";
          return (
            <Link
              key={r.code}
              href={`/regions/${r.code}`}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-500 uppercase tracking-wider">{r.code}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{r.shortName}</h2>
              <p className="text-xs text-gray-500 mb-4">{r.countryCount} countries</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Outbreaks</p>
                  <p className="text-lg font-semibold font-mono text-gray-900">{r.outbreakCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Readiness</p>
                  <p className="text-lg font-semibold font-mono text-gray-900">
                    {r.avgReadiness !== null ? r.avgReadiness.toFixed(0) : "—"}
                  </p>
                </div>
              </div>

              {r.topDiseases.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Top diseases</p>
                  <p className="text-xs text-gray-700">
                    {r.topDiseases.slice(0, 3).map((d) => d.name).join(", ")}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
