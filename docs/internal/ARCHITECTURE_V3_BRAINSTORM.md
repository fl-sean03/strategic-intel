# Architecture v3 — Deep Brainstorm

## The Root Problem

Every data display bug we've fixed has the same root cause: **manual wiring between entity types and rendering paths.**

Current flow:
```
User clicks sidebar item
  → Sidebar sets (type, id) — MANUALLY coded per entity type
  → page.tsx routes to DetailPanel — MANUALLY handles each type
  → DetailPanel picks tabs — MANUALLY configured per type
  → Each tab fetches data — MANUALLY knows which file to read
  → Intel tab passes category — MANUALLY specified (often WRONG)
```

12+ entity types × 5 rendering decisions = 60+ manual connection points. Every one is a potential bug.

## Why Patching Fails

Every new entity type requires changes in:
1. `page.tsx` — selectedItem type union, handleItemClick, handleSearchSelect
2. `Sidebar.tsx` — list component, click handler, display logic
3. `DetailPanel.tsx` — type switch, tab config, data lookup, rendering
4. Each tab component — props, data filtering
5. `MapView.tsx` — layers, hover handlers
6. `LayerControls.tsx` — toggle config
7. `GlobalSearch.tsx` — search function, type labels

That's 7 files for every new entity type. Miss one → broken pipe.

## The Correct Solution

### Principle: Derive Everything from the Entity ID

An entity ID like `mineral/gallium` contains TWO pieces of information:
- **Type**: `mineral` — determines display pattern
- **ID**: `gallium` — determines which data to fetch

From these two pieces, EVERYTHING should be derivable:
- Intel report path: `/data/intelligence/minerals/gallium.json`
- Graph connections: filter relationships where from/to contains `mineral/gallium`
- Structured data: look up in `metals-mining.json` by id `gallium`
- Available tabs: determined by what data exists
- Display config: name, icon, color from entity registry

### Component: Entity Registry

One file that defines all entity types:

```typescript
// lib/entityRegistry.ts
const ENTITY_REGISTRY: Record<string, EntityTypeConfig> = {
  mineral: {
    dataFile: 'metals-mining.json',
    dataPath: (data, id) => data.minerals?.find(m => m.id === id),
    intelCategory: 'minerals',
    graphPrefix: 'mineral/',
    tabs: ['overview', 'supply-chain', 'facilities', 'investments', 'defense', 'intel'],
    color: '#B45309',
  },
  chokepoint: {
    dataFile: 'logistics.json',
    dataPath: (data, id) => data.chokepoints?.find(c => slugify(c.name) === id),
    intelCategory: 'chokepoints',
    graphPrefix: 'chokepoint/',
    tabs: ['detail', 'intel'],
    color: '#0891B2',
  },
  satellite: {
    dataFile: 'telecom.json',
    dataPath: (data, id) => data.satellite_constellations?.find(s => slugify(s.name) === id),
    intelCategory: 'satellites',  // ← THIS is why satellites broke — it wasn't in any registry
    graphPrefix: 'satellite/',
    tabs: ['detail', 'intel'],
    color: '#8B5CF6',
  },
  // ... all other types
};
```

Adding a new entity type = ONE entry in this registry. No other files change.

### Component: Universal Data Resolver

```typescript
// lib/useEntityData.ts
function useEntityData(entityType: string, entityId: string) {
  const config = ENTITY_REGISTRY[entityType];

  return {
    // Structured data from the appropriate file
    structuredData: lookupFromDataFile(config.dataFile, config.dataPath, entityId),

    // Intel report (auto-derived path)
    intelPath: `/data/intelligence/${config.intelCategory}/${entityId}.json`,

    // Graph connections (auto-filtered)
    connections: graphRelationships.filter(r =>
      r.from === `${config.graphPrefix}${entityId}` ||
      r.to === `${config.graphPrefix}${entityId}`
    ),

    // Available tabs (from registry + what data exists)
    availableTabs: config.tabs.filter(tab => hasDataForTab(tab, ...)),

    // Display metadata
    name: entity.name,
    color: config.color,
  };
}
```

### Component: Universal Detail Panel

Instead of:
```tsx
// Current: 200+ lines of type-switching
if (type === 'mineral') { ... }
else if (type === 'chokepoint') { ... }
else if (type === 'cable') { ... }
// ... 12 more branches
```

It becomes:
```tsx
// New: data-driven
const { structuredData, intelPath, connections, availableTabs, name } = useEntityData(type, id);

return (
  <Panel title={name}>
    <TabBar tabs={availableTabs} />
    <TabContent tab={activeTab} data={structuredData} connections={connections} intelPath={intelPath} />
  </Panel>
);
```

### What TabContent Renders

Each tab type has a generic renderer:

- **overview**: Renders key-value pairs from structured data + risk scores if available
- **supply-chain**: Renders producers + supply-chain-notes if mineral type
- **facilities**: Renders MSHA matches + supply-chain-notes producers (ALWAYS both)
- **investments**: Renders graph connections of type 'funds'
- **defense**: Renders graph connections of type 'required_by'
- **detail**: Renders all fields from structured data as a clean card
- **connected**: Renders graph neighbors grouped by type
- **intel**: Fetches from auto-derived intelPath

### What This Fixes (Permanently)

1. **Wrong intel categories** — IMPOSSIBLE. Category derived from entity ID via registry.
2. **Missing type handlers** — IMPOSSIBLE. Universal renderer handles any registered type.
3. **Hidden data** — IMPOSSIBLE. Tabs appear based on what data exists, not hardcoded lists.
4. **New type = 7 file changes** — ELIMINATED. New type = 1 registry entry.
5. **Manual wiring between sidebar/panel/tabs** — ELIMINATED. Entity ID flows through.

### Migration Path

1. Build the entity registry + data resolver (new files, no changes to existing)
2. Build the universal detail renderer (new component)
3. Switch DetailPanel to use the universal renderer
4. Remove the old type-switching code
5. Validate everything still works

### What We Keep

- All existing data files (metals-mining.json, etc.)
- All existing tab components (OverviewTab, SupplyChainTab, etc.)
- Knowledge graph (entities.json, relationships.json)
- Intel reports (101 files)
- Map layers and sidebar (these still need type-specific code for now)

### What Changes

- DetailPanel.tsx — rewritten to use universal renderer
- New: lib/entityRegistry.ts
- New: lib/useEntityData.ts
- New: components/DetailPanel/UniversalDetail.tsx

## Validation Plan

### Programmatic Tests
For each entity type, verify:
1. Entity registry has an entry
2. Data resolver returns structured data
3. Intel path resolves to an existing file
4. Graph connections are non-empty
5. Available tabs include expected tabs

### Playwright Tests
For each lens, click 2 items and verify:
1. Detail panel appears with correct title
2. All expected tabs are present
3. Each tab shows non-empty content
4. Intel tab loads report (not "No report available")
5. Cross-navigation works (click a connected entity → navigates)

### Test Matrix
| Lens | Item 1 | Item 2 | Expected Tabs |
|------|--------|--------|---------------|
| Metals & Mining | Gallium | Copper | Overview, Supply Chain, Facilities, Investments, Defense, Intel |
| Manufacturing | Primary Metals | Transportation Equipment | Overview, States, Dependencies, Shipbuilding, Munitions, Intl, Investments |
| Energy | Natural Gas | Palo Verde | Detail, Intel |
| Logistics | Strait of Hormuz | Port of LA | Detail, Intel |
| Telecom | PEACE Cable | Starlink | Detail, Intel |
| Tech & R&D | AI | Hypersonics | Detail, Intel |
