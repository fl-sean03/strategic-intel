# Technology & R&D Module

This module maps where defense innovation dollars flow, who's building dual-use technology, and how the U.S. compares to China across critical technology domains. The data tells a stark story: China led in just 3 of 64 critical technologies in 2003-2007 but now leads in 57 of 64 (ASPI Critical Technology Tracker, 2025).

---

## What This Module Shows

### 1. SBIR/STTR Innovation Geography

Where defense innovation funding goes — geographically and by technology area.

**Key data points:**
- Every SBIR/STTR award since program inception (SBIR.gov API)
- Per award: firm name, city, state, zip, award amount, agency, abstract, keywords, phase, year
- DoD accounts for $5.6B of $6.3B total SBIR/STTR spending (91%)
- 3,230 businesses received awards in FY2023
- Phase breakdown: Phase I (4-5%), Phase II (35-40%), Phase III (55-60%)

**CRITICAL NOTE (Oct 2025):** SBIR/STTR program authorization expired effective October 1, 2025. New activity paused. The INNOVATE Act (S. 4715) was introduced to reauthorize and reform the program. Check current status before building this pipeline — historical data is still available but new awards may be frozen.

**National security angle:**
- Geographic concentration of defense innovation (which states/metros get the most DoD SBIR dollars?)
- Innovation desert identification (25 states with fewest awards — the INNOVATE Act targets these)
- Technology area concentration (which keywords/topics get the most funding?)
- Pipeline health: are Phase I awards converting to Phase II and Phase III?

**Visualize as:**
- Heatmap of SBIR awards by state/metro (sized by dollar amount)
- Treemap by agency (Army, Navy, Air Force, DARPA, MDA, etc.)
- Technology keyword clusters (what DoD is investing in)
- Time series: funding trends by technology area

### 2. Defense Contract R&D Spending

Track where DoD R&D money goes using USAspending data filtered to RDT&E (Research, Development, Test & Evaluation) accounts.

**DoD R&D budget structure (Budget Activity codes):**
- **6.1** — Basic Research (~$2.7B)
- **6.2** — Applied Research (~$6.5B)
- **6.3** — Advanced Technology Development (~$7.8B)
- **6.4** — Advanced Component Development & Prototypes (~$19B)
- **6.5** — System Development & Demonstration (~$22B)
- **6.6** — RDT&E Management Support (~$10B)
- **6.7** — Operational Systems Development (~$35B)
- Total DoD RDT&E: ~$104B (FY2025 request)

**Data sources:**
- USAspending API: filter by Treasury Account Symbol for RDT&E appropriations
- DoD Comptroller budget justification books (PDFs, per service/agency)
- DARPA programs database (darpa.mil/research/programs — filterable by topic and office)

**Visualize as:**
- Budget flow diagram: Congress → Service/Agency → Contractor → Geography
- R&D spending by recipient (which companies get the most?)
- Geographic distribution of R&D contracts
- DARPA program map (active programs by technology area)

### 3. Patent Activity in Dual-Use Technologies

Track patent filings in defense-relevant technology areas using USPTO's PatentsView API.

**Key technology areas (CPC classification codes):**
- **F41/F42** — Weapons, munitions, blasting
- **B64** — Aircraft, aviation, cosmonautics
- **H04** — Electric communication technique (radar, comms)
- **G01S** — Radio direction-finding, radar, sonar
- **G06N** — Computing arrangements based on specific models (AI/ML)
- **H01L** — Semiconductor devices
- **G21** — Nuclear physics, nuclear engineering
- **C22** — Metallurgy, alloys
- **B22F** — Additive manufacturing (3D printing metals)
- **H02** — Generation/conversion/distribution of electric power

**National security angle:**
- U.S. vs. China patent output in critical technology areas
- Geographic clusters of defense-relevant innovation
- University vs. corporate vs. government lab patent activity
- Trend lines: is the U.S. losing patent share in key areas?

**Visualize as:**
- Choropleth of patent filings by state (in defense-relevant CPC codes)
- U.S. vs. China patent comparison bar charts by technology area
- Time series showing patent share trends
- Innovation cluster map (metros with highest defense-patent density)

### 4. Critical Technology Competition (U.S. vs. China)

The ASPI Critical Technology Tracker provides the most comprehensive public assessment of technology leadership across nations.

