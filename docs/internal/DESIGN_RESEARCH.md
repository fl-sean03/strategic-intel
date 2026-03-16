# Design Research: Patterns from Open-Source OSINT Dashboards

Compiled from deep analysis of WorldMonitor (37K stars), CrisisMap, ShadowBroker (2.1K stars), Kepler.gl (11.6K stars), and Internet Infrastructure Map.

---

## What We Should Borrow (Priority Order)

### 1. Layer Registry System (from WorldMonitor)

Replace ad-hoc layer management with a config-driven registry:

```typescript
interface LayerDefinition {
  id: string;
  label: string;
  description: string;
  lens: LensId;               // which lens owns this layer
  defaultVisible: boolean;
  supportedProjections: ('globe' | 'mercator')[];
  minZoom?: number;            // hide below this zoom
  renderFn: string;            // method name on MapView
}

const LAYER_REGISTRY: LayerDefinition[] = [
  { id: 'mineral-choropleth', label: 'Production Dominance', lens: 'metals-mining', ... },
  { id: 'mineral-arcs', label: 'Trade Flows', lens: 'metals-mining', ... },
  { id: 'defense-contracts', label: 'DoD Spending by State', lens: 'manufacturing', ... },
  { id: 'shipyard-points', label: 'Shipyards', lens: 'manufacturing', ... },
  { id: 'submarine-cables', label: 'Undersea Cables', lens: 'logistics', ... },
  // ...
];
```

Store visibility in localStorage: `strategic-intel-layers → { [layerId]: boolean }`

### 2. deck.gl ArcLayer for Supply Chain Flows (from Kepler.gl)

Already installed (`@deck.gl/layers` v9.2.11). Use for:
- Mineral trade flows (country → country arcs, colored by risk)
- Defense supply chain (manufacturer → base)
- Submarine cables (when logistics module ships)

```typescript
new ArcLayer({
  data: tradeFlows,
  getSourcePosition: d => [d.source_lon, d.source_lat],
  getTargetPosition: d => [d.dest_lon, d.dest_lat],
  getSourceColor: d => getRiskRGBA(d.risk),
  getWidth: d => Math.log(d.volume) * 2,
  greatCircle: true,
  numSegments: 100,
  pickable: true,
});
```

### 3. Cascade/Disruption Analysis (from WorldMonitor)

BFS graph traversal with 3-hop max:

```
impact = edge.strength × disruption × (1 - redundancy)
```

Hard-code strategic chokepoint dependencies:
- Strait of Malacca → CN (0.6), JP (0.5), KR (0.5)
- Suez Canal → DE (0.6), CN (0.4)
- Taiwan Strait → Global semiconductors (0.9)
- Strait of Hormuz → JP (0.7), KR (0.6), IN (0.5)

### 4. CSS Variable Theme System (from CrisisMap)

Our current light theme is good but should use CSS variables for consistency:

```css
:root {
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f1f3f5;
  --border: #e2e4e8;
  --text-primary: #1a1a2e;
  --text-secondary: #6b7280;
  --accent-navy: #1E3A5F;
  --risk-critical: #DC2626;
  --risk-high: #D97706;
  --risk-moderate: #2563EB;
  --risk-low: #059669;
}
```

### 5. Fault-Isolated Data Loading (from CrisisMap)

```typescript
const results = await Promise.allSettled(
  sources.map(s =>
    Promise.race([
      s.fetch(),
      new Promise((_, reject) => setTimeout(() => reject('timeout'), 10_000))
    ])
  )
);
// One broken source doesn't kill the dashboard
```

### 6. Static Data in TypeScript (from WorldMonitor)

Ship reference data as `.ts` files, not JSON. Benefits:
- Type-safe at compile time
- Tree-shakeable (unused data stripped)
- No runtime JSON.parse overhead

Example: shipyard locations, chokepoint coordinates, NAICS codes → all as typed constants.

---

## Color System (Synthesized from All Sources)

### Sequential Risk (for choropleth intensity)
```
#dbeafe → #3b82f6 → #f59e0b → #ef4444 → #991b1b
(Light blue → Blue → Amber → Red → Dark red)
```
Already implemented. Matches industry standard.

### Threat Severity (for events/alerts)
```
Critical: #DC2626 (red)
High:     #D97706 (amber)
Medium:   #2563EB (blue)
Low:      #059669 (green)
Info:     #94A3B8 (slate)
```
Already implemented.

### Infrastructure Colors (for future layers)
```
Submarine cables:  #00c8ff (cyan)     — fault: #ff3232, degraded: #ffa500
Military bases:    #0096ff (blue)
Ports:             #10b981 (emerald)
Power plants:      #8b5cf6 (violet)
Shipping lanes:    #06b6d4 (cyan-500)
```

### Country Risk
```
Adversary:  #DC2626 (red)     — CN, RU, IR, KP
Allied:     #2563EB (blue)    — JP, KR, AU, GB, DE, FR
Neutral:    #94A3B8 (slate)   — everyone else
U.S.:       #1E3A5F (navy)
```

---

## UX Patterns to Adopt

### Panel Layout (WorldMonitor pattern)
- Floating panels over full-screen map (already doing this)
- Panels resizable via drag (CSS grid spans, localStorage persistence)
- 80px per grid row step, max 4 rows
- Content debounced at 150ms to prevent DOM thrash

### Sidebar (CrisisMap pattern)
- Scrollable entity list with search + category filters
- Region quick-select buttons (horizontal pill bar)
- Count badge on panel header
- Collapsible with localStorage memory

### Map Interactions (ShadowBroker pattern)
- Imperative MapLibre updates (bypass React reconciliation for perf)
- Viewport culling: only render what's visible
- Bounding box filtering with 20% padding
- Cluster at low zoom, individual markers at high zoom

### Detail Panel (synthesized)
- Slide up from bottom (already doing this)
- Max 40vh height, scrollable
- Close on click-away or X button
- Shows: entity name, key metrics, cross-sector links, data source attribution

---

## Data Format Standards

All tools converge on these conventions:
- **Coordinates:** `[longitude, latitude]` (GeoJSON order)
- **Country codes:** ISO 3166-1 alpha-2
- **Dates:** ISO 8601
- **Risk scores:** 0-100 (normalized)
- **Colors:** RGBA arrays `[r, g, b, a]` for deck.gl, hex strings for CSS

---

## What NOT to Borrow

1. **Dark theme** — We're light theme (decision tool, not threat monitor). Keep it.
2. **Real-time polling** — Our data is structural, not event-driven. Static JSON is correct.
3. **Redux** (Kepler.gl) — Overkill. Zustand or just React state is fine.
4. **Vanilla TS** (WorldMonitor) — We're already in Next.js/React. Switching gains nothing.
5. **ML clustering** (WorldMonitor) — We don't have news feeds to cluster.
6. **AIS WebSocket** (ShadowBroker) — No real-time ship tracking needed.

---

## Implementation Priority

### Now (this session)
- [ ] Add deck.gl ArcLayer for mineral trade flow arcs
- [ ] Add U.S. state boundaries for manufacturing data
- [ ] Layer toggle checkboxes in sidebar

### Next session
- [ ] Infrastructure cascade analysis (disruption scenarios)
- [ ] Timeline slider for year-over-year evolution
- [ ] Submarine cable data (TeleGeography GeoJSON)
- [ ] Resizable panels with localStorage persistence

### Future
- [ ] Full layer registry system
- [ ] Kepler.gl-style layer config panel
- [ ] GeoPolRisk governance indicators integration
- [ ] Export datasets publicly (like Internet Infrastructure Map)
