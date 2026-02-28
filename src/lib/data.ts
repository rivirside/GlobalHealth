import { readFileSync } from "fs";
import { join } from "path";
import type { Outbreak, CountryCapacity, Country, IndexScore, ReadinessScore, RiskScore } from "@/types";

const DATA_DIR = join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  const filepath = join(DATA_DIR, filename);
  const raw = readFileSync(filepath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getOutbreaks(): Outbreak[] {
  try {
    return readJson<Outbreak[]>("outbreaks.json");
  } catch {
    return [];
  }
}

export function getCountryCapacity(iso3: string): CountryCapacity | null {
  try {
    const all = readJson<Record<string, CountryCapacity>>("capacity.json");
    return all[iso3] || null;
  } catch {
    return null;
  }
}

export function getCountries(): Country[] {
  try {
    return readJson<Country[]>("countries.json");
  } catch {
    return [];
  }
}

export function getIndices(): Record<string, IndexScore[]> {
  try {
    return readJson<Record<string, IndexScore[]>>("indices.json");
  } catch {
    return {};
  }
}

export function getReadinessScore(iso3: string): ReadinessScore | null {
  try {
    const all = readJson<Record<string, ReadinessScore>>("readiness.json");
    return all[iso3] || null;
  } catch {
    return null;
  }
}

export function getAllReadinessScores(): Record<string, ReadinessScore> {
  try {
    return readJson<Record<string, ReadinessScore>>("readiness.json");
  } catch {
    return {};
  }
}

export function getBorders(): Record<string, string[]> {
  try {
    return readJson<Record<string, string[]>>("borders.json");
  } catch {
    return {};
  }
}

export interface DiseaseProfile {
  slug: string;
  name: string;
  category: string;
  outbreakCount: number;
  affectedCountries: string[];
  countryCount: number;
  totalCases: number | null;
  totalDeaths: number | null;
  firstReport: string | null;
  lastReport: string | null;
  transmission: string | null;
  incubation: string | null;
  symptoms: string | null;
  factSheet: string | null;
}

export function getDiseases(): DiseaseProfile[] {
  try {
    return readJson<DiseaseProfile[]>("diseases.json");
  } catch {
    return [];
  }
}

export interface RegionProfile {
  code: string;
  name: string;
  shortName: string;
  description: string;
  countryCount: number;
  countries: { iso3: string; name: string }[];
  outbreakCount: number;
  activeOutbreaks: number;
  affectedCountries: string[];
  affectedCountryCount: number;
  avgReadiness: number | null;
  readinessScoreCount: number;
  topDiseases: { name: string; count: number }[];
}

export function getRegions(): RegionProfile[] {
  try {
    return readJson<RegionProfile[]>("regions.json");
  } catch {
    return [];
  }
}

export function getRiskScore(iso3: string): RiskScore | null {
  try {
    const all = readJson<Record<string, RiskScore>>("risk.json");
    return all[iso3] || null;
  } catch {
    return null;
  }
}

export function getAllRiskScores(): Record<string, RiskScore> {
  try {
    return readJson<Record<string, RiskScore>>("risk.json");
  } catch {
    return {};
  }
}
