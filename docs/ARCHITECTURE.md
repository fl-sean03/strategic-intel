# Architecture

## System Overview

The platform is a three-layer system: sector-specific data pipelines feed into a unified data store, which powers an interactive map-first frontend.

```
┌─────────────────────────────────────────────────────────────────┐
│                       DATA SOURCES (by sector)                   │
│                                                                  │
│  Manufacturing:  FRED, Census ASM, BLS, USAspending, SBIR       │
│  Metals & Mining: USGS MCS, MSHA, UN Comtrade                   │
│  Energy:         EIA API, DOE, FERC                              │
│  Logistics:      AIS, MARAD, UNCTAD                              │
│  Telecom:        TeleGeography, UCS Satellite DB, FCC            │
│  Technology:     SBIR, USPTO, USAspending                        │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PIPELINE LAYER (Python)                       │
│                                                                  │
│  pipeline/                                                       │
│  ├── metals-mining/     # Migrated from Critical Chain v1        │
│  │   ├── ingestion/     # USGS download + parse                  │
│  │   ├── transform/     # Normalize, merge                       │
│  │   └── scoring/       # HHI, adversary dep, risk scores        │
│  │                                                               │
│  ├── manufacturing/     # NEW — flagship module                  │
│  │   ├── ingestion/     # FRED, Census, BLS, USAspending, SBIR  │
│  │   ├── transform/     # Normalize to common geo keys           │
│  │   └── scoring/       # Capacity health, concentration risk    │
│  │                                                               │
│  ├── energy/            # EIA API, DOE                           │
│  │   ├── ingestion/                                              │
│  │   ├── transform/                                              │
│  │   └── scoring/                                                │
│  │                                                               │
│  ├── logistics/         # AIS, MARAD, UNCTAD                    │
│  │   ├── ingestion/                                              │
│  │   ├── transform/                                              │
│  │   └── scoring/                                                │
│  │                                                               │
│  ├── shared/            # Common utilities                       │
│  │   ├── geo.py         # Country/state/county normalization     │
│  │   ├── cache.py       # Download caching (avoid re-fetching)   │
│  │   └── export.py      # JSON export for frontend               │
│  │                                                               │
│  ├── cross_sector/      # Dependency graph, disruption models    │
│  │   ├── dependencies.py                                         │
│  │   └── scenarios.py                                            │
│  │                                                               │
│  └── run.py             # Orchestrator: run all sector pipelines │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STATIC JSON DATA STORE                         │
│                                                                  │
│  data/                                                           │
│  ├── raw/                  # Cached API responses per sector     │
│  ├── processed/                                                  │
│  │   ├── metals-mining.json     # 60 minerals with risk scores  │
│  │   ├── manufacturing.json     # Sectors, facilities, contracts │
│  │   ├── energy.json            # Plants, grid, battery chain    │
│  │   ├── logistics.json         # Ports, lanes, fleet capacity   │
│  │   ├── cross-sector.json      # Dependency graph               │
│  │   └── stats.json             # Platform-wide aggregate stats  │
│  └── geo/                                                        │
│      ├── countries.json         # ISO country data + boundaries  │
│      ├── us-states.json         # State FIPS + boundaries        │
│      └── us-counties.json       # County FIPS (for granular)     │
│                                                                  │
│  All files < 50MB total. Entire dataset ships with the frontend. │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Next.js)                         │
│                                                                  │
│  Map Engine: MapLibre GL (base tiles) + deck.gl (data layers)    │
│  Tile source: Carto Positron (free, light theme, no API key)     │
│                                                                  │
│  Layout:                                                         │
│  ┌──────────────────────────────────────────────────────┐        │
│  │  [Industrials] [Energy] [Logistics] [Metals] [...]   │  ← Lens│
│  ├──────────┬───────────────────────────────────────────┤        │
│  │          │                                           │        │
│  │ Sidebar  │              MAP                          │        │
│  │ (ranked  │    (MapLibre + deck.gl overlays)          │        │
│  │  list,   │                                           │        │
│  │  filters,│                                           │        │
│  │  search) │                                           │        │
│  │          │                                           │        │
│  ├──────────┴───────────────────────────────────────────┤        │
│  │  Detail Panel (slides up on click)                    │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                  │
│  Pages:                                                          │
│  /                    Landing: hero stats + animated map          │
│  /explore             Main map view with lens switching           │
│  /sector/[id]         Sector deep dive (full-page analysis)      │
│  /mineral/[id]        Individual mineral (migrated from v1)      │
│  /facility/[id]       Manufacturing facility profile              │
│  /country/[id]        Country industrial profile                 │
│  /compare             Side-by-side country/sector comparison     │
│  /scenarios           Disruption scenario explorer               │
│  /about               Methodology, sources, limitations          │
│                                                                  │
│  Deployed to: Vercel (static export, free tier)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Design Decisions

### Why Static JSON Instead of a Database?
Same reasoning as Critical Chain v1, scaled up:
- Zero infrastructure cost (Vercel free tier handles static sites)
- Source data updates monthly at most (FRED, BLS) or annually (Census, USGS)
- Total dataset fits in <50MB JSON (easily cacheable by CDN)
- Anyone can fork, run pipelines, deploy their own instance
- No auth, no API keys for the frontend, no server to maintain

### Why MapLibre GL + deck.gl?
- **MapLibre GL** is the open-source fork of Mapbox GL. Free, no API key, no vendor lock-in.
- **deck.gl** adds high-performance data visualization layers (arcs for trade flows, hexbins for concentration, scatterplot for facilities). Used by WorldMonitor (37K stars), Kepler.gl (11.6K stars), and Uber's geospatial tools.
- **Carto Positron** tiles provide a clean light-theme basemap at no cost.
- This stack is proven at scale and used by the most successful OSINT dashboards.

### Why Lens-Based Navigation?
The six sectors map naturally to "lenses" — different views of the same geographic reality. A factory in Ohio shows up in the Manufacturing lens; the electricity powering it shows up in Energy; the cobalt in its products shows up in Metals & Mining. Same place, different layers of strategic reality.

This is more intuitive than separate pages per sector, and it enables the cross-sector insight that is the platform's unique value proposition.

### Why Python Pipeline + Next.js Frontend?
- Proven separation from Critical Chain v1
- Python has the best ecosystem for data APIs (requests, pandas, FRED bindings)
- Next.js has the best ecosystem for static sites with rich interactivity
- Clean separation: pipeline team and frontend team can work independently

### Why Light Theme?
- Target users are investment professionals, policy makers, and analysts — not SOC operators
- Light theme is easier to screenshot and embed in presentations and briefing decks
- Signals confidence and clarity, not anxiety and surveillance
- Bloomberg, McKinsey, CSIS, and the best policy tools all use light themes
- Risk colors (red/amber/blue/green) pop better against white than dark backgrounds

## Data Model

### Shared Geographic Keys
All sector data normalizes to common geographic identifiers:
- **Country:** ISO 3166-1 alpha-2 (US, CN, KR, JP, etc.)
- **State:** FIPS code (06 = California, 17 = Illinois, etc.)
- **County:** FIPS code (5-digit, for granular manufacturing data)
- **Coordinates:** Lat/lon for point data (facilities, mines, plants)

### Sector Data Schemas

Each sector pipeline outputs a JSON file conforming to a sector-specific schema. All schemas share a common envelope:

```json
{
  "sector": "manufacturing",
  "generated_at": "2026-03-14T00:00:00Z",
  "data_freshness": {
    "fred": "2026-02-01",
    "census_asm": "2024",
    "usaspending": "2026-03-13"
  },
  "summary": {
    "total_facilities": 12345,
    "total_employment": 12800000,
    "capacity_utilization": 77.3,
    "headline_stat": "U.S. shipbuilding output is 1/300th of China's"
  },
  "entities": [ ... ],
  "comparisons": { ... }
}
```

### Cross-Sector Dependency Graph

```json
{
  "dependencies": [
    {
      "from": { "sector": "manufacturing", "entity": "munitions" },
      "to": { "sector": "metals-mining", "entity": "tungsten" },
      "relationship": "requires",
      "criticality": "high",
      "note": "Tungsten heavy alloy for armor-piercing penetrators"
    },
    {
      "from": { "sector": "energy", "entity": "battery-storage" },
      "to": { "sector": "metals-mining", "entity": "lithium" },
      "relationship": "requires",
      "criticality": "critical"
    }
  ]
}
```

This graph powers the cross-sector drill-through: click on tungsten in the Metals & Mining lens and see which manufacturing sectors depend on it. Click on munitions in the Manufacturing lens and see which minerals it requires.
