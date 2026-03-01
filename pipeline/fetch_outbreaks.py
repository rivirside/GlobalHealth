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
from collections import defaultdict

import requests

from country_mapping import get_iso3, get_coordinates
from extract_counts import enrich_outbreaks

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
    # Fix miscategorizations: diseases that were falling through to "other"
    "sudan virus": "hemorrhagic",
    "hantavirus": "hemorrhagic",
    "chapare": "hemorrhagic",
    "western equine encephalitis": "vector-borne",
    "japanese encephalitis": "vector-borne",
    "enterohaemorrhagic": "diarrheal",
    "enterohemorrhagic": "diarrheal",
    "salmonellosis": "diarrheal",
}


def categorize_disease(disease_name: str) -> str:
    """Map a disease name to a category."""
    lower = disease_name.lower()
    for keyword, category in DISEASE_CATEGORIES.items():
        if keyword in lower:
            return category
    return "other"


def parse_don_title(title: str) -> list[tuple[str, str | None]]:
    """
    Parse WHO DON titles. Common formats:
    - "Nipah virus infection - Bangladesh"
    - "Ebola virus disease – Democratic Republic of the Congo"
    - "Marburg virus disease - Uganda and Kenya"
    - "Cholera – Multi-country with a focus on..."
    Returns a list of (disease, country_or_none) tuples.
    Multi-country titles produce multiple tuples.
    """
    # Normalize dash types
    normalized = title.replace("\u2013", "-").replace("\u2014", "-")

    # Skip "Global situation" / "Multi-country" / regional entries
    lower = normalized.lower()
    if "global situation" in lower or "multi-country" in lower or "global update" in lower:
        disease = normalized.split(" - ")[0].split(":")[0].strip()
        return [(disease, None)]

    # Try "Disease - Country" pattern with various dash formats
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
            return [(disease, None)]

        # Handle "Country A and Country B" → create records for both
        if " and " in country:
            # First check if full string is one country (e.g., "Trinidad and Tobago")
            full_iso = get_iso3(country)
            if full_iso:
                return [(disease, country)]

            # Split into multiple countries
            parts = country.split(" and ")
            results = []
            for part in parts:
                part = part.strip()
                if get_iso3(part):
                    results.append((disease, part))

            if results:
                return results
            # Fallback: just the first part
            return [(disease, parts[0].strip())]

        return [(disease, country)]

    return [(title, None)]


def make_id(disease: str, country: str, date: str) -> str:
    """Generate a deterministic ID for an outbreak entry."""
    raw = f"{disease}|{country}|{date}"
    return hashlib.md5(raw.encode()).hexdigest()[:12]


def fetch_who_don_page(skip: int = 0, top: int = 100) -> list[dict]:
    """Fetch one page of WHO Disease Outbreak News via the OData API."""
    full_url = (
        WHO_DON_API
        + "?sf_provider=dynamicProvider372"
        "&sf_culture=en"
        "&$orderby=PublicationDateAndTime%20desc"
        "&$select=Title,TitleSuffix,OverrideTitle,UseOverrideTitle,ItemDefaultUrl,PublicationDateAndTime"
        f"&$top={top}"
        f"&$skip={skip}"
    )

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (GlobalHealthDashboard/1.0)",
        "Accept": "application/json",
    })
    req = requests.Request("GET", full_url)
    prepared = req.prepare()
    prepared.url = full_url
    resp = session.send(prepared, timeout=30)
    resp.raise_for_status()
    return resp.json().get("value", [])


def parse_don_items(items: list[dict]) -> list[dict]:
    """Parse a list of WHO DON API items into outbreak records."""
    outbreaks = []
    for item in items:
        title = item.get("Title", "")
        suffix = item.get("TitleSuffix", "")
        override = item.get("OverrideTitle", "")
        use_override = item.get("UseOverrideTitle", False)

        display_title = override if use_override and override else title
        if suffix:
            display_title += f" {suffix}"

        date_str = item.get("PublicationDateAndTime", "")
        date = date_str[:10] if date_str else datetime.now().strftime("%Y-%m-%d")

        url_path = item.get("ItemDefaultUrl", "")
        if url_path:
            # ItemDefaultUrl returns paths like "/2026-DON594" or "/dd-month-yyyy-disease-country-en"
            # Full URL needs the emergencies/disease-outbreak-news/item prefix
            clean_path = url_path.lstrip("/")
            source_url = f"https://www.who.int/emergencies/disease-outbreak-news/item/{clean_path}"
        else:
            source_url = ""

        # parse_don_title now returns a list of (disease, country) tuples
        parsed_pairs = parse_don_title(display_title)

        for disease, country in parsed_pairs:
            if not country:
                continue

            iso3 = get_iso3(country)
            if not iso3:
                continue

            coords = get_coordinates(iso3)
            if not coords:
                continue

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
                "status": "active",  # Placeholder; determined in post-processing
            }
            outbreaks.append(outbreak)

    return outbreaks


