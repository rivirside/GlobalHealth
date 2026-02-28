# Architecture

> **Read this file in full when touching architecture, data flow, or project structure.**

## System Overview

```
Data Sources (WHO GHO, World Bank, WHO DON, GHSI, INFORM, SPAR)
        │
        ▼
Python Pipeline (pipeline/)
        │
        ▼
JSON Data Files (data/)
        │
        ▼
Next.js API Routes (src/app/api/)     Server Components (direct reads)
        │                                       │
        ▼                                       ▼
Client Components (src/components/)    Page-level rendering
        │
        ▼
User's Browser
```

## Data Flow

### 1. Pipeline → JSON Files
Python scripts in `pipeline/` fetch from external APIs and write normalized JSON to `data/`.
- `fetch_outbreaks.py` → `data/outbreaks.json` (append mode with deduplication)
- `fetch_capacity.py` → `data/capacity.json`
- `compute_readiness.py` → `data/readiness.json` (derived from capacity data)
- `fetch_indices.py` → `data/indices.json` (GHSI + INFORM + SPAR)
- Country metadata is static → `data/countries.json`
- Border adjacency is static → `data/borders.json`

### 2. JSON Files → API Routes / Server Components
Next.js API routes in `src/app/api/` read from `data/*.json` and serve filtered responses. Server components (country profile, timeline) read data directly via `src/lib/data.ts` loaders.
- `GET /api/outbreaks` → all outbreaks (with query filters)
- `GET /api/capacity/[iso3]` → capacity data for one country
- `GET /api/countries` → country list with metadata
- `GET /api/readiness/[iso3]` → composite readiness score
- `GET /api/indices/[iso3]` → GHSI, INFORM, SPAR index scores

### 3. API Routes → Components
- **Client-side fetch**: Map component fetches `/api/outbreaks` on mount; sidebar fetches capacity, readiness, and indices when an outbreak is clicked
- **Server-side reads**: Country profile pages, timeline page, and compare page read data directly from JSON files via `src/lib/data.ts` utility functions

## Key Design Decisions

### Why JSON files instead of a database?
- Zero infrastructure cost (no Supabase/Neon needed)
- Data is small enough (~5MB total) to commit to the repo
- Simplifies deployment (Vercel serves everything)
- Can migrate to a database later if needed
- Pipeline runs offline; app reads static files

### Why Python pipeline instead of fetching in Next.js?
- WHO GHO API and World Bank API are slow (multiple paginated requests)
- Country name normalization and Excel/CSV parsing are complex
- Pipeline runs on schedule (GitHub Actions cron), not on every page load
- Separates data concerns from presentation concerns

### Why Leaflet instead of Mapbox GL?
- Fully open source, no API key needed
- Free with no usage limits
- React-Leaflet has good Next.js compatibility
- Sufficient for our needs (markers, popups, choropleth)

### Why append mode for outbreaks?
- Historical data accumulates over time for trend analysis
- Each pipeline run merges new entries with existing data, deduplicating by ID
- Enables the /timeline page to show outbreak frequency over months/years

### Why browser print for country briefs instead of PDF libraries?
- Zero external dependencies (no jsPDF, html2canvas, puppeteer)
- `window.print()` + `@media print` CSS produces clean A4 output
- Users can save as PDF from their browser's print dialog

## Component Architecture

```
App Layout (src/app/layout.tsx)
├── Header (nav: Dashboard, Timeline, Compare, About)
│   └── MobileNav (hamburger menu for mobile)
├── Page Content
│   ├── Home Page (src/app/page.tsx) — client component
│   │   ├── FilterBar (disease, date range, active toggle)
│   │   ├── StatsBar ("47 outbreaks across 32 countries")
│   │   ├── OutbreakMap (Leaflet map + DiseaseMapLegend)
│   │   └── OutbreakSidebar
│   │       ├── OutbreakDetails (disease, cases, source links)
│   │       ├── ReadinessScoreBadge (SVG ring, color-coded)
│   │       ├── CapacityPanel (horizontal bar charts)
│   │       └── Index summary (GHSI/INFORM/SPAR one-line)
│   │
│   ├── Country Page (src/app/country/[iso3]/page.tsx) — server component
│   │   ├── ReadinessScoreBadge (large) + PrintButton
│   │   ├── Health System Capacity (6 indicator cards)
│   │   ├── Country Context (GDP, population, health spending)
│   │   ├── PreparednessRadar (GHSI radar + INFORM radar + SPAR bars)
│   │   ├── Outbreak History (filterable list)
│   │   └── Neighboring Countries (readiness + active outbreaks)
│   │
│   ├── Timeline Page (src/app/timeline/page.tsx) — server component
│   │   └── OutbreakTimeline (area chart, total/category views, filters)
│   │
│   ├── Compare Page (src/app/compare/page.tsx) — client component
│   │   ├── Country selectors (2-3 dropdowns)
│   │   └── ComparisonChart (capacity bars + index bars + overview cards)
│   │
│   └── About Page (src/app/about/page.tsx) — server component
│       └── Methodology, data sources, limitations, citation
└── (no footer — minimal layout)
```

## Data Models

See `src/types/index.ts` for TypeScript type definitions.

Key entities:
- **Outbreak**: disease, country, date, cases, deaths, source URL, category
- **CapacityIndicator**: country, indicator code, value, year, WHO benchmark
- **Country**: ISO3 code, name, region, income group, coordinates
- **IndexScore**: country, index name (GHSI/INFORM/SPAR), score, year, categories, invertedScale
- **ReadinessScore**: country, score (0-100), indicators used, indicator count

## File Map

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages and API routes |
| `src/app/api/` | Thin API routes reading from `data/*.json` |
| `src/app/country/[iso3]/` | Dynamic country profile page |
| `src/app/timeline/` | Historical outbreak timeline page |
| `src/app/compare/` | Country comparison page |
| `src/app/about/` | Methodology and data sources |
| `src/components/` | Reusable React components |
| `src/lib/data.ts` | Data loading utilities (server-side JSON reads) |
| `src/types/index.ts` | TypeScript type definitions |
| `data/` | Generated JSON data files |
| `pipeline/` | Python data fetching and processing scripts |
| `.github/workflows/` | GitHub Actions for automated data refresh |
