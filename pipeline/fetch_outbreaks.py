#!/usr/bin/env python3
"""
Fetch disease outbreak alerts from WHO Disease Outbreak News OData API.
Parses titles to extract disease name and country, geocodes using country mapping,
and outputs structured JSON to data/outbreaks.json.
"""

import json
import re
import hashlib
from pathlib import Path
from datetime import datetime

import requests

from country_mapping import get_iso3, get_coordinates

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "outbreaks.json"

WHO_DON_API = "https://www.who.int/api/emergencies/diseaseoutbreaknews"

# Disease → category mapping
DISEASE_CATEGORIES: dict[str, str] = {
    "avian influenza": "zoonotic",
    "influenza": "respiratory",
    "covid-19": "respiratory",
    "sars": "respiratory",
    "mers": "respiratory",
    "mers-cov": "respiratory",
    "coronavirus": "respiratory",
    "pneumonia": "respiratory",
    "dengue": "vector-borne",
    "malaria": "vector-borne",
    "zika": "vector-borne",
    "chikungunya": "vector-borne",
    "yellow fever": "vector-borne",
    "rift valley fever": "vector-borne",
    "west nile": "vector-borne",
    "oropouche": "vector-borne",
    "cholera": "diarrheal",
    "typhoid": "diarrheal",
    "diarrhoeal": "diarrheal",
    "shigella": "diarrheal",
    "ebola": "hemorrhagic",
    "marburg": "hemorrhagic",
    "lassa fever": "hemorrhagic",
    "crimean-congo": "hemorrhagic",
    "haemorrhagic fever": "hemorrhagic",
    "hemorrhagic fever": "hemorrhagic",
    "measles": "vaccine-preventable",
    "polio": "vaccine-preventable",
    "poliomyelitis": "vaccine-preventable",
    "diphtheria": "vaccine-preventable",
    "pertussis": "vaccine-preventable",
    "meningococcal": "vaccine-preventable",
    "meningitis": "vaccine-preventable",
    "mpox": "zoonotic",
    "monkeypox": "zoonotic",
    "plague": "zoonotic",
    "anthrax": "zoonotic",
    "rabies": "zoonotic",
    "nipah": "zoonotic",
    "hendra": "zoonotic",
}


def categorize_disease(disease_name: str) -> str:
    """Map a disease name to a category."""
    lower = disease_name.lower()
    for keyword, category in DISEASE_CATEGORIES.items():
        if keyword in lower:
            return category
    return "other"


def parse_don_title(title: str) -> tuple[str, str | None]:
    """
    Parse WHO DON titles. Common formats:
    - "Nipah virus infection - Bangladesh"
    - "Ebola virus disease – Democratic Republic of the Congo"
    - "Marburg virus disease- Ethiopia"
    - "Avian Influenza A(H5N5)- United States of America"
    - "Cholera – Multi-country with a focus on..."
    - "Mpox: recombinant virus... – Global situation"
    Returns (disease, country_or_none).
    """
    # Normalize dash types
    normalized = title.replace("\u2013", "-").replace("\u2014", "-")

    # Skip "Global situation" / "Multi-country" / regional entries
    lower = normalized.lower()
    if "global situation" in lower or "multi-country" in lower or "global update" in lower:
        disease = normalized.split(" - ")[0].split(":")[0].strip()
        return disease, None

    # Try "Disease - Country" pattern with various dash formats
    # Match: "Disease - Country" or "Disease- Country" or "Disease -Country"
    match = re.match(r'^(.+?)\s*-\s*(.+)$', normalized)
    if match:
        disease = match.group(1).strip()
        country = match.group(2).strip()

        # Clean up country: remove region suffixes like "(AFRO)"
        country = re.sub(r'\s*\([^)]*\)\s*$', '', country)
        # Remove trailing dates
        country = re.sub(r'\s*\d{1,2}\s+\w+\s+\d{4}\s*$', '', country)
        # Remove "African Region" style entries
        if "region" in country.lower():
            return disease, None

        # Handle "Country and Country" → check if it's one country or two
        if " and " in country:
            full_iso = get_iso3(country)
            if full_iso:
                return disease, country
            # Take the first country
            first = country.split(" and ")[0].strip()
            return disease, first

        return disease, country

    return title, None


def make_id(disease: str, country: str, date: str) -> str:
    """Generate a deterministic ID for an outbreak entry."""
    raw = f"{disease}|{country}|{date}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def fetch_who_don() -> list[dict]:
    """Fetch WHO Disease Outbreak News via the OData API."""
    print("Fetching WHO DON via API...")

    # Build full URL — use a Session with a PreparedRequest to prevent
    # requests from re-encoding the OData $ parameters
    full_url = (
        WHO_DON_API
        + "?sf_provider=dynamicProvider372"
        "&sf_culture=en"
        "&$orderby=PublicationDateAndTime%20desc"
        "&$select=Title,TitleSuffix,OverrideTitle,UseOverrideTitle,ItemDefaultUrl,PublicationDateAndTime"
        "&$top=100"
    )

    try:
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (GlobalHealthDashboard/1.0)",
            "Accept": "application/json",
        })
        req = requests.Request("GET", full_url)
        prepared = req.prepare()
        # Override the URL to prevent requests from re-encoding OData params
        prepared.url = full_url
        resp = session.send(prepared, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  Error fetching WHO DON API: {e}")
        return []

    items = data.get("value", [])
    print(f"  Received {len(items)} items from API")

    outbreaks = []
    for item in items:
        # Build title
        title = item.get("Title", "")
        suffix = item.get("TitleSuffix", "")
        override = item.get("OverrideTitle", "")
        use_override = item.get("UseOverrideTitle", False)

        display_title = override if use_override and override else title
        if suffix:
            display_title += f" {suffix}"

        # Parse title
        disease, country = parse_don_title(display_title)
        if not country:
            print(f"  Skipping (no country): {display_title}")
            continue

        iso3 = get_iso3(country)
        if not iso3:
            print(f"  Unknown country '{country}' from: {display_title}")
            continue

        coords = get_coordinates(iso3)
        if not coords:
            continue

        # Parse date
        date_str = item.get("PublicationDateAndTime", "")
        date = date_str[:10] if date_str else datetime.now().strftime("%Y-%m-%d")

        # Build URL
        url_path = item.get("ItemDefaultUrl", "")
        source_url = f"https://www.who.int{url_path}" if url_path else ""

        outbreak = {
            "id": make_id(disease, country, date),
            "disease": disease,
            "diseaseCategory": categorize_disease(disease),
            "country": country,
            "countryIso3": iso3,
            "date": date,
            "cases": None,
            "deaths": None,
            "summary": display_title,
            "sourceUrl": source_url,
            "source": "WHO DON",
            "lat": coords[0],
            "lon": coords[1],
            "status": "active",
        }
        outbreaks.append(outbreak)
        print(f"  + {disease} in {country} ({iso3}) - {date}")

    print(f"\nParsed {len(outbreaks)} outbreaks from WHO DON")
    return outbreaks


def main():
    DATA_DIR.mkdir(exist_ok=True)
    outbreaks = fetch_who_don()
    outbreaks.sort(key=lambda x: x["date"], reverse=True)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(outbreaks, f, indent=2)

    print(f"Wrote {len(outbreaks)} outbreaks to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