**Key findings (2025 update, 74 technologies tracked):**
- China leads in **66 of 74** technologies (up from 3 of 64 in 2003-2007)
- U.S. leads in **8** areas: quantum computing, geoengineering, vaccines/medical countermeasures, atomic clocks, and others
- **24 technologies** classified as "high risk" of Chinese monopoly (up from 14)
- High-risk defense technologies: radar, advanced aircraft engines, drones, swarming/collaborative robots, satellite positioning and navigation
- Chinese government invested an estimated **$900 billion** in AI, quantum, and biotech over the past decade — 3x U.S. government support

**U.S. vs. China by domain:**

| Domain | U.S. Position | China Position | Key Metric |
|--------|--------------|----------------|------------|
| **AI** | Leads in frameworks, cloud | Leads in applied/physical AI, robotics deployment | DeepSeek R1 rivaled OpenAI o1; China AI compute grew 28% CAGR 2020-2024 |
| **Semiconductors** | Leads in design, advanced manufacturing | Leads in investment volume ($26B+ on litho tools in 2024) | CHIPS Act: $52.7B committed |
| **Quantum Computing** | U.S. leads by 10%+ | China leads quantum communications (10,000km network, 145 nodes, 17 provinces) | Different strengths: computing vs. comms |
| **Hypersonics** | Behind | China 20x more flight tests than U.S.; 700+ papers vs. U.S. 207 (2017) | Critical gap, MDA requested $200.6M for defense FY2026 |
| **Space** | Leads launch cadence (SpaceX) | Closing fast (92 launches in 2025, +35% YoY) | See TELECOM.md |
| **Biotech** | Strong academic base | Patent filings now surpass U.S. in several subfields | China govt spent ~$900B on AI/quantum/bio over 10 years |
| **Advanced Materials** | Strong academic | ASPI classifies among 24 "high risk" for Chinese monopoly | Both strong, different stages |

**Key numbers:**
- China AI publications: 36% of global output (41,200 papers/yr) vs. U.S. 12% (28,400/yr) — but U.S. has 4.2 vs. 2.8 citation quality advantage
- GPU gap: U.S. 39.7M H100-equivalents vs. China 400K
- 68% of Chinese AI PhDs relocate to U.S. ($185K vs. $67K salary)
- China graduates 3x as many computer scientists annually
- SMIC producing 7nm chips rivaling TSMC 5nm; gap estimated ~3 years
- Global semiconductor capacity: Taiwan 35%, China 23%, U.S. 13%
- China quantum communications network: 10,000km, 145 nodes, 17 provinces — far ahead of any country

**Data sources:**
- ASPI Critical Technology Tracker: `https://techtracker.aspi.org.au/` (74 technologies, interactive)
- SCSP 2025 Gaps Analysis: `https://www.scsp.ai/reports/2025-gaps-analysis/` (12+ tech areas)
- CSET Country Activity Tracker: `https://cset.georgetown.edu/publication/country-activity-tracker/` (AI metrics by country)
- OECD.AI Policy Observatory: `https://oecd.ai/en/` (publications, R&D, patents, investments for 70+ countries)
- Recorded Future U.S.-China AI Gap: `https://www.recordedfuture.com/research/measuring-the-us-china-ai-gap`

**Visualize as:**
- Scorecard showing U.S. vs. China leadership by technology area
- Trend chart: technology areas where China's lead is growing vs. shrinking
- "High risk" technologies highlighted (24 at risk of Chinese monopoly)

### 5. Defense Innovation Ecosystem

Map the organizations that bridge lab-to-deployment:

**Innovation units:**
- **DARPA** — Advanced research ($4.1B FY2025 budget, ~250 programs)
- **DIU (Defense Innovation Unit)** — Commercial tech adoption, OTA contracts
- **AFWERX** — Air Force innovation arm, SBIR/STTR management
- **SpaceWERX** — Space Force innovation, STRATFI/TACFI programs
- **NavalX** — Navy innovation hub
- **CDAO** — Chief Digital and AI Office
- **SCO** — Strategic Capabilities Office

