#!/usr/bin/env python3
"""
Extract case and death counts from WHO Disease Outbreak News HTML pages.

The WHO DON OData API returns only metadata (title, date, URL). The actual
case/death figures are embedded in the HTML body of each report page. This
module fetches those pages, caches them locally, and extracts counts using
ordered regex patterns.

Safety properties:
- Extraction can only ADD data (null -> number) or leave unchanged (null -> null)
- Failed extraction = stays null (same as before)
- Cached HTML ensures reproducibility across runs
- Sanity cap rejects extracted counts > 10,000,000
- Rate-limited to avoid overwhelming the WHO server
"""

import hashlib
import json
import re
import time
from pathlib import Path

import requests

try:
    from bs4 import BeautifulSoup

    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

CACHE_DIR = Path(__file__).parent / "source_data" / "don_cache"
SANITY_MAX = 10_000_000  # Reject counts above this threshold
RATE_LIMIT_SECONDS = 1.5  # Delay between HTTP requests (generous to avoid 429s)
MAX_RETRIES = 3  # Retry on 429/5xx with exponential backoff


# ---------------------------------------------------------------------------
# Regex patterns — ordered from most specific to least specific
# ---------------------------------------------------------------------------

# Number pattern: matches digits with comma or space thousands separators
# Strict format to avoid matching across sentences like "In 2019, 349 cases"
# Matches: "47,500", "47 500", "1,234,567", "500", "1 234 567"
# Does NOT match: "2019, 349" (comma+space is not valid separator)
NUM = r"(?:\d{1,3}(?:,\d{3})+|\d{1,3}(?:\s\d{3})+|\d+)"

# Combined patterns: capture both cases and deaths in one match
COMBINED_PATTERNS = [
    # "X confirmed cases and Y deaths"
    re.compile(
        rf"({NUM})\s+(?:confirmed\s+)?cases?\s+(?:and|with|including)\s+({NUM})\s+deaths?",
        re.IGNORECASE,
    ),
    # "X cases, including Y deaths"
    re.compile(
        rf"({NUM})\s+cases?\s*,?\s+including\s+({NUM})\s+deaths?",
        re.IGNORECASE,
    ),
    # "X cases (Y deaths)"
    re.compile(
        rf"({NUM})\s+cases?\s*\(\s*({NUM})\s+deaths?\s*\)",
        re.IGNORECASE,
    ),
    # "X cases of which Y died"
    re.compile(
        rf"({NUM})\s+cases?\s+of\s+which\s+({NUM})\s+(?:died|fatal)",
        re.IGNORECASE,
    ),
    # "total of X cases and Y deaths"
    re.compile(
        rf"total\s+of\s+({NUM})\s+cases?\s+(?:and|with)\s+({NUM})\s+deaths?",
        re.IGNORECASE,
    ),
    # "X confirmed/probable cases... Y deaths" (within 80 chars)
    re.compile(
        rf"({NUM})\s+(?:confirmed|probable|suspected)\s+cases?.{{0,80}}?({NUM})\s+deaths?",
        re.IGNORECASE,
    ),
]

# Case-only patterns
CASE_PATTERNS = [
    re.compile(rf"total\s+of\s+({NUM})\s+(?:confirmed\s+)?cases?", re.IGNORECASE),
    re.compile(rf"({NUM})\s+confirmed\s+cases?", re.IGNORECASE),
    re.compile(rf"({NUM})\s+(?:cases?\s+(?:have\s+been\s+)?reported)", re.IGNORECASE),
    re.compile(rf"({NUM})\s+cases?\s+(?:of|were|have)", re.IGNORECASE),
    re.compile(rf"cumulative\s+(?:total\s+(?:of\s+)?)?({NUM})\s+cases?", re.IGNORECASE),
]

# Death-only patterns
DEATH_PATTERNS = [
    re.compile(rf"({NUM})\s+deaths?\s+(?:have\s+been\s+)?reported", re.IGNORECASE),
    re.compile(rf"({NUM})\s+(?:have\s+)?died", re.IGNORECASE),
    re.compile(rf"({NUM})\s+(?:fatal(?:ities)?|deaths?)", re.IGNORECASE),
    re.compile(rf"case\s+fatality.{{0,20}}?({NUM})\s+deaths?", re.IGNORECASE),
]


