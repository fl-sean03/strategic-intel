# Implementation Plan — Strategic Industrial Intelligence Platform v2

Generated: 2026-03-14

---

## API Validation Results

| Source | Status | Auth | Notes |
|--------|--------|------|-------|
| **FRED** | Needs key | Free registration | DEMO_KEY rejected; must register at research.stlouisfed.org |
| **Census CBP** | **Works** | None | County Business Patterns returns manufacturing employment by state. ASM timeseries endpoint 404'd — use CBP instead. |
| **BLS API v2** | **Works** | None (v1) | CES manufacturing employment (CES3000000001) returns monthly data. v2 key gives 500/day. |
| **USAspending** | **Works** | None | DoD contracts by geography. Scope must be `place_of_performance` not `place_of_performance_state`. |
| **SBIR** | **Down** | None | "Not available at this time" — under maintenance. Build client but use cached/fallback data. |
| **World Bank** | **Works** | None | Manufacturing value added by country (NV.IND.MANF.CD). |

### Design Decisions Based on Validation
- Use Census CBP (County Business Patterns) instead of ASM for manufacturing employment
- FRED requires a free API key — store in `.env`, document in README
- SBIR client should gracefully degrade when API is unavailable
- BLS v1 (no key) works for initial development; register v2 key for production

---

## Directory Structure

```
v2/
├── AGENT.md
├── CLAUDE.md
├── README.md
├── IMPLEMENTATION_PLAN.md
├── .env.example                    # API keys template
├── .env                            # Local API keys (gitignored)
├── .gitignore
│
├── docs/                           # Design docs (existing)
│
├── pipeline/                       # Python data pipeline
│   ├── requirements.txt
│   ├── run.py                      # Orchestrator: run all sector pipelines
│   ├── shared/
│   │   ├── __init__.py
│   │   ├── geo.py                  # Country/state/county FIPS/ISO normalization
│   │   ├── cache.py                # HTTP response caching
│   │   └── export.py               # JSON export + validation
│   │
│   ├── metals_mining/              # Migrated from critical-chain v1
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── ingestion/
│   │   │   ├── __init__.py
│   │   │   └── usgs.py
│   │   ├── transform/
│   │   │   ├── __init__.py
│   │   │   └── normalize.py
│   │   └── scoring/
│   │       ├── __init__.py
│   │       └── concentration.py
│   │
│   ├── manufacturing/              # NEW — priority module
│   │   ├── __init__.py
│   │   ├── config.py               # NAICS codes, series IDs, weights
│   │   ├── ingestion/
│   │   │   ├── __init__.py
│   │   │   ├── fred.py             # FRED API client
│   │   │   ├── bls.py              # BLS API client
│   │   │   ├── census.py           # Census CBP client
│   │   │   ├── usaspending.py      # USAspending API client
│   │   │   ├── worldbank.py        # World Bank API client
│   │   │   └── sbir.py             # SBIR API client (graceful degradation)
│   │   ├── transform/
│   │   │   ├── __init__.py
│   │   │   └── normalize.py        # Normalize to FIPS/ISO geo keys
│   │   └── scoring/
│   │       ├── __init__.py
│   │       └── health.py           # Manufacturing health + defense concentration scores
│   │
│   └── cross_sector/
│       ├── __init__.py
│       ├── dependencies.py         # Cross-sector dependency graph
│       └── scenarios.py            # Disruption scenario modeling
│
├── data/
│   ├── raw/                        # Cached API responses
│   ├── processed/
│   │   ├── metals-mining.json
│   │   ├── manufacturing.json
│   │   ├── cross-sector.json
│   │   └── stats.json
│   └── geo/
│       ├── us-states.json          # State FIPS + boundaries
│       └── countries.json          # ISO country data
│
├── tests/
│   ├── conftest.py
│   ├── test_metals_mining_scoring.py
│   ├── test_metals_mining_pipeline.py
│   ├── test_manufacturing_scoring.py
│   ├── test_manufacturing_pipeline.py
│   ├── test_shared_geo.py
│   └── test_cross_sector.py
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.js
    ├── postcss.config.js
    ├── public/
    │   └── data/                    # Static JSON from pipeline
    │       ├── metals-mining.json
    │       ├── manufacturing.json
    │       ├── cross-sector.json
    │       └── stats.json
    ├── app/
    │   ├── layout.tsx               # Root layout, nav, light theme
    │   ├── globals.css              # Tailwind + design system
    │   ├── page.tsx                 # Landing page (/)
    │   ├── explore/
    │   │   └── page.tsx             # Map + lens switching (/explore)
    │   ├── sector/
    │   │   └── [id]/page.tsx        # Sector deep dive
    │   ├── mineral/
    │   │   └── [id]/page.tsx        # Mineral detail (migrated)
    │   ├── compare/
    │   │   └── page.tsx             # Side-by-side comparison
    │   └── about/
    │       └── page.tsx             # Methodology + sources
    ├── components/
    │   ├── Map/
    │   │   ├── MapView.tsx          # MapLibre GL wrapper
    │   │   ├── DeckOverlay.tsx      # deck.gl layer manager
    │   │   └── LensSelector.tsx     # Lens tab bar
    │   ├── Sidebar/
    │   │   ├── Sidebar.tsx          # Ranked entity list
    │   │   └── SearchBar.tsx
    │   ├── DetailPanel/
    │   │   └── DetailPanel.tsx      # Bottom slide-up panel
    │   ├── ui/
    │   │   ├── RiskGauge.tsx        # Migrated from v1
    │   │   ├── RiskBadge.tsx
    │   │   ├── StatCard.tsx
    │   │   └── ProductionGauge.tsx  # For munitions dashboard
    │   └── charts/
    │       ├── ComparisonBar.tsx    # Country comparison bars
    │       └── CapacityGauge.tsx    # Capacity utilization gauge
    └── lib/
        ├── types.ts                 # All TypeScript types
        ├── data.ts                  # Data loading helpers
        ├── colors.ts                # Risk color system
        └── constants.ts             # Lens definitions, nav items
```

