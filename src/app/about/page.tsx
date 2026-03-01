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
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>Outbreak data</strong> is fetched from the WHO Disease
            Outbreak News OData API. Disease names and affected countries are
            extracted from report titles using pattern matching. Multi-country
            reports (e.g., &ldquo;Marburg - Uganda and Kenya&rdquo;) produce separate
            records for each country. Case and death counts are extracted from
            the HTML body of each WHO DON report page using regex pattern
            matching, since the API only returns metadata.
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

      {/* Readiness Score */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Readiness Score
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            The readiness score is a composite 0&ndash;100 metric summarizing a
            country&apos;s health system preparedness for outbreak response. It is
            computed from 6 WHO capacity indicators, each normalized against an
            internationally recognized benchmark.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
            <h4 className="font-semibold text-gray-700 mb-2">Indicators &amp; Benchmarks</h4>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-1 pr-4">Indicator</th>
                  <th className="py-1 pr-4">Benchmark</th>
                  <th className="py-1">Weight</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr><td className="py-0.5">Hospital beds</td><td>30 per 10,000</td><td>1.0x</td></tr>
                <tr><td className="py-0.5">Physicians</td><td>10 per 10,000</td><td>1.0x</td></tr>
                <tr><td className="py-0.5">Nurses &amp; midwives</td><td>25 per 10,000</td><td>1.0x</td></tr>
                <tr><td className="py-0.5">UHC service coverage</td><td>80 (index)</td><td>1.5x</td></tr>
                <tr><td className="py-0.5">DTP3 immunization</td><td>90%</td><td>1.0x</td></tr>
                <tr><td className="py-0.5">Health expenditure</td><td>$86/capita</td><td>1.5x</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono text-gray-600">
            <p className="font-semibold text-gray-700 font-sans mb-1">Formula</p>
            <p>normalized(i) = min(value / benchmark, 1.0)</p>
            <p>score = (sum of weighted_normalized / sum of weights) &times; 100</p>
          </div>
          <p className="text-xs text-gray-500 italic">
            Countries with fewer than 3 available indicators receive no score.
            Weights are informal and not based on a published epidemiological
            framework.
          </p>
        </div>
      </section>

      {/* Risk Score */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Risk Score
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            The risk score combines outbreak pressure (frequency and severity of
            recent outbreaks) with health system vulnerability (inverse of
            readiness). The formula is:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono text-gray-600">
            <p>Risk = Outbreak Pressure &times; 0.6 + Vulnerability &times; 0.4</p>
            <p className="mt-1 text-gray-500">For countries with no outbreaks: Risk = Vulnerability &times; 0.15</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
            <h4 className="font-semibold text-gray-700 mb-2">Disease Severity Weights</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600">
              <span>Hemorrhagic: 5.0</span>
              <span>Respiratory: 3.0</span>
              <span>Zoonotic: 2.5</span>
              <span>Vector-borne: 2.0</span>
              <span>Diarrheal: 2.0</span>
              <span>Vaccine-preventable: 1.5</span>
              <span>Other: 1.0</span>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
            <h4 className="font-semibold text-gray-700 mb-2">Recency Decay</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600">
              <span>&le;90 days: 1.0 weight</span>
              <span>&le;365 days: 0.6 weight</span>
              <span>&le;730 days: 0.3 weight</span>
              <span>&gt;730 days: 0.1 weight</span>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
            <h4 className="font-semibold text-gray-700 mb-2">Risk Tiers</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-600">
              <span className="text-red-600 font-medium">Critical: &ge;70</span>
              <span className="text-orange-500 font-medium">High: &ge;50</span>
              <span className="text-amber-500 font-medium">Moderate: &ge;30</span>
              <span className="text-emerald-600 font-medium">Low: &ge;10</span>
              <span className="text-gray-500 font-medium">Minimal: &lt;10</span>
            </div>
          </div>
        </div>
      </section>

      {/* Disease Categorization */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Disease Categorization
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Diseases are assigned to 7 categories based on keyword matching
            against the disease name from WHO DON report titles:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
            <div className="space-y-1.5 text-gray-600">
              <p><span className="font-medium text-blue-600">Respiratory:</span> Influenza, COVID-19, MERS-CoV, SARS, pneumonia</p>
              <p><span className="font-medium text-amber-500">Vector-borne:</span> Dengue, malaria, Zika, chikungunya, yellow fever, Rift Valley fever</p>
              <p><span className="font-medium text-red-600">Hemorrhagic:</span> Ebola, Marburg, Lassa fever, Crimean-Congo, Sudan virus, hantavirus</p>
              <p><span className="font-medium text-emerald-600">Diarrheal:</span> Cholera, typhoid, Shigella, salmonellosis, E. coli</p>
              <p><span className="font-medium text-purple-600">Vaccine-preventable:</span> Measles, polio, diphtheria, pertussis, meningococcal</p>
              <p><span className="font-medium text-orange-500">Zoonotic:</span> Mpox, Nipah, plague, anthrax, rabies, avian influenza</p>
              <p><span className="font-medium text-gray-500">Other:</span> Diseases not matching the above categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active/Resolved Logic */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Active vs. Resolved Status
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Outbreak status is determined using a supersession model:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>
              If multiple WHO DON reports exist for the same disease and country,
              only the most recent report is &ldquo;active&rdquo; (if within 365 days).
              Older reports are marked &ldquo;resolved.&rdquo;
            </li>
            <li>
              Single-report outbreaks use a 365-day fallback: active if less than
              one year old, resolved otherwise.
            </li>
          </ul>
          <p className="text-xs text-gray-500 italic">
            This is a heuristic. WHO DON does not formally declare outbreaks
            as resolved.
          </p>
        </div>
      </section>

      {/* Data Vintage */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Data Vintage
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Data ages vary by source and country. Key reference dates:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
            <div className="space-y-1.5 text-gray-600">
              <p><span className="font-medium">GHSI:</span> 2021 edition (latest available; published biennially)</p>
              <p><span className="font-medium">INFORM Risk:</span> 2025 edition (updated annually)</p>
              <p><span className="font-medium">IHR SPAR:</span> Varies by country (annual self-assessment)</p>
              <p><span className="font-medium">WHO capacity indicators:</span> Year shown per indicator (may lag 1&ndash;5 years)</p>
              <p><span className="font-medium">Outbreaks:</span> WHO DON reports from 2015 to present, refreshed every 12 hours</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 italic">
            Indicators older than 4 years are flagged in the UI with an amber
            warning badge.
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
