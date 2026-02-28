import Link from "next/link";
import type { Metadata } from "next";
import { getDiseases, getOutbreaks } from "@/lib/data";
import { DISEASE_CATEGORY_COLORS, DISEASE_CATEGORY_LABELS } from "@/types";
import type { DiseaseCategory } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const diseases = getDiseases();
  const disease = diseases.find((d) => d.slug === slug);
  if (!disease) return { title: "Disease Not Found" };

  return {
    title: disease.name,
    description: `${disease.name}: ${disease.outbreakCount} outbreak reports across ${disease.countryCount} countries. ${disease.transmission || ""}`.trim(),
    openGraph: {
      title: `${disease.name} — Outbreak Profile`,
      description: `${disease.outbreakCount} reports across ${disease.countryCount} countries.`,
    },
  };
}

export default async function DiseaseProfilePage({ params }: Props) {
  const { slug } = await params;
  const diseases = getDiseases();
  const disease = diseases.find((d) => d.slug === slug);

  if (!disease) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Disease Not Found</h1>
        <p className="text-gray-600 mb-6">No profile for &ldquo;{slug}&rdquo;.</p>
        <Link href="/diseases" className="text-blue-600 hover:text-blue-800 underline text-sm">
          &larr; All Diseases
        </Link>
      </div>
    );
  }

  const catColor = DISEASE_CATEGORY_COLORS[disease.category as DiseaseCategory] || "#6B7280";
  const catLabel = DISEASE_CATEGORY_LABELS[disease.category as DiseaseCategory] || "Other";

  // Get outbreaks for this disease
  const allOutbreaks = getOutbreaks();
  const diseaseOutbreaks = allOutbreaks
    .filter((o) => {
      const oSlug = o.disease.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
      return oSlug.includes(slug) || slug.includes(oSlug.split("-")[0]);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/diseases" className="text-sm text-blue-600 hover:text-blue-800 underline">
        &larr; All Diseases
      </Link>

      {/* Header */}
      <div className="mt-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
          <span className="text-xs text-gray-500 uppercase tracking-wider">{catLabel}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{disease.name}</h1>
        <p className="text-gray-500 mt-1">
          {disease.outbreakCount} {disease.outbreakCount === 1 ? "outbreak" : "outbreaks"} reported across{" "}
          {disease.countryCount} {disease.countryCount === 1 ? "country" : "countries"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Disease Info */}
          {(disease.transmission || disease.incubation || disease.symptoms) && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                Disease Information
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                {disease.transmission && (
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Transmission</p>
                    <p className="text-sm text-gray-900">{disease.transmission}</p>
                  </div>
                )}
                {disease.incubation && (
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Incubation Period</p>
                    <p className="text-sm text-gray-900">{disease.incubation}</p>
                  </div>
                )}
                {disease.symptoms && (
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Key Symptoms</p>
                    <p className="text-sm text-gray-900">{disease.symptoms}</p>
                  </div>
                )}
              </div>
              {disease.factSheet && (
                <a
                  href={disease.factSheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  WHO Fact Sheet &rarr;
                </a>
              )}
            </section>
          )}

          {/* Stats */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-500 rounded-full" />
              Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total Outbreaks" value={disease.outbreakCount.toString()} />
              <StatCard label="Countries Affected" value={disease.countryCount.toString()} />
              <StatCard
                label="Reported Cases"
                value={disease.totalCases ? disease.totalCases.toLocaleString() : "Not reported"}
              />
              <StatCard
                label="Reported Deaths"
                value={disease.totalDeaths ? disease.totalDeaths.toLocaleString() : "Not reported"}
              />
              {disease.totalCases && disease.totalDeaths && disease.totalCases > 0 && (
                <StatCard
                  label="Case Fatality Rate"
                  value={`${((disease.totalDeaths / disease.totalCases) * 100).toFixed(1)}%`}
                  subtitle="From aggregate reported figures"
                />
              )}
            </div>
          </section>

          {/* Outbreak History */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-500 rounded-full" />
              Outbreak Reports ({diseaseOutbreaks.length})
            </h2>
            {diseaseOutbreaks.length === 0 ? (
              <p className="text-sm text-gray-400">No matching outbreak reports found.</p>
            ) : (
              <div className="space-y-3">
                {diseaseOutbreaks.map((o) => (
                  <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <Link
                        href={`/country/${o.countryIso3}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {o.country}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {new Date(o.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {(o.cases !== null || o.deaths !== null) && (
                      <div className="flex gap-4 text-xs text-gray-500">
                        {o.cases !== null && <span>{o.cases.toLocaleString()} cases</span>}
                        {o.deaths !== null && <span className="text-red-600">{o.deaths.toLocaleString()} deaths</span>}
                      </div>
                    )}
                    <a
                      href={o.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                    >
                      {o.source} Report &rarr;
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Affected Countries */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-amber-500 rounded-full" />
              Affected Countries
            </h2>
            <div className="space-y-2">
              {disease.affectedCountries.map((iso3) => {
                const outbreak = diseaseOutbreaks.find((o) => o.countryIso3 === iso3);
                return (
                  <Link
                    key={iso3}
                    href={`/country/${iso3}`}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {outbreak?.country || iso3}
                    </span>
                    <span className="text-xs text-gray-500">{iso3}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Date Range */}
          {disease.firstReport && disease.lastReport && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gray-400 rounded-full" />
                Reporting Period
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-xs text-gray-500">First Report</p>
                    <p className="font-medium text-gray-900">
                      {new Date(disease.firstReport).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Latest Report</p>
                    <p className="font-medium text-gray-900">
                      {new Date(disease.lastReport).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold font-mono text-gray-900">{value}</p>
      {subtitle && <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
