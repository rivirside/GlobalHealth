import { readFileSync } from "fs";
import { join } from "path";
import type { Outbreak, CountryCapacity, Country, IndexScore, ReadinessScore, RiskScore } from "@/types";

const DATA_DIR = join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  const filepath = join(DATA_DIR, filename);
  const raw = readFileSync(filepath, "utf-8");
  return JSON.parse(raw) as T;
}

// Module-level caches — each JSON file is read at most once per process lifetime.
// In Next.js, module-level state persists across requests within the same server
// instance, avoiding redundant readFileSync calls for large data files.
let _outbreaks: Outbreak[] | null = null;
let _capacity: Record<string, CountryCapacity> | null = null;
let _countries: Country[] | null = null;
let _indices: Record<string, IndexScore[]> | null = null;
let _readiness: Record<string, ReadinessScore> | null = null;
let _borders: Record<string, string[]> | null = null;
let _diseases: DiseaseProfile[] | null = null;
let _regions: RegionProfile[] | null = null;
let _risk: Record<string, RiskScore> | null = null;

export function getOutbreaks(): Outbreak[] {
  if (!_outbreaks) {
    try {
      _outbreaks = readJson<Outbreak[]>("outbreaks.json");
    } catch {
      _outbreaks = [];
    }
  }
  return _outbreaks;
}

export function getCountryCapacity(iso3: string): CountryCapacity | null {
  if (!_capacity) {
    try {
      _capacity = readJson<Record<string, CountryCapacity>>("capacity.json");
    } catch {
      _capacity = {};
    }
  }
  return _capacity[iso3] || null;
}

export function getCountries(): Country[] {
  if (!_countries) {
    try {
      _countries = readJson<Country[]>("countries.json");
    } catch {
      _countries = [];
    }
  }
  return _countries;
}

export function getIndices(): Record<string, IndexScore[]> {
  if (!_indices) {
    try {
      _indices = readJson<Record<string, IndexScore[]>>("indices.json");
    } catch {
      _indices = {};
    }
  }
  return _indices;
}

export function getReadinessScore(iso3: string): ReadinessScore | null {
  if (!_readiness) {
    try {
      _readiness = readJson<Record<string, ReadinessScore>>("readiness.json");
    } catch {
      _readiness = {};
    }
  }
  return _readiness[iso3] || null;
}

export function getAllReadinessScores(): Record<string, ReadinessScore> {
  if (!_readiness) {
    try {
      _readiness = readJson<Record<string, ReadinessScore>>("readiness.json");
    } catch {
      _readiness = {};
    }
  }
  return _readiness;
}

export function getBorders(): Record<string, string[]> {
  if (!_borders) {
    try {
      _borders = readJson<Record<string, string[]>>("borders.json");
    } catch {
      _borders = {};
    }
  }
  return _borders;
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
  if (!_diseases) {
    try {
      _diseases = readJson<DiseaseProfile[]>("diseases.json");
    } catch {
      _diseases = [];
    }
  }
  return _diseases;
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
  if (!_regions) {
    try {
      _regions = readJson<RegionProfile[]>("regions.json");
    } catch {
      _regions = [];
    }
  }
  return _regions;
}

export function getRiskScore(iso3: string): RiskScore | null {
  if (!_risk) {
    try {
      _risk = readJson<Record<string, RiskScore>>("risk.json");
    } catch {
      _risk = {};
    }
  }
  return _risk[iso3] || null;
}

export function getAllRiskScores(): Record<string, RiskScore> {
  if (!_risk) {
    try {
      _risk = readJson<Record<string, RiskScore>>("risk.json");
    } catch {
      _risk = {};
    }
  }
  return _risk;
}
