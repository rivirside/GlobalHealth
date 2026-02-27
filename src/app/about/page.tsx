import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-8">
        About This Dashboard
      </h1>

      {/* What This Is */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          What is Outbreak Context?
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Outbreak Context is a dashboard that combines real-time disease
          outbreak alerts with health system capacity data for affected
          countries. When a new outbreak is reported, understanding whether
          the local health system can respond is critical — but this
          information is typically scattered across separate platforms.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          This tool bridges that gap by showing outbreak details alongside
          indicators like hospital beds per capita, physician density, UHC
          coverage, immunization rates, and health spending — all in one
          view.
        </p>
      </section>

      {/* Data Sources */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Data Sources
        </h2>
        <div className="space-y-4">
          <DataSourceCard
            name="WHO Disease Outbreak News (DON)"
            url="https://www.who.int/emergencies/disease-outbreak-news"
            description="Official WHO reports on confirmed disease outbreaks worldwide. Updated as new outbreaks are reported."
            indicators={["Disease name", "Affected country", "Report date", "Case/death counts (when available)"]}
          />
          <DataSourceCard
            name="WHO Global Health Observatory (GHO)"
            url="https://www.who.int/data/gho"
            description="Comprehensive health statistics compiled by the World Health Organization."
            indicators={[
              "Hospital beds per 10,000 population",
              "Physicians per 10,000 population",
              "Nurses & midwives per 10,000 population",
              "UHC Service Coverage Index",
              "DTP3 immunization coverage",
            ]}
          />
          <DataSourceCard
            name="World Bank Open Data"
            url="https://data.worldbank.org"
            description="Economic and development indicators for all countries."
            indicators={[
              "Current health expenditure per capita (USD)",
              "Health expenditure as % of GDP",
              "GDP per capita (USD)",
              "Total population",
            ]}
          />
        </div>
      </section>

      {/* Benchmarks */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Benchmarks & Color Coding
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          Capacity indicators are color-coded based on how close a country
          is to internationally recognized benchmarks:
        </p>
        <div className="space-y-2">
          <BenchmarkRow
            color="bg-emerald-500"
            label="Meets benchmark"
            description="75%+ of target value"
          />
          <BenchmarkRow
            color="bg-amber-500"
            label="Below benchmark"
            description="40-75% of target value"
          />
          <BenchmarkRow
            color="bg-red-500"
            label="Far below benchmark"
            description="Under 40% of target value"
          />
        </div>
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Reference Benchmarks
          </h3>
          <div className="space-y-1 text-xs text-gray-600">
            <p>Hospital beds: WHO recommends 30 per 10,000 population</p>
            <p>Physicians: WHO recommends 10 per 10,000 population</p>
            <p>Nurses & midwives: WHO recommends 25 per 10,000 population</p>
            <p>UHC Service Coverage: SDG target of 80+</p>
            <p>DTP3 Immunization: WHO target of 90% coverage</p>
            <p>Health expenditure: WHO minimum of $86 per capita</p>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Methodology
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>Outbreak data</strong> is fetched from the WHO Disease
            Outbreak News API. Disease names and affected countries are
            extracted from report titles. Each outbreak is categorized
            (respiratory, vector-borne, hemorrhagic, etc.) based on the
            disease type.
          </p>
          <p>
            <strong>Capacity data</strong> uses the most recent available
            value for each country and indicator. Some data points may be
            several years old — the year of the data is displayed alongside
            each value.
          </p>
          <p>
            <strong>Country matching</strong> uses ISO 3166-1 alpha-3 codes.
            Country names from WHO DON reports are normalized to ISO3 codes
            using a comprehensive mapping that accounts for name variations.
          </p>
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Limitations
        </h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>
            Outbreak data only includes events reported through WHO DON.
            Many outbreaks, especially smaller or sub-national events, may
            not appear.
          </li>
          <li>
            Capacity data has inherent reporting delays. Hospital bed counts,
            physician density, and other indicators may reflect conditions
            from 1-5 years prior.
          </li>
          <li>
            National-level indicators mask significant sub-national
            variation. A country&apos;s average physician density may hide
            severe shortages in rural areas.
          </li>
          <li>
            Case and death counts from WHO DON reports may be preliminary
            and subject to revision.
          </li>
          <li>
            This dashboard is for informational purposes only and should not
            be used for clinical decision-making.
          </li>
        </ul>
      </section>

      {/* How to Cite */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          How to Cite
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 font-mono">
          Outbreak Context Dashboard. Disease outbreak alerts with health
          system capacity data. Data from WHO GHO, World Bank, and WHO DON.
          Available at: [URL]. Accessed: [date].
        </div>
      </section>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Built as a global health capstone project. Open source. Data is
          refreshed automatically from public APIs.
        </p>
      </div>
    </div>
  );
}

function DataSourceCard({
  name,
  url,
  description,
  indicators,
}: {
  name: string;
  url: string;
  description: string;
  indicators: string[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {name}
        </a>
      </h3>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      <div className="flex flex-wrap gap-1">
        {indicators.map((ind) => (
          <span
            key={ind}
            className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5"
          >
            {ind}
          </span>
        ))}
      </div>
    </div>
  );
}

function BenchmarkRow({
  color,
  label,
  description,
}: {
  color: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-4 h-2 rounded-full ${color}`} />
      <span className="text-sm text-gray-700 font-medium w-40">{label}</span>
      <span className="text-xs text-gray-500">{description}</span>
    </div>
  );
}
