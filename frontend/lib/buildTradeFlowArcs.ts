/**
 * Build arc data for deck.gl ArcLayer from mineral producer data.
 * Arcs go from each producing country's centroid → U.S. centroid.
 */

import type { Mineral, CountryCentroids } from './types';
import { riskToColor } from './colorUtils';

export interface TradeArc {
  sourcePosition: [number, number];
  targetPosition: [number, number];
  sourceCountry: string;
  sourceIso: string;
  share: number;
  mineral: string;
  riskScore: number;
}

const US_CENTROID: [number, number] = [-98.58, 39.83];

export function buildTradeFlowArcs(
  mineral: Mineral,
  centroids: CountryCentroids,
): TradeArc[] {
  const arcs: TradeArc[] = [];
  const producers = mineral.supply_chain?.mining?.top_producers || [];

  for (const producer of producers) {
    const iso = producer.country_iso;
    if (!iso || iso === 'WORLD' || iso === 'US') continue;
    const centroid = centroids[iso];
    if (!centroid) continue;
    if (producer.share <= 0) continue;

    arcs.push({
      sourcePosition: centroid,
      targetPosition: US_CENTROID,
      sourceCountry: producer.country,
      sourceIso: iso,
      share: producer.share,
      mineral: mineral.name,
      riskScore: mineral.risk_scores.overall_risk,
    });
  }

  return arcs.sort((a, b) => b.share - a.share);
}

/** Get arc width from share (0-1 → 1-8 pixels) */
export function arcWidth(share: number): number {
  return Math.max(1, Math.min(8, share * 16));
}

/** Get arc color from risk score */
export function arcColor(riskScore: number): [number, number, number, number] {
  return riskToColor(riskScore, 160);
}
