#!/usr/bin/env python3
"""
Build countries.json from capacity data, country_mapping, and WHO metadata.
"""

import json
from pathlib import Path

import requests

from country_mapping import NAME_TO_ISO3, ISO3_COORDINATES

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "countries.json"

# WHO region for each country (from WHO GHO dimension members)
# We fetch this from the API rather than hardcoding
WHO_GHO_COUNTRY_URL = "https://ghoapi.azureedge.net/api/DIMENSION/COUNTRY/DimensionValues"

# Income group and region data from World Bank
WB_COUNTRY_URL = "https://api.worldbank.org/v2/country?format=json&per_page=500"

# WHO region code mapping
WHO_REGION_MAP = {
    "AFR": "AFRO",
    "AMR": "AMRO",
    "EMR": "EMRO",
    "EUR": "EURO",
    "SEAR": "SEARO",
    "WPR": "WPRO",
}


def fetch_who_regions() -> dict[str, str]:
    """Fetch WHO region for each country from GHO API."""
    print("Fetching WHO region data...")
    try:
        resp = requests.get(WHO_GHO_COUNTRY_URL, timeout=60)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  Error: {e}")
        return {}

    regions = {}
    for item in data.get("value", []):
        iso3 = item.get("Code", "")
        parent = item.get("ParentCode", "")
        if len(iso3) == 3 and parent:
            # Map WHO 3-letter region codes to standard 4-letter
            mapped = WHO_REGION_MAP.get(parent, parent)
            regions[iso3] = mapped

    print(f"  Got regions for {len(regions)} countries")
    return regions


def fetch_wb_metadata() -> dict[str, dict]:
    """Fetch income group and region from World Bank."""
    print("Fetching World Bank metadata...")
    metadata: dict[str, dict] = {}
    page = 1
    total_pages = 1

    while page <= total_pages:
        try:
            resp = requests.get(WB_COUNTRY_URL, params={"page": page}, timeout=30)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  Error page {page}: {e}")
            break

        if not isinstance(data, list) or len(data) < 2:
            break

        total_pages = data[0].get("pages", 1)

        for item in (data[1] or []):
            iso3 = item.get("id", "")
            if len(iso3) != 3:
                continue
            income = item.get("incomeLevel", {})
            region = item.get("region", {})
            metadata[iso3] = {
                "incomeGroup": income.get("value", ""),
                "region": region.get("value", ""),
            }

        page += 1

    print(f"  Got metadata for {len(metadata)} countries")
    return metadata


def main():
    DATA_DIR.mkdir(exist_ok=True)

    # Load capacity data for country names
    capacity = {}
    cap_file = DATA_DIR / "capacity.json"
    if cap_file.exists():
        with open(cap_file) as f:
            capacity = json.load(f)

    who_regions = fetch_who_regions()
    wb_metadata = fetch_wb_metadata()

    # Build iso3→name mapping from country_mapping
    iso3_to_name: dict[str, str] = {}
    for name, iso3 in NAME_TO_ISO3.items():
        if iso3 not in iso3_to_name or len(name) < len(iso3_to_name[iso3]):
            iso3_to_name[iso3] = name

    # Override with capacity data names if available
    for iso3, cap in capacity.items():
        if cap.get("name"):
            iso3_to_name[iso3] = cap["name"]

    # Build country list
    all_iso3 = set(iso3_to_name.keys()) | set(who_regions.keys()) | set(wb_metadata.keys())

    countries = []
    for iso3 in sorted(all_iso3):
        if len(iso3) != 3:
            continue

        coords = ISO3_COORDINATES.get(iso3, (0, 0))
        wb = wb_metadata.get(iso3, {})
        pop = None
        # Try to get population from capacity data
        if iso3 in capacity:
            for ind in capacity[iso3].get("indicators", []):
                if ind["code"] == "population" and ind["value"] is not None:
                    pop = int(ind["value"])
                    break

        country = {
            "iso3": iso3,
            "name": iso3_to_name.get(iso3, iso3),
            "region": wb.get("region", ""),
            "incomeGroup": wb.get("incomeGroup", ""),
            "whoRegion": who_regions.get(iso3, ""),
            "lat": coords[0],
            "lon": coords[1],
            "population": pop,
        }
        countries.append(country)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(countries, f, indent=2)

    print(f"\nWrote {len(countries)} countries to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
