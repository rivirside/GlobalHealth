# Decision Log

> **Do NOT read this file in full. GREP for specific topics as needed.**

## Format
Each decision follows this structure:
- **Date**: When decided
- **Decision**: What was decided
- **Context**: Why this came up
- **Options Considered**: What alternatives existed
- **Rationale**: Why this option was chosen
- **Consequences**: What this means going forward

---

## 2026-02-27: Project Direction — Outbreak Context Dashboard

**Decision**: Build a Disease Outbreak Context Dashboard that combines real-time outbreak alerts with health system capacity data.

**Context**: Evaluated 10 project ideas for a global health capstone. Needed something that fills a genuine gap, where data is 99%+ programmable, and requires minimal ongoing maintenance.

**Options Considered**:
1. Global Health Equity Dashboard (~98% hands-off, moderate gap)
2. Health Policy Impact Simulator (~96% hands-off, large gap)
3. Disease Outbreak Context Dashboard (~99% hands-off, very large gap)
4. Unified Data Explorer (~99% hands-off, medium gap)
5. Several others eliminated (crowdsourced apps, clinical tools — required manual data)

**Rationale**: Competitive analysis of 17 existing outbreak/capacity tools confirmed that literally zero public tools combine outbreak alerts with health system capacity data in an integrated view. The WHO Emergency Dashboard comes closest but the "integration" is just separate toggle layers. Gap is structural (data silos between organizations), not due to lack of demand.

**Consequences**:
- Data pipeline fetches from WHO GHO API, World Bank API, WHO DON API
- All sources are free with no API keys
- Near-zero maintenance (automated feeds + quarterly refresh)

---

## 2026-02-27: Data Storage — JSON Files, Not Database

**Decision**: Store pipeline output as JSON files in the repo rather than using PostgreSQL/Supabase.

**Context**: Original plan called for PostgreSQL. Reassessed during implementation.

**Options Considered**:
1. PostgreSQL on Supabase/Neon free tier
2. SQLite file in the repo
3. JSON files in the repo

**Rationale**: Total data is ~5MB. JSON files are simpler to deploy (Vercel serves them as static assets), require no database setup or connection strings, and can be committed to the repo for versioning. Can always migrate to a database later if data grows.

**Consequences**:
- API routes read from `data/*.json` files using `fs.readFileSync`
- Pipeline scripts write to `data/*.json`
- Data refresh = re-run pipeline + commit updated JSON files
- No database connection management, no cold starts, no free tier limits

---

## 2026-02-27: Map Library — Leaflet, Not Mapbox GL

**Decision**: Use Leaflet with React-Leaflet for the interactive map.

**Context**: Need an interactive world map with clickable markers.

**Options Considered**:
1. Mapbox GL JS (powerful, free tier 50k loads/month, requires API key)
2. Leaflet (open source, no limits, no key needed)
3. Google Maps (requires billing account)

**Rationale**: Leaflet is fully free and open source with no usage limits or API keys. React-Leaflet provides good React integration. For our use case (markers on a world map), Leaflet is more than sufficient. Mapbox would add complexity (API key management, usage monitoring) without meaningful benefit.

**Consequences**:
- Use CartoDB Positron tiles for a clean, muted base map
- May need leaflet.markercluster plugin if markers overlap at low zoom
- No vector tiles or 3D terrain (not needed)

---

## 2026-02-27: CSS Framework — Tailwind CSS

**Decision**: Use Tailwind CSS for styling.

**Context**: Need a CSS approach for a data-heavy dashboard.

**Options Considered**:
1. Tailwind CSS (utility-first, fast iteration)
2. CSS Modules (scoped styles, more verbose)
3. shadcn/ui (component library built on Tailwind)

**Rationale**: Tailwind is fast for building data dashboards. Utility classes keep styles co-located with components. No need for a full component library — our UI is custom (map + sidebar + charts).

**Consequences**:
- All styles via Tailwind utility classes
- Custom colors defined in Tailwind config for disease categories and capacity status
- No external UI component library dependency

---

## 2026-02-27: Readiness Score — Weighted Composite of WHO Capacity Indicators

**Decision**: Compute a 0-100 composite readiness score from 6 WHO capacity indicators using weighted normalization against benchmarks.

**Context**: Needed a single number to summarize a country's health system preparedness for outbreak response.

**Options Considered**:
1. Simple average of all indicators
2. Weighted composite with benchmark normalization
3. Reuse GHSI or INFORM scores directly

**Rationale**: Weighted composite allows emphasizing the most relevant indicators (UHC index and health expenditure get 1.5x weight). Normalizing against WHO benchmarks gives a meaningful 0-100 scale where 100 = meets all benchmarks. Requires minimum 3 indicators to avoid sparse data artifacts. GHSI/INFORM serve different purposes (security vs risk) and don't measure operational readiness directly.

