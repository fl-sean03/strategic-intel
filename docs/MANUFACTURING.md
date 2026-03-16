# Manufacturing & Industrial Capacity Module

This is the **priority new build** for v2. Nothing like this exists in the public domain. Govini's Ark platform ($919M government contract) is the closest, but it's classified and proprietary. CSIS has open R scripts for defense spending analysis but no integrated dashboard. This module fills that gap.

---

## What This Module Shows

### 1. U.S. Manufacturing Health by Sector

For each NAICS manufacturing sector, show:
- **Capacity utilization** (FRED, monthly) — is the sector running hot, healthy, or underutilized?
- **Employment trend** (BLS, monthly) — growing or shrinking?
- **Value of shipments** (Census ASM, annual) — actual output
- **Geographic concentration** — which states/regions dominate this sector?

Key NAICS sectors to highlight:
| NAICS | Sector | Why It Matters |
|-------|--------|----------------|
| 332 | Fabricated Metal Products | Ammunition, armor, structural components |
| 334 | Computer & Electronic Products | Semiconductors, radar, guidance systems |
| 335 | Electrical Equipment | Batteries, power systems, motors |
| 336 | Transportation Equipment | Aircraft, ships, vehicles, missiles |
| 325 | Chemicals | Propellants, explosives, materials |
| 331 | Primary Metals | Steel, aluminum, titanium, specialty alloys |
| 327 | Nonmetallic Mineral Products | Ceramics, glass, advanced materials |

### 2. Defense Industrial Base

Map defense manufacturing using USAspending contract data:
- **Prime contractor locations** — geocode top defense manufacturers
- **Contract concentration** — how much defense spending flows through single facilities or regions?
- **SBIR/STTR innovation hubs** — where small defense tech companies cluster
- **Sole-source risk** — contracts with only one viable supplier

Key question this answers: "If a natural disaster or attack hit [region X], which defense programs would be impacted?"

### 3. Shipbuilding

The most visceral data point in the entire platform. The comparison:

| Metric | United States | China |
|--------|--------------|-------|
| Active major shipyards | 8 | 400+ |
| Large commercial vessels on order | 3 | ~3,800 |
| Share of global orders | 0.06% | 70%+ |
| Annual commercial tonnage | ~0.3% of global | ~50% of global |

Sources: CRS reports, GAO assessments, UNCTAD Review of Maritime Transport, White House Maritime Action Plan (2025).

Visualize as:
- Map showing yard locations (8 U.S. dots vs. hundreds of Chinese dots along the coast)
- Bar chart comparison (the visual gap is the story)
- Timeline of U.S. shipyard closures (1980s: 20+ yards → today: 8)
- New capacity: South Korean firms (HD Hyundai, Hanwha Ocean) building yards in the U.S.

### 4. Munitions Production

No single database exists. Assemble from public sources:

| Munition | Current Rate | Target Rate | Wartime Need | Gap |
|----------|-------------|-------------|--------------|-----|
| 155mm shells | ~40,000/mo | 100,000/mo | Unknown (high) | Significant |
| Javelin missiles | ~400/mo (est.) | 800/mo target | Burned ~7,000 in Ukraine Year 1 | Severe |
| Stinger missiles | Restarted 2023 | ~720/yr target | Stockpile depleted | Severe |
| GMLRS rockets | ~14,000/yr | Increasing | High demand signal | Moderate |

Sources: Defense One, Breaking Defense, National Defense Magazine, Army budget justification books, congressional testimony.

Visualize as:
- Production rate gauges (current vs. target vs. estimated wartime consumption)
- Facility locations on map (Lake City AAP, Scranton AAP, new Repkon USA in Kentucky, etc.)
- Stockpile burn-down scenarios: "At current consumption rates, X would run out in Y months"

**Important caveat:** Much of this data is approximate/estimated from public reporting. Be transparent about confidence levels and sources. Some production rates are classified.

### 5. Reshoring & New Capacity

Track the wave of new manufacturing investment:
- **Megaprojects ($1B+):** Semiconductor fabs (TSMC Arizona, Intel Ohio, Samsung Texas), EV battery plants (LG, SK, Panasonic), etc.
- **Mid-scale ($50M-$1B):** From IndustrialSage tracker (biweekly CSV updates)
- **CHIPS Act investments:** Semiconductor-specific ($52.7B authorized)
- **IRA investments:** Clean energy manufacturing

Visualize as:
- Map dots sized by investment amount, colored by sector
- Timeline: announced → under construction → operational
- Jobs: promised vs. delivered
- Geographic distribution: which states are winning reshoring?

---

## Data Sources — Manufacturing Module

### Primary APIs (Free, Programmable)

**1. FRED API (Federal Reserve Economic Data)**
- Endpoint: `api.stlouisfed.org/fred/series/observations`
- Auth: Free API key (register at research.stlouisfed.org)
- Rate limit: 120 requests/minute
- Key series:
  - `MCUMFN` — Manufacturing capacity utilization (total)
  - `CAPUTLG332S` — Fabricated metals capacity utilization
  - `CAPUTLG334S` — Computer/electronics capacity utilization
  - `CAPUTLG336S` — Transportation equipment capacity utilization
  - `IPMAN` — Industrial production: manufacturing
  - `MANEMP` — Manufacturing employment (total)
  - 2,672 total series available for manufacturing
