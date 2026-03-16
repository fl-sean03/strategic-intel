'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type {
  LensId, Mineral, MetalsMiningData, ManufacturingData, ManufacturingSector,
  Facility, Shipyard, Investment, DefenseProgram, CrossSectorData,
  LayerVisibility, CountryCentroids, EnergyData, LogisticsData,
  TelecomData, TechnologyData,
} from '@/lib/types';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import LensSelector from '@/components/Map/LensSelector';
import LayerControls from '@/components/Map/LayerControls';
import Sidebar from '@/components/Sidebar/Sidebar';
import DetailPanel from '@/components/DetailPanel/DetailPanel';
import GlobalSearch from '@/components/Search/GlobalSearch';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useDarkMode } from '@/lib/useDarkMode';

const MapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center">
      <div className="text-sm text-gray-400 animate-pulse">Loading globe...</div>
    </div>
  ),
});

const DEFAULT_LAYERS: LayerVisibility = {
  facilities: true,
  shipyards: true,
  investments: true,
  tradeFlows: true,
  usStates: true,
};

function loadLayerVisibility(): LayerVisibility {
  if (typeof window === 'undefined') return DEFAULT_LAYERS;
  try {
    const stored = localStorage.getItem('si-layers');
    if (stored) return { ...DEFAULT_LAYERS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_LAYERS;
}

export default function App() {
  const { dark, toggle: toggleDarkMode } = useDarkMode();
  const [activeLens, setActiveLens] = useState<LensId>('metals-mining');
  const [metalsMiningData, setMetalsMiningData] = useState<MetalsMiningData | null>(null);
  const [manufacturingData, setManufacturingData] = useState<ManufacturingData | null>(null);
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [logisticsData, setLogisticsData] = useState<LogisticsData | null>(null);
  const [telecomData, setTelecomData] = useState<TelecomData | null>(null);
  const [technologyData, setTechnologyData] = useState<TechnologyData | null>(null);
  const [crossSectorData, setCrossSectorData] = useState<CrossSectorData | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [shipyards, setShipyards] = useState<Shipyard[]>([]);
  const [investmentsData, setInvestmentsData] = useState<Investment[]>([]);
  const [defensePrograms, setDefensePrograms] = useState<DefenseProgram[]>([]);
  const [countryCentroids, setCountryCentroids] = useState<CountryCentroids>({});
  const [usStatesGeo, setUsStatesGeo] = useState<any>(null);
  const [supplyChainNotes, setSupplyChainNotes] = useState<Record<string, any>>({});
  const [graphEntities, setGraphEntities] = useState<any[]>([]);
  const [graphRelationships, setGraphRelationships] = useState<any[]>([]);
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'mineral' | 'manufacturing-sector' | 'country'
      | 'energy-overview' | 'energy-fuel' | 'energy-facility'
      | 'logistics-overview' | 'chokepoint' | 'port'
      | 'telecom-overview' | 'cable' | 'satellite'
      | 'technology-overview' | 'tech-competition' | 'rd-spending';
    id: string;
    name?: string;
  } | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  // Load welcome dismissed state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('si-welcome-dismissed')) {
      setWelcomeDismissed(true);
    }
  }, []);

  const dismissWelcome = useCallback(() => {
    setWelcomeDismissed(true);
    try { localStorage.setItem('si-welcome-dismissed', 'true'); } catch {}
  }, []);

  // Ref to track whether we're restoring from URL (to avoid overwriting hash during restore)
  const restoringFromUrl = useRef(false);

  // Load layer visibility from localStorage
  useEffect(() => {
    setLayerVisibility(loadLayerVisibility());
  }, []);

  // Persist layer visibility
  const handleLayerToggle = useCallback((layer: keyof LayerVisibility) => {
    setLayerVisibility((prev) => {
      const next = { ...prev, [layer]: !prev[layer] };
      try { localStorage.setItem('si-layers', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Track which data files have been fetched to avoid re-fetching
  const fetched = useRef(new Set<string>());

  // Helper: fetch a JSON file once, cache via state setter
  const fetchOnce = useCallback((file: string, setter: (d: any) => void) => {
    if (fetched.current.has(file)) return;
    fetched.current.add(file);
    fetch(`/data/${file}`)
      .then((r) => r.json())
      .then(setter)
      .catch(() => setDataError((prev) => prev ? `${prev}, ${file}` : file));
  }, []);

  // Load shared data on mount (small files needed by all lenses)
  useEffect(() => {
    fetchOnce('cross-sector.json', setCrossSectorData);
    fetchOnce('investments.json', setInvestmentsData);
    fetchOnce('defense-programs.json', setDefensePrograms);
    fetchOnce('country-centroids.json', setCountryCentroids);
    fetchOnce('graph/entities.json', (d: any) => setGraphEntities(d?.entities || []));
    fetchOnce('graph/relationships.json', (d: any) => setGraphRelationships(d?.relationships || []));
  }, [fetchOnce]);

  // Load lens-specific data when lens changes (cached — only fetches once per file)
  useEffect(() => {
    if (activeLens === 'metals-mining') {
      fetchOnce('metals-mining.json', setMetalsMiningData);
      fetchOnce('facilities.json', setFacilities);
      fetchOnce('supply-chain-notes.json', (d: any) => setSupplyChainNotes(d?.minerals || {}));
    } else if (activeLens === 'manufacturing') {
      fetchOnce('manufacturing.json', setManufacturingData);
      fetchOnce('shipyards.json', setShipyards);
      fetchOnce('us-states-10m.json', setUsStatesGeo);
    } else if (activeLens === 'energy') {
      fetchOnce('energy.json', setEnergyData);
    } else if (activeLens === 'logistics') {
      fetchOnce('logistics.json', setLogisticsData);
    } else if (activeLens === 'telecom') {
      fetchOnce('telecom.json', setTelecomData);
    } else if (activeLens === 'technology') {
      fetchOnce('technology.json', setTechnologyData);
      fetchOnce('us-states-10m.json', setUsStatesGeo);
    }
    // Also preload all lens data in background after a short delay
    // so switching feels instant
    const timer = setTimeout(() => {
      fetchOnce('metals-mining.json', setMetalsMiningData);
      fetchOnce('manufacturing.json', setManufacturingData);
      fetchOnce('facilities.json', setFacilities);
      fetchOnce('shipyards.json', setShipyards);
      fetchOnce('us-states-10m.json', setUsStatesGeo);
      fetchOnce('energy.json', setEnergyData);
      fetchOnce('logistics.json', setLogisticsData);
      fetchOnce('telecom.json', setTelecomData);
      fetchOnce('technology.json', setTechnologyData);
      fetchOnce('supply-chain-notes.json', (d: any) => setSupplyChainNotes(d?.minerals || {}));
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeLens, fetchOnce]);

  // Handle lens+item from URL hash on mount (#lens/itemId)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const parts = hash.split('/');
    const lensFromHash = parts[0];
    // New format: #lens/type/id  (backwards compatible with #lens/id)
    const typeFromHash = parts.length >= 3 ? parts[1] : undefined;
    const itemIdFromHash = parts.length >= 3 ? parts[2] : parts[1];

    if (lensFromHash === 'manufacturing' || lensFromHash === 'industrials') {
      setActiveLens('manufacturing');
    } else if (lensFromHash === 'metals-mining' || lensFromHash === 'minerals') {
      setActiveLens('metals-mining');
    } else if (lensFromHash === 'energy') {
      setActiveLens('energy');
    } else if (lensFromHash === 'logistics') {
      setActiveLens('logistics');
    } else if (lensFromHash === 'telecom') {
      setActiveLens('telecom');
    } else if (lensFromHash === 'technology') {
      setActiveLens('technology');
    }

    if (itemIdFromHash) {
      restoringFromUrl.current = true;
      // We'll set the item once data loads — store it in a ref
      const checkAndSet = () => {
        // Defer to let data load
        const interval = setInterval(() => {
          const mmData = metalsMiningDataRef.current;
          const mfgData = manufacturingDataRef.current;

          if (lensFromHash === 'metals-mining' || lensFromHash === 'minerals') {
            if (mmData) {
              const mineral = mmData.minerals.find(m => m.id === itemIdFromHash);
              if (mineral) {
                setSelectedItem({ type: 'mineral', id: itemIdFromHash });
              }
              clearInterval(interval);
              restoringFromUrl.current = false;
            }
          } else if (lensFromHash === 'manufacturing' || lensFromHash === 'industrials') {
            if (mfgData) {
              const sector = mfgData.sectors.find(s => s.naics_code === itemIdFromHash);
              if (sector) {
                setSelectedItem({ type: 'manufacturing-sector', id: itemIdFromHash });
              }
              clearInterval(interval);
              restoringFromUrl.current = false;
            }
          } else if (lensFromHash === 'energy') {
            setSelectedItem({ type: 'energy-overview', id: 'energy' });
            clearInterval(interval);
            restoringFromUrl.current = false;
          } else if (lensFromHash === 'logistics') {
            if (itemIdFromHash) {
              // Could be a chokepoint or port
              setSelectedItem({ type: 'chokepoint', id: itemIdFromHash });
            }
            clearInterval(interval);
            restoringFromUrl.current = false;
          } else if (lensFromHash === 'telecom') {
            setSelectedItem({ type: 'telecom-overview', id: 'telecom' });
            clearInterval(interval);
            restoringFromUrl.current = false;
          } else if (lensFromHash === 'technology') {
            setSelectedItem({ type: 'technology-overview', id: 'technology' });
            clearInterval(interval);
            restoringFromUrl.current = false;
          } else {
            clearInterval(interval);
            restoringFromUrl.current = false;
          }
        }, 100);
        // Timeout after 5 seconds
        setTimeout(() => { restoringFromUrl.current = false; }, 5000);
      };
      checkAndSet();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refs for data (used during URL restore)
  const metalsMiningDataRef = useRef(metalsMiningData);
  metalsMiningDataRef.current = metalsMiningData;
  const manufacturingDataRef = useRef(manufacturingData);
  manufacturingDataRef.current = manufacturingData;

  // Sync hash when selectedItem or activeLens changes, and dismiss welcome on first selection
  useEffect(() => {
    if (restoringFromUrl.current) return;
    if (selectedItem) {
      if (!welcomeDismissed) dismissWelcome();
      window.location.hash = `${activeLens}/${selectedItem.type}/${selectedItem.id}`;
    } else {
      window.location.hash = activeLens;
    }
  }, [selectedItem, activeLens, welcomeDismissed, dismissWelcome]);

  // Listen for browser back/forward
  useEffect(() => {
    function handlePopState() {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      const parts = hash.split('/');
      const lensFromHash = parts[0] as LensId;
      // New format: #lens/type/id  (backwards compatible with #lens/id)
      const typeFromHash = parts.length >= 3 ? parts[1] : undefined;
      const itemIdFromHash = parts.length >= 3 ? parts[2] : parts[1];

      if (['metals-mining', 'manufacturing', 'energy', 'logistics', 'telecom', 'technology'].includes(lensFromHash)) {
        setActiveLens(lensFromHash);
      }

      if (itemIdFromHash) {
        if (typeFromHash) {
          // Full type from URL — use directly
          setSelectedItem({ type: typeFromHash as any, id: itemIdFromHash });
        } else {
          // Legacy format: guess type from lens
          if (lensFromHash === 'metals-mining') {
            setSelectedItem({ type: 'mineral', id: itemIdFromHash });
          } else if (lensFromHash === 'manufacturing') {
            setSelectedItem({ type: 'manufacturing-sector', id: itemIdFromHash });
          } else if (lensFromHash === 'energy') {
            setSelectedItem({ type: 'energy-fuel', id: itemIdFromHash });
          } else if (lensFromHash === 'logistics') {
            setSelectedItem({ type: 'chokepoint', id: itemIdFromHash });
          } else if (lensFromHash === 'telecom') {
            setSelectedItem({ type: 'cable', id: itemIdFromHash });
          } else if (lensFromHash === 'technology') {
            setSelectedItem({ type: 'tech-competition', id: itemIdFromHash });
          }
        }
      } else {
        setSelectedItem(null);
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLensChange = useCallback((lens: LensId) => {
    setActiveLens(lens);
    setSelectedItem(null);
    setSidebarCollapsed(false);
  }, []);

  const minerals = metalsMiningData?.minerals || [];
  const sectors = manufacturingData?.sectors || [];

  const selectedMineral = selectedItem?.type === 'mineral'
    ? minerals.find((m) => m.id === selectedItem.id)
    : undefined;

  const selectedSector = selectedItem?.type === 'manufacturing-sector'
    ? sectors.find((s) => s.naics_code === selectedItem.id)
    : undefined;

  const handleItemClick = useCallback((id: string, type: string) => {
    setSelectedItem({ type: type as any, id });
  }, []);

  const handleCrossSectorNav = useCallback((targetType: 'mineral' | 'manufacturing-sector', targetId: string) => {
    if (targetType === 'mineral') {
      setActiveLens('metals-mining');
    } else {
      setActiveLens('manufacturing');
    }
    setSelectedItem({ type: targetType, id: targetId });
  }, []);

  const handleSearchSelect = useCallback((result: { type: string; id: string }) => {
    if (result.type === 'mineral') {
      setActiveLens('metals-mining');
      setSelectedItem({ type: 'mineral', id: result.id });
    } else if (result.type === 'sector') {
      setActiveLens('manufacturing');
      setSelectedItem({ type: 'manufacturing-sector', id: result.id });
    } else if (result.type === 'facility') {
      setActiveLens('metals-mining');
      const facility = facilities.find((f) => f.id === result.id);
      if (facility?.mineral_match[0]) {
        const m = minerals.find((min) => min.name.toLowerCase() === facility.mineral_match[0].toLowerCase());
        if (m) setSelectedItem({ type: 'mineral', id: m.id });
      }
    } else if (result.type === 'investment') {
      setActiveLens('metals-mining');
      const inv = investmentsData.find((i) => i.id === result.id);
      if (inv?.mineral) {
        const m = minerals.find((min) => min.name.toLowerCase() === inv.mineral!.toLowerCase());
        if (m) setSelectedItem({ type: 'mineral', id: m.id });
      }
    } else if (result.type === 'program') {
      setActiveLens('metals-mining');
    } else if (result.type === 'chokepoint') {
      setActiveLens('logistics');
      setSelectedItem({ type: 'chokepoint', id: result.id });
    } else if (result.type === 'port') {
      setActiveLens('logistics');
      setSelectedItem({ type: 'port', id: result.id });
    } else if (result.type === 'cable') {
      setActiveLens('telecom');
      setSelectedItem({ type: 'cable', id: result.id });
    } else if (result.type === 'satellite') {
      setActiveLens('telecom');
      setSelectedItem({ type: 'satellite', id: result.id });
    } else if (result.type === 'tech-competition') {
      setActiveLens('technology');
      setSelectedItem({ type: 'tech-competition', id: result.id });
    } else if (result.type === 'energy-facility') {
      setActiveLens('energy');
      setSelectedItem({ type: 'energy-facility', id: result.id });
    }
  }, [facilities, investmentsData, minerals]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger when typing in input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }
      if (e.key === 'Escape') {
        setSelectedItem(null);
      }
      if (e.key === '/') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
      }
      if (e.key === '1') handleLensChange('metals-mining');
      if (e.key === '2') handleLensChange('manufacturing');
      if (e.key === '3') handleLensChange('energy');
      if (e.key === '4') handleLensChange('logistics');
      if (e.key === '5') handleLensChange('telecom');
      if (e.key === '6') handleLensChange('technology');
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLensChange]);

  // Count facilities per mineral for sidebar
  const facilityCountByMineral = facilities.reduce((acc, f) => {
    for (const m of f.mineral_match) {
      const key = m.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Top 3 risk minerals for welcome overlay
  const topRiskMinerals = minerals
    .slice()
    .sort((a, b) => b.risk_scores.overall_risk - a.risk_scores.overall_risk)
    .slice(0, 3);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Skip to content link — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:rounded focus:text-sm focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Map fills entire viewport */}
      <div id="main-content" className="absolute inset-0">
        <ErrorBoundary fallbackMessage="Map failed to load. Try refreshing the page.">
          <MapView
            activeLens={activeLens}
            metalsMiningData={metalsMiningData}
            manufacturingData={manufacturingData}
            energyData={energyData}
            logisticsData={logisticsData}
            telecomData={telecomData}
            technologyData={technologyData}
            selectedMineral={selectedMineral || null}
            facilities={facilities}
            shipyards={shipyards}
            investments={investmentsData}
            countryCentroids={countryCentroids}
            layerVisibility={layerVisibility}
            usStatesGeo={usStatesGeo}
            dark={dark}
            onCountryClick={(iso, name) => setSelectedItem({ type: 'country', id: iso, name })}
          />
        </ErrorBoundary>
      </div>

      {/* Top bar — floating over map */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="panel rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 bg-navy rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-[11px]">SI</span>
            </div>
            <span className="text-xs font-semibold text-gray-900 hidden sm:inline">
              Strategic Industrial Intelligence
            </span>
          </div>
        </div>

        {/* Lens pills */}
        <div className="pointer-events-auto">
          <div className="panel rounded-xl px-2 py-1.5">
            <LensSelector activeLens={activeLens} onLensChange={handleLensChange} />
          </div>
        </div>

        {/* Search + Info */}
        <div className="pointer-events-auto flex items-center gap-2">
          <GlobalSearch
            minerals={minerals}
            sectors={sectors}
            facilities={facilities}
            investments={investmentsData}
            defensePrograms={defensePrograms}
            energyData={energyData}
            logisticsData={logisticsData}
            telecomData={telecomData}
            technologyData={technologyData}
            onSelect={handleSearchSelect}
          />
          <DarkModeToggle dark={dark} onToggle={toggleDarkMode} />
          <a
            href="https://github.com/fl-sean03/strategic-intel"
            target="_blank"
            rel="noopener noreferrer"
            className="panel rounded-xl px-2.5 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="View on GitHub"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
          <a
            href="/about"
            className="panel rounded-xl px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            About
          </a>
        </div>
      </div>

      {/* Data error banner */}
      {dataError && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-fade-in">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs text-red-700">
              Failed to load: {dataError}
            </span>
            <button
              onClick={() => setDataError(null)}
              className="text-red-400 hover:text-red-600 ml-1"
              aria-label="Dismiss error"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Layer controls */}
      <LayerControls
        activeLens={activeLens}
        layers={layerVisibility}
        onToggle={handleLayerToggle}
      />

      {/* Sidebar */}
      <ErrorBoundary fallbackMessage="Sidebar failed to load.">
        <Sidebar
          activeLens={activeLens}
          minerals={minerals}
          manufacturingSectors={sectors}
          energyData={energyData}
          logisticsData={logisticsData}
          telecomData={telecomData}
          technologyData={technologyData}
          facilityCountByMineral={facilityCountByMineral}
          onItemClick={handleItemClick}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </ErrorBoundary>

      {/* Welcome overlay — shown when no item is selected and data is loaded (metals-mining/manufacturing only) */}
      {!welcomeDismissed && selectedItem === null && activeLens !== 'energy' && activeLens !== 'logistics' && activeLens !== 'telecom' && activeLens !== 'technology' && metalsMiningData && topRiskMinerals.length > 0 && (
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-16 pointer-events-none">
          <div className="panel rounded-xl p-4 max-w-sm text-center pointer-events-auto animate-fade-in">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              Strategic Industrial Intelligence
            </h2>
            <p className="text-[11px] text-gray-500 mb-3">
              Explore U.S. supply chain vulnerabilities across critical minerals and manufacturing sectors. Select a mineral to begin.
            </p>
            <div className="flex items-center justify-center gap-2">
              {topRiskMinerals.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { dismissWelcome(); setSelectedItem({ type: 'mineral', id: m.id }); }}
                  className="badge bg-amber-50 text-amber-700 border-amber-200 text-[11px] cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  {m.name} ({Math.round(m.risk_scores.overall_risk)})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail panel */}
      <ErrorBoundary fallbackMessage="Detail panel failed to load.">
        <DetailPanel
          type={selectedItem?.type ?? null}
          selectedItemId={selectedItem?.id}
          mineral={selectedMineral}
          sector={selectedSector}
          countryIso={selectedItem?.type === 'country' ? selectedItem.id : undefined}
          countryName={selectedItem?.type === 'country' ? selectedItem.name : undefined}
          metalsMiningData={metalsMiningData}
          manufacturingData={manufacturingData}
          energyData={energyData}
          logisticsData={logisticsData}
          telecomData={telecomData}
          technologyData={technologyData}
          crossSectorData={crossSectorData}
          facilities={facilities}
          shipyards={shipyards}
          investments={investmentsData}
          defensePrograms={defensePrograms}
          supplyChainNotes={supplyChainNotes}
          onClose={() => setSelectedItem(null)}
          onCrossSectorNav={handleCrossSectorNav}
          onCountryClick={(iso, name) => setSelectedItem({ type: 'country', id: iso, name })}
          graphEntities={graphEntities}
          graphRelationships={graphRelationships}
        />
      </ErrorBoundary>

      {/* Stats bar at bottom — lens-specific */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
        <div className="panel rounded-lg px-3 py-1.5 flex items-center gap-4 text-[11px] text-gray-500 pointer-events-auto">
          {activeLens === 'metals-mining' && metalsMiningData && (
            <>
              <span><strong className="text-gray-700">{metalsMiningData.summary.total_minerals}</strong> minerals</span>
              <span><strong className="text-gray-700">{metalsMiningData.summary.single_source_count}</strong> single source</span>
              {facilities.length > 0 && (
                <span><strong className="text-gray-700">{facilities.length}</strong> facilities</span>
              )}
            </>
          )}
          {activeLens === 'manufacturing' && manufacturingData && (
            <>
              <span><strong className="text-gray-700">{sectors.length}</strong> sectors</span>
              <span><strong className="text-gray-700">{manufacturingData.summary.capacity_utilization ? Math.round(manufacturingData.summary.capacity_utilization * 10) / 10 : 'N/A'}%</strong> cap util</span>
              <span><strong className="text-gray-700">${(manufacturingData.defense_contracts?.reduce((s, c) => s + c.total_amount, 0) / 1e9).toFixed(0)}B</strong> defense contracts</span>
            </>
          )}
          {activeLens === 'energy' && energyData && (
            <>
              <span><strong className="text-gray-700">{energyData.summary.total_capacity_gw}</strong> GW capacity</span>
              <span><strong className="text-gray-700">{energyData.summary.renewable_share_pct}%</strong> renewable</span>
              <span><strong className="text-gray-700">{energyData.key_facilities.filter(f => f.type === 'Nuclear').length}</strong> nuclear facilities</span>
            </>
          )}
          {activeLens === 'logistics' && logisticsData && (
            <>
              <span><strong className="text-gray-700">{logisticsData.chokepoints.length}</strong> chokepoints</span>
              <span><strong className="text-gray-700">{logisticsData.major_ports.filter(p => p.country_iso === 'US').length}</strong> U.S. ports</span>
              <span><strong className="text-gray-700">{logisticsData.summary.us_flagged_vessels}</strong> U.S. vessels</span>
            </>
          )}
          {activeLens === 'telecom' && telecomData && (
            <>
              <span><strong className="text-gray-700">{telecomData.key_cables.length}</strong> cables</span>
              <span><strong className="text-gray-700">{telecomData.satellite_constellations.length}</strong> constellations</span>
              <span><strong className="text-gray-700">{telecomData.summary.us_5g_coverage_pct}%</strong> 5G coverage</span>
            </>
          )}
          {activeLens === 'technology' && technologyData && (
            <>
              <span><strong className="text-gray-700">{technologyData.tech_competition.length}</strong> tech areas</span>
              <span><strong className="text-gray-700">${technologyData.summary.dod_rd_budget_b}B</strong> DoD R&D</span>
              <span><strong className="text-gray-700">{technologyData.summary.critical_tech_areas}</strong> critical techs</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
