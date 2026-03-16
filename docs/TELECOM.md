# Telecom & Space Infrastructure Module

This module covers the physical infrastructure that underpins global communications, navigation, and space-based intelligence. Over 99% of internet traffic travels via submarine cables. GPS signals are trivially easy to jam. China is building, controlling, cutting, and displacing Western submarine cable infrastructure simultaneously.

---

## What This Module Shows

### 1. Submarine Cables

The backbone of the global internet. 694 cable systems, 1,893 landing stations worldwide.

**Key data points:**
- Cable routes (GeoJSON MultiLineString geometry)
- Landing points (GeoJSON Point geometry with country, name)
- Cable owners (which companies/governments control which routes)
- Capacity (where available from licensed TeleGeography data)
- Planned vs. in-service status
- ~40 new cable systems expected to go live in 2026 (record year)

**National security angle:**
- **Landing point concentration**: Major U.S. clusters at NY/NJ, Virginia Beach, South Florida, Hawaii, and California. Multiple cables sharing the same landing station = single point of failure.
- **95 FCC-licensed submarine cables** in the U.S. (63 international, 21 domestic)
- **HMN Technologies** (formerly Huawei Marine Networks): involved in 90+ international cable projects. Market share declining under U.S. pressure (18% of cables online in last 4 years → 7% of cables under development).
- **China cable-cutting capability**: China publicly disclosed a deep-sea cable-cutting device. 4 cable-cutting incidents near Taiwan in Jan-Feb 2025. Captain convicted (3 years).
- **Route displacement**: Google/Meta's Apricot and Echo cables deliberately avoid the South China Sea, adding cost and distance.
- **PEACE cable** (Pakistan-East Africa Connecting Europe): China-backed alternative route, operational Sep 2024. Part of a strategy to build redundant routes that bypass Western-controlled infrastructure.

**Visualize as:**
- Map layer showing cable routes as colored lines (by owner, status, or capacity)
- Landing points as dots (sized by number of cables, colored by concentration risk)
- Highlight chokepoints: Strait of Malacca, Suez Canal, South China Sea, English Channel
- U.S. landing point cluster analysis: how many cables per station
- Adversary-controlled vs. allied cable overlay

### 2. Satellites & Space Assets

**Key data points:**
- 7,560+ operational satellites (UCS database)
- Per satellite: name, country, operator, purpose, orbit type, perigee/apogee, launch date, mass, contractor
- Real-time orbital positions (CelesTrak TLE data)

**U.S. vs. China comparison:**

| Metric | United States | China |
|--------|--------------|-------|
| Total satellites | ~5,184 | ~1,900 (up from <100 in 2013) |
| Military satellites | ~247 | ~157 (with 500+ ISR satellites tracking U.S. Pacific forces) |
| Navigation constellation | GPS (31 sats) | BeiDou (56 sats, nearly 2x GPS) |
| Ground monitoring stations | GPS: ~16 | BeiDou: ~160 (10x GPS) |
| Commercial LEO constellation | Starlink (~11,000+) | Guowang (~100+) + Qianfan (~108) |

**Commercial constellations:**

| Constellation | Operator | In Orbit | Planned | Status |
|--------------|----------|----------|---------|--------|
| Starlink | SpaceX | ~11,000+ | 42,000 | Dominant, global service |
| OneWeb | Eutelsat | 654 operational | 648 (phase 1 complete) | Operational |
| Kuiper | Amazon | 182 | 3,236 | Early deployment, FCC deadline Jul 2026 |
| Guowang | CASIC (China state) | ~100+ | 13,000 | Accelerating |
| Qianfan/SpaceSail | Shanghai Spacecom | ~108 | 15,000+ | Technical issues, resumed Oct 2025 |

**National security angle:**
- **GPS vulnerability**: Signals are extremely weak at ground level (-130 dBm), trivially jammed with a few watts of power. BeiDou has 2x satellites and 10x ground stations.
- **ASAT threats**: China has operational ground-based direct-ascent ASAT (LEO) and is pursuing GEO-capable ASAT. Russia has Peresvet laser weapons (5 divisions) and a nuclear-armed ASAT satellite under development. Russian satellites have approached within <1 km of U.S. satellites (Feb 2025).
- **Dual-use inspection satellites**: Both China and Russia operating "inspection and repair" satellites that can maneuver close to adversary assets.
- **Orbital slot competition**: LEO is getting crowded. Debris risk increasing.

**Visualize as:**
- Satellite positions plotted on map (colored by country/purpose)
- Constellation coverage maps (Starlink vs. BeiDou vs. GPS footprint)
- Bar chart: U.S. vs. China space asset comparison
- Timeline: China's satellite fleet growth (exponential curve from 2013-2026)

### 3. Spectrum & 5G

**Key data points:**
- FCC frequency allocations (225 MHz - 3700 MHz): federal vs. non-federal vs. shared
- 5G deployment coverage (145,000+ deployments across 233 providers in 142 countries)
- Cell tower locations (40M+ towers globally via OpenCelliD)
- Broadband availability by geography (FCC Broadband Map)

