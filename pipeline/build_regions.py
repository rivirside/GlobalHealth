#!/usr/bin/env python3
"""
Build regional overview data from outbreaks, capacity, and readiness data.
Groups by WHO region and outputs data/regions.json.
"""

import json
from pathlib import Path
from collections import defaultdict

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "regions.json"

# WHO region mapping: region code → display info
WHO_REGIONS = {
    "AFRO": {
        "name": "African Region",
        "shortName": "Africa",
        "description": "WHO Regional Office for Africa covers 47 Member States in sub-Saharan Africa.",
    },
    "AMRO": {
        "name": "Region of the Americas",
        "shortName": "Americas",
        "description": "WHO Regional Office for the Americas / Pan American Health Organization covers 35 Member States.",
    },
    "EMRO": {
        "name": "Eastern Mediterranean Region",
        "shortName": "Eastern Mediterranean",
        "description": "WHO Regional Office for the Eastern Mediterranean covers 22 Member States across the Middle East and North Africa.",
    },
    "EURO": {
        "name": "European Region",
        "shortName": "Europe",
        "description": "WHO Regional Office for Europe covers 53 Member States across Europe and Central Asia.",
    },
    "SEARO": {
        "name": "South-East Asia Region",
        "shortName": "South-East Asia",
        "description": "WHO Regional Office for South-East Asia covers 11 Member States.",
    },
    "WPRO": {
        "name": "Western Pacific Region",
        "shortName": "Western Pacific",
        "description": "WHO Regional Office for the Western Pacific covers 37 Member States and areas.",
    },
}


def main():
    DATA_DIR.mkdir(exist_ok=True)

    # Load data
    with open(DATA_DIR / "outbreaks.json") as f:
        outbreaks = json.load(f)
    with open(DATA_DIR / "countries.json") as f:
        countries = json.load(f)
    readiness = {}
    if (DATA_DIR / "readiness.json").exists():
        with open(DATA_DIR / "readiness.json") as f:
            readiness = json.load(f)

    print(f"Loaded {len(outbreaks)} outbreaks, {len(countries)} countries, {len(readiness)} readiness scores")

    # Build country → region mapping
    country_region: dict[str, str] = {}
    for c in countries:
        iso3 = c.get("iso3", "")
        region = c.get("whoRegion", "")
        if iso3 and region:
            country_region[iso3] = region

    # Group countries by region
    region_countries: dict[str, list[dict]] = defaultdict(list)
    for c in countries:
        region = c.get("whoRegion", "")
        if region in WHO_REGIONS:
            region_countries[region].append(c)

    # Group outbreaks by region
    region_outbreaks: dict[str, list[dict]] = defaultdict(list)
    for o in outbreaks:
        region = country_region.get(o["countryIso3"], "")
        if region:
            region_outbreaks[region].append(o)

    # Build region profiles
    regions = []
    for code, info in WHO_REGIONS.items():
        r_countries = region_countries.get(code, [])
        r_outbreaks = region_outbreaks.get(code, [])

        # Readiness stats
        scores = []
        for c in r_countries:
            r = readiness.get(c["iso3"])
            if r and r.get("score") is not None:
                scores.append(r["score"])

        avg_readiness = round(sum(scores) / len(scores), 1) if scores else None

        # Top diseases
        disease_counts: dict[str, int] = defaultdict(int)
        for o in r_outbreaks:
            disease_counts[o["disease"]] += 1
        top_diseases = sorted(disease_counts.items(), key=lambda x: -x[1])[:5]

        # Active outbreaks
        active = [o for o in r_outbreaks if o.get("status") == "active"]

        # Affected country ISO3 codes
        affected = list(set(o["countryIso3"] for o in r_outbreaks))

        region = {
            "code": code,
            "name": info["name"],
            "shortName": info["shortName"],
            "description": info["description"],
            "countryCount": len(r_countries),
            "countries": [{"iso3": c["iso3"], "name": c["name"]} for c in r_countries],
            "outbreakCount": len(r_outbreaks),
            "activeOutbreaks": len(active),
            "affectedCountries": affected,
            "affectedCountryCount": len(affected),
            "avgReadiness": avg_readiness,
            "readinessScoreCount": len(scores),
            "topDiseases": [{"name": d, "count": c} for d, c in top_diseases],
        }
        regions.append(region)
        print(f"  {code}: {len(r_countries)} countries, {len(r_outbreaks)} outbreaks, avg readiness {avg_readiness}")

    with open(OUTPUT_FILE, "w") as f:
        json.dump(regions, f, indent=2)

    print(f"\nWrote {len(regions)} regions to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
