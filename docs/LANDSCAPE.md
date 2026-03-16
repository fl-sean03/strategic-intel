# Competitive Landscape

What exists, what doesn't, and where this platform fits.

---

## The Gap

**No open-source, public-facing tool lets someone ask:** "Show me U.S. industrial capacity for sector X, who our suppliers are, where the concentration risk is, and what happens if that supply chain breaks — across all the sectors that matter for national security."

The closest thing is Govini's Ark platform, which costs the U.S. government $919 million and is FedRAMP-classified. Everything else covers one slice.

---

## OSINT / Geopolitical Dashboards

These track real-time events. They answer "what just happened?" — not "where are the structural vulnerabilities?"

| Tool | Stars | What It Does | Gap vs. Us |
|------|-------|-------------|------------|
| **WorldMonitor** | 37K | Real-time news/events on 3D globe, has commodity variant with mineral feeds | News aggregation, not structural supply chain analysis. No risk scoring. No manufacturing data. |
| **ShadowBroker** | 2.1K | Multi-domain OSINT (aircraft ADS-B, ships AIS, satellites, conflicts) | Tracking moving objects, not industrial capacity. No scoring or dependency mapping. |
| **GlobalThreatMap** | 1.3K | Wars, conflicts, military bases, AI country dossiers | Conflict-focused. No economic/industrial lens. |
| **CrisisMap** | newer | Real-time crisis events + financial market impact correlation | Cleanest architecture (Next.js + MapLibre). Event-driven, not structural. |

**What to borrow:** Map UX patterns (MapLibre + deck.gl), dark-to-light theme adaptation, fault-isolated data source fetching (CrisisMap pattern).

**What's different about us:** We show structural dependencies and capacity, not events. Our data updates monthly/annually, not in real-time. The insight is "where will problems emerge" not "what just happened."

---

## Defense / Policy Analysis Tools

| Tool | Access | What It Does | Gap vs. Us |
|------|--------|-------------|------------|
| **Govini Ark** | Classified ($919M contract) | Supply chain risk, production capacity, vendor health, foreign ownership risk on a "National Security Knowledge Graph" | Gold standard but inaccessible. No public equivalent exists. |
| **Advana (DoD)** | Internal DoD (100K+ users) | Combines 1,200 DoD systems. Finance, contracts, logistics, readiness. Powers SecDef's "Pulse dashboard." | Government internal. Not public. |
| **CSIS Defense (GitHub)** | Open (R scripts) | R-based analysis of FPDS contract data, defense spending visualizations | Open data/code but no integrated dashboard. Academic tooling, not a product. 28 repos on GitHub. |
| **Defense Futures Simulator** | Free (account) | Interactive defense budget/strategy tool (CSIS + AEI) | Budget allocation tool, not industrial base mapping. |
| **Heritage Military Index** | Public (report) | Annual U.S. military strength assessment (capacity, capability, readiness) | Report format, not interactive dashboard. Covers readiness, not supply chain. |

**What to borrow:** CSIS's open R scripts and lookup tables for FPDS data processing. Their analytical methodology is well-documented.

**What's different about us:** We're building a public, interactive product — not R scripts or PDF reports. We combine defense contract data with manufacturing capacity, mineral supply chains, and energy infrastructure in one map-first interface.

---

## Manufacturing / Industrial Trackers

| Tool | Access | What It Does | Gap vs. Us |
|------|--------|-------------|------------|
| **Manufacturing Megaprojects Tracker** | Public web | Map of 46+ U.S. megaprojects ($1B+), $560B+ total investment | Only large projects. No sector health scoring. No defense lens. No international comparison. |
| **ITA Manufacturing Industry Tracker** | Public | Monthly indicators for 21 NAICS sectors (exports, imports, production, employment) | Tables and charts, not map-based. No geographic drill-down. Government tool, functional but not engaging. |
| **Brookings Locating American Manufacturing** | Public | Interactive maps of manufacturing geography across 366 metro areas | Academic framing. No defense lens. No risk scoring. Dated. |
| **U.S. Cluster Mapping (Harvard/EDA)** | Public | 50M+ data records on industry clusters and regional business environments | Comprehensive data but academic UX. Not defense-focused. No supply chain risk dimension. |
| **Reshoring Initiative** | Semi-public | Database of reshoring/FDI cases, TCO estimator | Valuable data but behind forms/reports. No interactive map. No defense integration. |
| **Clean Economy Tracker** | Public | IRA/CHIPS clean energy manufacturing investments by state | Clean energy only. No defense. No broader manufacturing. |

