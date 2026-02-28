#!/usr/bin/env python3
"""
Fetch health system capacity data from WHO GHO API and World Bank API.
Outputs structured JSON to data/capacity.json keyed by ISO3 country code.
"""

import json
import time
from pathlib import Path

import requests

from country_mapping import NAME_TO_ISO3

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "capacity.json"

# WHO GHO API indicators
WHO_INDICATORS = {
    "hospital_beds": {
        "code": "WHS6_102",  # Hospital beds per 10,000
        "name": "Hospital Beds",
        "unit": "per 10,000",
        "benchmark": 30,
        "benchmarkLabel": "WHO recommends 30 per 10,000",
    },
    "physicians": {
        "code": "HWF_0001",  # Medical doctors per 10,000
        "name": "Physicians",
        "unit": "per 10,000",
        "benchmark": 10,
        "benchmarkLabel": "WHO recommends 10 per 10,000",
    },
    "nurses": {
        "code": "HWF_0006",  # Nursing and midwifery per 10,000
        "name": "Nurses & Midwives",
        "unit": "per 10,000",
        "benchmark": 25,
        "benchmarkLabel": "WHO recommends 25 per 10,000",
    },
    "uhc_index": {
        "code": "UHC_INDEX_REPORTED",
        "name": "UHC Service Coverage",
        "unit": "index (0-100)",
        "benchmark": 80,
        "benchmarkLabel": "SDG target: 80+",
    },
    "dtp3_coverage": {
        "code": "WHS4_100",  # DTP3 immunization among 1-year-olds
        "name": "DTP3 Immunization",
        "unit": "%",
        "benchmark": 90,
        "benchmarkLabel": "WHO target: 90%",
    },
    # Vaccination Coverage
    "mcv1_coverage": {
        "code": "WHS8_110",  # Measles (MCV1) among 1-year-olds
        "name": "Measles (MCV1)",
        "unit": "%",
        "benchmark": 95,
        "benchmarkLabel": "WHO target: 95%",
    },
    "mcv2_coverage": {
        "code": "WHS4_544",  # Measles 2nd dose
        "name": "Measles 2nd Dose (MCV2)",
        "unit": "%",
        "benchmark": 95,
        "benchmarkLabel": "WHO target: 95%",
    },
    "pol3_coverage": {
        "code": "WHS4_117",  # Polio (Pol3) among 1-year-olds
        "name": "Polio (Pol3)",
        "unit": "%",
        "benchmark": 90,
        "benchmarkLabel": "WHO target: 90%",
    },
    "hepb3_coverage": {
        "code": "WHS4_129",  # Hepatitis B (HepB3) among 1-year-olds
        "name": "Hepatitis B (HepB3)",
        "unit": "%",
        "benchmark": 90,
        "benchmarkLabel": "WHO target: 90%",
    },
    "pcv3_coverage": {
        "code": "PCV3",  # Pneumococcal (PCV3)
        "name": "Pneumococcal (PCV3)",
        "unit": "%",
        "benchmark": 90,
        "benchmarkLabel": "WHO target: 90%",
    },
    "bcg_coverage": {
        "code": "WHS4_543",  # BCG coverage
        "name": "BCG",
        "unit": "%",
        "benchmark": 90,
        "benchmarkLabel": "WHO target: 90%",
    },
    # Health Outcomes
    "life_expectancy": {
        "code": "WHOSIS_000001",  # Life expectancy at birth
        "name": "Life Expectancy",
        "unit": "years",
        "benchmark": None,
        "benchmarkLabel": None,
    },
    "under5_mortality": {
        "code": "MDG_0000000001",  # Under-5 mortality per 1,000 live births
        "name": "Under-5 Mortality",
        "unit": "per 1,000 live births",
        "benchmark": 25,
        "benchmarkLabel": "SDG target: <25 per 1,000",
    },
    "maternal_mortality": {
        "code": "MORT_MATERNALNUM",  # Maternal mortality ratio
        "name": "Maternal Mortality Ratio",
        "unit": "per 100,000 live births",
        "benchmark": 70,
        "benchmarkLabel": "SDG target: <70 per 100,000",
    },
}

# World Bank indicators
WB_INDICATORS = {
    "health_expenditure_pc": {
        "code": "SH.XPD.CHEX.PC.CD",
        "name": "Health Expenditure",
        "unit": "USD per capita",
        "benchmark": 86,
        "benchmarkLabel": "WHO minimum: $86/capita",
    },
    "health_expenditure_gdp": {
        "code": "SH.XPD.CHEX.GD.ZS",
        "name": "Health Expenditure (% GDP)",
        "unit": "% of GDP",
        "benchmark": None,
        "benchmarkLabel": None,
    },
    "gdp_per_capita": {
        "code": "NY.GDP.PCAP.CD",
        "name": "GDP per Capita",
        "unit": "USD",
        "benchmark": None,
        "benchmarkLabel": None,
    },
    "population": {
        "code": "SP.POP.TOTL",
        "name": "Population",
        "unit": "people",
        "benchmark": None,
        "benchmarkLabel": None,
    },
    # Demographics
    "population_density": {
        "code": "EN.POP.DNST",
        "name": "Population Density",
        "unit": "per km²",
        "benchmark": None,
        "benchmarkLabel": None,
    },
    "population_65plus": {
        "code": "SP.POP.65UP.TO.ZS",
        "name": "Population 65+",
        "unit": "%",
        "benchmark": None,
        "benchmarkLabel": None,
    },
    "urban_population": {
        "code": "SP.URB.TOTL.IN.ZS",
        "name": "Urban Population",
        "unit": "%",
        "benchmark": None,
        "benchmarkLabel": None,
    },
    # WASH Infrastructure
    "basic_water": {
        "code": "SH.H2O.BASW.ZS",
        "name": "Basic Drinking Water",
        "unit": "%",
        "benchmark": 100,
        "benchmarkLabel": "SDG target: universal access",
    },
    "basic_sanitation": {
        "code": "SH.STA.BASS.ZS",
        "name": "Basic Sanitation",
        "unit": "%",
        "benchmark": 100,
        "benchmarkLabel": "SDG target: universal access",
    },
    "safe_water": {
        "code": "SH.H2O.SMDW.ZS",
        "name": "Safely Managed Water",
        "unit": "%",
        "benchmark": 100,
        "benchmarkLabel": "SDG target: universal access",
    },
    "safe_sanitation": {
        "code": "SH.STA.SMSS.ZS",
        "name": "Safely Managed Sanitation",
        "unit": "%",
        "benchmark": 100,
        "benchmarkLabel": "SDG target: universal access",
    },
}

