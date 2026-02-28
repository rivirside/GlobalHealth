import Link from "next/link";
import type { Metadata } from "next";
import { getDiseases } from "@/lib/data";
import { DISEASE_CATEGORY_COLORS, DISEASE_CATEGORY_LABELS } from "@/types";
import type { DiseaseCategory } from "@/types";

export const metadata: Metadata = {
  title: "Disease Profiles",
  description: "Browse disease profiles tracked from WHO Disease Outbreak News. View outbreak counts, affected countries, transmission details, and more.",
};

export default function DiseasesPage() {
  const diseases = getDiseases();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Disease Profiles</h1>
      <p className="text-gray-500 mb-8">
        {diseases.length} diseases tracked from WHO Disease Outbreak News reports.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {diseases.map((d) => {
          const catColor =
            DISEASE_CATEGORY_COLORS[d.category as DiseaseCategory] || "#6B7280";
          const catLabel =
            DISEASE_CATEGORY_LABELS[d.category as DiseaseCategory] || "Other";

          return (
            <Link
              key={d.slug}
              href={`/diseases/${d.slug}`}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: catColor }}
                />
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {catLabel}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {d.name}
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  <span className="font-mono font-semibold text-gray-900">{d.outbreakCount}</span>{" "}
                  {d.outbreakCount === 1 ? "outbreak" : "outbreaks"}
                </span>
                <span className="text-gray-600">
                  <span className="font-mono font-semibold text-gray-900">{d.countryCount}</span>{" "}
                  {d.countryCount === 1 ? "country" : "countries"}
                </span>
              </div>
              {d.lastReport && (
                <p className="text-xs text-gray-400 mt-2">
                  Latest: {new Date(d.lastReport).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
