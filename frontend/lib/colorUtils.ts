/**
 * Color utilities for deck.gl layers (requires RGBA arrays).
 */

/** Convert hex color string to [r, g, b, a] array for deck.gl */
export function hexToRGBA(hex: string, alpha = 255): [number, number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b, alpha];
}

/** Risk score → deck.gl RGBA color */
export function riskToColor(score: number, alpha = 200): [number, number, number, number] {
  if (score >= 80) return [220, 38, 38, alpha];   // critical - red
  if (score >= 60) return [217, 119, 6, alpha];    // high - amber
  if (score >= 40) return [37, 99, 235, alpha];    // moderate - blue
  return [5, 150, 105, alpha];                      // low - green
}

/** Interpolate between two colors based on t (0-1) */
export function lerpColor(
  c1: [number, number, number, number],
  c2: [number, number, number, number],
  t: number,
): [number, number, number, number] {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
    Math.round(c1[3] + (c2[3] - c1[3]) * t),
  ];
}

/** Map a commodity to a consistent color for mine markers */
const COMMODITY_COLORS: Record<string, [number, number, number, number]> = {
  Lithium: [139, 92, 246, 200],     // purple
  Cobalt: [59, 130, 246, 200],      // blue
  Copper: [234, 88, 12, 200],       // orange
  Nickel: [16, 185, 129, 200],      // emerald
  Graphite: [75, 85, 99, 200],      // gray
  Tungsten: [244, 63, 94, 200],     // rose
  Titanium: [14, 165, 233, 200],    // sky
  Chromium: [168, 162, 158, 200],   // stone
  Manganese: [217, 119, 6, 200],    // amber
  Aluminum: [156, 163, 175, 200],   // cool gray
  'Rare Earths': [192, 38, 211, 200], // fuchsia
  Uranium: [34, 197, 94, 200],      // green
  Zinc: [100, 116, 139, 200],       // slate
};

export function commodityColor(mineral: string): [number, number, number, number] {
  return COMMODITY_COLORS[mineral] || [107, 114, 128, 200]; // default gray
}

/** Navy color for defense/investment features */
export const NAVY_RGBA: [number, number, number, number] = [30, 58, 95, 200];
export const GREEN_INVESTMENT: [number, number, number, number] = [34, 197, 94, 200];