def parse_number(s: str) -> int | None:
    """Parse a number string like '1,234' or '47 500' into an int."""
    if not s:
        return None
    cleaned = s.replace(",", "").replace(" ", "").strip()
    try:
        val = int(cleaned)
        if val > SANITY_MAX:
            return None
        if val < 0:
            return None
        return val
    except ValueError:
        return None


def extract_from_text(text: str) -> tuple[int | None, int | None]:
    """
    Extract case and death counts from text using ordered regex patterns.
    Returns (cases, deaths) where either can be None.
    """
    cases = None
    deaths = None

    # Try combined patterns first (most reliable — capture both at once)
    for pattern in COMBINED_PATTERNS:
        match = pattern.search(text)
        if match:
            c = parse_number(match.group(1))
            d = parse_number(match.group(2))
            if c is not None:
                cases = c
                deaths = d
                break

    # If no combined match, try case-only patterns
    if cases is None:
        for pattern in CASE_PATTERNS:
            match = pattern.search(text)
            if match:
                c = parse_number(match.group(1))
                if c is not None:
                    cases = c
                    break

    # If no deaths from combined match, try death-only patterns
    if deaths is None:
        for pattern in DEATH_PATTERNS:
            match = pattern.search(text)
            if match:
                d = parse_number(match.group(1))
                if d is not None:
                    deaths = d
                    break

    return cases, deaths


def cache_path_for_url(url: str) -> Path:
    """Get the cache file path for a URL."""
    url_hash = hashlib.md5(url.encode()).hexdigest()
    return CACHE_DIR / f"{url_hash}.html"


def fetch_don_page(url: str) -> str | None:
    """
    Fetch a WHO DON page, using cached HTML if available.
    Retries on 429/5xx with exponential backoff.
    Returns HTML string or None on failure.
    """
    cached = cache_path_for_url(url)
    if cached.exists():
        return cached.read_text(encoding="utf-8", errors="replace")

    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(
                url,
                timeout=30,
                headers={
                    "User-Agent": "Mozilla/5.0 (GlobalHealthDashboard/1.0)",
                    "Accept": "text/html",
                },
            )

            # Retry on rate limit or server error
            if resp.status_code == 429 or resp.status_code >= 500:
                wait = (2 ** attempt) * 3  # 3s, 6s, 12s
                if attempt < MAX_RETRIES - 1:
                    print(f"    {resp.status_code} for {url}, retrying in {wait}s...")
                    time.sleep(wait)
                    continue
                else:
                    print(f"    {resp.status_code} for {url} after {MAX_RETRIES} attempts")
                    return None

            resp.raise_for_status()
            html = resp.text

            # Cache for future runs
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            cached.write_text(html, encoding="utf-8")

            return html
        except requests.exceptions.HTTPError:
            # Non-retryable HTTP errors (404, etc.)
            if attempt == 0:
                print(f"    {resp.status_code} for {url}")
            return None
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                wait = (2 ** attempt) * 3
                print(f"    Error for {url}: {e}, retrying in {wait}s...")
                time.sleep(wait)
            else:
                print(f"    Failed to fetch {url}: {e}")
                return None

    return None


def extract_counts_from_html(html: str) -> tuple[int | None, int | None]:
    """
    Parse HTML and extract case/death counts from the article body.

    WHO DON pages have a consistent structure:
    - "Situation at a glance" / overview section (first ~1500 chars): current outbreak numbers
    - "Epidemiology" / historical context (later): cumulative/historical numbers

    We prioritize the overview section to avoid extracting historical figures.
    """
    if not HAS_BS4:
        return None, None

    soup = BeautifulSoup(html, "html.parser")

    # Try selectors from most specific to least specific
    selectors = [
        "div.sf-detail-body-wrapper",  # WHO DON detail page wrapper
        "div.content-block",  # Alternative WHO layout
        "article",  # Generic article
        "main",  # Main content area
        "div.container",  # Generic container
    ]

    text = None
    for selector in selectors:
        element = soup.select_one(selector)
        if element:
            text = element.get_text(separator=" ", strip=True)
            if len(text) > 100:  # Ensure we got substantial content
                break

    # Fallback: use entire body text
    if not text or len(text) < 100:
        body = soup.find("body")
        if body:
            text = body.get_text(separator=" ", strip=True)

    if not text:
        return None, None

    # Strategy: WHO DON pages have current outbreak data in the overview/summary
    # section (first ~2000 chars) and historical/cumulative figures deeper in.
    # We search in expanding windows to prioritize current data over historical.
    # If the overview has sufficient content (>200 chars), don't search further
    # than ~4000 chars — this avoids extracting "since 2001, 348 cases including
    # 250 deaths" from the epidemiology background section.
    for window_size in [2000, 4000]:
        window = text[:window_size]
        cases, deaths = extract_from_text(window)
        if cases is not None or deaths is not None:
            return cases, deaths
        # If this window had substantial content but no match, stop searching
        # wider — the numbers later are likely historical context
        if len(window) > 1500:
            continue

    # Final fallback for very short articles only
    if len(text) <= 4000:
        return extract_from_text(text)

    return None, None


