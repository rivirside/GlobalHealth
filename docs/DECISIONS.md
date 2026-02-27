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
- Data pipeline fetches from WHO GHO API, World Bank API, WHO DON RSS, ProMED RSS
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
