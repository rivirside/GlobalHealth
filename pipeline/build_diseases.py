#!/usr/bin/env python3
"""
Build disease profile data from outbreak records.
Reads data/outbreaks.json and generates data/diseases.json with
per-disease statistics and static metadata.
"""

import json
from pathlib import Path
from collections import defaultdict

DATA_DIR = Path(__file__).parent.parent / "data"
OUTBREAKS_FILE = DATA_DIR / "outbreaks.json"
OUTPUT_FILE = DATA_DIR / "diseases.json"

# Static disease metadata: transmission, incubation, symptoms, WHO fact sheet
DISEASE_METADATA: dict[str, dict] = {
    "cholera": {
        "transmission": "Contaminated water and food",
        "incubation": "12 hours to 5 days",
        "symptoms": "Watery diarrhea, vomiting, dehydration",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/cholera",
    },
    "ebola": {
        "transmission": "Direct contact with infected body fluids",
        "incubation": "2 to 21 days",
        "symptoms": "Fever, hemorrhaging, organ failure",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/ebola-virus-disease",
    },
    "dengue": {
        "transmission": "Aedes mosquito bites",
        "incubation": "4 to 10 days",
        "symptoms": "High fever, severe headache, joint pain",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue",
    },
    "measles": {
        "transmission": "Airborne droplets",
        "incubation": "10 to 14 days",
        "symptoms": "Fever, cough, rash, conjunctivitis",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/measles",
    },
    "mpox": {
        "transmission": "Close physical contact, contaminated materials",
        "incubation": "6 to 13 days",
        "symptoms": "Skin rash, fever, swollen lymph nodes",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/monkeypox",
    },
    "avian influenza": {
        "transmission": "Contact with infected poultry or contaminated environments",
        "incubation": "1 to 5 days",
        "symptoms": "Fever, cough, sore throat, pneumonia",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/influenza-(avian-and-other-zoonotic)",
    },
    "marburg": {
        "transmission": "Direct contact with infected body fluids",
        "incubation": "2 to 21 days",
        "symptoms": "High fever, severe hemorrhaging, organ failure",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/marburg-virus-disease",
    },
    "yellow fever": {
        "transmission": "Aedes and Haemagogus mosquito bites",
        "incubation": "3 to 6 days",
        "symptoms": "Fever, jaundice, hemorrhaging",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/yellow-fever",
    },
    "plague": {
        "transmission": "Flea bites, respiratory droplets, contact with infected animals",
        "incubation": "1 to 7 days",
        "symptoms": "Fever, chills, swollen lymph nodes (bubonic) or pneumonia (pneumonic)",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/plague",
    },
    "meningococcal": {
        "transmission": "Respiratory droplets",
        "incubation": "2 to 10 days",
        "symptoms": "Sudden fever, stiff neck, headache, petechial rash",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/meningococcal-meningitis",
    },
    "lassa fever": {
        "transmission": "Contact with Mastomys rat excretions or infected body fluids",
        "incubation": "6 to 21 days",
        "symptoms": "Gradual fever, weakness, malaise, hemorrhaging in severe cases",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/lassa-fever",
    },
    "oropouche": {
        "transmission": "Culicoides paraensis midge bites",
        "incubation": "4 to 8 days",
        "symptoms": "Sudden fever, headache, joint and muscle pain",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/oropouche-virus-disease",
    },
    "rift valley fever": {
        "transmission": "Mosquito bites, contact with infected animal blood/tissues",
        "incubation": "2 to 6 days",
        "symptoms": "Fever, weakness, back pain, dizziness",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/rift-valley-fever",
    },
    "diphtheria": {
        "transmission": "Respiratory droplets",
        "incubation": "2 to 5 days",
        "symptoms": "Sore throat, fever, gray membrane in throat",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/diphtheria",
    },
    "polio": {
        "transmission": "Fecal-oral route",
        "incubation": "7 to 21 days",
        "symptoms": "Most asymptomatic; can cause paralysis",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/poliomyelitis",
    },
    "malaria": {
        "transmission": "Anopheles mosquito bites",
        "incubation": "10 to 15 days",
        "symptoms": "Fever, chills, headache, sweating",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/malaria",
    },
    "nipah": {
        "transmission": "Contact with infected bats, pigs, or contaminated food",
        "incubation": "4 to 14 days",
        "symptoms": "Fever, headache, drowsiness, encephalitis",
        "factSheet": "https://www.who.int/news-room/fact-sheets/detail/nipah-virus",
    },
}


