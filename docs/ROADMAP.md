# Roadmap

> **Do NOT read this file in full. GREP for specific topics as needed.**

## Phase 1: Foundation ✅
### 1.1 Project Setup
- [x] Initialize repo with README, CLAUDE.md, .gitignore
- [x] Install Next.js 15 + TypeScript + Tailwind
- [x] Install Leaflet, React-Leaflet, Recharts
- [x] Create directory structure
- [x] Create TypeScript type definitions
- [x] Set up global CSS with Tailwind

### 1.2 Data Pipeline
- [x] Write fetch_outbreaks.py (WHO DON OData API)
- [x] Write fetch_capacity.py (WHO GHO API + World Bank API)
- [x] Write fetch_indices.py (GHSI CSV + INFORM Excel + SPAR via WHO GHO)
- [x] Write compute_readiness.py (derived composite score)
- [x] Create requirements.txt for Python dependencies
- [x] Run initial data fetch (74 outbreaks, 268 countries, 219 index countries)
- [x] Verify data quality
- [x] Commit initial data/*.json files

### 1.3 Core App Shell
- [x] Create root layout with header/navigation
- [x] Set up global styles (Tailwind config, CSS)
- [x] Create home page with interactive map
- [x] Verify dev server runs cleanly

## Phase 2: Core Features ✅
### 2.1 Interactive Map
- [x] Leaflet map component with dynamic import (no SSR)
- [x] Load outbreak data and place markers
- [x] Color markers by disease category
- [x] Click marker → select outbreak
- [x] Zoom controls and default world view
- [x] Tile layer (CartoDB Positron)
- [x] Tooltips on marker hover
- [x] Disease category legend (collapsible)

### 2.2 Outbreak Sidebar
- [x] Sidebar component (persistent desktop, overlay tablet, bottom sheet mobile)
- [x] Outbreak details section (disease, country, cases, deaths, dates)
- [x] Source links (WHO DON)
- [x] Capacity indicators section (horizontal bar charts with WHO benchmarks)
- [x] Readiness score badge (SVG ring, color-coded)
- [x] Index summary (GHSI/INFORM/SPAR one-line)
- [x] Historical outbreaks list for that country
- [x] "View Full Profile" link to country page

### 2.3 Filter Controls
- [x] Disease type dropdown (7 categories)
- [x] Date range selector (last 30 days, 90 days, 1 year, all)
- [x] Active-only toggle
- [x] Stats bar showing filtered count

## Phase 3: Country Profiles ✅
### 3.1 Country Profile Page
- [x] Dynamic route /country/[iso3]
- [x] Country header (name, ISO3, readiness badge, print button)
- [x] Capacity indicator cards (6 indicators with values + benchmarks)
- [x] Country context (GDP, population, health expenditure % GDP)
- [x] Preparedness radar chart (GHSI/INFORM radar + SPAR bars)
- [x] Outbreak history list
- [x] Neighboring countries (readiness scores + active outbreak counts)

## Phase 4: Polish & Deploy ✅
### 4.1 About/Methodology Page
- [x] Data sources table with links and update frequencies
- [x] Methodology explanation
- [x] Limitations section
- [x] How to cite
- [x] Benchmarks reference table

### 4.2 Responsive Design
- [x] Mobile layout: full-width map, bottom sheet sidebar, hamburger nav
- [x] Tablet layout: overlay sidebar
- [x] Desktop layout: persistent sidebar
- [x] Stacked filters on small screens

### 4.3 Deployment Prep
- [x] Vercel config (vercel.json with API caching headers)
- [x] GitHub Actions: outbreak refresh every 12h
- [x] GitHub Actions: capacity refresh quarterly
- [x] Production build passes with zero errors

## Phase 5: Analytical Depth ✅
### 5.1 Composite Readiness Score
- [x] Weighted composite of 6 capacity indicators (0-100 scale)
- [x] Pipeline: `compute_readiness.py` → `data/readiness.json` (195 countries)
- [x] ReadinessScoreBadge component (SVG ring, green/amber/red, lg/sm sizes)
- [x] Displayed on country profile and sidebar

### 5.2 GHSI / INFORM / SPAR Index Integration
- [x] Pipeline: `fetch_indices.py` → `data/indices.json` (219 countries)
- [x] GHSI: CSV from ghsindex.org (2021, 163 countries, 6 categories)
- [x] INFORM: Excel from drmkc.jrc.ec.europa.eu (2025, 191 countries, inverted scale)
- [x] SPAR: WHO GHO API, IHRSPAR2 2nd edition (218 countries, 15 capacities)
- [x] PreparednessRadar component (radar charts + horizontal bars)
- [x] Index summary in sidebar

### 5.3 Historical Outbreak Timeline
- [x] Outbreak pipeline append mode with deduplication
- [x] Timeline page (/timeline) with Recharts area chart
- [x] Total and by-category views with country filter
- [x] Stats grid (total, countries, diseases, date range)

### 5.4 Neighboring Country Context
- [x] `data/borders.json` (148 countries, bidirectional)
- [x] Neighboring Countries section on country profile
- [x] Readiness scores + active outbreak badges per neighbor
- [x] Clickable links to neighbor profiles

### 5.5 Country Comparison Mode
- [x] Compare page (/compare) with 2-3 country selectors
- [x] Grouped bar charts for capacity indicators
- [x] Index score comparison (GHSI/SPAR)
- [x] Overview cards with readiness badges

### 5.6 Exportable Country Briefs
- [x] Print button on country profile
- [x] `@media print` CSS for clean A4 layout
- [x] Browser print-to-PDF (zero dependencies)

## Phase 6: Deployment & Polish (Next)
### 6.1 Deploy
- [ ] Deploy to Vercel (connect GitHub repo)
- [ ] Manually trigger GitHub Actions workflows to verify
- [ ] Test auto-refresh pipeline end-to-end
- [ ] Performance audit (Lighthouse)

### 6.2 Optional Enhancements
- [ ] Marker clustering for zoomed-out views (leaflet.markercluster)
- [ ] Region filter implementation
- [ ] Choropleth map layer by readiness score
- [ ] Bookmarkable filters (URL-based state)
- [ ] Open Graph meta tags for social sharing

## Data Source API Reference

### WHO GHO API
- Base URL: `https://ghoapi.azureedge.net/api/`
- No authentication required
- Pagination: `$top=1000&$skip=0`
- Filter by country: `$filter=SpatialDim eq 'USA'`
- Key indicator codes:
  - `WHOSIS_000001` — Life expectancy at birth
  - `WHOSIS_000005` — Hospital beds per 10,000
  - `HWF_0001` — Physicians per 10,000
  - `HWF_0002` — Nurses and midwives per 10,000
  - `UHC_INDEX_REPORTED` — UHC service coverage index
  - `WHS4_100` — DTP3 immunization coverage
  - `MDG_0000000001` — Under-5 mortality rate
  - `WHOSIS_000015` — Maternal mortality ratio
  - `WHS6_102` — Total health expenditure % GDP

### World Bank API
- Base URL: `https://api.worldbank.org/v2/`
- No authentication required
- Format: append `?format=json&per_page=500`
- Key indicator codes:
  - `SH.XPD.CHEX.PC.CD` — Health expenditure per capita (current US$)
  - `SH.XPD.CHEX.GD.ZS` — Health expenditure % of GDP
  - `SH.XPD.OOPC.CH.ZS` — Out-of-pocket % of health expenditure
  - `NY.GDP.PCAP.CD` — GDP per capita
  - `SP.POP.TOTL` — Total population

### WHO DON API (OData)
- URL: `https://www.who.int/api/emergencies/diseaseoutbreaknews`
- Format: OData JSON (old RSS feed is deprecated)
- Key fields: Id, DatePublished, DonId, Summary, Country, DiseaseId
- Note: Use `requests.PreparedRequest` to avoid URL double-encoding of OData `$filter` params

### GHSI (Global Health Security Index)
- URL: `https://www.ghsindex.org/wp-content/uploads/2022/04/2021-GHS-Index-April-2022.csv`
- Format: CSV with country rows and indicator columns
- Key columns: "Country", "OVERALL SCORE", plus 6 category scores
- Data: 2021 edition, 163 countries

### INFORM Risk Index
- URL: `https://drmkc.jrc.ec.europa.eu/inform-index/Portals/0/InfoRM/2025/INFORM_Risk_Mid_2025_v071.xlsx`
- Format: Excel (.xlsx), requires openpyxl
- Key columns: Iso3, INFORM RISK, HAZARD & EXPOSURE, VULNERABILITY, LACK OF COPING CAPACITY
- Data: 2025 mid-year, 191 countries
- **Inverted scale**: Higher INFORM = more risk (opposite of GHSI/SPAR)

### SPAR (State Party Annual Report)
- Source: WHO GHO API using IHRSPAR2 2nd edition indicator codes
- Codes: `IHRSPAR2_C01` through `IHRSPAR2_C15` (15 capacities)
- Includes: Legislation, IHR Coordination, Zoonotic Events, Food Safety, Laboratory, Surveillance, Human Resources, Health Emergency Management, Health Service Provision, Risk Communication, Points of Entry, Chemical Events, Radiation, Climate Change, Communities
- Data: 218 countries, latest available year per country
