# Project Status

> **Read this file in full at the start of every conversation.**

## Current Phase
Phase 5 Complete: Analytical Depth

## What's Done
- [x] Project idea research and competitive analysis (17 tools analyzed)
- [x] Repo initialized with README, CLAUDE.md, .gitignore
- [x] Next.js 15 + TypeScript + Tailwind CSS setup
- [x] Leaflet, React-Leaflet, Recharts installed
- [x] Python data pipeline: fetch_outbreaks.py (WHO DON API), fetch_capacity.py (WHO GHO + World Bank)
- [x] Initial data fetch: 74 outbreaks across 33 countries, 268 countries with 9 capacity indicators
- [x] TypeScript types and data models
- [x] API routes: /api/outbreaks, /api/capacity/[iso3], /api/countries, /api/readiness/[iso3], /api/indices/[iso3]
- [x] Interactive Leaflet map with color-coded outbreak markers
- [x] Sidebar with outbreak details + health system capacity bars + readiness score + index summary
- [x] Filter controls (disease category, date range, active only)
- [x] Country profile pages (/country/[iso3]) with capacity indicators, context data, outbreak history
- [x] About/methodology page with data sources, benchmarks, limitations, citation guide
- [x] Production build passes with zero errors
- [x] Map tooltips on marker hover (disease name, country, case count)
- [x] Disease category legend on map (collapsible, 7 categories with color dots)
- [x] Responsive design: mobile bottom sheet sidebar, tablet overlay, hamburger nav, stacked filters
- [x] Vercel config with API caching headers (vercel.json)
- [x] GitHub Actions: outbreak refresh every 12h, capacity refresh quarterly (auto-commit + redeploy)
- [x] Composite readiness score: pipeline/compute_readiness.py → data/readiness.json (195 countries)
- [x] ReadinessScoreBadge component (SVG ring, green/amber/red, lg/sm sizes)
- [x] GHSI/INFORM/SPAR index pipeline: pipeline/fetch_indices.py → data/indices.json (219 countries)
- [x] PreparednessRadar component (Recharts radar for GHSI/INFORM, horizontal bars for SPAR)
- [x] Indices displayed on country profile and sidebar
- [x] Historical outbreak timeline page (/timeline) with Recharts area chart, category/country filters
- [x] Outbreak pipeline append mode with deduplication (preserves historical records)
- [x] Neighboring country context on country profile (readiness scores + active outbreak counts)
- [x] Country comparison page (/compare) with side-by-side capacity + index charts
- [x] Exportable country briefs (print button + @media print CSS)
- [x] Navigation updated: Dashboard, Timeline, Compare, About (desktop + mobile)

## Current Blockers
None

## Key Decisions Made
- **Tech stack**: Next.js 15 + Leaflet + Recharts + Tailwind
- **Data strategy**: Python pipeline → JSON files → Next.js reads at runtime (no database)
- **Map**: Leaflet with CartoDB Positron tiles (free, no API key)
- **WHO DON API**: OData endpoint at `who.int/api/emergencies/diseaseoutbreaknews` (old RSS feed deprecated)
- **Hosting**: Vercel free tier
- **Data refresh**: GitHub Actions cron (outbreaks every 12h, capacity quarterly)
- **Responsive sidebar**: Bottom sheet on mobile (<768px), right overlay on tablet (768-1024px), persistent on desktop (>1024px)
- **Readiness score**: Weighted composite of 6 WHO capacity indicators (min 3 required)
- **GHSI source**: CSV from ghsindex.org (2021 data, 163 countries)
- **INFORM source**: Excel from drmkc.jrc.ec.europa.eu (2025 data, 191 countries, inverted scale)
- **SPAR source**: WHO GHO API, IHRSPAR2 2nd edition codes (15 capacities, 218 countries)
- **Borders data**: Static JSON mapping ISO3 → neighbor ISO3 arrays (148 countries)

## Data Files
| File | Source | Records |
|------|--------|---------|
| data/outbreaks.json | WHO DON API | 74 outbreaks |
| data/capacity.json | WHO GHO + World Bank | 268 countries |
| data/readiness.json | Computed from capacity | 195 countries |
| data/indices.json | GHSI + INFORM + SPAR | 219 countries |
| data/borders.json | Static mapping | 148 countries |
| data/countries.json | WHO GHO | 268 countries |

## What To Work On Next

### Deployment (Priority)
1. Deploy to Vercel — connect GitHub repo, import project, click deploy (zero-config with vercel.json already set up)
2. Manually trigger GitHub Actions workflows (Actions tab → Run workflow) to verify outbreak refresh and capacity refresh work
3. Test auto-refresh pipeline end-to-end: verify Actions commit updated JSON files and Vercel redeploys

### Optional Enhancements
- Marker clustering for zoomed-out views (leaflet.markercluster plugin)
- Region filter implementation (matchesRegion TODO in page.tsx)
- Choropleth map layer by readiness score
- Bookmarkable filters (URL-based state with query params)
- Open Graph meta tags for social sharing previews
- Performance audit with Lighthouse