def normalize_disease_key(disease_name: str) -> str:
    """Normalize disease name to a slug for matching."""
    lower = disease_name.lower().strip()
    # Map common variants
    if "avian influenza" in lower or "influenza a(h5" in lower:
        return "avian-influenza"
    if "ebola" in lower:
        return "ebola"
    if "marburg" in lower:
        return "marburg"
    if "cholera" in lower:
        return "cholera"
    if "dengue" in lower:
        return "dengue"
    if "measles" in lower:
        return "measles"
    if "mpox" in lower or "monkeypox" in lower:
        return "mpox"
    if "yellow fever" in lower:
        return "yellow-fever"
    if "plague" in lower:
        return "plague"
    if "meningococcal" in lower or "meningitis" in lower:
        return "meningococcal"
    if "lassa" in lower:
        return "lassa-fever"
    if "oropouche" in lower:
        return "oropouche"
    if "rift valley" in lower:
        return "rift-valley-fever"
    if "diphtheria" in lower:
        return "diphtheria"
    if "polio" in lower:
        return "polio"
    if "malaria" in lower:
        return "malaria"
    if "nipah" in lower:
        return "nipah"
    if "chikungunya" in lower:
        return "chikungunya"
    if "zika" in lower:
        return "zika"
    # Fallback: slugify
    slug = lower.replace(" ", "-").replace("(", "").replace(")", "")
    return slug


def find_metadata(slug: str) -> dict:
    """Look up static metadata for a disease slug."""
    # Try direct key match
    key = slug.replace("-", " ")
    if key in DISEASE_METADATA:
        return DISEASE_METADATA[key]
    # Try slug match
    for mkey, mval in DISEASE_METADATA.items():
        if mkey.replace(" ", "-") == slug:
            return mval
    return {}


def main():
    DATA_DIR.mkdir(exist_ok=True)

    with open(OUTBREAKS_FILE) as f:
        outbreaks = json.load(f)

    print(f"Processing {len(outbreaks)} outbreaks...")

    # Group by normalized disease slug
    by_slug: dict[str, list[dict]] = defaultdict(list)
    slug_to_display: dict[str, str] = {}

    for o in outbreaks:
        slug = normalize_disease_key(o["disease"])
        by_slug[slug].append(o)
        # Keep the most common display name
        if slug not in slug_to_display:
            slug_to_display[slug] = o["disease"]

    diseases = []
    for slug, entries in sorted(by_slug.items()):
        countries = list(set(e["countryIso3"] for e in entries))
        dates = [e["date"] for e in entries if e["date"]]
        total_cases = sum(e["cases"] or 0 for e in entries)
        total_deaths = sum(e["deaths"] or 0 for e in entries)
        category = entries[0]["diseaseCategory"]

        metadata = find_metadata(slug)

        disease = {
            "slug": slug,
            "name": slug_to_display[slug],
            "category": category,
            "outbreakCount": len(entries),
            "affectedCountries": countries,
            "countryCount": len(countries),
            "totalCases": total_cases if total_cases > 0 else None,
            "totalDeaths": total_deaths if total_deaths > 0 else None,
            "firstReport": min(dates) if dates else None,
            "lastReport": max(dates) if dates else None,
            "transmission": metadata.get("transmission"),
            "incubation": metadata.get("incubation"),
            "symptoms": metadata.get("symptoms"),
            "factSheet": metadata.get("factSheet"),
        }
        diseases.append(disease)
        print(f"  {slug}: {len(entries)} outbreaks across {len(countries)} countries")

    # Sort by outbreak count descending
    diseases.sort(key=lambda d: d["outbreakCount"], reverse=True)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(diseases, f, indent=2)

    print(f"\nWrote {len(diseases)} disease profiles to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
