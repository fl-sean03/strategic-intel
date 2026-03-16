/**
 * Geographic utilities — state centroid lookup, coordinate validation.
 */

/** U.S. state FIPS → approximate centroid [lon, lat] */
const STATE_CENTROIDS: Record<string, [number, number]> = {
  '01': [-86.83, 32.81],  // AL
  '02': [-153.37, 63.35], // AK
  '04': [-111.43, 34.17], // AZ
  '05': [-92.37, 34.97],  // AR
  '06': [-119.68, 36.12], // CA
  '08': [-105.31, 39.06], // CO
  '09': [-72.76, 41.60],  // CT
  '10': [-75.51, 38.91],  // DE
  '12': [-81.69, 27.77],  // FL
  '13': [-83.64, 33.04],  // GA
  '15': [-155.84, 19.74], // HI
  '16': [-114.74, 44.24], // ID
  '17': [-89.20, 40.35],  // IL
  '18': [-86.13, 39.85],  // IN
  '19': [-93.21, 42.01],  // IA
  '20': [-98.48, 38.53],  // KS
  '21': [-84.67, 37.67],  // KY
  '22': [-91.87, 30.98],  // LA
  '23': [-69.38, 45.25],  // ME
  '24': [-76.64, 39.05],  // MD
  '25': [-71.53, 42.23],  // MA
  '26': [-84.54, 43.33],  // MI
  '27': [-94.64, 46.28],  // MN
  '28': [-89.68, 32.74],  // MS
  '29': [-92.29, 38.46],  // MO
  '30': [-109.36, 46.80], // MT
  '31': [-99.80, 41.13],  // NE
  '32': [-116.42, 38.31], // NV
  '33': [-71.58, 43.68],  // NH
  '34': [-74.41, 40.06],  // NJ
  '35': [-106.25, 34.52], // NM
  '36': [-74.95, 42.17],  // NY
  '37': [-79.81, 35.63],  // NC
  '38': [-101.00, 47.53], // ND
  '39': [-82.76, 40.42],  // OH
  '40': [-97.09, 35.57],  // OK
  '41': [-120.55, 43.80], // OR
  '42': [-77.21, 40.59],  // PA
  '44': [-71.53, 41.68],  // RI
  '45': [-80.95, 33.86],  // SC
  '46': [-99.44, 43.97],  // SD
  '47': [-86.58, 35.75],  // TN
  '48': [-99.33, 31.17],  // TX
  '49': [-111.09, 39.32], // UT
  '50': [-72.71, 44.05],  // VT
  '51': [-78.17, 37.77],  // VA
  '53': [-120.74, 47.38], // WA
  '54': [-80.62, 38.60],  // WV
  '55': [-89.62, 44.27],  // WI
  '56': [-107.29, 42.76], // WY
  '11': [-77.03, 38.90],  // DC
};

/** State abbreviation → FIPS code */
const STATE_ABBREV_TO_FIPS: Record<string, string> = {
  AL: '01', AK: '02', AZ: '04', AR: '05', CA: '06', CO: '08', CT: '09',
  DE: '10', FL: '12', GA: '13', HI: '15', ID: '16', IL: '17', IN: '18',
  IA: '19', KS: '20', KY: '21', LA: '22', ME: '23', MD: '24', MA: '25',
  MI: '26', MN: '27', MS: '28', MO: '29', MT: '30', NE: '31', NV: '32',
  NH: '33', NJ: '34', NM: '35', NY: '36', NC: '37', ND: '38', OH: '39',
  OK: '40', OR: '41', PA: '42', RI: '44', SC: '45', SD: '46', TN: '47',
  TX: '48', UT: '49', VT: '50', VA: '51', WA: '53', WV: '54', WI: '55',
  WY: '56', DC: '11',
};

/** FIPS → state abbreviation */
const FIPS_TO_ABBREV: Record<string, string> = {};
for (const [abbrev, fips] of Object.entries(STATE_ABBREV_TO_FIPS)) {
  FIPS_TO_ABBREV[fips] = abbrev;
}

export function getStateCentroid(fipsOrAbbrev: string): [number, number] | null {
  // Try direct FIPS lookup
  if (STATE_CENTROIDS[fipsOrAbbrev]) return STATE_CENTROIDS[fipsOrAbbrev];
  // Try abbreviation → FIPS
  const fips = STATE_ABBREV_TO_FIPS[fipsOrAbbrev.toUpperCase()];
  if (fips && STATE_CENTROIDS[fips]) return STATE_CENTROIDS[fips];
  return null;
}

export function fipsToAbbrev(fips: string): string {
  return FIPS_TO_ABBREV[fips] || fips;
}

export function abbrevToFips(abbrev: string): string {
  return STATE_ABBREV_TO_FIPS[abbrev.toUpperCase()] || abbrev;
}

export { STATE_CENTROIDS, STATE_ABBREV_TO_FIPS };
