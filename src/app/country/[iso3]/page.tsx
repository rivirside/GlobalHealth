import Link from "next/link";
import { getOutbreaks, getCountryCapacity } from "@/lib/data";
import { CapacitySection } from "./CapacitySection";
import { DISEASE_CATEGORY_COLORS, DISEASE_CATEGORY_LABELS } from "@/types";
import type { DiseaseCategory } from "@/types";

interface Props {
  params: Promise<{ iso3: string }>;
}

export default async function CountryProfilePage({ params }: Props) {
  const { iso3 } = await params;
  const upper = iso3.toUpperCase();

  const capacity = getCountryCapacity(upper);
  const allOutbreaks = getOutbreaks();
  const countryOutbreaks = allOutbreaks
    .filter((o) => o.countryIso3 === upper)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!capacity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Country Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          No data available for country code &ldquo;{upper}&rdquo;.
        </p>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  // Separate indicators into ones with benchmarks (capacity) and context (no benchmark)
  const capacityIndicators = capacity.indicators.filter((i) => i.benchmark !== null);
  const contextIndicators = capacity.indicators.filter((i) => i.benchmark === null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        &larr; Back to Dashboard
      </Link>

      {/* Country Header */}
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{capacity.name || upper}</h1>
        <p className="text-sm text-gray-500 mt-1">
          ISO 3166-1: {upper}
          {countryOutbreaks.length > 0 && (
            <span className="ml-4">
              {countryOutbreaks.length} outbreak{countryOutbreaks.length !== 1 ? "s" : ""} reported
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Health Capacity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Capacity Indicators with benchmarks */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full" />
              Health System Capacity
            </h2>
            <CapacitySection indicators={capacityIndicators} />
          </section>

          {/* Context indicators */}
          {contextIndicators.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gray-400 rounded-full" />
                Country Context
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {contextIndicators.map((ind) => (
                  <div
                    key={ind.code}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <p className="text-xs text-gray-500 mb-1">{ind.name}</p>
                    <p className="text-lg font-semibold font-mono text-gray-900">
                      {formatContextValue(ind.value, ind.unit)}
                    </p>
                    {ind.year && (
                      <p className="text-xs text-gray-400 mt-1">{ind.year}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: Outbreak History */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-500 rounded-full" />
            Outbreak History
          </h2>
          {countryOutbreaks.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-500">
                No WHO DON reports for this country in our dataset.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {countryOutbreaks.map((outbreak) => {
                const catColor =
                  DISEASE_CATEGORY_COLORS[outbreak.diseaseCategory as DiseaseCategory] || "#6B7280";
                const catLabel =
                  DISEASE_CATEGORY_LABELS[outbreak.diseaseCategory as DiseaseCategory] || "Other";
                return (
                  <div
                    key={outbreak.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: catColor }}
                      />
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        {catLabel}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {outbreak.disease}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(outbreak.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {(outbreak.cases !== null || outbreak.deaths !== null) && (
                      <div className="flex gap-4 mt-2 text-xs">
                        {outbreak.cases !== null && (
                          <span className="text-gray-600">
                            {outbreak.cases.toLocaleString()} cases
                          </span>
                        )}
                        {outbreak.deaths !== null && (
                          <span className="text-red-600">
                            {outbreak.deaths.toLocaleString()} deaths
                          </span>
                        )}
                      </div>
                    )}
                    <a
                      href={outbreak.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                    >
                      {outbreak.source} Report &rarr;
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Data Sources Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Health system data from WHO Global Health Observatory and World Bank.
          Outbreak data from WHO Disease Outbreak News. Data may have reporting
          delays. Not for clinical decision-making.
        </p>
      </div>
    </div>
  );
}

function formatContextValue(value: number | null, unit: string): string {
  if (value === null) return "N/A";
  if (unit === "% of GDP") return `${value.toFixed(1)}%`;
  if (unit === "USD") return `$${Math.round(value).toLocaleString()}`;
  if (unit === "people") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return Math.round(value).toLocaleString();
  }
  return value.toFixed(1);
}
