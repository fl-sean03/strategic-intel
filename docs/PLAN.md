# Build Plan

## Overview

This is a phased plan for building a strategic industrial intelligence platform. The core concept: an interactive map with switchable "lenses" that overlay different sector data onto the same geographic view. Each phase ships something usable.

The **Manufacturing & Industrial Capacity** module is the priority new build. The **Metals & Mining** module already exists in `../critical-chain/` and needs migration.

---

## Phase 0: Foundation & Migration (Week 1)

**Goal:** Set up the v2 project scaffold and migrate Critical Chain as the first working module.

### Tasks
- [ ] Initialize Next.js 14 project with App Router, TypeScript, Tailwind CSS
- [ ] Set up MapLibre GL + deck.gl as the core map component
- [ ] Build the lens-switching UI shell (sector tabs/toggles above the map)
- [ ] Design the shared data model for cross-sector mineral/industry data
- [ ] Migrate Critical Chain pipeline into `pipeline/metals-mining/`
- [ ] Migrate Critical Chain scored.json into the new frontend data structure
- [ ] Verify Metals & Mining lens renders all 60 minerals on the map
- [ ] Set up light theme design system (colors, typography, spacing)
- [ ] Deploy scaffold to Vercel

### Deliverable
Working site with a map, one functional lens (Metals & Mining), and the UI shell for additional lenses.

---

## Phase 1: Manufacturing & Industrial Capacity Module (Weeks 2-3)

**Goal:** Build the flagship new module — the one that doesn't exist anywhere in the public domain.

### Data Ingestion
- [ ] **FRED API** — Industrial production indexes and capacity utilization by NAICS sector (monthly, ~2 week lag). Series: MCUMFN (manufacturing total), plus sector-specific series. 2,672 series available.
- [ ] **Census ASM API** — Employment, payroll, value of shipments, value added by 2-6 digit NAICS. Annual.
- [ ] **BLS API v2** — Manufacturing employment by state, metro area, NAICS sector (CES series). Monthly. For county-level: QCEW bulk CSV downloads.
- [ ] **USAspending API** — Defense contracts by manufacturer, location, NAICS code, product/service code. Filter by awarding agency (DoD). Daily updates.
- [ ] **SBIR/STTR API** — Awards by firm, location, agency, keywords. 35+ fields per award.
- [ ] **FRED World Bank proxy** — Manufacturing value added by country for international comparison (NV.IND.MANF.CD).

### Transform & Scoring
- [ ] Normalize all data to common geographic keys (state FIPS, county FIPS, country ISO)
- [ ] Calculate manufacturing concentration by sector and geography
- [ ] Calculate defense manufacturing dependency scores (% of defense contracts by region/firm)
- [ ] Build U.S. vs. peer comparison metrics (manufacturing output, shipbuilding, etc.)
- [ ] Identify sole-source and single-region dependencies in defense contracting
- [ ] Score manufacturing health by sector: capacity utilization + employment trend + investment pipeline

### Key Submodules

**Shipbuilding**
- U.S. has 8 active major shipyards (66 total facilities), building 3 of 5,448 large commercial vessels on order globally
- China builds 70%+ of global orders
- Data: CRS reports, GAO assessments, UNCTAD Review of Maritime Transport, White House Maritime Action Plan
- Visualization: Side-by-side comparison (U.S. vs China vs South Korea vs Japan), yard locations on map, capacity vs. output

**Munitions**
- No single database — assemble from DoD budget justification books, congressional testimony, defense journalism
- Key metrics: 155mm shell production (currently ~40K/month, goal 100K), Javelin/Stinger replacement rates
- Visualization: Production rate gauges, facility locations, stockpile burn-down scenarios
- NOTE: Much of this data is approximate/public estimates, not precise. Be transparent about sources.

**Reshoring & New Capacity**
- Reshoring Initiative data (public reports, TCO estimator)
- New factory announcements ($50M+ from IndustrialSage tracker)
- CHIPS Act and IRA investment tracking
- Visualization: Map of new manufacturing investments, timeline of announcements, jobs created

**Defense Industrial Base Map**
- Prime contractor facilities from USAspending (geocoded)
- SBIR/STTR award locations (innovation hubs)
- Concentration risk: how many critical contracts flow through single facilities/regions
- NOTE: Sub-tier supplier data is NOT publicly available. Acknowledge this limitation explicitly.