def enrich_outbreaks(
    outbreaks: list[dict], max_fetch: int = 0
) -> list[dict]:
    """
    Second pass: enrich outbreaks that have null cases/deaths by fetching
    the WHO DON page and extracting counts.

    Args:
        outbreaks: List of outbreak dicts (modified in place)
        max_fetch: Max pages to fetch in this run (0 = unlimited)

    Returns:
        The same list with cases/deaths populated where possible.
    """
    if not HAS_BS4:
        print("Warning: beautifulsoup4 not installed. Skipping count extraction.")
        return outbreaks

    # Find outbreaks needing enrichment
    needs_enrichment = [
        o for o in outbreaks if o.get("cases") is None and o.get("deaths") is None and o.get("sourceUrl")
    ]

    if not needs_enrichment:
        print("All outbreaks already have case/death data.")
        return outbreaks

    print(f"\nEnriching {len(needs_enrichment)} outbreaks with case/death counts...")

    fetched = 0
    enriched = 0
    cached_hits = 0
    errors = 0

    for i, outbreak in enumerate(needs_enrichment):
        url = outbreak["sourceUrl"]
        if not url:
            continue

        # Check cache first (doesn't count against max_fetch)
        cached = cache_path_for_url(url)
        is_cached = cached.exists()

        if not is_cached:
            if max_fetch > 0 and fetched >= max_fetch:
                print(f"  Reached max_fetch limit ({max_fetch}). Stopping.")
                break
            # Rate limit only for non-cached requests
            if fetched > 0:
                time.sleep(RATE_LIMIT_SECONDS)

        html = fetch_don_page(url)
        if not html:
            errors += 1
            continue

        if is_cached:
            cached_hits += 1
        else:
            fetched += 1

        cases, deaths = extract_counts_from_html(html)

        if cases is not None or deaths is not None:
            outbreak["cases"] = cases
            outbreak["deaths"] = deaths
            enriched += 1

        # Progress reporting every 50 items
        total_processed = i + 1
        if total_processed % 50 == 0:
            print(f"  Processed {total_processed}/{len(needs_enrichment)} "
                  f"(enriched: {enriched}, fetched: {fetched}, cached: {cached_hits})")

    print(f"\nEnrichment complete:")
    print(f"  Processed: {min(len(needs_enrichment), fetched + cached_hits + errors)}")
    print(f"  Enriched: {enriched} outbreaks with case/death data")
    print(f"  Fetched: {fetched} new pages")
    print(f"  Cached: {cached_hits} pages from cache")
    print(f"  Errors: {errors}")

    return outbreaks


if __name__ == "__main__":
    # Standalone mode: enrich existing outbreaks.json
    DATA_DIR = Path(__file__).parent.parent / "data"
    outbreaks_file = DATA_DIR / "outbreaks.json"

    if not outbreaks_file.exists():
        print(f"No outbreaks file found at {outbreaks_file}")
        print("Run fetch_outbreaks.py first.")
        exit(1)

    outbreaks = json.loads(outbreaks_file.read_text())
    print(f"Loaded {len(outbreaks)} outbreaks from {outbreaks_file}")

    # Count current null cases/deaths
    null_count = sum(1 for o in outbreaks if o.get("cases") is None and o.get("deaths") is None)
    print(f"Outbreaks with null cases/deaths: {null_count}")

    outbreaks = enrich_outbreaks(outbreaks, max_fetch=0)

    # Write back
    with open(outbreaks_file, "w") as f:
        json.dump(outbreaks, f, indent=2)

    new_null_count = sum(1 for o in outbreaks if o.get("cases") is None and o.get("deaths") is None)
    print(f"\nAfter enrichment: {new_null_count} outbreaks still have null counts "
          f"(reduced from {null_count})")