WHO_API_BASE = "https://ghoapi.azureedge.net/api"
WB_API_BASE = "https://api.worldbank.org/v2"


def fetch_who_indicator(indicator_code: str) -> dict[str, tuple[float, int]]:
    """
    Fetch data for a WHO GHO indicator.
    Returns dict of {iso3: (value, year)} with most recent value per country.
    """
    url = f"{WHO_API_BASE}/{indicator_code}"
    results: dict[str, tuple[float, int]] = {}

    try:
        resp = requests.get(url, timeout=60)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  Error fetching {indicator_code}: {e}")
        return results

    for item in data.get("value", []):
        iso3 = item.get("SpatialDim", "")
        if len(iso3) != 3:
            continue

        value = item.get("NumericValue")
        year = item.get("TimeDim")
        if value is None or year is None:
            continue

        try:
            year = int(year)
            value = float(value)
        except (ValueError, TypeError):
            continue

        # Keep most recent value per country
        if iso3 not in results or year > results[iso3][1]:
            results[iso3] = (value, year)

    return results


def fetch_wb_indicator(indicator_code: str) -> dict[str, tuple[float, int]]:
    """
    Fetch data for a World Bank indicator.
    Returns dict of {iso3: (value, year)} with most recent value per country.
    """
    results: dict[str, tuple[float, int]] = {}
    page = 1
    total_pages = 1

    while page <= total_pages:
        url = f"{WB_API_BASE}/country/all/indicator/{indicator_code}"
        params = {
            "format": "json",
            "per_page": 500,
            "page": page,
            "date": "2015:2025",
        }

        try:
            resp = requests.get(url, params=params, timeout=30)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  Error fetching {indicator_code} page {page}: {e}")
            break

        if not isinstance(data, list) or len(data) < 2:
            break

        metadata = data[0]
        total_pages = metadata.get("pages", 1)
        records = data[1]

        if records is None:
            break

        for item in records:
            iso3 = item.get("countryiso3code", "")
            if len(iso3) != 3:
                continue

            value = item.get("value")
            year_str = item.get("date", "")
            if value is None:
                continue

            try:
                year = int(year_str)
                value = float(value)
            except (ValueError, TypeError):
                continue

            # Keep most recent value per country
            if iso3 not in results or year > results[iso3][1]:
                results[iso3] = (value, year)

        page += 1
        time.sleep(0.2)  # Be nice to the API

    return results


def main():
    DATA_DIR.mkdir(exist_ok=True)
    all_data: dict[str, dict] = {}

    # Fetch WHO indicators
    print("Fetching WHO GHO indicators...")
    for key, info in WHO_INDICATORS.items():
        print(f"  Fetching {info['name']} ({info['code']})...")
        data = fetch_who_indicator(info["code"])
        print(f"    Got data for {len(data)} countries")

        for iso3, (value, year) in data.items():
            if iso3 not in all_data:
                all_data[iso3] = {"iso3": iso3, "name": "", "indicators": []}
            all_data[iso3]["indicators"].append({
                "code": key,
                "name": info["name"],
                "value": round(value, 2),
                "year": year,
                "unit": info["unit"],
                "benchmark": info["benchmark"],
                "benchmarkLabel": info["benchmarkLabel"],
                "source": "WHO GHO",
            })
        time.sleep(0.5)

    # Fetch World Bank indicators
    print("\nFetching World Bank indicators...")
    for key, info in WB_INDICATORS.items():
        print(f"  Fetching {info['name']} ({info['code']})...")
        data = fetch_wb_indicator(info["code"])
        print(f"    Got data for {len(data)} countries")

        for iso3, (value, year) in data.items():
            if iso3 not in all_data:
                all_data[iso3] = {"iso3": iso3, "name": "", "indicators": []}
            all_data[iso3]["indicators"].append({
                "code": key,
                "name": info["name"],
                "value": round(value, 2),
                "year": year,
                "unit": info["unit"],
                "benchmark": info["benchmark"],
                "benchmarkLabel": info["benchmarkLabel"],
                "source": "World Bank",
            })
        time.sleep(0.5)

    # Fill in country names from our mapping
    iso3_to_name = {v: k for k, v in NAME_TO_ISO3.items()}
    # Prefer shorter names (some countries have multiple entries)
    for name, iso3 in NAME_TO_ISO3.items():
        if iso3 in all_data:
            current = all_data[iso3]["name"]
            if not current or len(name) < len(current):
                all_data[iso3]["name"] = name

    # Write output
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_data, f, indent=2)

    print(f"\nWrote capacity data for {len(all_data)} countries to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