### Frontend
- [ ] Manufacturing lens on the map: factory locations, capacity utilization by region, defense contract density
- [ ] Sidebar with sector rankings (NAICS sectors sorted by health score)
- [ ] Drill-down: click a region → see manufacturers, contracts, employment, capacity
- [ ] Comparison view: U.S. vs China vs allies on key manufacturing metrics
- [ ] Shipbuilding comparison panel (the "1/300th" story, visualized)
- [ ] Munitions production dashboard (gauges showing current rate vs. target vs. wartime need)

### Deliverable
Manufacturing & Industrial Capacity lens fully functional. Users can explore U.S. manufacturing health by sector and geography, see defense industrial base concentration, and compare to peer nations.

---

## Phase 2: Energy Infrastructure Module (Week 3-4)

**Goal:** Add the Energy lens using EIA's excellent free API.

### Data Sources
- [ ] **EIA API v2** — Power plants (location, fuel type, capacity, generation). Electricity generation by state/source. Natural gas infrastructure. Extremely well-structured.
- [ ] **DOE** — Battery supply chain data, critical minerals overlap
- [ ] **FERC** — Transmission infrastructure (where available)

### Key Metrics
- Power generation capacity by source and state
- Grid vulnerability (transmission bottlenecks, single points of failure)
- Battery manufacturing capacity (domestic vs. imported cells)
- Energy import dependency (uranium, LNG)
- Renewable energy buildout pace vs. demand growth

### Deliverable
Energy lens showing power generation, grid infrastructure, and battery supply chain on the map. Cross-links to Metals & Mining for battery minerals.

---

## Phase 3: Global Logistics Module (Week 4-5)

**Goal:** Add shipping lanes, ports, and strategic maritime capacity.

### Data Sources
- [ ] **AIS data** — Real-time vessel tracking (free feeds available for delayed data)
- [ ] **DOT Maritime Administration (MARAD)** — U.S. merchant marine fleet, strategic sealift
- [ ] **UNCTAD** — Global shipping statistics, port throughput rankings
- [ ] **Chokepoint data** — Suez, Malacca, Panama, Hormuz traffic volumes

### Key Metrics
- U.S. port throughput vs. global peers
- Chokepoint dependency (% of trade flowing through each)
- Strategic sealift capacity vs. requirements
- U.S. merchant marine fleet size (tiny — ~80 vessels vs. China's 5,500+)

### Deliverable
Global Logistics lens showing shipping lanes, ports, chokepoints, and the U.S. maritime capacity gap.

---

## Phase 4: Cross-Sector Intelligence (Week 5-6)

**Goal:** Build the connections between sectors — the thing nobody else has.

### Features
- [ ] Dependency graph: when viewing a mineral, show which manufacturing sectors depend on it
- [ ] When viewing a manufacturing sector, show which minerals/energy/logistics it requires
- [ ] "What if" disruption scenarios that cascade across sectors
- [ ] Aggregated "industrial health" composite score by country/region

### Deliverable
Cross-sector drill-through and disruption scenario modeling.

---

## Phase 5: Polish & Launch (Week 6-7)

### Tasks
- [ ] Landing page with hero stats and animated map
- [ ] About/methodology page
- [ ] Blog post: "The open-source defense industrial base dashboard"
- [ ] Open-source the repo (MIT license)
- [ ] Deploy to production (Vercel)
- [ ] Distribution: personal site, Hacker News, defense tech communities
- [ ] Share with: defense analysts, VCs, think tank contacts

---

## Timeline Summary

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Foundation + Migration | Map shell + Metals & Mining lens (from v1) |
| 2-3 | Manufacturing module | Full manufacturing/defense industrial base lens |
| 3-4 | Energy module | Energy infrastructure lens |
| 4-5 | Logistics module | Global logistics lens |
| 5-6 | Cross-sector | Dependency graph + disruption scenarios |
| 6-7 | Polish + Launch | Blog post, open source, distribution |

This is aggressive. The critical path is Phase 1 (Manufacturing) because it requires the most data source integration and has the most novel content. Phases 2-3 are faster because the data sources are cleaner and the frontend patterns are established by then.
