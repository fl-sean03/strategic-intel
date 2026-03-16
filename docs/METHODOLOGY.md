# Scoring & Analysis Methodology

## Principles

1. **Transparency:** Every score is decomposable. Users can click through to see exactly which inputs produced which number.
2. **Public data only:** No classified or proprietary inputs. Anyone can reproduce the analysis.
3. **Directional, not precise:** We provide structural insight, not precision forecasting. All scores are relative rankings, not absolute predictions.
4. **Cross-sector awareness:** Scores should reflect dependencies between sectors where possible.

---

## Metals & Mining Scoring (Migrated from Critical Chain v1)

### HHI (Herfindahl-Hirschman Index)
```
HHI = Σ(market_share_i²) for all countries i
```
- Range: 0.0 (perfect competition) to 1.0 (monopoly)
- Applied per mineral per supply chain stage (mining, processing, refining)

### Concentration Risk (0-100)
```
concentration_risk = (0.25 * HHI_mining + 0.40 * HHI_processing + 0.35 * HHI_refining) * 100
```
Processing weighted highest: hardest to replicate, where China has invested most aggressively.

### Adversary Dependency (0-100)
```
adversary_share_stage = Σ(share_i) for i in {China, Russia, Iran, North Korea, ...}
adversary_dependency = (0.25 * adv_mining + 0.40 * adv_processing + 0.35 * adv_refining) * 100
```

### Single Source Risk (boolean)
```
True if any country controls >50% of any supply chain stage
```

### Overall Mineral Risk (0-100)
```
overall_risk = (0.30 * concentration_risk +
                0.25 * adversary_dependency +
                0.20 * import_dependency +
                0.15 * defense_criticality_score +
                0.10 * substitutability_penalty)
```

Full details: `../critical-chain/docs/METHODOLOGY.md`

---

## Manufacturing Health Scoring (NEW)

### Sector Health Score (0-100, per NAICS manufacturing sector)

| Component | Weight | Source | What It Measures |
|-----------|--------|--------|-----------------|
| Capacity utilization | 0.30 | FRED | Are factories running? 80%+ = healthy |
| Employment trend | 0.25 | BLS | Growing = positive (3-year trend) |
| Output trend | 0.20 | Census ASM | Value of shipments trend (3-year) |
| Geographic diversity | 0.15 | BLS/Census | HHI of employment by state — lower = more distributed |
| Investment pipeline | 0.10 | IndustrialSage/CHIPS | New facilities announced or under construction |

**Normalization:** Each component is normalized to 0-100 before weighting.
- Capacity utilization: linear scale, 60% = 0, 85% = 100
- Employment trend: -5%/yr = 0, +5%/yr = 100, 0% = 50
- Output trend: same as employment
- Geographic diversity: inverse HHI (lower concentration = higher score)
- Investment pipeline: number and value of announced projects (relative to sector size)

### Defense Concentration Risk (0-100, per geographic region)

Measures how much critical defense manufacturing is concentrated in a single area.

```
defense_concentration = (
    0.40 * contract_hhi +        # HHI of DoD contracts by geography
    0.30 * sole_source_pct +     # % of contracts with single viable supplier
    0.30 * facility_density       # Critical facility count in region / total
)
```

Higher score = more concentrated = higher risk. A region with many sole-source defense contracts is a vulnerability.

### International Manufacturing Comparison

Not a single score — a set of metrics showing U.S. position relative to key nations:

| Metric | Source | Nations Compared |
|--------|--------|-----------------|
| Manufacturing value added ($) | World Bank | US, CN, JP, DE, KR, IN |
| Manufacturing as % of GDP | World Bank | Same |
| Shipbuilding orderbook (tonnage) | UNCTAD | US, CN, KR, JP |
| Active shipyards (count) | CRS/GAO | US, CN, KR, JP |

Displayed as comparative bar charts, not composite scores. The visual gap tells the story.

---

## Energy Scoring (Future)

### Grid Resilience Score (0-100, per grid region)

Planned components:
- Generation diversity (fuel mix HHI — less concentrated = more resilient)
- Capacity reserve margin (generation capacity vs. peak demand)
- Transmission bottlenecks (known constraints)
- Fuel import dependency (uranium, natural gas source concentration)

### Battery Supply Chain Score

Overlaps with Metals & Mining:
- Lithium, cobalt, nickel, graphite, manganese supply concentration
- Domestic cell manufacturing capacity vs. imports
- Recycling capacity

---

## Logistics Scoring (Future)

### Maritime Capacity Score (0-100)

Planned components:
- Merchant fleet size (U.S. flag vessels vs. requirements)
- Shipbuilding capacity (yards, order backlog, workforce)
- Port throughput vs. capacity
- Chokepoint exposure (% of trade through Suez, Malacca, Panama, Hormuz)

---

## Cross-Sector Disruption Modeling

### Scenario Structure

A disruption scenario consists of:
1. **Trigger:** Country X restricts/loses capacity for resource Y at stage Z
2. **Direct impact:** Available supply of Y drops by N%
3. **Cascade:** Which downstream sectors depend on Y?
4. **Severity:** Based on substitutability, stockpile levels, time to develop alternatives
5. **Recovery:** Estimated time to develop alternative supply (months/years)

### Cascade Logic

Uses the cross-sector dependency graph:
```
Trigger: China restricts gallium exports
→ Direct: Gallium supply drops 98%
→ Cascade: Semiconductor fabs (Technology) lose feedstock
→ Cascade: Radar/EW systems (Industrials/Defense) lose GaAs components
→ Cascade: LED manufacturing loses substrate
→ Severity: Critical (no near-term substitutes for GaAs in defense electronics)
→ Recovery: 5-8 years (Japan/SK pilot facilities exist but not at scale)
```

### Confidence Levels

All scores and scenarios carry a confidence tag:
- **High:** Based on structured, regularly updated government data (FRED, EIA, USGS, USAspending)
- **Medium:** Based on compiled public reports and estimates (munitions rates, reshoring announcements)
- **Low:** Based on press reports, expert estimates, or extrapolation (sub-tier suppliers, stockpile adequacy)

The dashboard displays confidence alongside every metric. This is a feature, not a bug — it shows intellectual honesty and helps users calibrate their decisions.

---

## Limitations

1. **No classified data.** Cannot replicate DoD internal tools (Govini, Advana, SCREEn). Sub-tier supplier data is not available publicly.
2. **Data lag.** FRED is ~2 weeks. Census ASM is ~2 years. USGS is ~1 year. We show structural trends, not current-day status.
3. **Processing/refining data is weakest.** USGS tracks production, not processing capacity. This is the biggest blind spot in critical minerals analysis globally.
4. **Munitions data is approximate.** Production rates assembled from press reports, not official databases.
5. **Scores are relative, not absolute.** A score of 75 means "high risk relative to other entities in this dataset," not "75% probability of disruption."
6. **No demand-side modeling.** We show supply concentration but not consumption patterns or inventory levels (mostly classified for defense).
