import { readFileSync } from "fs";
import { join } from "path";
import type { Outbreak, CountryCapacity, Country, IndexScore, ReadinessScore } from "@/types";

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
