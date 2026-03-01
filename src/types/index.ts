export interface Outbreak {
  id: string;
  disease: string;
  diseaseCategory: DiseaseCategory;
  country: string;
  countryIso3: string;
  date: string;
  cases: number | null;
  deaths: number | null;
  summary: string;
  sourceUrl: string;
  source: "WHO DON";
  lat: number;
  lon: number;
  status: "active" | "resolved";
}

export type DiseaseCategory =
  | "respiratory"
  | "vector-borne"
  | "diarrheal"
  | "hemorrhagic"
  | "vaccine-preventable"
  | "zoonotic"
  | "other";

export interface CapacityIndicator {
  code: string;
  name: string;
  value: number | null;
  year: number | null;
  unit: string;
  benchmark: number | null;
  benchmarkLabel: string | null;
  source: string;
}

export interface CountryCapacity {
  iso3: string;
  name: string;
  indicators: CapacityIndicator[];
}

export interface Country {
  iso3: string;
  name: string;
  region: string;
  incomeGroup: string;
  whoRegion: string;
  lat: number;
  lon: number;
  population: number | null;
}

export interface IndexScore {
  iso3: string;
  indexName: string;
  score: number;
  year: number;
  invertedScale?: boolean;
  categories?: Record<string, number>;
}

export interface ReadinessScore {
  iso3: string;
  score: number;
  breakdown: Record<string, number>;
  indicatorsUsed: number;
  computedAt: string;
}

export type RiskLevel = "critical" | "high" | "moderate" | "low" | "minimal";

export interface RiskScore {
  iso3: string;
  score: number;
  level: RiskLevel;
  outbreakPressure: number;
  vulnerability: number;
  readinessScore: number | null;
  factors: {
    outbreakCount: number;
    activeCount: number;
    recentCount: number;
    categoryBreakdown: Record<string, number>;
  };
  computedAt: string;
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  critical: "#DC2626",
  high: "#F97316",
  moderate: "#F59E0B",
  low: "#10B981",
  minimal: "#6B7280",
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  critical: "Critical",
  high: "High",
  moderate: "Moderate",
  low: "Low",
  minimal: "Minimal",
};

export interface OutbreakFilters {
  diseaseCategory: DiseaseCategory | "all";
  dateRange: "30d" | "90d" | "1y" | "all";
  region: string;
  activeOnly: boolean;
}

export const DISEASE_CATEGORY_COLORS: Record<DiseaseCategory, string> = {
  respiratory: "#3B82F6",
  "vector-borne": "#F59E0B",
  diarrheal: "#10B981",
  hemorrhagic: "#EF4444",
  "vaccine-preventable": "#8B5CF6",
  zoonotic: "#F97316",
  other: "#6B7280",
};

export const DISEASE_CATEGORY_LABELS: Record<DiseaseCategory, string> = {
  respiratory: "Respiratory",
  "vector-borne": "Vector-borne",
  diarrheal: "Diarrheal",
  hemorrhagic: "Hemorrhagic",
  "vaccine-preventable": "Vaccine-preventable",
  zoonotic: "Zoonotic",
  other: "Other",
};

export interface IndicatorGroup {
  key: string;
  label: string;
  color: string;
  codes: string[];
}

export const CAPACITY_INDICATORS = [
  {
    code: "hospital_beds",
    name: "Hospital Beds",
    unit: "per 10,000",
    benchmark: 30,
    benchmarkLabel: "WHO recommends 30 per 10,000",
  },
  {
    code: "physicians",
    name: "Physicians",
    unit: "per 10,000",
    benchmark: 10,
    benchmarkLabel: "WHO recommends 10 per 10,000",
  },
  {
    code: "nurses",
    name: "Nurses & Midwives",
    unit: "per 10,000",
    benchmark: 25,
    benchmarkLabel: "WHO recommends 25 per 10,000",
  },
  {
    code: "uhc_index",
    name: "UHC Service Coverage",
    unit: "index (0-100)",
    benchmark: 80,
    benchmarkLabel: "SDG target: 80+",
  },
  {
    code: "dtp3_coverage",
    name: "DTP3 Immunization",
    unit: "%",
    benchmark: 90,
    benchmarkLabel: "WHO target: 90%",
  },
  {
    code: "health_expenditure_pc",
    name: "Health Expenditure",
    unit: "USD per capita",
    benchmark: 86,
    benchmarkLabel: "WHO minimum: $86/capita",
  },
  // Vaccination Coverage
  {
    code: "mcv1_coverage",
    name: "Measles (MCV1)",
    unit: "%",
    benchmark: 95,
    benchmarkLabel: "WHO target: 95%",
  },
  {
    code: "mcv2_coverage",
    name: "Measles 2nd Dose (MCV2)",
    unit: "%",
    benchmark: 95,
    benchmarkLabel: "WHO target: 95%",
  },
  {
    code: "pol3_coverage",
    name: "Polio (Pol3)",
    unit: "%",
    benchmark: 90,
    benchmarkLabel: "WHO target: 90%",
  },
  {
    code: "hepb3_coverage",
    name: "Hepatitis B (HepB3)",
    unit: "%",
    benchmark: 90,
    benchmarkLabel: "WHO target: 90%",
  },
  {
    code: "pcv3_coverage",
    name: "Pneumococcal (PCV3)",
    unit: "%",
    benchmark: 90,
    benchmarkLabel: "WHO target: 90%",
  },
  {
    code: "bcg_coverage",
    name: "BCG",
    unit: "%",
    benchmark: 90,
    benchmarkLabel: "WHO target: 90%",
  },
  // Health Outcomes
  {
    code: "life_expectancy",
    name: "Life Expectancy",
    unit: "years",
    benchmark: null,
    benchmarkLabel: null,
  },
  {
    code: "under5_mortality",
    name: "Under-5 Mortality",
    unit: "per 1,000 live births",
    benchmark: 25,
    benchmarkLabel: "SDG target: <25 per 1,000",
  },
  {
    code: "maternal_mortality",
    name: "Maternal Mortality Ratio",
    unit: "per 100,000 live births",
    benchmark: 70,
    benchmarkLabel: "SDG target: <70 per 100,000",
  },
] as const;

export const INDICATOR_GROUPS: IndicatorGroup[] = [
  {
    key: "capacity",
    label: "Health System Capacity",
    color: "#3B82F6",
    codes: ["hospital_beds", "physicians", "nurses", "uhc_index", "dtp3_coverage", "health_expenditure_pc"],
  },
  {
    key: "vaccination",
    label: "Vaccination Coverage",
    color: "#8B5CF6",
    codes: ["mcv1_coverage", "mcv2_coverage", "pol3_coverage", "hepb3_coverage", "pcv3_coverage", "bcg_coverage"],
  },
  {
    key: "wash",
    label: "Water, Sanitation & Hygiene",
    color: "#06B6D4",
    codes: ["basic_water", "basic_sanitation", "safe_water", "safe_sanitation"],
  },
  {
    key: "outcomes",
    label: "Health Outcomes",
    color: "#10B981",
    codes: ["life_expectancy", "under5_mortality", "maternal_mortality"],
  },
  {
    key: "demographics",
    label: "Demographics",
    color: "#6B7280",
    codes: ["population", "population_density", "population_65plus", "urban_population", "gdp_per_capita", "health_expenditure_gdp"],
  },
];
