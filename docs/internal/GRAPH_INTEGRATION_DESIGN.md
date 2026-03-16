# Knowledge Graph Integration — How It Works

## Three Layers of Information

For any relationship (e.g., Gallium ↔ F-35):

```
Layer 1: Graph Edge (summary)
  "GaN/GaAs in AESA radar (AN/APG-81)"
  → Stored in: graph/relationships.json
  → Used for: Quick display in lists, cross-navigation

Layer 2: Entity Detail (structured data)
  F-35 material_details["Gallium"] = full role description
  → Stored in: defense-programs.json (on the program entity)
  → Used for: Defense tab deep detail

Layer 3: Intelligence Context (research)
  "11,000 defense parts require gallium, AN/SPY-6, F-35..."
  → Stored in: intelligence/minerals/gallium.json
  → Used for: Intel tab findings, sourced analysis
```

## How Tabs Should Work

### Defense Tab (viewing Gallium)
1. Query graph: `getIncoming('mineral/gallium', 'required_by')` → 9 programs
2. For each program, show:
   - Program name + type (from graph entity)
   - Edge detail: "GaAs in AESA radar" (from graph relationship)
   - Full material_details (from defense-programs.json, looked up by program ID)
3. This is EXACTLY what the current tab shows — same data, just routed through the graph

### Investments Tab (viewing Gallium)
1. Query graph: `getIncoming('mineral/gallium', 'funds')` → investments
2. For each investment, show full investment data (from investments.json, by ID)

### Supply Chain Tab (viewing Gallium)
1. USGS data stays (production stages from metals-mining.json)
2. Graph adds: `getIncoming('mineral/gallium', 'produces')` → countries with shares
3. Supply chain notes add: U.S. producer details

### The Key Insight
The graph doesn't replace any data — it CONNECTS it. The existing tabs keep all their rich detail. The graph just makes it possible to:
- Navigate: click F-35 from Gallium → see F-35's full profile
- Traverse: F-35 needs 33 minerals → which have supply chain risk?
- Discover: "What else is connected to this?"

## Implementation: Minimal Change, Maximum Value

The simplest integration that adds real value:

1. Load graph data once in page.tsx (alongside everything else)
2. Pass graph data to DetailPanel
3. In each tab, OPTIONALLY use graph queries to supplement existing data
4. Add cross-navigation: clicking any entity name in any tab navigates to it

This means:
- Existing tabs continue to work exactly as they do now
- Graph data enables cross-entity clicking (the main UX improvement)
- No data is lost or moved
- Future tabs/features can query the graph for new views