**DIU impact metrics:**
- $4.9B+ in production contracts generated
- 48 portfolio companies backed by $20B in private investment
- 51% prototype-to-production transition rate
- Focus areas: AI/ML, Autonomy, Cyber, Human Systems, Energy, Space
- Contracting model: Commercial Solutions Opening (CSO) via Other Transaction Authority (OTA)

**Data availability:**
- DARPA: filterable programs database at darpa.mil/research/programs; budget justification PDFs
- DIU: portfolio companies listed on diu.mil/latest; OTA contract data in USAspending
- AFWERX/SpaceWERX: SBIR/STTR awards in SBIR.gov database
- All: contract data in USAspending (search by awarding sub-agency)
- MITRE AiDA ecosystem map: `https://aida.mitre.org/demystifying-dod/innovation-ecosystem/`

### Defense Tech VC Landscape

VC deals in defense tech hit **$49.1B in 2025** (up from $27.2B in 2024, per PitchBook).

| Investor | Type | Focus |
|----------|------|-------|
| In-Q-Tel | CIA venture arm | Dual-use national security tech |
| a16z | VC | "American Dynamism" practice |
| Founders Fund | VC | Autonomy, AI, space |
| Lockheed Martin Ventures | Corporate VC | Strategic defense tech |
| Point72 Deterrence Fund | Hedge fund VC | National security |
| Shield Capital | VC | Defense & national security |
| Lux Capital | VC | Deep tech, hard tech |
| DTX Ventures | VC | "Technologies that define global power" |

17,619 dual-use tech scaleups across NATO countries (35% U.S.-based). 54 VC funds globally invest in dual-use (48% U.S.-based).

**Data sources:**
- OpenVC Defense Tech Investor List: `https://www.openvc.app/investor-lists/defensetech-investors` (free)
- Mind the Bridge 2025 Dual-Use Report: `https://mindthebridge.com/dual-use-technologies-2025-report/`
- PitchBook Defense Tech VC Trends (subscription)
- Crunchbase Defense Tech Snapshot (partial free)

**Visualize as:**
- Map of innovation unit portfolios (which companies, where)
- Funding flows: which innovation units → which companies → which locations
- Technology focus area comparison across units
- Defense tech VC investment by year (bar chart showing growth)
- Geographic heatmap of dual-use startups

### 6. National Laboratory R&D

The 17 DOE national laboratories are a critical but often overlooked part of the technology base.

**Key labs and defense relevance:**
| Lab | Location | Annual Budget | Defense Relevance |
|-----|----------|--------------|-------------------|
| Los Alamos (LANL) | NM | ~$4.5B | Nuclear weapons, HPC, advanced materials |
| Lawrence Livermore (LLNL) | CA | ~$3.5B | Nuclear weapons, laser/directed energy, HPC |
| Sandia (SNL) | NM/CA | ~$4.1B | Nuclear weapons engineering, microsystems |
| Oak Ridge (ORNL) | TN | ~$2.8B | Advanced materials, manufacturing, neutron science |
| Pacific Northwest (PNNL) | WA | ~$1.5B | Cybersecurity, nuclear materials, chemistry |
| Argonne (ANL) | IL | ~$1.2B | Nuclear engineering, advanced computing |
| Idaho (INL) | ID | ~$2.0B | Nuclear energy, critical infrastructure |

**Data sources:**
- DOE budget justification documents (energy.gov)
- NNSA budget request (FY2026: ~$25B total)
- NSF Survey of Federal Funds for R&D (ncses.nsf.gov) — comprehensive R&D funding by agency
- Lab annual reports (public)

**Visualize as:**
- Map of all 17 DOE labs with budget/focus area
- NNSA weapons complex overview
- Comparison: DOE lab R&D vs. DoD intramural R&D vs. university R&D

---

## Data Sources — Technology & R&D Module

### Primary APIs (Free)

