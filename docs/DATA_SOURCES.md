# Data Sources — All Sectors

Comprehensive catalog of every data source the platform uses or plans to use, organized by sector.

---

## Metals & Mining (Migrated from Critical Chain v1)

| Source | URL | Format | Auth | Update | Coverage |
|--------|-----|--------|------|--------|----------|
| USGS MCS 2025 | doi.org/10.5066/P14RDM17 | CSV + PDF | None | Annual | 90+ minerals: production, reserves, trade, prices |
| USGS Critical Minerals List | usgs.gov/programs/mineral-resources-program | Web | None | Per designation | 60 critical minerals |
| UN Comtrade | comtradeplus.un.org | JSON API | Free key | Quarterly | Global bilateral trade by HS code |
| MSHA Mine Data | msha.gov/data-and-reports | CSV/Excel | None | Quarterly | 91,000+ U.S. mining operations |
| World Bank Commodity Prices | worldbank.org/commodity-markets | Excel | None | Monthly | 70+ commodity price series |
| CRS/GAO Reports | crsreports.congress.gov | PDF | None | Periodic | Defense applications, policy context |

**Status:** Pipeline complete. 60 minerals scored, 23 tests passing. See `../critical-chain/`.

---

## Manufacturing & Industrial Capacity (NEW — Priority)

| Source | Endpoint | Format | Auth | Rate Limit | Update | Key Data |
|--------|----------|--------|------|------------|--------|----------|
| **FRED API** | api.stlouisfed.org/fred/ | JSON | Free key | 120/min | Monthly | Capacity utilization, industrial production (2,672 series) |
| **Census ASM API** | api.census.gov/data/timeseries/asm/ | JSON | Free key | Generous | Annual | Employment, payroll, output by NAICS × state |
| **BLS API v2** | api.bls.gov/publicAPI/v2/ | JSON | Free reg | 500/day | Monthly | Employment by sector, state, metro |
| **BLS QCEW** | bls.gov/cew/downloadable-data-files.htm | CSV bulk | None | N/A | Quarterly | County-level employment and wages |
| **USAspending API** | api.usaspending.gov/api/v2/ | JSON | None | Generous | Daily | Defense contracts, recipients, geography |
| **USAspending Bulk** | files.usaspending.gov | CSV | None | N/A | Monthly | Full contract/grant data by fiscal year |
| **SBIR/STTR API** | api.www.sbir.gov/public/api/ | JSON/XML | None | Generous | Periodic | Awards by firm, location, agency, keywords |
| **World Bank API** | api.worldbank.org/v2/ | JSON | None | Generous | Annual | Manufacturing value added by country (NV.IND.MANF.CD) |
| **IndustrialSage** | industrialsage.com | CSV | None | Biweekly | Biweekly | Factory announcements $50M+ |
| **CRS Reports** | crsreports.congress.gov | PDF | None | Periodic | Shipbuilding, munitions, DIB analysis |
| **GAO Reports** | gao.gov | PDF | None | Periodic | Sub-tier suppliers, critical materials, readiness |
| **UNCTAD Maritime** | unctad.org | PDF/data | None | Annual | Global shipbuilding, merchant fleet stats |

---

## Energy Infrastructure

| Source | Endpoint | Format | Auth | Rate Limit | Update | Key Data |
|--------|----------|--------|------|------------|--------|----------|
| **EIA API v2** | api.eia.gov/v2/ | JSON | Free key | 1000/hr | Monthly+ | Power plants, generation, fuel, grid, prices |
| **EIA 860** | eia.gov/electricity/data/eia860/ | CSV | None | Annual | Every U.S. power plant: location, capacity, fuel type |
| **EIA 923** | eia.gov/electricity/data/eia923/ | CSV | None | Monthly | Actual generation, fuel consumption |
| **DOE** | energy.gov | Various | None | Periodic | Battery supply chain, critical minerals overlap |
| **FERC** | ferc.gov | Various | None | Periodic | Transmission infrastructure (limited) |

EIA is one of the best-structured federal data APIs. EIA-860 alone gives you every power plant in the U.S. with coordinates, capacity, fuel type, owner, and status.

---

## Global Logistics

| Source | Endpoint | Format | Auth | Rate Limit | Update | Key Data |
|--------|----------|--------|------|------------|--------|----------|
| **AIS (delayed)** | Various free feeds | JSON/CSV | Varies | Varies | Delayed | Vessel positions, shipping density |
| **MARAD** | maritime.dot.gov | PDF/data | None | Periodic | U.S. merchant fleet, strategic sealift |
| **UNCTAD Transport** | unctad.org | PDF/data | None | Annual | Global shipping, port throughput |
| **World Port Rankings** | Various | Tables | None | Annual | Port throughput by TEU/tonnage |

