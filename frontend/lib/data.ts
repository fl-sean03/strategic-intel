import type {
  MetalsMiningData, ManufacturingData, PlatformStats, CrossSectorData,
  Facility, Shipyard, Investment, DefenseProgram, CountryCentroids,
  EnergyData, LogisticsData, TelecomData, TechnologyData,
  SupplyChainNotes,
  GraphEntitiesFile, GraphRelationshipsFile,
} from './types';

const BASE = '/data';

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}/${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function loadMetalsMining() {
  return fetchJSON<MetalsMiningData>('metals-mining.json');
}

export function loadManufacturing() {
  return fetchJSON<ManufacturingData>('manufacturing.json');
}

export function loadStats() {
  return fetchJSON<PlatformStats>('stats.json');
}

export function loadCrossSector() {
  return fetchJSON<CrossSectorData>('cross-sector.json');
}

export function loadFacilities() {
  return fetchJSON<Facility[]>('facilities.json');
}

export function loadShipyards() {
  return fetchJSON<Shipyard[]>('shipyards.json');
}

export function loadInvestments() {
  return fetchJSON<Investment[]>('investments.json');
}

export function loadDefensePrograms() {
  return fetchJSON<DefenseProgram[]>('defense-programs.json');
}

export function loadCountryCentroids() {
  return fetchJSON<CountryCentroids>('country-centroids.json');
}

export function loadUsStates() {
  return fetchJSON<any>('us-states-10m.json');
}

export function loadEnergy() {
  return fetchJSON<EnergyData>('energy.json');
}

export function loadLogistics() {
  return fetchJSON<LogisticsData>('logistics.json');
}

export function loadTelecom() {
  return fetchJSON<TelecomData>('telecom.json');
}

export function loadTechnology() {
  return fetchJSON<TechnologyData>('technology.json');
}

export function loadSupplyChainNotes() {
  return fetchJSON<{ minerals: SupplyChainNotes }>('supply-chain-notes.json');
}

// --- Knowledge Graph ---

export function loadGraphEntities() {
  return fetchJSON<GraphEntitiesFile>('graph/entities.json');
}

export function loadGraphRelationships() {
  return fetchJSON<GraphRelationshipsFile>('graph/relationships.json');
}
