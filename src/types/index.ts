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
  source: "WHO DON" | "ProMED";
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
  categories?: Record<string, number>;
}

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
] as const;
