/**
 * Entity Registry — Single source of truth for all entity types.
 *
 * Every entity type gets ONE entry that defines:
 *   - Display metadata (label, color)
 *   - Data resolution (intel category, graph prefix)
 *   - Available tabs
 *   - Fallback intel ID for sector-level entities
 *
 * Adding a new entity type = ONE entry here. Intel paths are NEVER
 * manually specified elsewhere — always derived from this registry.
 */

export interface EntityTypeConfig {
  /** Human-readable label */
  label: string;
  /** Display color (hex) */
  color: string;

  /** Maps to intelligence/{intelCategory}/{id}.json */
  intelCategory: string;
  /** Prefix for graph entity IDs, e.g. "mineral/" → "mineral/gallium" */
  graphPrefix: string;

  /** Tabs this entity type supports */
  tabs: string[];

  /** Fallback intel ID when no entity-specific report exists (sector-level) */
  intelFallbackId?: string;
}

export const ENTITY_REGISTRY: Record<string, EntityTypeConfig> = {
  'mineral': {
    label: 'Mineral',
    color: '#B45309',
    intelCategory: 'minerals',
    graphPrefix: 'mineral/',
    tabs: ['overview', 'supply-chain', 'facilities', 'investments', 'defense', 'intel'],
  },
  'manufacturing-sector': {
    label: 'Manufacturing Sector',
    color: '#1E3A5F',
    intelCategory: 'sectors',
    graphPrefix: 'sector/',
    tabs: ['overview', 'states-facilities', 'dependencies', 'shipbuilding', 'munitions', 'international', 'investments'],
    intelFallbackId: 'manufacturing',
  },
  'country': {
    label: 'Country',
    color: '#6B7280',
    intelCategory: 'countries',
    graphPrefix: 'country/',
    tabs: ['minerals-produced'],
  },
  'energy-overview': {
    label: 'Energy Sector',
    color: '#7C3AED',
    intelCategory: 'sectors',
    graphPrefix: '',
    tabs: ['overview', 'battery-minerals', 'intel'],
    intelFallbackId: 'energy',
  },
  'energy-fuel': {
    label: 'Energy Fuel',
    color: '#7C3AED',
    intelCategory: 'sectors',
    graphPrefix: '',
    tabs: ['detail', 'intel'],
    intelFallbackId: 'energy',
  },
  'energy-facility': {
    label: 'Energy Facility',
    color: '#7C3AED',
    intelCategory: 'sectors',
    graphPrefix: '',
    tabs: ['detail', 'intel'],
    intelFallbackId: 'energy',
  },
  'chokepoint': {
    label: 'Chokepoint',
    color: '#0891B2',
    intelCategory: 'chokepoints',
    graphPrefix: 'chokepoint/',
    tabs: ['detail', 'intel'],
  },
  'port': {
    label: 'Port',
    color: '#0891B2',
    intelCategory: 'sectors',
    graphPrefix: 'port/',
    tabs: ['detail', 'intel'],
    intelFallbackId: 'logistics',
  },
  'logistics-overview': {
    label: 'Logistics Sector',
    color: '#0891B2',
    intelCategory: 'sectors',
    graphPrefix: '',
    tabs: ['overview', 'chokepoints', 'merchant-fleet', 'ports', 'intel'],
    intelFallbackId: 'logistics',
  },
  'telecom-overview': {
    label: 'Telecom Sector',
    color: '#8B5CF6',
    intelCategory: 'sectors',
    graphPrefix: '',
    tabs: ['overview', 'cables', 'satellites', 'intel'],
    intelFallbackId: 'telecom',
  },
  'cable': {
    label: 'Submarine Cable',
    color: '#8B5CF6',
    intelCategory: 'cables',
    graphPrefix: 'cable/',
    tabs: ['detail', 'intel'],
  },
  'satellite': {
    label: 'Satellite',
    color: '#8B5CF6',
    intelCategory: 'satellites',
    graphPrefix: 'constellation/',
    tabs: ['detail', 'intel'],
  },
  'technology-overview': {
    label: 'Technology Sector',
    color: '#EC4899',
    intelCategory: 'sectors',
    graphPrefix: '',
    tabs: ['overview', 'rd-spending', 'defense-rd-states', 'intel'],
    intelFallbackId: 'technology',
  },
  'tech-competition': {
    label: 'Technology',
    color: '#EC4899',
    intelCategory: 'technologies',
    graphPrefix: 'technology/',
    tabs: ['detail', 'intel'],
  },
  'rd-spending': {
    label: 'R&D Spending',
    color: '#EC4899',
    intelCategory: 'sectors',
    graphPrefix: '',
    tabs: ['detail', 'intel'],
    intelFallbackId: 'technology',
  },
};

/**
 * Derive the intel report fetch path for any entity.
 * Uses intelFallbackId when the entity type is a sector-level aggregate
 * (e.g. energy-fuel falls back to sectors/energy.json).
 */
export function getIntelPath(entityType: string, entityId: string): string {
  const config = ENTITY_REGISTRY[entityType];
  if (!config) return '';
  const category = config.intelCategory;
  const id = config.intelFallbackId || entityId;
  return `/data/intelligence/${category}/${id}.json`;
}

/**
 * Derive the graph entity ID for knowledge-graph lookups.
 * Returns empty string for entity types with no graph prefix (sector overviews).
 */
export function getGraphEntityId(entityType: string, entityId: string): string {
  const config = ENTITY_REGISTRY[entityType];
  if (!config || !config.graphPrefix) return '';
  return `${config.graphPrefix}${entityId}`;
}
