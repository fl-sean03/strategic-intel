# Knowledge Graph Design

## Problem

Data about each entity is scattered across 7+ JSON files, linked only by string matching. "Gallium" appears in metals-mining.json, facilities.json, investments.json, defense-programs.json, cross-sector.json, supply-chain-notes.json, and intelligence reports — but there's no formal graph connecting them.

This means:
- Can't easily answer "show me everything connected to Gallium"
- Can't traverse: Gallium → F-35 → Titanium → what facilities make titanium?
- Adding a new entity type requires updating multiple files
- No single source of truth for what entities exist

## Solution: Normalized Entity Graph

### Entity Types (one file per type)

```
frontend/public/data/graph/
├── entities.json          # Master entity index
├── minerals.json          # 60 mineral entities
├── programs.json          # 17 defense program entities
├── investments.json       # 55 investment entities
├── facilities.json        # 627 facility entities
├── countries.json         # ~60 relevant countries
├── companies.json         # Key companies (Lockheed, Freeport, TSMC, etc.)
├── chokepoints.json       # 8 chokepoints
├── ports.json             # 14 ports
├── cables.json            # 8 cables
├── satellites.json        # 8 constellations
├── technologies.json      # 10 technology areas
├── sectors.json           # 8 NAICS manufacturing sectors
└── relationships.json     # ALL edges between entities
```

### Entity Schema

Every entity has:
```typescript
interface Entity {
  id: string;              // Globally unique: "mineral/gallium", "program/f35"
  type: EntityType;        // "mineral", "program", "investment", "facility", etc.
  name: string;            // Display name
  slug: string;            // URL-safe slug
  metadata: Record<string, any>;  // Type-specific fields
}
```

### Relationship Schema

Every edge has:
```typescript
interface Relationship {
  from: string;           // Entity ID: "mineral/gallium"
  to: string;             // Entity ID: "program/f35"
  type: RelationType;     // "required_by", "funds", "produces", "operates_at", etc.
  detail?: string;        // "GaAs in AESA radar (AN/APG-81)"
  strength?: number;      // 0-1, how critical is this link
  source?: string;        // Where this relationship was established
}
```

### Relationship Types

| Type | From → To | Example |
|------|----------|---------|
| `required_by` | mineral → program | Gallium required by F-35 |
| `produces` | country → mineral | China produces Gallium |
| `mines` | facility → mineral | Freeport Morenci mines Copper |
| `funds` | investment → mineral | DOE LPO funds Lithium |
| `depends_on` | sector → mineral | Electronics depends on Gallium |
| `supplies` | company → mineral | MP Materials supplies Rare Earths |
| `contracts_with` | program → company | F-35 contracts with Lockheed |
| `located_in` | facility → country | Palo Verde located in US |
| `transits` | chokepoint → trade_route | Hormuz transits 21M bbl/day |
| `connects` | cable → country | MAREA connects US-Spain |

### Query Examples

```typescript
// Everything connected to Gallium (1 hop)
const galliumEdges = relationships.filter(r =>
  r.from === 'mineral/gallium' || r.to === 'mineral/gallium'
);

// Programs that depend on minerals China controls >50%
const chinaControlled = relationships
  .filter(r => r.type === 'produces' && r.from.startsWith('country/CN') && r.strength > 0.5)
  .map(r => r.to);
const vulnerablePrograms = relationships
  .filter(r => r.type === 'required_by' && chinaControlled.includes(r.from));

// Investment → Mineral → Program chain
const lithiumInvestments = relationships.filter(r => r.type === 'funds' && r.to === 'mineral/lithium');
const lithiumPrograms = relationships.filter(r => r.type === 'required_by' && r.from === 'mineral/lithium');
```

### Frontend Integration

The graph data enables:
1. **Entity pages** — click any entity, see all connections
2. **Traversal** — "Gallium → F-35 → what other minerals does F-35 need?"
3. **Risk cascading** — "if China cuts Gallium, what programs are affected?"
4. **Network visualization** — force-directed graph of mineral-program dependencies

### Build Pipeline

```
1. Read existing data files (metals-mining, investments, programs, facilities, etc.)
2. Extract entities with unique IDs
3. Extract relationships from:
   - defense-programs.json materials arrays → "required_by" edges
   - investments.json mineral field → "funds" edges
   - facilities.json mineral_match → "mines" edges
   - cross-sector.json dependencies → "depends_on" edges
   - metals-mining.json top_producers → "produces" edges
   - supply-chain-notes.json us_producers → "supplies" edges
4. Write graph/entities.json + graph/relationships.json
5. Frontend loads graph data, enables traversal
```

### Implementation Priority

1. **Build the graph generator script** — reads all existing data, produces graph files
2. **Add graph types to frontend** — Entity, Relationship interfaces
3. **Build EntityPage component** — shows all connections for any entity
4. **Add "Connected" tab to detail panels** — shows graph neighbors
5. **Optional: Force-directed visualization** — deck.gl or d3-force network diagram
