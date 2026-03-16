# Strategic Industrial Intelligence Platform — Developer Context

## What This Is

An open-source, map-first intelligence dashboard for U.S. industrial base health, supply chain dependencies, and strategic capacity. Think "Bloomberg Terminal meets CIA World Factbook" for the defense industrial base — but public, open-source, and built on free government data.

The interactive world map is the centerpiece. Users switch between sector "lenses" (Manufacturing, Energy, Logistics, Metals & Mining) and the map transforms to show that sector's data. The unique value is cross-sector connection mapping: click on a mineral and see which manufacturing sectors depend on it. Click on munitions and see which minerals they require.

## Origin

Started as **Critical Chain** — a critical minerals supply chain dashboard scoring 60 minerals for concentration risk (see `../critical-chain/`). Evolved to cover all six national security sectors with cross-sector intelligence.

Full origin story: `README.md`

## Project Status

**Phase: Pre-implementation. All documentation and design complete. No code written yet.**

The `../critical-chain/` directory contains the working v1 MVP:
- Python pipeline (USGS → parse → score → export)
- 60 minerals with risk scores
- 23 tests passing
- Next.js frontend (67 static pages)
- Ready for Vercel deployment

V2 needs to:
1. Scaffold a new Next.js + MapLibre + deck.gl frontend
2. Migrate v1's pipeline into `pipeline/metals-mining/`
3. Build the Manufacturing module (pipeline + frontend) as the priority new feature
4. Build Energy and Logistics modules
5. Build cross-sector dependency graph
6. Ship

## Read These First

| File | What It Covers |
|------|---------------|
| `README.md` | Full origin story, who this is for, design philosophy, project structure |
| `docs/PLAN.md` | Phased build plan with week-by-week deliverables |
| `docs/ARCHITECTURE.md` | System design: pipeline → data store → frontend, data model, design decisions |
| `docs/UX_DESIGN.md` | Complete UX specification: pages, layouts, interactions, responsive design |
| `docs/MANUFACTURING.md` | Manufacturing module deep dive: submodules, data sources, APIs, scoring |
| `docs/TELECOM.md` | Telecom & Space module: submarine cables, satellites, spectrum, launch infra |
| `docs/TECHNOLOGY.md` | Technology & R&D module: SBIR, patents, ASPI tracker, U.S.-China competition |
| `docs/DATA_SOURCES.md` | Every data source across all sectors with endpoints, auth, formats |
| `docs/LANDSCAPE.md` | Competitive landscape: what exists, what doesn't, where we fit |
| `docs/METHODOLOGY.md` | Scoring formulas for all sectors, disruption modeling, confidence levels |

## Key Design Decisions

- **Light theme** — forward-facing decision tool, not dark-mode threat monitor. Carto Positron tiles.
- **MapLibre GL + deck.gl** — free, no vendor lock-in. Proven at scale (WorldMonitor 37K stars uses same stack).
- **Static JSON** — no database, no backend server. Pipeline exports JSON, Next.js static-exports HTML. Deploy to Vercel free tier.
- **Lens-based navigation** — same map, different overlays per sector. Enables cross-sector drill-through.
- **Python pipeline + Next.js frontend** — proven separation from v1. Pipeline team and frontend team work independently.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Map:** MapLibre GL JS + deck.gl + Carto Positron tiles (all free)
- **Charts:** D3.js or Recharts
- **Pipeline:** Python 3.12+, pandas, requests
- **Testing:** pytest (pipeline), vitest or jest (frontend)
- **Hosting:** Vercel (static export)
- **Data:** All public/free government APIs (see DATA_SOURCES.md)

## Priority Order

1. **Foundation + Migration** — scaffold, set up map, migrate v1 Metals & Mining as first lens
2. **Manufacturing & Industrial Capacity** — the flagship new module, highest novelty
3. **Energy** — EIA API is excellent, fast to integrate
4. **Global Logistics** — shipping lanes, ports, the shipbuilding comparison
5. **Cross-sector** — dependency graph, disruption scenarios
6. **Polish + Launch** — landing page, blog post, open-source release

## What Already Works (in ../critical-chain/)

```bash
# Python pipeline
cd ../critical-chain
source .venv/bin/activate
python pipeline/run.py              # Full pipeline
python -m pytest tests/ -v          # 23 tests

# Frontend
cd frontend
npm run dev       # localhost:3000
npm run build     # Static export to out/
```

Key files to understand the v1 codebase:
- `pipeline/config.py` — all minerals, URLs, HS codes, weights, mappings
- `pipeline/scoring/concentration.py` — HHI, adversary dep, risk scoring
- `pipeline/run.py` — orchestrator
- `frontend/lib/data.ts` — TypeScript types + data helpers

## License

MIT