**1. SBIR/STTR API**
- Endpoint: `https://api.www.sbir.gov/public/api/awards.json`
- Auth: None
- Fields: firm, award_title, agency, branch, phase, program, award_year, award_amount, duns, uei, hubzone_owned, socially_economically_disadvantaged, women_owned, number_employees, city, state, zip, pi_name, research_area_keywords, abstract, award_link
- Filter by: agency (DOD, DARPA, etc.), state, year, keyword, phase
- Also: `https://www.sbir.gov/api/awards.json?keyword=hypersonics&agency=DOD`
- Solicitations endpoint: `https://api.www.sbir.gov/public/api/solicitations`
- Company endpoint: `https://api.www.sbir.gov/public/api/companies`
- Pagination: default 100 rows, adjust with `?rows=400`, offset with `?start=100`
- **Bulk CSV with abstracts** (~290 MB): `https://data.www.sbir.gov/awarddatapublic/award_data.csv`
- **Bulk without abstracts** (~65 MB): from `https://www.sbir.gov/data-resources`
- Status: API noted as "undergoing maintenance" — availability may be intermittent
- Note: Check program reauthorization status (expired Oct 2025)

**2. USPTO PatentsView API**
- Current endpoint: `https://search.patentsview.org/api/v1/patent/` (v1 — legacy deprecated May 2025)
- Auth: API key required in header `X-Api-Key: {your_key}`. Request at PatentsView service desk.
- POST body: JSON query with criteria (assignee, CPC code, date range, location)
- Fields: patent_number, patent_title, patent_date, patent_abstract, assignee, inventor, cpc_code, inventor_city, inventor_state, inventor_country, lat/lon
- Rate limit: 45 requests/minute per key. Do NOT use multiple keys simultaneously.
- 7 endpoints: patent, assignee, inventor, cpc_group, cpc_subgroup, location, application
- CPC class search: `https://search.patentsview.org/api/v1/cpc_group/`
- Geographic mapping: PatentsView assigns lat/lon using OSMNames database
- USPTO metro/county patent reports: `https://www.uspto.gov/web/offices/ac/ido/oeip/taf/reports_cbsa.htm`
- **CRITICAL**: PatentsView migrates to USPTO Open Data Portal (`data.uspto.gov`) on **March 20, 2026**. Target new endpoint.

**3. USAspending API (R&D-specific queries)**
- Same API as Manufacturing module: `https://api.usaspending.gov/api/v2/`
- Filter by: Treasury Account Symbol for RDT&E, Budget Function code 050 (National Defense)
- Key endpoint: `/search/spending_by_award/` with filters for R&D contracts
- Also: bulk download by fiscal year at files.usaspending.gov

**4. NSF NCSES Data**
- Federal Funds for R&D survey: `https://ncses.nsf.gov/surveys/federal-funds-research-development`
- Interactive tables: `https://ncsesdata.nsf.gov/ids/`
- Data by agency, performer type (industry, university, government lab), character of work (basic, applied, development)
- Format: CSV/Excel downloads, interactive data explorer
- Update: Annual

### Secondary Sources (Manual / Periodic)

**5. ASPI Critical Technology Tracker**
- URL: `https://www.aspi.org.au/report/critical-technology-tracker/`
- Interactive tool: `https://techtracker.aspi.org.au/`
- 74 technologies tracked across 10 categories
- Data: research output (top 10% cited papers), patent filings, talent flows
- Update: Annual (2025 is latest)
- Note: Data methodology uses Scopus publication data; interactive tool allows country-by-country comparison

**6. DARPA Programs Database**
- URL: `https://www.darpa.mil/research/programs`
- Filterable by office (DSO, MTO, I2O, etc.) and research topic
- No API — scrape or manual extraction
- Budget justification books: `https://comptroller.war.gov/` → Budget Materials → RDT&E Vol 1 DARPA

**7. DIU Portfolio**
- URL: `https://www.diu.mil/`
- Portfolio companies and OTA contracts listed
- No structured API — extract from website + USAspending OTA contract data

**8. DOE Lab Budgets**
- DOE budget justifications: `https://www.energy.gov/cfo/budget-justification-supporting-documents`
- NNSA budget: included in DOE budget, also at `https://www.energy.gov/nnsa/budget`
- Individual lab annual reports (public, per-lab websites)

**9. SSTI (State Science & Technology Institute)**
- URL: `https://ssti.org/`
- Produces SBIR treemaps and state-level analysis
- Not an API — reports and visualizations

### Reference / Context

**10. Congressional Research Service Reports**
- R43695: Small Business Research Programs: SBIR and STTR
- R46458: Defense Primer: Research, Development, Test & Evaluation
- Available at: `https://crsreports.congress.gov/`

