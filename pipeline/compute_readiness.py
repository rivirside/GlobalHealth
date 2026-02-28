#!/usr/bin/env python3
"""Compute composite outbreak response readiness score from capacity indicators."""

import json
from pathlib import Path
from datetime import date

DATA_DIR = Path(__file__).parent.parent / "data"
CAPACITY_FILE = DATA_DIR / "capacity.json"
OUTPUT_FILE = DATA_DIR / "readiness.json"

# Indicators used for scoring, with WHO benchmarks and weights
SCORING_CONFIG = {
    "hospital_beds":         {"benchmark": 30,  "weight": 1.0},
    "physicians":            {"benchmark": 10,  "weight": 1.0},
    "nurses":                {"benchmark": 25,  "weight": 1.0},
    "uhc_index":             {"benchmark": 80,  "weight": 1.5},
    "dtp3_coverage":         {"benchmark": 90,  "weight": 1.0},
    "health_expenditure_pc": {"benchmark": 86,  "weight": 1.5},
}

MIN_INDICATORS = 3


def compute_score(indicators: list[dict]) -> dict | None:
    """Compute readiness score from a country's capacity indicators."""
    lookup = {ind["code"]: ind["value"] for ind in indicators if ind.get("value") is not None}

    weighted_sum = 0.0
    total_weight = 0.0
    breakdown = {}
    used = 0

    for code, config in SCORING_CONFIG.items():
        value = lookup.get(code)
        if value is None:
            continue
        normalized = min(value / config["benchmark"], 1.0)
        weighted_sum += normalized * config["weight"]
        total_weight += config["weight"]
        breakdown[code] = value
        used += 1

    if used < MIN_INDICATORS:
        return None

    score = round((weighted_sum / total_weight) * 100, 1)
    return {
        "score": score,
        "breakdown": breakdown,
        "indicatorsUsed": used,
    }


def main():
    capacity = json.loads(CAPACITY_FILE.read_text())
    results = {}
    scores = []

    for iso3, country_data in capacity.items():
        result = compute_score(country_data.get("indicators", []))
        if result:
            results[iso3] = {
                "iso3": iso3,
                **result,
                "computedAt": str(date.today()),
            }
            scores.append(result["score"])

    OUTPUT_FILE.write_text(json.dumps(results, indent=2))

    if scores:
        scores.sort()
        n = len(scores)
        print(f"Computed readiness scores for {n} countries")
        print(f"  Min: {scores[0]:.1f}  Max: {scores[-1]:.1f}")
        print(f"  Mean: {sum(scores)/n:.1f}  Median: {scores[n//2]:.1f}")
    else:
        print("No scores computed")


if __name__ == "__main__":
    main()