**What to borrow:** Megaprojects tracker's investment data, ITA's NAICS sector structure, Reshoring Initiative's case database (public reports).

**What's different about us:** We combine manufacturing health metrics with defense contract concentration, mineral dependencies, energy infrastructure, and international comparison in one product. Nobody does this.

---

## Critical Minerals Tools

| Tool | Access | What It Does | Gap vs. Us |
|------|--------|-------------|------------|
| **Columbia Critical Materials Monitor** | Public | Trade flow explorer mapping HS codes to minerals across supply chain stages | Academic. Trade flows only. No risk scoring. No manufacturing or defense integration. |
| **Silverado Policy Accelerator** | Public | Defense/dual-use mineral dashboards | Policy-focused. Limited interactivity. |
| **GeoPolRisk-py** | Open source (JOSS) | Python library for geopolitical supply risk scoring (HHI, import risk) | Library, not a product. No visualization. Could be a backend component. |
| **DARPA CriticalMAAS** | Open source | AI/ML for automating USGS mineral assessments, geological map digitization | Data extraction, not dashboards. Could be a future data source. |
| **DOE Critical Minerals GIS** | Public | Government platform for critical minerals spatial data | Government tool. Minerals only. No defense integration. |

**What to borrow:** GeoPolRisk-py's scoring methodology (published in JOSS, peer-reviewed). Columbia's HS code → mineral mapping.

**What's different about us:** Critical Chain v1 already does this better — we have 60 minerals scored with HHI, adversary dependency, and single-source risk. In v2, it becomes one module in a broader platform.

---

## Shipbuilding Comparison

**Gap: No interactive shipbuilding comparison tool exists anywhere.**

CSIS has the best individual analyses:
- "Unpacking China's Naval Buildup" — D3.js scrollytelling with ship-by-ship comparison
- "Hidden Reach" — 307 active Chinese shipyards from 4,500+ records
- ChinaPower — satellite imagery analysis of specific yards

But these are narrative articles with embedded charts, not reusable tools. There is no dashboard where you can compare U.S. vs. China vs. South Korea vs. Japan shipbuilding capacity with filtering and time-series.

**This is one of the highest-impact visualizations we can build.** The "8 yards vs. 400+" story is immediately visceral.

---

## Visualization / Map Frameworks (Building Blocks)

| Tool | Stars | What It Does | Relevance |
|------|-------|-------------|-----------|
| **Kepler.gl** | 11.6K | Geospatial analysis with arc layers, hexbins, heatmaps (ex-Uber) | Arc layers are perfect for trade/supply chain flows |
| **deck.gl** | 12K+ | High-performance WebGL data visualization layers | Core dependency for our map overlays |
| **MapLibre GL** | 6K+ | Open-source map rendering (Mapbox GL fork) | Core dependency for our base map |
| **USAspending (GitHub)** | Open | React + D3.js + Elasticsearch frontend for federal spending | Reference architecture for contract data visualization |

---

## Summary: Where We Sit

```
                    Real-time Events ←————————→ Structural Analysis
                           │                          │
                    WorldMonitor               [THIS PLATFORM]
                    CrisisMap                   Govini Ark (classified)
                    ShadowBroker
                           │                          │
                    Single Sector ←————————————→ Cross-Sector
                           │                          │
                    Columbia (minerals)         [THIS PLATFORM]
                    CSIS (defense $)            Govini Ark (classified)
                    ITA (manufacturing)
                    EIA (energy)
```

We occupy the quadrant of **structural analysis × cross-sector integration** — and the only other occupant is a classified government tool. The public space is empty.
