# Architecture

> **Read this file in full when touching architecture, data flow, or project structure.**

## System Overview

```
Data Sources (APIs/RSS)
        │
        ▼
Python Pipeline (pipeline/)
        │
        ▼
JSON Data Files (data/)
        │
        ▼
Next.js API Routes (src/app/api/)
        │
        ▼
React Components (src/components/)
        │
        ▼
User's Browser
```

## Data Flow

### 1. Pipeline → JSON Files
Python scripts in `pipeline/` fetch from external APIs and write normalized JSON to `data/`.
- `fetch_outbreaks.py` → `data/outbreaks.json`
- `fetch_capacity.py` → `data/capacity.json`
- `fetch_indices.py` → `data/indices.json`
- Country metadata is static → `data/countries.json`

### 2. JSON Files → API Routes
Next.js API routes in `src/app/api/` read from `data/*.json` and serve filtered responses.
- `GET /api/outbreaks` → all outbreaks (with query filters)
- `GET /api/capacity/[iso3]` → capacity data for one country
- `GET /api/countries` → country list with metadata

### 3. API Routes → Components
React components fetch from API routes using client-side fetch.
- Map component fetches `/api/outbreaks` on mount
- Sidebar fetches `/api/capacity/[iso3]` when an outbreak is clicked
- Country profile pages fetch both on mount

## Key Design Decisions

### Why JSON files instead of a database?
- Zero infrastructure cost (no Supabase/Neon needed)
- Data is small enough (~5MB total) to commit to the repo
- Simplifies deployment (Vercel serves everything)
- Can migrate to a database later if needed
- Pipeline runs offline; app reads static files

### Why Python pipeline instead of fetching in Next.js?
- WHO GHO API and World Bank API are slow (multiple paginated requests)
- RSS parsing and country name normalization are complex
- Pipeline runs on schedule (GitHub Actions cron), not on every page load
- Separates data concerns from presentation concerns

### Why Leaflet instead of Mapbox GL?
- Fully open source, no API key needed
- Free with no usage limits
- React-Leaflet has good Next.js compatibility
- Sufficient for our needs (markers, popups, choropleth)

## Component Architecture

```
App Layout (src/app/layout.tsx)
├── Header (nav bar)
├── Page Content
│   ├── Home Page (src/app/page.tsx)
│   │   ├── FilterBar
│   │   ├── StatsBar ("47 outbreaks across 32 countries")
│   │   ├── OutbreakMap (Leaflet map with markers)
│   │   └── OutbreakSidebar (details + capacity on click)
│   │       ├── OutbreakDetails (disease, cases, source)
│   │       ├── CapacityPanel (bars/gauges for indicators)
│   │       └── HistoricalOutbreaks (past events list)
│   ├── Country Page (src/app/country/[iso3]/page.tsx)
│   │   ├── CountryHeader (name, region, income group)
│   │   ├── CapacityGrid (all indicators)
│   │   ├── PreparednessRadar (GHSI/INFORM spider chart)
│   │   └── OutbreakTimeline (historical events)
│   └── About Page (src/app/about/page.tsx)
└── Footer
```

## Data Models

See `src/types/index.ts` for TypeScript type definitions.

Key entities:
- **Outbreak**: disease, country, date, cases, deaths, source URL
- **CapacityIndicator**: country, indicator code, value, year, WHO benchmark
- **Country**: ISO3 code, name, region, income group, coordinates
- **IndexScore**: country, index name (GHSI/INFORM/SPAR), score, year
