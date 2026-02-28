#!/usr/bin/env python3
"""
Compute composite risk scores per country.

Risk = Outbreak Pressure × Vulnerability

- Outbreak Pressure: number of recent outbreaks, weighted by recency and severity category
- Vulnerability: inverse of readiness score (countries with weaker health systems = higher risk)

Output: data/risk.json — { iso3: { score, level, outbreakPressure, vulnerability, factors } }
"""

import json
from pathlib import Path
from datetime import date, datetime

DATA_DIR = Path(__file__).parent.parent / "data"
OUTBREAKS_FILE = DATA_DIR / "outbreaks.json"
READINESS_FILE = DATA_DIR / "readiness.json"
OUTPUT_FILE = DATA_DIR / "risk.json"

# Disease category severity weights (higher = more dangerous)
CATEGORY_SEVERITY = {
    "hemorrhagic": 5.0,
    "respiratory": 3.0,
    "vaccine-preventable": 2.5,
    "zoonotic": 2.0,
    "diarrheal": 2.0,
    "vector-borne": 1.5,
    "other": 1.0,
}

# Recency decay: more recent outbreaks contribute more
def recency_weight(outbreak_date: str) -> float:
    """Weight based on how recent the outbreak is (0-1 scale)."""
    try:
        d = datetime.strptime(outbreak_date, "%Y-%m-%d").date()
        days_ago = (date.today() - d).days
    except ValueError:
        return 0.1

    if days_ago <= 90:
        return 1.0
    elif days_ago <= 365:
        return 0.6
    elif days_ago <= 730:
        return 0.3
    else:
        return 0.1


def compute_outbreak_pressure(country_outbreaks: list[dict]) -> tuple[float, dict]:
    """
    Compute outbreak pressure for a country.
    Returns (pressure_score, factors_dict).
    """
    if not country_outbreaks:
        return 0.0, {}

    total_weighted = 0.0
    category_counts: dict[str, int] = {}

    for o in country_outbreaks:
        cat = o.get("diseaseCategory", "other")
        severity = CATEGORY_SEVERITY.get(cat, 1.0)
        recency = recency_weight(o.get("date", ""))
        total_weighted += severity * recency
        category_counts[cat] = category_counts.get(cat, 0) + 1

    # Normalize: raw weighted sum capped at 100
    # A single recent hemorrhagic outbreak = 5.0
    # 20 recent hemorrhagic outbreaks = 100.0
    pressure = min(total_weighted * 5, 100.0)

    factors = {
        "outbreakCount": len(country_outbreaks),
        "activeCount": sum(1 for o in country_outbreaks if o.get("status") == "active"),
        "categoryBreakdown": category_counts,
        "recentCount": sum(1 for o in country_outbreaks
                          if recency_weight(o.get("date", "")) >= 0.6),
    }

    return round(pressure, 1), factors


def compute_vulnerability(readiness_score: float | None) -> float:
    """
    Convert readiness score (0-100, higher=better) to vulnerability (0-100, higher=worse).
    Countries without readiness data get a moderate default.
    """
    if readiness_score is None:
        return 60.0  # Moderate default for unknown
    return round(100.0 - readiness_score, 1)


def risk_level(score: float) -> str:
    """Categorize risk score into levels."""
    if score >= 70:
        return "critical"
    elif score >= 50:
        return "high"
    elif score >= 30:
        return "moderate"
    elif score >= 10:
        return "low"
    else:
        return "minimal"


def main():
    outbreaks = json.loads(OUTBREAKS_FILE.read_text())
    readiness = json.loads(READINESS_FILE.read_text()) if READINESS_FILE.exists() else {}

    # Group outbreaks by country
    by_country: dict[str, list[dict]] = {}
    for o in outbreaks:
        iso3 = o.get("countryIso3", "")
        if iso3:
            by_country.setdefault(iso3, []).append(o)

    # Compute risk for all countries that have outbreaks OR readiness data
    all_countries = set(by_country.keys()) | set(readiness.keys())

    results = {}
    scores = []

    for iso3 in sorted(all_countries):
        country_outbreaks = by_country.get(iso3, [])
        readiness_data = readiness.get(iso3)
        readiness_score = readiness_data["score"] if readiness_data else None

        pressure, factors = compute_outbreak_pressure(country_outbreaks)
        vulnerability = compute_vulnerability(readiness_score)

        # Combined risk: geometric mean gives balanced weight to both factors
        # Countries need BOTH outbreaks AND weak health systems to score high
        if pressure > 0:
            risk = round((pressure * 0.6 + vulnerability * 0.4), 1)
        else:
            # No outbreaks — risk is purely vulnerability-based but capped low
            risk = round(vulnerability * 0.15, 1)

        risk = min(risk, 100.0)
        level = risk_level(risk)

        results[iso3] = {
            "iso3": iso3,
            "score": risk,
            "level": level,
            "outbreakPressure": pressure,
            "vulnerability": vulnerability,
            "readinessScore": readiness_score,
            "factors": factors,
            "computedAt": str(date.today()),
        }
        scores.append(risk)

    OUTPUT_FILE.write_text(json.dumps(results, indent=2))

    if scores:
        scores.sort()
        n = len(scores)
        critical = sum(1 for s in scores if s >= 70)
        high = sum(1 for s in scores if 50 <= s < 70)
        moderate = sum(1 for s in scores if 30 <= s < 50)
        low = sum(1 for s in scores if s < 30)

        print(f"Computed risk scores for {n} countries")
        print(f"  Critical: {critical}  High: {high}  Moderate: {moderate}  Low: {low}")
        print(f"  Min: {scores[0]:.1f}  Max: {scores[-1]:.1f}")
        print(f"  Mean: {sum(scores)/n:.1f}  Median: {scores[n//2]:.1f}")
    else:
        print("No scores computed")


if __name__ == "__main__":
    main()