**National security angle:**
- Spectrum is a finite resource. Federal (military) vs. commercial allocation is a constant tension.
- 5G infrastructure dependency: who manufactures the equipment (Ericsson, Nokia vs. Huawei/ZTE)
- Rural broadband gaps = military recruitment and base connectivity gaps

**Visualize as:**
- 5G coverage heatmap overlay
- Cell tower density map (OpenCelliD data)
- Spectrum allocation chart (frequency bands, who controls what)

### 4. Space Launch Infrastructure

**Key data points:**
- 14 FAA-licensed U.S. spaceports (9 horizontal, 4 vertical, 1 reentry)
- Launch cadence by country (2025: U.S. 181, China 92, Russia 17, Europe 8 — U.S. + China = 83% of global)
- SpaceX alone: 165 of 181 U.S. launches (91%)
- Historical launch data back to Sputnik-1 (1957)

**National security angle:**
- U.S. launch dominance is really SpaceX dominance. Single-company dependency.
- China's launch cadence increasing 35% year-over-year, driven by Guowang/Qianfan constellation buildout.
- Launch site concentration: most U.S. launches from Cape Canaveral and Vandenberg.

**Visualize as:**
- Launch site locations on map (sized by annual cadence)
- Bar chart: launches by country by year (time series showing China's growth)
- SpaceX share of U.S. launches (pie/donut chart — the single-company risk)

---

## Data Sources — Telecom & Space Module

### Submarine Cables (Free, No Auth)

**1. TeleGeography Submarine Cable Map API v3**
- Base: `https://www.submarinecablemap.com/api/v3/`
- All cables: `cable/all.json` (1,382 entries)
- Cable routes GeoJSON: `cable/cable-geo.json` (105 MultiLineString features)
- Landing points GeoJSON: `landing-point/landing-point-geo.json` (1,024 Point features)
- Individual cable: `cable/{cable-id}.json`
- Fields: id, name, length, rfs_year, is_planned, owners (array), suppliers, landing_points (array with country)
- Auth: None
- Rate limit: Reasonable (no documented limit)
- License: Free for non-commercial use

**2. GitHub: lintaojlu/submarine_cable_information**
- URL: `https://github.com/lintaojlu/submarine_cable_information`
- Crawled TeleGeography data in GeoJSON format
- Cable routes as MultiLineStrings, landing points as Points
- Free to use

**3. NOAA Submarine Cable Areas (U.S. Government)**
- data.gov: `https://catalog.data.gov/dataset/submarine-cable-areas-u-s-and-affiliated-territories`
- Formats: GeoJSON, GML, KML, Shapefile, CSV, ArcGIS REST
- U.S. and affiliated territories only

**4. FCC Submarine Cable Data**
- Landing licenses: `https://www.fcc.gov/submarine-cable-landing-licenses`
- Licenses granted: `https://www.fcc.gov/submarine-cable-landing-licenses-granted`
- Circuit capacity: `https://www.fcc.gov/international/circuit-capacity-data-us-international-submarine-cables`

### Satellites (Free, Some Require Registration)

**5. CelesTrak GP API (BEST — no auth required)**
- Endpoint: `https://celestrak.org/NORAD/elements/gp.php?{QUERY}=VALUE&FORMAT=VALUE`
- Query by: CATNR (catalog number), GROUP (e.g., STARLINK, GPS-OPS), NAME (search)
- Formats: JSON, CSV, TLE, XML, KVN
- Example: `gp.php?GROUP=STARLINK&FORMAT=JSON`
- Example: `gp.php?GROUP=GPS-OPS&FORMAT=JSON`
- Returns: orbital elements for position calculation
- No auth, no rate limit documented

**6. UCS Satellite Database**
- Download: `https://www.ucs.org/media/11492` (Excel) or `https://www.ucs.org/media/11493` (tab-delimited text)
- 7,560 operational satellites, 28 fields per satellite
- Fields: Name, Country, Operator, Purpose, Users, Orbit class/type, Perigee/Apogee, Inclination, Launch Mass, Launch Date, Contractor, Launch Site, NORAD Number
- Last updated: May 2023 data (page updated Jan 2024) — check for newer versions
- Static download, not an API

**7. Space-Track.org (NORAD/18th Space Defense Squadron)**
- URL: `https://www.space-track.org/`
- Auth: Free account required
- REST API with configurable queries
- Key classes: GP, TLE, satcat (Satellite Catalog), cdm_public (Conjunction Data)
- Rate limits: 30 req/min, 300 req/hr
- Note: 5-digit NORAD catalog numbers will run out ~July 2026

### Spectrum & 5G

**8. FCC Spectrum Dashboard API**
- Endpoint: `http://data.fcc.gov/api/spectrum-view/services/advancedSearch/getSpectrumBands`
- Parameters: frequencyFrom, frequencyTo
- Returns: frequency bands, allocation type (federal/non-federal), radio services
- No auth required

**9. OpenCelliD (Cell Towers)**
- URL: `https://opencellid.org/`
- 40M+ cell towers globally
- API: `https://wiki.opencellid.org/wiki/API`
- Downloads: `https://opencellid.org/downloads.php`
- Fields: mcc, mnc, lac, cellid, lon, lat, samples, averageSignal
- License: CC-BY-SA 4.0

**10. Ookla Open Data (5G/Broadband Speed)**
- AWS S3: `s3://ookla-open-data`
- Format: Apache Parquet + Shapefile
- Coverage: zoom level 16 tiles (~610m resolution)
- Data: download/upload speed + latency per tile, 2019-2024
- Free for non-commercial use

**11. FCC Broadband Map**
- Map: `https://broadbandmap.fcc.gov/`
- Data download: `https://broadbandmap.fcc.gov/data-download/nationwide-data`
- API spec: `https://www.fcc.gov/sites/default/files/bdc-public-data-api-spec.pdf`
- Auth: API token + username required; MFA required as of March 2026

### Space Launch

**12. TheSpaceDevs Launch Library 2 API**
- Endpoint: `https://ll.thespacedevs.com/2.2.0/launch/`
- Swagger: `https://ll.thespacedevs.com/2.0.0/swagger`
- Every orbital launch since 1957
- Filters: launch service provider, launcher config, spacecraft, date range
- Free tier: 15 calls/hour
- No auth required for basic queries

**13. FAA Spaceport Data**
- Spaceports by state: `https://www.faa.gov/space/spaceports_by_state`
- Commercial space data portal: `https://www.faa.gov/data_research/commercial_space_data`
- 14 licensed spaceports with locations

### Reference / Context

**14. Secure World Foundation — 2025 Global Counterspace Capabilities Report**
- URL: `https://www.swfound.org/publications-and-reports/2025-global-counterspace-capabilities-report`
- 316 pages, 12 countries
- ASAT capabilities, dual-use satellites, electronic warfare, cyber threats

**15. CSIS — China's Underwater Power Play**
- URL: `https://www.csis.org/analysis/chinas-underwater-power-play-prcs-new-subsea-cable-cutting-ship-spooks-international`
- Cable-cutting capability analysis

**16. Atlantic Council — Cyber Defense Across the Ocean Floor**
- URL: `https://www.atlanticcouncil.org/in-depth-research-reports/report/cyber-defense-across-the-ocean-floor-the-geopolitics-of-submarine-cable-security/`
- Submarine cable security geopolitics

---

## Scoring Methodology — Telecom & Space

### Submarine Cable Concentration Risk (0-100, per landing region)

```
cable_concentration = (
    0.35 * landing_point_hhi +       # HHI of cables per landing station
    0.25 * owner_concentration +      # HHI of cable ownership (few owners = risk)
    0.20 * route_diversity +          # Inverse: fewer diverse routes = higher risk
    0.20 * adversary_proximity        # Cables passing through adversary-controlled waters
)
```

### Space Asset Dependency Score (0-100)

```
space_dependency = (
    0.30 * constellation_concentration +  # Single-operator share (SpaceX/Starlink dominance)
    0.25 * navigation_vulnerability +     # GPS vs. BeiDou capability gap
    0.25 * asat_threat_level +            # Adversary counterspace capabilities
    0.20 * launch_concentration           # Single-provider launch dependency
)
```

### Key Metrics to Highlight

| Metric | Value | Source |
|--------|-------|--------|
| Global submarine cable systems | 694 | TeleGeography 2026 |
| Internet traffic via submarine cables | >99% | Industry consensus |
| FCC-licensed U.S. cables | 95 | FCC |
| China cable-cutting incidents (2025) | 4 | CSIS |
| Operational satellites | 7,560+ | UCS |
| U.S. military satellites | ~247 | Various |
| China military satellites | ~157 | Various |
| GPS satellites | 31 | GPS.gov |
| BeiDou satellites | 56 (nearly 2x GPS) | BeiDou.gov.cn |
| U.S. orbital launches (2025) | 181 (91% SpaceX) | FAA |
| China orbital launches (2025) | 92 (+35% YoY) | Various |
| FAA-licensed U.S. spaceports | 14 | FAA |
| Cell towers globally (OpenCelliD) | 40M+ | OpenCelliD |

---

## Key Limitations

1. **Cable capacity data is commercially licensed.** TeleGeography's free API gives routes and landing points but not capacity (Tbps). The licensed dataset costs money. We can show topology but not throughput.
2. **UCS satellite database lags.** Latest data is May 2023. CelesTrak provides real-time orbital elements but fewer metadata fields. Combine both for best coverage.
3. **Spectrum data is complex.** FCC allocation data is structured by frequency band, not by geographic coverage. Translating "who has spectrum" to "where is 5G deployed" requires combining FCC + Ookla + OpenCelliD data.
4. **Military satellite purposes are approximate.** UCS categorizes satellites by purpose (military, civil, commercial, government) but exact capabilities are often classified.
5. **Launch data doesn't capture payload.** We know how many launches, but national security payload details are classified. We can track cadence but not capability.
