# Full Vision Implementation Tracker

**Last updated:** 2026-03-16
**Status:** 4 sectors live, scenarios page, all core features complete.

---

## Phase 1: Core Platform (v1.0) — COMPLETE
- [x] Metals & Mining lens (60 minerals, risk scores, USGS pipeline)
- [x] Manufacturing lens (8 NAICS sectors, BLS/FRED/Census/USAspending)
- [x] 627 MSHA mine facilities
- [x] 14 shipyards, 18 investments, 10 defense programs
- [x] deck.gl layers, trade arcs, US state choropleth
- [x] Multi-tab detail panel, cross-entity search
- [x] URL deep linking, keyboard shortcuts, mobile responsive
- [x] Source URLs, error boundaries, loading skeletons
- [x] Design polish (font, favicon, accessibility, SVG icons, text sizes)

## Phase 2: Manufacturing Deep Dive — COMPLETE
- [x] ShipbuildingTab (U.S. vs China/SK/Japan bars — 3 comparison charts)
- [x] MunitionsTab (155mm, Javelin, Stinger, GMLRS, PAC-3 — production gauges)
- [x] InternationalTab (value added + % GDP bars for 6 countries)
- [x] SECTOR_TABS expanded to 7 tabs

## Phase 3: Energy Lens — COMPLETE
- [x] energy.json curated data (7 fuel types, 10 key facilities, 5 battery mineral deps, 5 grid challenges)
- [x] EnergyData types (EnergyFuel, EnergyFacility, EnergyData)
- [x] EnergyOverviewTab (generation mix bars, grid challenges)
- [x] BatteryMineralsTab (import reliance for Li, Co, Ni, Graphite, Mn)
- [x] Sidebar: fuel type list with share bars and trend indicators
- [x] MapView: power plant markers colored by fuel type
- [x] Layer controls: Power Plants toggle
- [x] Legend: fuel type colors

## Phase 4: Logistics Lens — COMPLETE
- [x] logistics.json curated data (8 chokepoints, 14 ports, 6 merchant fleets, sealift assessment)
- [x] LogisticsData types (Chokepoint, Port, MerchantFleet, LogisticsData)
- [x] LogisticsOverviewTab (fleet comparison, sealift readiness)
- [x] ChokepointsTab (risk-sorted with severity badges)
- [x] MerchantFleetTab (ComparisonBar chart)
- [x] PortsTab (U.S. + global ports with TEU stats)
- [x] Sidebar: chokepoints + ports list
- [x] MapView: port markers (navy/gray/orange) + chokepoint markers (risk-colored)
- [x] Layer controls: Ports + Chokepoints toggles
- [x] Legend: risk levels + port types

## Phase 5: Scenarios — COMPLETE
- [x] /scenarios page with 5 preset disruption scenarios
- [x] China rare earth ban, Taiwan Strait conflict, Malacca blockade, Gulf Coast hurricane, DRC cobalt disruption
- [x] Cascade effects, affected minerals (clickable), probability, recovery time
- [x] Split-panel layout (scenario cards + detail view)

## Phase 6: Entity Pages — PARTIAL
- [x] Entity detail via hash-based deep linking (#metals-mining/gallium)
- [x] Country click → mineral producers panel
- [ ] ~~Dynamic route pages~~ (incompatible with static export; hash-based approach used instead)

## Not Yet Built (Future)
- [ ] Telecom & Space lens (submarine cables, satellites, spectrum — requires TeleGeography/CelesTrak APIs)
- [ ] Technology & R&D lens (SBIR, patents, ASPI tracker — requires USPTO/SBIR APIs)
- [ ] Dark mode
- [ ] Agentic research automation (cron-based intelligence gathering)
- [ ] Real-time data feeds (commodity prices, vessel tracking)