def determine_status(outbreaks: list[dict]) -> list[dict]:
    """
    Mark outbreaks as active or resolved using two rules:
    1. If a newer DON report exists for the same disease+country, older ones are "resolved"
    2. Fallback: >365 days old = "resolved"
    """
    groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for o in outbreaks:
        key = (o["disease"].lower().strip(), o["countryIso3"])
        groups[key].append(o)

    now = datetime.now()
    for _key, group in groups.items():
        if len(group) == 1:
            # Single report: use 365-day rule
            o = group[0]
            try:
                age = (now - datetime.strptime(o["date"], "%Y-%m-%d")).days
                o["status"] = "resolved" if age > 365 else "active"
            except ValueError:
                o["status"] = "active"
        else:
            # Multiple reports: most recent is active (if within 365 days), older ones resolved
            sorted_group = sorted(group, key=lambda x: x["date"], reverse=True)
            for i, o in enumerate(sorted_group):
                try:
                    age = (now - datetime.strptime(o["date"], "%Y-%m-%d")).days
                except ValueError:
                    age = 0

                if i == 0:  # Most recent report
                    o["status"] = "resolved" if age > 365 else "active"
                else:  # Older reports: superseded by newer report
                    o["status"] = "resolved"

    return outbreaks


# Maximum pages to fetch (100 items each). 8 pages = up to 800 items, going back ~8 years.
MAX_PAGES = 8


def fetch_who_don() -> list[dict]:
    """Fetch WHO Disease Outbreak News via the OData API with pagination."""
    print("Fetching WHO DON via API (paginated)...")

    all_outbreaks = []
    for page in range(MAX_PAGES):
        skip = page * 100
        try:
            items = fetch_who_don_page(skip=skip)
        except Exception as e:
            print(f"  Error fetching page {page + 1} (skip={skip}): {e}")
            break

        if not items:
            print(f"  Page {page + 1}: no more items")
            break

        parsed = parse_don_items(items)
        all_outbreaks.extend(parsed)

        first_date = items[0].get("PublicationDateAndTime", "")[:10]
        last_date = items[-1].get("PublicationDateAndTime", "")[:10]
        print(f"  Page {page + 1}: {len(items)} items, {len(parsed)} parsed ({last_date} to {first_date})")

        if len(items) < 100:
            break

    print(f"\nParsed {len(all_outbreaks)} outbreaks total from WHO DON")
    return all_outbreaks


def main():
    DATA_DIR.mkdir(exist_ok=True)

    # Load existing outbreaks for append/dedup
    existing: list[dict] = []
    if OUTPUT_FILE.exists():
        try:
            existing = json.loads(OUTPUT_FILE.read_text())
            print(f"Loaded {len(existing)} existing outbreaks")
        except Exception:
            pass

    new_outbreaks = fetch_who_don()

    # Merge: deduplicate by ID, keeping new entries if duplicate
    by_id = {o["id"]: o for o in existing}
    added = 0
    for o in new_outbreaks:
        if o["id"] not in by_id:
            added += 1
        by_id[o["id"]] = o

    merged = list(by_id.values())

    # Post-processing: determine active/resolved status
    merged = determine_status(merged)

    # Enrich with case/death counts from DON HTML pages
    merged = enrich_outbreaks(merged, max_fetch=0)

    # Sort by date descending
    merged = sorted(merged, key=lambda x: x["date"], reverse=True)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(merged, f, indent=2)

    print(f"Wrote {len(merged)} outbreaks to {OUTPUT_FILE} ({added} new, {len(existing)} existing)")


if __name__ == "__main__":
    main()