---

## Build Order

### Phase 1: Foundation (Tasks 1-3)
1. Scaffold Next.js + Python pipeline directories
2. Install dependencies (MapLibre, deck.gl, Tailwind, etc.)
3. Build map shell with lens tabs and Carto Positron tiles
4. Set up light theme design system

### Phase 2: First Lens (Tasks 4-5)
5. Migrate v1 pipeline into `pipeline/metals_mining/`
6. Build shared geo utilities
7. Render minerals on map (country choropleth + sidebar)
8. Write pipeline and scoring tests

### Phase 3: Manufacturing (Tasks 6-7)
9. Build API clients (FRED, BLS, Census, USAspending, World Bank)
10. Build manufacturing transform + scoring
11. Build manufacturing lens on map
12. Build shipbuilding comparison + munitions dashboard
13. Write manufacturing tests

### Phase 4: Polish (Tasks 8-9)
14. Landing page with hero stats
15. About/methodology page
16. Full test suite pass
17. Static export + build validation

---

## Dependencies

### Python
```
requests>=2.31
pandas>=2.1
python-dotenv>=1.0
pytest>=8.0
```

### Node.js
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "maplibre-gl": "^4.0.0",
    "@deck.gl/core": "^9.0.0",
    "@deck.gl/layers": "^9.0.0",
    "@deck.gl/mapbox": "^9.0.0",
    "@deck.gl/geo-layers": "^9.0.0",
    "d3": "^7.9.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/d3": "^7"
  }
}
```

---

## Key Design Decisions

1. **MapLibre GL, not Mapbox GL** — v1 used mapbox-gl. v2 uses maplibre-gl (free, no API key).
2. **Carto Positron tiles** — `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`
3. **Light theme only** — white backgrounds, navy accent (#1E3A5F), risk colors pop on white.
4. **Static JSON in `/public/data/`** — loaded client-side, no API calls at runtime.
5. **Census CBP over ASM** — ASM timeseries endpoint is broken, CBP provides comparable manufacturing employment data.
6. **SBIR graceful degradation** — API under maintenance; build client with cached fallback.
7. **deck.gl for data layers** — ScatterplotLayer (facilities), ArcLayer (trade flows), GeoJsonLayer (choropleth).
