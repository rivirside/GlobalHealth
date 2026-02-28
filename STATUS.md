# Project Status

> **Read this file in full at the start of every conversation.**

## Current Phase
Wave 2 Complete: Data Enrichment + Content Pages

## What's Done
- [x] Project idea research and competitive analysis (17 tools analyzed)
- [x] Repo initialized with README, CLAUDE.md, .gitignore
- [x] Next.js 15 + TypeScript + Tailwind CSS setup
- [x] Leaflet, React-Leaflet, Recharts installed
- [x] Python data pipeline: fetch_outbreaks.py (WHO DON API), fetch_capacity.py (WHO GHO + World Bank)
- [x] Data fetch: 74 outbreaks, 270 countries with 25 capacity indicators
- [x] TypeScript types and data models with indicator grouping system
- [x] API routes: /api/outbreaks, /api/capacity/[iso3], /api/countries, /api/readiness/[iso3], /api/indices/[iso3]
- [x] Interactive Leaflet map with color-coded outbreak markers
- [x] Choropleth map layer toggling between outbreak markers and readiness score heatmap
- [x] Sidebar with outbreak details + health system capacity bars + readiness score + index summary
- [x] Filter controls (disease category, date range, region, active only)
- [x] Country profile pages (/country/[iso3]) with 5 grouped indicator sections
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
- [x] Historical outbreak timeline page (/timeline) with Recharts area chart, category/country filters
- [x] Outbreak pipeline append mode with deduplication (preserves historical records)
- [x] Neighboring country context on country profile (readiness scores + active outbreak counts)
- [x] Country comparison page (/compare) with side-by-side capacity + index charts
- [x] Exportable country briefs (print button + @media print CSS)
- [x] Expanded pipeline: 25 indicators (capacity, vaccination, WASH, demographics, outcomes)
- [x] Country profiles: 5 grouped indicator sections with benchmarks and progress bars
- [x] Choropleth map layer colored by readiness score (GeoJSON, 177 countries)
- [x] Disease profile pages (/diseases, /diseases/[slug]) — 29 diseases with metadata
- [x] Regional overview pages (/regions, /regions/[region]) — 6 WHO regions
- [x] Country metadata pipeline: build_countries.py → data/countries.json (311 countries with WHO regions)
- [x] Region filter on dashboard (AFRO, AMRO, EMRO, EURO, SEARO, WPRO)
- [x] Latest reports feed in sidebar when no outbreak selected
- [x] Navigation updated: Dashboard, Diseases, Regions, Timeline, Compare, About

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
- **Indicator grouping**: 5 categories (capacity, vaccination, WASH, outcomes, demographics)
- **Choropleth**: Natural Earth 110m GeoJSON (280KB, 177 features)
- **Disease profiles**: Pipeline builds from outbreaks + static metadata (transmission, symptoms, WHO links)
- **Region profiles**: Pipeline builds from outbreaks + countries + readiness, grouped by WHO region

## Data Files
| File | Source | Records |
|------|--------|---------|
| data/outbreaks.json | WHO DON API | 74 outbreaks |
| data/capacity.json | WHO GHO + World Bank | 270 countries, 25 indicators |
| data/readiness.json | Computed from capacity | 195 countries |
| data/indices.json | GHSI + INFORM + SPAR | 219 countries |
| data/borders.json | Static mapping | 148 countries |
| data/countries.json | WHO GHO + World Bank | 311 countries |
| data/diseases.json | Built from outbreaks | 29 diseases |
| data/regions.json | Built from outbreaks + countries | 6 WHO regions |

## What To Work On Next

### Wave 3: Smart Features
1. WHO regional RSS feeds (AFRO, EMRO) for more outbreak data
2. Composite risk scoring (outbreak pressure × vulnerability)
3. Loading skeletons for data fetching states
4. Open Graph meta tags for social sharing
5. Better empty states when no data available

### Deployment
1. Deploy to Vercel — connect GitHub repo, import project, click deploy
2. Manually trigger GitHub Actions workflows to verify
3. Test auto-refresh pipeline end-to-end
4. Performance audit with Lighthouse
