# User Experience Design

## Design Philosophy

**Light, confident, professional.** This is a tool for people deploying capital and making policy decisions, not a dark-mode threat monitor for doomscrolling. Think Bloomberg Terminal meets Apple's design language. Clean enough to screenshot and drop into a briefing deck.

---

## Visual Identity

### Color System
- **Background:** White (#FFFFFF) or warm off-white (#FAFAFA)
- **Text:** Near-black (#1A1A2E) for primary, slate gray (#64748B) for secondary
- **Risk colors (data visualization):**
  - Critical: Deep red (#DC2626)
  - High: Amber (#D97706)
  - Moderate: Blue (#2563EB)
  - Low: Green (#059669)
  - Neutral: Slate (#94A3B8)
- **Accent:** Navy blue (#1E3A5F) — professional, trustworthy, defense-adjacent without being militaristic
- **Map base tiles:** Carto Positron (free, light cartography, no API key)

### Typography
- **Headings:** Inter (clean, professional sans-serif)
- **Body:** Inter or system sans-serif stack
- **Data/numbers:** Tabular figures (monospace numerals for alignment in tables)
- No decorative fonts. No all-caps headings. Understated and legible.

### General Aesthetic
- Generous whitespace
- Subtle shadows and borders (not flat, not skeuomorphic)
- No gradients on data elements (colors must be semantically meaningful)
- Minimal animation (map transitions yes, gratuitous motion no)
- Mobile-responsive but desktop-first (this is a work tool)

---

## Page Structure

### Landing Page (`/`)

The user lands and immediately sees a map. Not a hero image — the actual interactive map, gently animated (slow rotation if globe view, or subtle data pulse if flat).

**Above the map — one sentence:**
> "The U.S. cannot project shortfalls for nearly half of materials critical to national security, has mapped less than 10% of its sub-tier supplier relationships, and produces 1/300th the ships China does. This tool maps the gaps."

**Below the map — three to five headline stats:**
- **60** critical minerals tracked
- **$200B** in federal capital being deployed
- **34 of 60** minerals dominated by a single country
- **1/300th** U.S. shipbuilding output vs. China
- **77.3%** manufacturing capacity utilization (vs. 80%+ healthy threshold)

**Call to action:** "Explore the map" → takes user to `/explore`

The landing page is a hook. It should make someone go "I didn't know that" within 5 seconds.

---

### Explore Page (`/explore`) — The Core Experience

This is where users spend 90% of their time. Full-screen map with a thin control bar.

#### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  [Industrials] [Energy] [Logistics] [Metals & Mining] [All]  │  ← Lens tabs
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ SIDEBAR  │                    MAP                            │
│          │                                                   │
│ Ranked   │   MapLibre GL base (Carto Positron)               │
│ list of  │   + deck.gl data overlays                         │
│ entities │                                                   │
│          │   (facilities, mines, trade arcs,                  │
│ Search   │    chokepoints, risk regions...)                   │
│ bar      │                                                   │
│          │                                                   │
│ Filters  │                                                   │
│          │                                                   │
├──────────┴───────────────────────────────────────────────────┤
│  DETAIL PANEL (slides up from bottom on entity click)         │
│  Shows: entity name, key metrics, risk scores, related items  │
└──────────────────────────────────────────────────────────────┘
```

#### Lens Switching
Each lens tab changes what data is overlaid on the map:

**Industrials lens:**
- Dots: manufacturing facilities (sized by employment or output)
- Colors: capacity utilization (green = healthy, red = strained or idle)
- Density overlay: defense contract concentration by region
- Callouts: shipyards (with capacity stats), munitions plants, key defense facilities

**Energy lens:**
- Dots: power plants (colored by fuel type: nuclear=purple, gas=orange, solar=yellow, wind=teal)
- Lines: major transmission corridors
- Regions: grid reliability zones
- Overlay: battery manufacturing facilities

**Global Logistics lens:**
- Lines: major shipping lanes (thickness = traffic volume)
- Dots: ports (sized by throughput)
- Highlighted zones: chokepoints (Suez, Malacca, Panama, Hormuz)
- Callouts: U.S. shipyards and merchant marine bases

**Metals & Mining lens:**
- Choropleth: production concentration by country
- Dots: U.S. mines and processing facilities (from MSHA)
- Arcs: trade flows for selected mineral (deck.gl ArcLayer)
- Colors: risk level (red = critical, amber = high, green = low)

**All (composite) lens:**
- Aggregate "industrial health" score by country or U.S. region
- Highlights only the highest-risk items across all sectors
- The "executive summary" view

#### Sidebar Behavior
- Shows a ranked list of entities in the current lens
- Sorted by risk score (highest risk first) by default
- Each row: entity name, score badge (colored), one-line summary, country flag
- Click a row → map pans to that entity, detail panel opens
- Search bar at top: type "tungsten" or "shipbuilding" or "Texas" to filter
- Collapsible on mobile

#### Detail Panel Behavior
- Slides up from bottom of screen (like Google Maps info cards)
- Shows: entity name, type, location, key metrics, risk score breakdown
- Links to: full entity page (`/mineral/[id]`, `/facility/[id]`, etc.)
- Shows cross-sector connections: "This mineral is required by: [manufacturing sectors]"
- Dismissible (click X or click elsewhere on map)

#### Map Interactions
- **Click country** → side panel shows that country's role across all sectors
- **Click facility/mine/plant** → detail panel with specifics
- **Click mineral (from sidebar)** → map shows production choropleth + trade arcs
- **Hover** → tooltip with key stat (lightweight, not obtrusive)
- **Zoom** → at country level show national data; at state level show facility-level data
- **Toggle layers** → within a lens, toggle sub-layers (e.g., Energy lens: show/hide nuclear, show/hide transmission)

---

### Sector Deep Dive (`/sector/[id]`)

Full-page analysis for a sector, away from the map. For users who want to read and analyze rather than explore spatially.

#### Content Structure
1. **Hero stat + one-sentence summary**
   > "U.S. manufacturing capacity utilization is 77.3%, below the 80% threshold economists consider healthy. Employment has declined 33% since 1979 while output has grown, driven by automation."

2. **Key metrics dashboard** — 4-6 cards with primary numbers
   - Total facilities / employment / output
   - Capacity utilization trend (sparkline)
   - Defense contract concentration
   - International comparison (U.S. vs. China vs. allies)

3. **Sub-sector breakdown** — expandable sections for each sub-sector
   - E.g., Manufacturing: Shipbuilding, Munitions, Aerospace, Semiconductors, Automotive, Chemicals
   - Each sub-sector has its own metrics, facilities, and risk assessment

4. **Geographic distribution** — small map showing where this sector's activity is concentrated in the U.S.

5. **Cross-sector dependencies** — what this sector needs from other sectors (minerals, energy, logistics)

6. **Data sources and methodology** — transparency about where numbers come from

---

### Entity Pages (`/mineral/[id]`, `/facility/[id]`, `/country/[id]`)

Deep dive into a specific mineral, facility, or country. Structure follows the Critical Chain v1 mineral page pattern but generalized.

**Mineral page** (migrated from v1, enhanced):
- Risk score gauges, supply chain flow diagram, trade flows, defense applications
- NEW: Cross-sector dependencies ("Gallium is required by: semiconductor fabs [Technology], radar systems [Industrials/Defense]")

**Facility page** (new):
- Location, owner, sector, products, employment
- Defense contracts associated (from USAspending)
- Supply chain position (what it consumes, what it produces)

**Country page** (new):
- Role across all sectors: what it produces, processes, exports
- Adversary/allied classification
- Dependency score (how dependent is the U.S. on this country across all sectors)

---

### Compare Page (`/compare`)

Side-by-side comparison of two countries or two sectors.

- Select two entities from dropdowns
- Key metrics rendered in parallel columns
- Difference highlighted (e.g., "China builds 284x more ships than the U.S.")
- Exportable as image (for presentations)

---

### Scenarios Page (`/scenarios`)

Interactive "what if" analysis. Select a disruption and see cascading effects.

**Preset scenarios:**
- "China restricts rare earth exports"
- "Strait of Malacca blockade"
- "Major hurricane hits Gulf Coast energy infrastructure"
- "Taiwan conflict disrupts semiconductor supply"

**Custom scenario builder:**
- Select: country + sector + disruption type (export ban, conflict, natural disaster)
- See: which minerals/products affected, downstream industries impacted, estimated recovery time
- Cross-sector cascade: a Taiwan scenario affects Technology AND Metals & Mining AND Energy (battery supply)

---

### About Page (`/about`)

Methodology, data sources (with links), update frequency, limitations, contribution guide, and license.

---

## Responsive Design

- **Desktop (1200px+):** Full sidebar + map + detail panel
- **Tablet (768-1199px):** Collapsible sidebar, map fills screen, detail panel as overlay
- **Mobile (< 768px):** Map with bottom sheet navigation, sidebar becomes full-screen list view

Desktop is the primary design target. Most users will be on work laptops.

---

## Performance Targets

- **First paint:** < 1.5s (static site, CDN-cached)
- **Map interactive:** < 3s (MapLibre + initial tile load)
- **Lens switch:** < 500ms (swap JSON overlay, no network request)
- **Total data payload:** < 10MB (all sectors, gzipped)

All data ships with the static build. No API calls at runtime. Lens switching is purely client-side JSON swapping + map layer updates.