- Update: Monthly (~2 week lag)
- Format: JSON

**2. Census Bureau ASM API**
- Endpoint: `api.census.gov/data/timeseries/asm/state`
- Auth: Free API key
- Key variables: `EMP` (employment), `PAYANN` (payroll), `VALADD` (value added), `RCPTOT` (revenue)
- Granularity: State × NAICS (2-6 digit)
- Update: Annual (latest is usually 2 years prior)
- Format: JSON

**3. BLS API v2**
- Endpoint: `api.bls.gov/publicAPI/v2/timeseries/data/`
- Auth: Free registration (500 daily queries, 50 series per query)
- Key series: CES (Current Employment Statistics) — manufacturing employment by state, metro, NAICS
- For county-level: use QCEW bulk CSV downloads (quarterly)
- Format: JSON

**4. USAspending API**
- Endpoint: `api.usaspending.gov/api/v2/`
- Auth: None required
- Key endpoints:
  - `/search/spending_by_geography/` — contract spending by state/county
  - `/search/spending_by_award/` — individual contracts
  - `/recipient/` — contractor profiles
  - `/references/naics/` — NAICS code lookup
- Filter by: awarding agency (DoD = 097), NAICS code, location, date range
- Update: Daily
- Format: JSON
- Also: bulk CSV downloads by fiscal year at files.usaspending.gov

**5. SBIR/STTR API**
- Endpoint: `api.www.sbir.gov/public/api/awards.json`
- Auth: None
- Fields: firm name, city, state, zip, award amount, agency, abstract, keywords, phase, year
- Filter by agency (DOD), keyword, state, year
- Format: JSON/XML

**6. World Bank API (International Comparison)**
- Endpoint: `api.worldbank.org/v2/country/{code}/indicator/{indicator}`
- Auth: None
- Key indicator: `NV.IND.MANF.CD` (Manufacturing value added, current USD)
- Use for: U.S. vs. China vs. allies manufacturing output comparison
- Format: JSON

### Secondary Sources (Manual / Periodic Download)

**7. IndustrialSage Factory Tracker**
- URL: industrialsage.com (check for latest tracker)
- Format: CSV, biweekly updates
- Coverage: New factory announcements $50M+
- Use for: Reshoring/new capacity map layer

**8. CRS/GAO Reports (Shipbuilding, Munitions, DIB)**
- Not API-accessible — manually extract key data points
- Key reports:
  - CRS R44972: Navy Force Structure and Shipbuilding Plans
  - GAO-24-107176: Critical Materials
  - GAO-25-107283: Defense Industrial Base Sub-Tier Suppliers
  - Various CRS reports on munitions industrial base
- Use for: Shipbuilding yard data, munitions production estimates, qualitative analysis

**9. UNCTAD Review of Maritime Transport**
- URL: unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport
- Annual PDF report with global shipbuilding and merchant fleet data
- Use for: International shipbuilding comparison

**10. White House Maritime Action Plan (2025)**
- Policy document with specific yard data and planned investments
- Use for: U.S. shipyard locations and new capacity plans

---

## Scoring Methodology — Manufacturing

### Manufacturing Health Score (0-100, per NAICS sector)

```
health_score = (
    0.30 * capacity_utilization_score +   # FRED: 80%+ = healthy
    0.25 * employment_trend_score +        # BLS: growing = positive
    0.20 * output_trend_score +            # Census ASM: value of shipments trend
    0.15 * geographic_diversity_score +     # How spread out is this sector?
    0.10 * investment_pipeline_score        # New facilities announced/under construction
)
```

### Defense Concentration Risk (0-100, per region)

```
defense_concentration = (
    0.40 * contract_hhi_by_region +        # HHI of defense contracts by geography
    0.30 * sole_source_percentage +         # % of contracts with single viable supplier
    0.30 * critical_facility_density        # How many critical facilities in one area?
)
```

### International Comparison Index

For key metrics, show U.S. position relative to China, South Korea, Japan, Germany, India:
- Manufacturing value added (World Bank)
- Shipbuilding output (UNCTAD)
- Capacity utilization (FRED vs. equivalents where available)

Not a single score — a set of comparative metrics that tell the story.

---

## Key Limitations

1. **Sub-tier suppliers are invisible.** USAspending only tracks prime contractors. The DoD's internal tools (Advana/SCREEn) have sub-tier data but it's not public. We can show prime contractor concentration but not the full supply chain depth.

2. **Munitions data is approximate.** Production rates come from press reports and congressional testimony, not official databases. Confidence levels vary. Some data is classified.

3. **Census data lags 2 years.** The latest ASM data is typically for 2 years prior. FRED and BLS are more current (monthly).

4. **Reshoring announcements ≠ completed projects.** Many announced megaprojects face delays or cancellation. We track announced vs. under construction vs. operational where possible.

5. **No classified inputs.** This is a public tool built on public data. It cannot replicate what Govini or Advana see with classified feeds. It provides directional insight, not precision intelligence.
