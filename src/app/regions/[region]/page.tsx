import Link from "next/link";
import type { Metadata } from "next";
import { getRegions, getOutbreaks, getAllReadinessScores } from "@/lib/data";
import { ReadinessScoreBadge } from "@/components/ReadinessScoreBadge";
import { DISEASE_CATEGORY_COLORS, DISEASE_CATEGORY_LABELS } from "@/types";
import type { DiseaseCategory } from "@/types";

interface Props {
  params: Promise<{ region: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  const regions = getRegions();
  const regionData = regions.find((r) => r.code === region.toUpperCase());
  if (!regionData) return { title: "Region Not Found" };

  return {
    title: `${regionData.name} (${regionData.shortName})`,
    description: `WHO ${regionData.name}: ${regionData.countryCount} countries, ${regionData.outbreakCount} outbreak reports.${regionData.avgReadiness ? ` Average readiness: ${regionData.avgReadiness.toFixed(0)}/100.` : ""}`,
    openGraph: {
      title: `${regionData.name} — Regional Overview`,
      description: `${regionData.countryCount} countries, ${regionData.outbreakCount} outbreak reports.`,
    },
  };
}

export default async function RegionProfilePage({ params }: Props) {
  const { region } = await params;
  const code = region.toUpperCase();
  const regions = getRegions();
  const regionData = regions.find((r) => r.code === code);

  if (!regionData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Region Not Found</h1>
        <p className="text-gray-600 mb-6">No data for region &ldquo;{code}&rdquo;.</p>
        <Link href="/regions" className="text-blue-600 hover:text-blue-800 underline text-sm">
          &larr; All Regions
        </Link>
      </div>
    );
  }

  const allOutbreaks = getOutbreaks();
  const allReadiness = getAllReadinessScores();

  // Get outbreaks for this region
  const regionCountrySet = new Set(regionData.countries.map((c) => c.iso3));
  const regionOutbreaks = allOutbreaks
    .filter((o) => regionCountrySet.has(o.countryIso3))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Countries with readiness sorted by score
  const countriesWithReadiness = regionData.countries
    .map((c) => ({
      ...c,
      readiness: allReadiness[c.iso3]?.score ?? null,
      outbreakCount: allOutbreaks.filter((o) => o.countryIso3 === c.iso3).length,
    }))
    .sort((a, b) => (b.readiness ?? -1) - (a.readiness ?? -1));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/regions" className="text-sm text-blue-600 hover:text-blue-800 underline">
        &larr; All Regions
      </Link>

      {/* Header */}
      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{regionData.name}</h1>
        <p className="text-gray-500 mt-1">{regionData.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Countries" value={regionData.countryCount.toString()} />
        <StatCard label="Outbreak Reports" value={regionData.outbreakCount.toString()} />
        <StatCard label="Countries Affected" value={regionData.affectedCountryCount.toString()} />
        <StatCard
          label="Avg Readiness"
          value={regionData.avgReadiness !== null ? regionData.avgReadiness.toFixed(0) : "—"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Countries & Outbreaks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top Diseases */}
          {regionData.topDiseases.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded-full" />
                Top Diseases
              </h2>
              <div className="space-y-2">
                {regionData.topDiseases.map((d) => (
                  <div key={d.name} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                    <span className="text-sm font-medium text-gray-900">{d.name}</span>
                    <span className="text-sm font-mono text-gray-600">{d.count} reports</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent Outbreaks */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-amber-500 rounded-full" />
              Recent Outbreak Reports ({regionOutbreaks.length})
            </h2>
            <div className="space-y-3">
              {regionOutbreaks.slice(0, 15).map((o) => {
                const catColor = DISEASE_CATEGORY_COLORS[o.diseaseCategory as DiseaseCategory] || "#6B7280";
                return (
                  <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        {DISEASE_CATEGORY_LABELS[o.diseaseCategory as DiseaseCategory] || "Other"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{o.disease}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(o.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <Link
                      href={`/country/${o.countryIso3}`}
                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                    >
                      {o.country} &rarr;
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: Country List */}
        <div>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full" />
              Countries ({regionData.countryCount})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {countriesWithReadiness.map((c) => (
                <Link
                  key={c.iso3}
                  href={`/country/${c.iso3}`}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {c.readiness !== null && <ReadinessScoreBadge score={c.readiness} size="sm" />}
                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  </div>
                  {c.outbreakCount > 0 && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {c.outbreakCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold font-mono text-gray-900">{value}</p>
    </div>
  );
}