**11. RAND / CSIS Technology Assessments**
- RAND: `https://www.rand.org/topics/science-and-technology-policy.html`
- CSIS Technology Policy: `https://www.csis.org/programs/strategic-technologies-program`
- Periodic reports on U.S.-China technology competition

### Useful GitHub Repos

| Repo | URL | Use |
|------|-----|-----|
| `mt-digital/contracts` | github.com/mt-digital/contracts | Parse DoD daily contract announcements to JSON |
| `bsweger/usaspending-scripts` | github.com/bsweger/usaspending-scripts | Python scripts for USAspending data |
| `makegov/awesome-procurement-data` | github.com/makegov/awesome-procurement-data | Curated federal procurement data list |
| `fedspendingtransparency/usaspending-api` | github.com/fedspendingtransparency/usaspending-api | Full USAspending API source code |
| `rovertm/sbir_analysis` | github.com/rovertm/sbir_analysis | NLP analysis of SBIR solicitations |
| `georgetown-cset` | github.com/georgetown-cset | CSET data tools and publications |
| `deptofdefense` | github.com/deptofdefense | 63 DoD open-source repos |

---

## Scoring Methodology — Technology & R&D

### Innovation Concentration Score (0-100, per technology area)

```
innovation_concentration = (
    0.35 * sbir_geographic_hhi +        # HHI of SBIR awards by state
    0.25 * patent_geographic_hhi +       # HHI of patents by state
    0.20 * contractor_hhi +              # HHI of R&D contract dollars by firm
    0.20 * lab_concentration              # How many labs work on this area
)
```

Higher score = more concentrated = higher risk. If all AI SBIR awards go to 3 states, that's a vulnerability.

### Technology Leadership Score (0-100, U.S. position per technology)

Based on ASPI Critical Technology Tracker data:
```
leadership_score = (
    0.40 * research_output_share +       # U.S. share of top 10% cited papers
    0.30 * patent_share +                # U.S. share of patents in this area
    0.20 * talent_share +                # U.S. share of top researchers
    0.10 * funding_trend                 # Is U.S. investment increasing or decreasing?
)
```

### Key Metrics to Highlight

| Metric | Value | Source |
|--------|-------|--------|
| DoD RDT&E budget (FY2025 enacted) | $143.7B | DoD Comptroller |
| DoD S&T (6.1-6.3) FY2025 | $21.3B | DoD Comptroller |
| DARPA budget (FY2025) | ~$4.1B | DARPA |
| NNSA budget (FY2026 request) | $30.0B (+25%) | DOE |
| NNSA Weapons Activities (FY2026) | $24.9B (+29%) | DOE |
| Defense tech VC deals (2025) | $49.1B (+81% YoY) | PitchBook |
| Total SBIR/STTR spending | $6.3B (FY2023) | SBA |
| DoD share of SBIR/STTR | 91% ($5.6B) | SBA |
| Technologies where China leads | 66 of 74 | ASPI 2025 |
| Technologies where U.S. leads | 8 of 74 | ASPI 2025 |
| High-risk (Chinese monopoly) technologies | 24 | ASPI 2025 |
| China govt investment in AI/quantum/bio (10yr) | ~$900B | ASPI/ITIF estimates |
| DOE national laboratories | 17 | DOE |

---

## Key Limitations

1. **SBIR program may be frozen.** Authorization expired Oct 2025. Historical data available but new awards paused. Check reauthorization status.
2. **Patent data ≠ capability.** Patents filed don't always translate to deployed technology. China files many patents that may not represent breakthrough capability. Use as a proxy, not a measure.
3. **ASPI tracker uses research output as proxy.** Top 10% cited papers is a good but imperfect measure of technology leadership. Doesn't capture classified research, manufacturing capability, or deployment readiness.
4. **Classified programs invisible.** The most sensitive defense R&D (black programs, SAPs) won't appear in any public data. This module shows the unclassified innovation landscape only.
5. **DARPA data is unstructured.** No API — program data must be extracted from website and budget PDFs. Budget justification books are dense PDFs, not machine-readable.
6. **DIU/AFWERX/SpaceWERX contract data is scattered.** Some in USAspending under OTA (Other Transaction Authority), some not. Coverage is incomplete.
7. **NSF R&D survey lags.** Federal Funds for R&D data is typically 2 years behind. Use for structural trends, not current-year analysis.
