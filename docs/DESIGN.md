# Design System

> **Read this file in full when touching UI components, styling, or layout.**

## Visual Design Principles

1. **Clean and professional** — This is a public health tool, not a consumer app. No playful gradients or decorative elements.
2. **Data-dense but readable** — Show lots of information without feeling overwhelming. Use whitespace and hierarchy.
3. **Color communicates meaning** — Colors indicate severity, disease category, or capacity status. Never decorative.
4. **Accessible** — WCAG AA minimum. High contrast text, screen-reader-friendly map interactions.

## Color Palette

### Disease Categories (map markers)
- Respiratory (COVID, influenza, MERS): `#3B82F6` (blue)
- Vector-borne (dengue, malaria, Zika): `#F59E0B` (amber)
- Diarrheal (cholera, typhoid): `#10B981` (emerald)
- Hemorrhagic (Ebola, Marburg, Lassa): `#EF4444` (red)
- Vaccine-preventable (measles, polio): `#8B5CF6` (purple)
- Zoonotic (avian flu, plague, mpox): `#F97316` (orange)
- Other: `#6B7280` (gray)

### Capacity Status (sidebar indicators)
- Meets WHO benchmark: `#10B981` (green)
- Below benchmark: `#F59E0B` (amber)
- Far below benchmark: `#EF4444` (red)
- No data: `#D1D5DB` (light gray)

### UI Colors
- Background: `#FFFFFF` (white)
- Surface/cards: `#F9FAFB` (gray-50)
- Borders: `#E5E7EB` (gray-200)
- Primary text: `#111827` (gray-900)
- Secondary text: `#6B7280` (gray-500)
- Accent/links: `#2563EB` (blue-600)

## Typography
- Font family: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) via Tailwind's `font-sans`
- Headings: `font-semibold`
- Body: `font-normal`
- Data values: `font-mono` for numbers

## Layout Breakpoints
- Mobile: `< 768px` — map full-width, sidebar as bottom sheet
- Tablet: `768px - 1024px` — map with collapsible sidebar
- Desktop: `> 1024px` — map + persistent sidebar

## Map Style
- Tile provider: OpenStreetMap (free) or CartoDB Positron (cleaner, free)
- Default zoom: World view (zoom level 2)
- Marker style: Circles with category color, sized by case count (or uniform if no count)
- Cluster markers when zoomed out (Leaflet MarkerCluster plugin if needed)

## Sidebar Layout

```
┌─────────────────────────┐
│ ✕ Close                 │
├─────────────────────────┤
│ OUTBREAK DETAILS        │
│                         │
│ Disease Name            │
│ Country · Region        │
│ Reported: Jan 15, 2026  │
│                         │
│ Cases: 1,234            │
│ Deaths: 56              │
│                         │
│ [WHO DON →]             │
├─────────────────────────┤
│ HEALTH SYSTEM CAPACITY  │
│                         │
│ Hospital Beds    ████░░ │
│ 1.2/10k (WHO: 3.0)     │
│                         │
│ Physicians       ██░░░░ │
│ 0.3/1k (WHO: 1.0)      │
│                         │
│ UHC Index        ███░░░ │
│ 42/100                  │
│                         │
│ DTP3 Coverage    ████░░ │
│ 67%                     │
│                         │
│ Health Spending   █░░░░ │
│ $23/capita              │
│                         │
│ [View Full Profile →]   │
├─────────────────────────┤
│ PAST OUTBREAKS          │
│ · Cholera (2023)        │
│ · Measles (2022)        │
│ · Ebola (2019)          │
└─────────────────────────┘
```

## Component Patterns
- Cards: `rounded-lg border border-gray-200 bg-white shadow-sm`
- Buttons: `rounded-md px-4 py-2 text-sm font-medium`
- Section headers: `text-xs font-semibold uppercase tracking-wider text-gray-500`
- Data labels: `text-sm text-gray-500`
- Data values: `text-lg font-semibold text-gray-900 font-mono`

## Readiness Score Badge
- Component: `ReadinessScoreBadge.tsx`
- SVG circular ring gauge (0-100)
- Colors: green (`#10B981`) for 75+, amber (`#F59E0B`) for 40-74, red (`#EF4444`) for <40
- Two sizes: `lg` (96px, used on country profile) and `sm` (64px, used in sidebar/neighbors)
- Labels: "Strong", "Moderate", "Limited" based on score range

## Preparedness Radar
- Component: `PreparednessRadar.tsx`
- **GHSI**: Recharts RadarChart with 6 category axes (Prevention, Detection, Response, Health, Norms, Risk)
- **INFORM**: Recharts RadarChart with 3 dimension axes (Hazard, Vulnerability, Coping Capacity). Note: INFORM uses inverted scale (higher = more risk)
- **SPAR**: Horizontal progress bars for 15 IHR capacity areas
- Bar colors: green for 60+, amber for 40-59, red for <40

## Comparison Charts
- Component: `ComparisonChart.tsx`
- Up to 3 countries, color-coded: blue (`#3B82F6`), red (`#EF4444`), green (`#10B981`)
- Horizontal grouped BarChart for capacity indicators
- Vertical grouped BarChart for GHSI/SPAR indices
- Overview cards with readiness badges per country

## Timeline Chart
- Component: `OutbreakTimeline.tsx`
- Recharts AreaChart with monthly outbreak counts
- Two views: "Total" (single blue area) and "By Category" (stacked areas using disease category colors)
- Country filter dropdown
- Stats grid: Total Reports, Countries, Diseases, Date Range

## Print Styles
- `@media print` rules in `globals.css`
- Hides header, nav, footer, and `.print:hidden` elements
- A4 page size with 1.5cm margins
- `break-inside: avoid` on cards and charts
- `print-color-adjust: exact` for color preservation
- PrintButton component calls `window.print()`, hides itself when printing
