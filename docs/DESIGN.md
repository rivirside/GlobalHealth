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
│ [WHO DON →] [ProMED →]  │
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
