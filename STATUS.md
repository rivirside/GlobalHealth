# Project Status

> **Read this file in full at the start of every conversation.**

## Current Phase
Phase 4: Polish & Deployment

## What's Done
- [x] Project idea research and competitive analysis (17 tools analyzed)
- [x] Repo initialized with README, CLAUDE.md, .gitignore
- [x] Next.js 15 + TypeScript + Tailwind CSS setup
- [x] Leaflet, React-Leaflet, Recharts installed
- [x] Python data pipeline: fetch_outbreaks.py (WHO DON API), fetch_capacity.py (WHO GHO + World Bank)
- [x] Initial data fetch: 74 outbreaks across 33 countries, 268 countries with 9 capacity indicators
- [x] TypeScript types and data models
- [x] API routes: /api/outbreaks, /api/capacity/[iso3], /api/countries
- [x] Interactive Leaflet map with color-coded outbreak markers
- [x] Sidebar with outbreak details + health system capacity bars
- [x] Filter controls (disease category, date range, active only)
- [x] Country profile pages (/country/[iso3]) with capacity indicators, context data, outbreak history
- [x] About/methodology page with data sources, benchmarks, limitations, citation guide
- [x] Production build passes with zero errors

## Current Blockers
None

## Key Decisions Made
- **Tech stack**: Next.js 15 + Leaflet + Recharts + Tailwind
- **Data strategy**: Python pipeline → JSON files → Next.js reads at runtime (no database)
- **Map**: Leaflet with CartoDB Positron tiles (free, no API key)
- **WHO DON API**: OData endpoint at `who.int/api/emergencies/diseaseoutbreaknews` (old RSS feed deprecated)
- **Hosting**: Vercel free tier
- **Data refresh**: GitHub Actions cron (outbreaks every 12h, capacity quarterly)

## What To Work On Next
- Responsive design improvements (mobile viewport)
- Disease category legend on the map
- Map tooltip on marker hover
- Deploy to Vercel
- Set up GitHub Actions for automated data refresh
