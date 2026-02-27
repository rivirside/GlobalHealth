# Roadmap

> **Do NOT read this file in full. GREP for specific topics as needed.**

## Phase 1: Foundation (Current)
### 1.1 Project Setup
- [x] Initialize repo with README, CLAUDE.md, .gitignore
- [x] Install Next.js 15 + TypeScript + Tailwind
- [x] Install Leaflet, React-Leaflet, Recharts
- [x] Create directory structure
- [ ] Create TypeScript type definitions
- [ ] Set up global CSS with Tailwind

### 1.2 Data Pipeline
- [ ] Write fetch_outbreaks.py (WHO DON RSS + ProMED RSS parser)
- [ ] Write fetch_capacity.py (WHO GHO API + World Bank API)
- [ ] Write fetch_indices.py (GHSI CSV + INFORM CSV + SPAR CSV)
- [ ] Write normalize.py (country name → ISO3 mapping)
- [ ] Create requirements.txt for Python dependencies
- [ ] Run initial data fetch
- [ ] Verify data quality (spot-check 10 countries)
- [ ] Commit initial data/*.json files

### 1.3 Core App Shell
- [ ] Create root layout with header/footer
- [ ] Set up global styles (Tailwind config, CSS reset)
- [ ] Create home page placeholder
- [ ] Verify dev server runs cleanly

## Phase 2: Core Features
### 2.1 Interactive Map
- [ ] Leaflet map component with dynamic import (no SSR)
- [ ] Load outbreak data and place markers
- [ ] Color markers by disease category
- [ ] Click marker → select outbreak
- [ ] Zoom controls and default world view
- [ ] Tile layer (CartoDB Positron for clean look)

### 2.2 Outbreak Sidebar
- [ ] Sidebar component (slides in from right on desktop, bottom sheet on mobile)
- [ ] Outbreak details section (disease, country, cases, deaths, dates)
- [ ] Source links (WHO DON, ProMED)
- [ ] Capacity indicators section (horizontal bar charts)
- [ ] WHO benchmark comparison coloring (green/amber/red)
- [ ] Historical outbreaks list for that country
- [ ] "View Full Profile" link to country page

### 2.3 Filter Controls
- [ ] Disease type dropdown (respiratory, vector-borne, etc.)
- [ ] Date range selector (last 30 days, 90 days, 1 year, all)
- [ ] Region filter (WHO regions or continents)
- [ ] Active-only toggle
- [ ] Stats bar showing filtered count ("47 outbreaks across 32 countries")

## Phase 3: Country Profiles
### 3.1 Country Profile Page
- [ ] Dynamic route /country/[iso3]
- [ ] Country header (name, flag, region, income group)
- [ ] Capacity indicator grid (all indicators with values + benchmarks)
- [ ] Time trend charts for key indicators (Recharts line charts)
- [ ] Comparison to regional average and income-group peers
- [ ] Preparedness radar chart (GHSI/INFORM dimensions)

### 3.2 Historical Outbreak Timeline
- [ ] Chronological list of all past WHO DON reports for the country
- [ ] Filterable by disease type
- [ ] Links to original WHO DON reports

## Phase 4: Polish & Deploy
### 4.1 About/Methodology Page
- [ ] Data sources table with links and update frequencies
- [ ] Methodology explanation (how data is collected, normalized, displayed)
- [ ] Limitations section (data lag, reporting delays, coverage gaps)
- [ ] How to cite
- [ ] Contact/feedback mechanism

### 4.2 Responsive Design
- [ ] Mobile layout: full-width map, bottom sheet sidebar
- [ ] Tablet layout: collapsible sidebar
- [ ] Desktop layout: persistent sidebar
- [ ] Touch-friendly map interactions

### 4.3 Deployment
- [ ] Deploy to Vercel
- [ ] Set up GitHub Actions for data refresh cron
- [ ] Test auto-refresh pipeline
- [ ] Add Open Graph meta tags for social sharing
- [ ] Performance audit (Lighthouse)

## Phase 5: Enhancements (Post-MVP)
### 5.1 Data Enrichment
- [ ] Add WHO AFRO outbreak alerts (regional feed)
- [ ] Add WAHIS animal health alerts (One Health angle)
- [ ] Subnational data where available
- [ ] Historical capacity time series (show trends)

### 5.2 Analytics Features
- [ ] Capacity gap analysis ("this country needs X more physicians")
- [ ] Outbreak frequency analysis (which countries have recurring outbreaks)
- [ ] Regional comparison views
- [ ] Export/download data as CSV

### 5.3 User Features
- [ ] Email alerts for outbreaks in selected countries
- [ ] Bookmarkable filters (URL-based state)
- [ ] Embeddable widget for other websites
- [ ] Print-friendly country profiles

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

### WHO DON RSS
- URL: `https://www.who.int/feeds/entity/don/en/rss.xml`
- Format: RSS 2.0 XML
- Fields: title, link, description, pubDate, category
- Parse disease name and country from title (format: "Disease – Country")

### ProMED RSS
- URL: `https://promedmail.org/promed-posts/` (check for RSS endpoint)
- Alternative: scrape recent posts list
- Fields: title, link, description, pubDate

### Static CSV Sources
- GHSI: `https://ghsindex.org/` → download data model Excel
- INFORM: `https://drmkc.jrc.ec.europa.eu/inform-index/Portals/0/InfoRM/Scores/INFORM_2024.xlsx`
- SPAR/IHR: `https://extranet.who.int/e-spar/` → export data
- Fragile States Index: `https://fragilestatesindex.org/excel/`