**Consequences**:
- Formula: `min(value/benchmark, 1.0)` per indicator, then weighted average × 100
- Indicators: hospital_beds, physicians, nurses, uhc_index, dtp3_coverage, health_expenditure_pc
- UHC and health_expenditure get 1.5x weight; rest get 1.0x
- Countries with <3 indicators get null score (excluded from display)
- 195 countries have valid scores

---

## 2026-02-27: Index Data Sources — GHSI CSV + INFORM Excel + SPAR via GHO API

**Decision**: Use three distinct sources for preparedness indices: GHSI CSV, INFORM Excel, and SPAR via WHO GHO API.

**Context**: Multiple global health preparedness indices exist. Need to integrate the most authoritative ones.

**Options Considered**:
1. GHSI only (most well-known)
2. GHSI + INFORM (two perspectives: security + risk)
3. GHSI + INFORM + SPAR (adds WHO's own self-assessment)

**Rationale**: Each index measures something different. GHSI measures health security capacity (higher = better). INFORM measures disaster risk (higher = worse — inverted scale). SPAR provides WHO's IHR self-assessment (15 granular capacities). Together they give a triangulated picture that no single index provides.

**Consequences**:
- GHSI: CSV download from ghsindex.org (2021 data, 163 countries)
- INFORM: Excel from drmkc.jrc.ec.europa.eu (2025 data, 191 countries)
- SPAR: WHO GHO API with IHRSPAR2 2nd edition codes (218 countries, 15 capacities)
- INFORM uses `invertedScale: true` flag in data model
- Excel parsing requires openpyxl dependency in pipeline
- GHSI data is from 2021 (latest available); may update when new edition releases

---

## 2026-02-27: Outbreak History — Append Mode with Deduplication

**Decision**: Outbreak pipeline appends new entries to existing data and deduplicates by ID, rather than overwriting.

**Context**: Want to build historical trends over time for the timeline view.

**Options Considered**:
1. Overwrite outbreaks.json on each run (simple, no history)
2. Append with deduplication (accumulates history)
3. Separate archive file + current file

**Rationale**: Appending is simple and the data is small. Deduplication by WHO DON ID prevents duplicates. A single file is easier to query than split archives. Over months of pipeline runs, the dataset naturally grows to support trend analysis.

**Consequences**:
- `fetch_outbreaks.py` loads existing outbreaks.json, merges new entries, deduplicates by `id`
- Timeline page (/timeline) can show outbreak frequency over time
- Data file grows slowly over time (currently 74 entries)
- GitHub Actions commits updated file on each run

---

## 2026-02-27: Country Briefs — Browser Print, Not PDF Library

**Decision**: Use `window.print()` with `@media print` CSS for exportable country briefs instead of a PDF generation library.

**Context**: Country profiles need a "download as PDF" feature for offline use.

**Options Considered**:
1. jsPDF + html2canvas (JavaScript PDF generation)
2. Puppeteer/Playwright server-side rendering
3. Browser print-to-PDF with `@media print` CSS

**Rationale**: Browser print requires zero external dependencies and produces high-quality output. Users can save as PDF from the print dialog. CSS gives full control over layout (A4 page, hidden nav, avoid page breaks inside cards). jsPDF would add ~200KB bundle size for worse output quality. Server-side rendering would require a headless browser on Vercel.

**Consequences**:
- PrintButton component calls `window.print()`
- `@media print` in globals.css: hides nav, sets A4 page, avoids breaking cards
- Zero bundle size impact
- Users must use browser's "Save as PDF" option (standard behavior)

---

## 2026-02-27: Border Data — Static JSON Mapping

**Decision**: Use a static `data/borders.json` file mapping ISO3 codes to arrays of neighbor ISO3 codes.

**Context**: Country profiles need a "Neighboring Countries" section showing nearby health system context.

**Options Considered**:
1. Compute borders from GeoJSON polygon data at runtime
2. Use an external API for border information
3. Static JSON mapping maintained manually

**Rationale**: Border relationships don't change frequently. A static file is fast to read, requires no API calls, and works offline. Computing from GeoJSON would add a large data dependency (~10MB topology file). 148 countries cover all countries likely to have active outbreaks.

**Consequences**:
- `data/borders.json` is a simple object: `{ "KEN": ["ETH", "SOM", "SSD", "TZA", "UGA"], ... }`
- 148 countries with bidirectional mappings
- Must be manually updated if new countries are added (rare)
- Island nations without land borders are excluded (acceptable)
