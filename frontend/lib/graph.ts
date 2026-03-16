/**
 * Knowledge graph utility functions.
 *
 * These operate on the flat arrays from entities.json and relationships.json
 * and provide traversal, filtering, and lookup helpers.
 */

import type { GraphEntity, GraphRelationship } from './types';

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/**
 * Build a Map from entity id -> entity for O(1) lookups.
 */
export function buildEntityIndex(entities: GraphEntity[]): Map<string, GraphEntity> {
  const idx = new Map<string, GraphEntity>();
  for (const e of entities) {
    idx.set(e.id, e);
  }
  return idx;
}

// ---------------------------------------------------------------------------
// Relationship queries
// ---------------------------------------------------------------------------

/**
 * Get all relationships where an entity appears as source or target.
 */
export function getEntityRelationships(
  entityId: string,
  relationships: GraphRelationship[],
): GraphRelationship[] {
  return relationships.filter(r => r.from === entityId || r.to === entityId);
}

/**
 * Get outgoing relationships (entity is the source).
 */
export function getOutgoing(
  entityId: string,
  relationships: GraphRelationship[],
): GraphRelationship[] {
  return relationships.filter(r => r.from === entityId);
}

/**
 * Get incoming relationships (entity is the target).
 */
export function getIncoming(
  entityId: string,
  relationships: GraphRelationship[],
): GraphRelationship[] {
  return relationships.filter(r => r.to === entityId);
}

// ---------------------------------------------------------------------------
// Entity traversal
// ---------------------------------------------------------------------------

/**
 * Get all entities connected to the given entity (1 hop in either direction).
 */
export function getConnectedEntities(
  entityId: string,
  relationships: GraphRelationship[],
  entities: GraphEntity[],
): GraphEntity[] {
  const related = getEntityRelationships(entityId, relationships);
  const ids = new Set(related.map(r => (r.from === entityId ? r.to : r.from)));
  return entities.filter(e => ids.has(e.id));
}

/**
 * Get connected entities filtered to a specific entity type.
 */
export function getConnectedByType(
  entityId: string,
  type: string,
  relationships: GraphRelationship[],
  entities: GraphEntity[],
): GraphEntity[] {
  return getConnectedEntities(entityId, relationships, entities).filter(
    e => e.type === type,
  );
}

/**
 * Get connected entities filtered to a specific relationship type.
 */
export function getConnectedByRelType(
  entityId: string,
  relType: string,
  relationships: GraphRelationship[],
  entities: GraphEntity[],
): GraphEntity[] {
  const related = relationships.filter(
    r => r.type === relType && (r.from === entityId || r.to === entityId),
  );
  const ids = new Set(related.map(r => (r.from === entityId ? r.to : r.from)));
  return entities.filter(e => ids.has(e.id));
}

// ---------------------------------------------------------------------------
// Multi-hop traversal
// ---------------------------------------------------------------------------

/**
 * BFS traversal up to `maxDepth` hops from a starting entity.
 * Returns a Set of reachable entity ids (excluding the start).
 */
export function getReachable(
  startId: string,
  relationships: GraphRelationship[],
  maxDepth: number = 2,
): Set<string> {
  const visited = new Set<string>();
  let frontier = new Set<string>([startId]);

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextFrontier = new Set<string>();
    Array.from(frontier).forEach(id => {
      for (const r of relationships) {
        if (r.from === id && !visited.has(r.to) && r.to !== startId) {
          nextFrontier.add(r.to);
        }
        if (r.to === id && !visited.has(r.from) && r.from !== startId) {
          nextFrontier.add(r.from);
        }
      }
    });
    Array.from(nextFrontier).forEach(id => visited.add(id));
    frontier = nextFrontier;
    if (frontier.size === 0) break;
  }

  return visited;
}

// ---------------------------------------------------------------------------
// Filtering helpers
// ---------------------------------------------------------------------------

/**
 * Filter entities by type.
 */
export function entitiesByType(entities: GraphEntity[], type: string): GraphEntity[] {
  return entities.filter(e => e.type === type);
}

/**
 * Filter relationships by type.
 */
export function relationshipsByType(
  relationships: GraphRelationship[],
  type: string,
): GraphRelationship[] {
  return relationships.filter(r => r.type === type);
}

/**
 * Get the strongest relationships (sorted desc by strength).
 */
export function strongestRelationships(
  relationships: GraphRelationship[],
  limit: number = 20,
): GraphRelationship[] {
  return [...relationships]
    .filter(r => r.strength != null)
    .sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0))
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Subgraph extraction
// ---------------------------------------------------------------------------

/**
 * Extract a subgraph containing only specified entity types and
 * relationships between them.
 */
export function extractSubgraph(
  entityTypes: string[],
  entities: GraphEntity[],
  relationships: GraphRelationship[],
): { entities: GraphEntity[]; relationships: GraphRelationship[] } {
  const typeSet = new Set(entityTypes);
  const subEntities = entities.filter(e => typeSet.has(e.type));
  const idSet = new Set(subEntities.map(e => e.id));
  const subRels = relationships.filter(r => idSet.has(r.from) && idSet.has(r.to));
  return { entities: subEntities, relationships: subRels };
}
