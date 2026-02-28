import Link from "next/link";
import type { Metadata } from "next";
import { getOutbreaks, getCountryCapacity, getReadinessScore, getIndices, getBorders, getAllReadinessScores, getRiskScore } from "@/lib/data";
import { CapacitySection } from "./CapacitySection";
import { ReadinessScoreBadge } from "@/components/ReadinessScoreBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { PreparednessRadar } from "@/components/PreparednessRadar";
import { PrintButton } from "@/components/PrintButton";
import { DISEASE_CATEGORY_COLORS, DISEASE_CATEGORY_LABELS, INDICATOR_GROUPS } from "@/types";
import type { DiseaseCategory, CapacityIndicator } from "@/types";

interface Props {
  params: Promise<{ iso3: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iso3 } = await params;
  const upper = iso3.toUpperCase();
  const capacity = getCountryCapacity(upper);
  const name = capacity?.name || upper;
  const readiness = getReadinessScore(upper);
  const scoreText = readiness ? ` (Readiness: ${readiness.score.toFixed(0)}/100)` : "";

  return {
    title: `${name} Health Profile`,
    description: `Health system capacity, outbreak history, and preparedness data for ${name}${scoreText}. Includes WHO indicators, vaccination coverage, and risk assessment.`,
    openGraph: {
      title: `${name} — Health System Profile`,
      description: `Health capacity data and outbreak history for ${name}${scoreText}.`,
    },
  };
}

export default async function CountryProfilePage({ params }: Props) {
  const { iso3 } = await params;
  const upper = iso3.toUpperCase();

  const capacity = getCountryCapacity(upper);
  const readiness = getReadinessScore(upper);
  const risk = getRiskScore(upper);
  const allIndices = getIndices();
  const countryIndices = allIndices[upper] || [];
  const allOutbreaks = getOutbreaks();
  const countryOutbreaks = allOutbreaks
    .filter((o) => o.countryIso3 === upper)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Neighboring countries
  const borders = getBorders();
  const neighborIso3s = borders[upper] || [];
  const allReadiness = getAllReadinessScores();
  const neighbors = neighborIso3s.map((nIso3) => {
    const nCapacity = getCountryCapacity(nIso3);
    const nReadiness = allReadiness[nIso3];
    const nOutbreaks = allOutbreaks.filter((o) => o.countryIso3 === nIso3);
    return {
      iso3: nIso3,
      name: nCapacity?.name || nIso3,
      readinessScore: nReadiness?.score ?? null,
      activeOutbreaks: nOutbreaks.filter((o) => o.status === "active").length,
    };
  });

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

  // Group indicators by category
  const indicatorsByCode = new Map<string, CapacityIndicator>();
  for (const ind of capacity.indicators) {
    indicatorsByCode.set(ind.code, ind);
  }

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
      <div className="mt-4 mb-8 print:mb-4">
        <div className="flex items-start gap-6">
          {readiness && <ReadinessScoreBadge score={readiness.score} size="lg" />}
          {risk && <RiskBadge score={risk.score} level={risk.level} size="lg" />}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{capacity.name || upper}</h1>
              <PrintButton />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              ISO 3166-1: {upper}
              {countryOutbreaks.length > 0 && (
                <span className="ml-4">
                  {countryOutbreaks.length} outbreak{countryOutbreaks.length !== 1 ? "s" : ""} reported
                </span>
              )}
            </p>
            {readiness && (
              <p className="text-xs text-gray-400 mt-1">
                Based on {readiness.indicatorsUsed} capacity indicators
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Grouped Indicators */}
        <div className="lg:col-span-2 space-y-8">
          {INDICATOR_GROUPS.map((group) => {
            const groupIndicators = group.codes
              .map((code) => indicatorsByCode.get(code))
              .filter((ind): ind is CapacityIndicator => ind !== undefined);

            if (groupIndicators.length === 0) return null;

            const hasBenchmarks = groupIndicators.some((i) => i.benchmark !== null);

            return (
              <section key={group.key}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span
                    className="w-1 h-5 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.label}
                </h2>
                {hasBenchmarks ? (
                  <CapacitySection indicators={groupIndicators} />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {groupIndicators.map((ind) => (
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
                )}
              </section>
            );
          })}

          {/* Preparedness Indices */}
          {countryIndices.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-purple-500 rounded-full" />
                Preparedness Indices
              </h2>
              <PreparednessRadar indices={countryIndices} />
            </section>
          )}
        </div>

        {/* Right: Outbreak History + Neighbors */}
        <div className="space-y-8">
          <section>
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
          </section>

          {/* Neighboring Countries */}
          {neighbors.length > 0 && (
            <section className="print:hidden">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-amber-500 rounded-full" />
                Neighboring Countries
              </h2>
              <div className="space-y-2">
                {neighbors.map((n) => (
                  <Link
                    key={n.iso3}
                    href={`/country/${n.iso3}`}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {n.readinessScore !== null && (
                        <ReadinessScoreBadge score={n.readinessScore} size="sm" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {n.name}
                      </span>
                    </div>
                    {n.activeOutbreaks > 0 && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        {n.activeOutbreaks} active
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
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
