import Link from "next/link";
import {
  getCountryCapacity,
  getReadinessScore,
  getRiskScore,
  getOutbreaks,
  getIndices,
} from "@/lib/data";
import { RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from "@/types";
import { BriefPrintButton } from "./BriefPrintButton";

export default async function BriefPage({
  params,
}: {
  params: Promise<{ iso3: string }>;
}) {
  const { iso3 } = await params;
  const upper = iso3.toUpperCase();

  const capacity = getCountryCapacity(upper);
  const readiness = getReadinessScore(upper);
  const risk = getRiskScore(upper);
  const allOutbreaks = getOutbreaks();
  const allIndices = getIndices();
  const countryIndices = allIndices[upper] || [];

  const countryOutbreaks = allOutbreaks
    .filter((o) => o.countryIso3 === upper)
    .sort((a, b) => b.date.localeCompare(a.date));
  const activeOutbreaks = countryOutbreaks.filter((o) => o.status === "active");

  const countryName = capacity?.name || upper;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Key capacity indicators for the brief
  const keyIndicators = [
    { code: "hospital_beds", label: "Hospital beds", benchmark: "30 per 10k" },
    { code: "physicians", label: "Physicians", benchmark: "10 per 10k" },
    { code: "nurses_midwives", label: "Nurses & midwives", benchmark: "25 per 10k" },
    { code: "uhc_index", label: "UHC coverage", benchmark: "80 index" },
    { code: "dtp3", label: "DTP3 immunization", benchmark: "90%" },
    { code: "health_expenditure", label: "Health expenditure", benchmark: "$86/capita" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 print:px-0 print:py-0 print:max-w-none">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href={`/country/${upper}`} className="text-sm text-blue-600 hover:text-blue-800 underline">
          &larr; Back to Country Profile
        </Link>
        <BriefPrintButton />
      </div>

      {/* Brief Document */}
      <div className="border border-gray-200 rounded-lg print:border-0 print:rounded-none">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-4 print:bg-gray-900 print:text-white rounded-t-lg print:rounded-none">
          <h1 className="text-xl font-bold tracking-tight">
            SITUATION BRIEF: {countryName}
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Generated: {today} | Source: WHO DON, WHO GHO, World Bank
          </p>
        </div>

        {/* Summary Strip */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-6 text-sm">
          {risk && (
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Risk</span>
              <p className="font-semibold" style={{ color: RISK_LEVEL_COLORS[risk.level] }}>
                {RISK_LEVEL_LABELS[risk.level]} ({Math.round(risk.score)})
              </p>
            </div>
          )}
          {readiness && (
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Readiness</span>
              <p className="font-semibold text-gray-900">{Math.round(readiness.score)} / 100</p>
            </div>
          )}
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Active Outbreaks</span>
            <p className="font-semibold text-gray-900">{activeOutbreaks.length}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total Reports</span>
            <p className="font-semibold text-gray-900">{countryOutbreaks.length}</p>
          </div>
        </div>

        {/* Two-Column Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-0">
          {/* Left: Outbreaks */}
          <div className="px-6 py-4 border-r border-gray-200">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Key Outbreaks
            </h2>
            {activeOutbreaks.length === 0 && countryOutbreaks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No outbreak reports on record.</p>
            ) : (
              <div className="space-y-3">
                {(activeOutbreaks.length > 0 ? activeOutbreaks : countryOutbreaks.slice(0, 5)).map((o) => (
                  <div key={o.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{o.disease}</span>
                      {o.status === "active" && (
                        <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(o.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      {o.cases !== null && ` | ${o.cases.toLocaleString()} cases`}
                      {o.deaths !== null && ` | ${o.deaths.toLocaleString()} deaths`}
                    </p>
                  </div>
                ))}
                {activeOutbreaks.length === 0 && countryOutbreaks.length > 5 && (
                  <p className="text-xs text-gray-400">
                    + {countryOutbreaks.length - 5} more reports
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Capacity + Indices */}
          <div className="px-6 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Health System Capacity
            </h2>
            <div className="space-y-2">
              {keyIndicators.map((ki) => {
                const ind = capacity?.indicators.find((i) => i.code === ki.code);
                return (
                  <div key={ki.code} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{ki.label}</span>
                    <span className="font-mono text-gray-900">
                      {ind?.value !== null && ind?.value !== undefined
                        ? ki.code === "health_expenditure"
                          ? `$${Math.round(ind.value)}`
                          : ki.code === "uhc_index"
                            ? ind.value.toFixed(0)
                            : ki.code === "dtp3"
                              ? `${ind.value.toFixed(0)}%`
                              : ind.value.toFixed(1)
                        : "—"}
                      <span className="text-xs text-gray-400 ml-1">/ {ki.benchmark}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {countryIndices.length > 0 && (
              <>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 mt-6">
                  Preparedness Indices
                </h2>
                <div className="space-y-2">
                  {countryIndices.map((idx) => (
                    <div key={idx.indexName} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{idx.indexName}</span>
                      <span className="font-mono text-gray-900">
                        {idx.score.toFixed(1)}
                        <span className="text-xs text-gray-400 ml-1">({idx.year})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 rounded-b-lg print:rounded-none">
          Data: WHO DON, WHO GHO, World Bank | Dashboard: global-health-two.vercel.app |
          Readiness &amp; risk scores are custom composites — see methodology at /about
        </div>
      </div>
    </div>
  );
}