AIS data is the most complex to integrate. Free feeds provide delayed data (hours to days). Real-time requires commercial subscription. For a static dashboard, delayed or aggregated annual data is sufficient.

---

## Telecom & Space Infrastructure

Full deep dive with 16 data sources: [`TELECOM.md`](TELECOM.md)

| Source | Endpoint | Format | Auth | Update | Key Data |
|--------|----------|--------|------|--------|----------|
| **TeleGeography API v3** | submarinecablemap.com/api/v3/ | GeoJSON/JSON | None | Periodic | 694 cable systems, 1,893 landing stations, routes + owners |
| **CelesTrak GP API** | celestrak.org/NORAD/elements/gp.php | JSON/CSV/TLE | None | Real-time | Orbital elements for all tracked satellites |
| **UCS Satellite DB** | ucs.org/media/11492 | Excel | None | Periodic | 7,560+ satellites: 28 fields per satellite |
| **Space-Track.org** | space-track.org | REST API | Free account | 30/min | NORAD catalog, conjunction data |
| **FCC Spectrum API** | data.fcc.gov/api/spectrum-view/ | JSON | None | Periodic | Frequency allocations, federal vs. non-federal |
| **OpenCelliD** | opencellid.org | CSV/API | CC-BY-SA | Continuous | 40M+ cell towers globally |
| **Ookla Open Data** | s3://ookla-open-data | Parquet | None | Quarterly | 5G/broadband speed tiles, 610m resolution |
| **TheSpaceDevs API** | ll.thespacedevs.com/2.2.0/ | JSON | None | 15/hr | Every orbital launch since 1957 |
| **FAA Spaceport Data** | faa.gov/space/spaceports_by_state | Web/PDF | None | Periodic | 14 licensed U.S. spaceports |
| **NOAA Cable Areas** | catalog.data.gov | GeoJSON/SHP | None | Periodic | U.S. submarine cable protection areas |

---

## Technology & R&D

Full deep dive with 11 data sources: [`TECHNOLOGY.md`](TECHNOLOGY.md)

| Source | Endpoint | Format | Auth | Update | Key Data |
|--------|----------|--------|------|--------|----------|
| **SBIR/STTR API** | api.www.sbir.gov/public/api/awards.json | JSON | None | Periodic | All awards: firm, location, amount, agency, keywords |
| **USPTO PatentsView** | api.patentsview.org/patents/query | JSON | Optional key | Weekly | Patents by CPC code, assignee, location |
| **NSF NCSES** | ncses.nsf.gov/surveys/federal-funds-research-development | CSV/Excel | None | Annual | Federal R&D funding by agency, performer, character |
| **ASPI Tech Tracker** | techtracker.aspi.org.au | Interactive | None | Annual | 74 technologies, U.S. vs. China leadership scores |
| **DARPA Programs** | darpa.mil/research/programs | Web (no API) | None | Ongoing | ~250 active programs by topic and office |
| **USAspending (RDT&E)** | api.usaspending.gov/api/v2/ | JSON | None | Daily | DoD R&D contracts by recipient and geography |

---

## Cross-Cutting Sources

| Source | Use | Notes |
|--------|-----|-------|
| **Natural Earth** | Base map geometry (countries, states, coastlines) | Free, public domain, multiple resolutions |
| **US Census TIGER** | U.S. county boundaries, metro areas | Free, public domain |
| **ISO 3166** | Country codes | Standard |
| **FIPS** | State and county codes | Standard |
| **NAICS** | Industry classification | Census Bureau maintains code list |

---

## Data Freshness Summary

| Sector | Most Current Source | Lag | Oldest Source | Lag |
|--------|-------------------|-----|---------------|-----|
| Metals & Mining | USGS MCS | ~1 year | MSHA | ~3 months |
| Manufacturing | FRED | ~2 weeks | Census ASM | ~2 years |
| Energy | EIA monthly | ~2 months | EIA annual | ~1 year |
| Logistics | AIS (if live) | Hours-days | UNCTAD | ~1 year |
| Telecom | CelesTrak | Real-time | UCS satellite DB | ~2 years |
| Technology | USAspending | Daily | NSF NCSES | ~2 years |

The platform shows structural analysis, not real-time news. Data lag is acceptable and should be communicated transparently on the About page.
