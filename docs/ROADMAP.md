# Strategic Industrial Intelligence — Roadmap

**Last updated:** 2026-03-16
**Live:** https://strategic-intel-flax.vercel.app

---

## What's Shipped (v1.0)

Two fully functional sector lenses with cross-sector intelligence, facility-level data, and production-quality polish.

### Data
| Dataset | Count | Source |
|---------|-------|--------|
| Critical minerals | 60 | USGS MCS 2025 |
| Manufacturing sectors | 8 NAICS codes | BLS, FRED, Census, USAspending, World Bank |
| U.S. mine facilities | 627 | MSHA |
| Shipyards | 14 | CRS, company data |
| Government investments | 18 | DOE LPO, CHIPS, DPA, IRA |
| Defense programs | 10 | CRS/GAO reports |
| Cross-sector dependencies | 32 (13 critical) | Curated |
| Pipeline tests | 126 passing | pytest |

### Features
- Globe map with country choropleth (mineral production dominance)
- deck.gl layers: facility markers, shipyard markers, investment markers, trade flow arcs, US state defense contract choropleth
- Multi-tab detail panel: Overview, Supply Chain, Facilities, Investments, Defense, Intel (placeholder)
- Mineral → Sector cross-navigation (dependent sector badges)
- Country click → mineral producers detail
- Cross-entity search (minerals, facilities, investments, programs, sectors)
- Layer toggle controls, dynamic legend
- Zoom-based marker scaling
- Source URLs on all data (USGS, DOE, CRS, NIST, MSHA, BLS, FRED links)
- URL deep linking (#metals-mining/gallium, browser back/forward)
- Keyboard shortcuts (Esc, /, 1, 2)
- Energy/Logistics lens placeholders ("Coming Soon")
- Welcome overlay (top 3 risk minerals)
- Error boundaries, loading skeletons
- Expandable detail panel (40vh/70vh toggle)
- PNG chart export (html-to-image)
- Lazy data loading (lens-driven fetch with background preload)

### Design
- Self-hosted Inter font (next/font)
- SVG favicon + OpenGraph meta tags
- Minimum 11px text, WCAG-aware contrast
- prefers-reduced-motion support
- SVG icons (no emojis)
- ARIA roles, skip-to-content link
- Mobile responsive (bottom sheet sidebar, full-width panel)
- Polar rendering artifact fix (two-source strategy)

---

## What's Next (Prioritized)

### Phase 2: Manufacturing Deep Dive
Expand the existing Manufacturing lens with richer visualizations.

- [ ] Shipbuilding comparison panel (U.S. vs China bars, yard capacity, order book)
- [ ] Munitions production dashboard (current rate vs target gauges for 155mm, Javelin, GMLRS, PAC-3)
- [ ] International manufacturing comparison chart (U.S. vs top 6 countries)
- [ ] Reshoring / new capacity map layer (investments sized by amount, construction status)

### Phase 3: Energy Lens
EIA API is excellent and well-documented. Fastest new sector to build.

- [ ] EIA API v2 pipeline (power plants, generation by fuel type, capacity)
- [ ] Power plant markers on map (colored by fuel: nuclear, gas, coal, solar, wind)
- [ ] Grid capacity utilization by region
- [ ] Battery supply chain mapping (lithium → cell → pack → deployment)
- [ ] Cross-links to Metals & Mining (battery minerals)

### Phase 4: Logistics Lens
Shipping lanes, ports, maritime capacity.

- [ ] MARAD merchant marine fleet data
- [ ] Port throughput rankings (U.S. vs global)
- [ ] Shipping lane visualization (major trade routes)
- [ ] Chokepoint analysis (Suez, Malacca, Panama, Hormuz)
- [ ] Strategic sealift capacity assessment

### Phase 5: Additional Sectors
These require significant new data pipelines.

- [ ] Telecom & Space: submarine cables (TeleGeography), satellite positions (CelesTrak), 5G coverage
- [ ] Technology & R&D: SBIR/STTR awards, defense patent analysis (USPTO), ASPI tech tracker

### Phase 6: Advanced Features
- [ ] Disruption scenario explorer (/scenarios page, "what if" modeling)
- [ ] Entity detail pages (/mineral/[id], /sector/[id], /country/[id])
- [ ] Comparison page (/compare — side-by-side minerals or countries)
- [ ] Dark mode (prefers-color-scheme)
- [ ] Marker clustering (Supercluster for 1000+ points)
- [ ] Agentic research system (automated Claude -p research, triggered by events)

---

## Architecture Notes

The docs in this directory (ARCHITECTURE.md, UX_DESIGN.md, PLAN.md, MANUFACTURING.md, TELECOM.md, TECHNOLOGY.md, DATA_SOURCES.md, METHODOLOGY.md) describe the **full multi-sector vision**. They were written as design specifications before implementation began. The current v1.0 implements the Metals & Mining and Manufacturing sectors with all planned UX features. The remaining sectors (Energy, Logistics, Telecom, Technology) and advanced features (disruption scenarios, entity pages) are future phases.
