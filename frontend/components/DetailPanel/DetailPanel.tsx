'use client';

import { useState, useEffect } from 'react';
import type {
  Mineral, ManufacturingSector, Facility, Investment, DefenseProgram,
  CrossSectorData, Shipyard, MetalsMiningData, ManufacturingData,
  EnergyData, EnergyFacility, EnergyFuel, LogisticsData, Chokepoint, Port,
  TelecomData, SubmarineCable, SatelliteConstellation,
  TechnologyData, TechCompetition, RdSpending,
} from '@/lib/types';
import { getRiskColor } from '@/lib/colors';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { MineralOverviewTab, SectorOverviewTab } from './tabs/OverviewTab';
import { SupplyChainTab } from './tabs/SupplyChainTab';
import { MineralFacilitiesTab, SectorFacilitiesTab } from './tabs/FacilitiesTab';
import { InvestmentsTab } from './tabs/InvestmentsTab';
import { MineralDefenseTab, SectorDependenciesTab } from './tabs/DefenseTab';
import { IntelReportTab } from './tabs/IntelReportTab';
import { ENTITY_REGISTRY } from '@/lib/entityRegistry';
import { ShipbuildingTab } from './tabs/ShipbuildingTab';
import { MunitionsTab } from './tabs/MunitionsTab';
import { InternationalTab } from './tabs/InternationalTab';
import { EnergyOverviewTab, BatteryMineralsTab } from './tabs/EnergyOverviewTab';
import { LogisticsOverviewTab, ChokepointsTab, MerchantFleetTab, PortsTab } from './tabs/LogisticsOverviewTab';
import { TelecomOverviewTab, CablesTab, SatellitesTab } from './tabs/TelecomOverviewTab';
import { TechnologyOverviewTab, RdSpendingTab, DefenseRdStatesTab } from './tabs/TechnologyOverviewTab';

type DetailType = 'mineral' | 'manufacturing-sector' | 'country'
  | 'energy-overview' | 'energy-fuel' | 'energy-facility'
  | 'logistics-overview' | 'chokepoint' | 'port'
  | 'telecom-overview' | 'cable' | 'satellite'
  | 'technology-overview' | 'tech-competition' | 'rd-spending'
  | null;

interface DetailPanelProps {
  type: DetailType;
  selectedItemId?: string;
  mineral?: Mineral;
  sector?: ManufacturingSector;
  countryIso?: string;
  countryName?: string;
  metalsMiningData?: MetalsMiningData | null;
  manufacturingData?: ManufacturingData | null;
  energyData?: EnergyData | null;
  logisticsData?: LogisticsData | null;
  telecomData?: TelecomData | null;
  technologyData?: TechnologyData | null;
  crossSectorData?: CrossSectorData | null;
  facilities?: Facility[];
  shipyards?: Shipyard[];
  investments?: Investment[];
  defensePrograms?: DefenseProgram[];
  supplyChainNotes?: Record<string, any>;
  onClose: () => void;
  onCrossSectorNav?: (type: 'mineral' | 'manufacturing-sector', id: string) => void;
  onCountryClick?: (iso: string, name: string) => void;
  graphEntities?: any[];
  graphRelationships?: any[];
}

const MINERAL_TABS = ['Overview', 'Supply Chain', 'Facilities', 'Investments', 'Defense', 'Intel'] as const;
const SECTOR_TABS = ['Overview', 'States/Facilities', 'Dependencies', 'Shipbuilding', 'Munitions', 'International', 'Investments'] as const;
const ENERGY_TABS = ['Overview', 'Battery Minerals', 'Intel'] as const;
const ENERGY_ITEM_TABS = ['Detail', 'Intel'] as const;
const LOGISTICS_TABS = ['Overview', 'Chokepoints', 'Merchant Fleet', 'Ports', 'Intel'] as const;
const LOGISTICS_ITEM_TABS = ['Detail', 'Intel'] as const;
const TELECOM_TABS = ['Overview', 'Cables', 'Satellites', 'Intel'] as const;
const TELECOM_ITEM_TABS = ['Detail', 'Intel'] as const;
const TECHNOLOGY_TABS = ['Overview', 'R&D Spending', 'Top States', 'Intel'] as const;
const TECH_ITEM_TABS = ['Detail', 'Intel'] as const;

export default function DetailPanel({
  type,
  selectedItemId,
  mineral,
  sector,
  countryIso,
  countryName,
  metalsMiningData,
  manufacturingData,
  energyData,
  logisticsData,
  telecomData,
  technologyData,
  crossSectorData,
  facilities = [],
  shipyards = [],
  investments = [],
  defensePrograms = [],
  supplyChainNotes,
  onClose,
  onCrossSectorNav,
  onCountryClick,
  graphEntities = [],
  graphRelationships = [],
}: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  // Three height states: 0 = collapsed, 1 = default, 2 = expanded
  const [panelSize, setPanelSize] = useState<0 | 1 | 2>(1);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    setActiveTab(0);
    setPanelSize(1);
  }, [mineral?.id, sector?.naics_code, countryIso, type, selectedItemId]);

  const cyclePanelSize = () => {
    setPanelSize((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
  };

  const panelHeightClass =
    panelSize === 0 ? 'max-h-[30vh]' :
    panelSize === 1 ? 'max-h-[45vh]' :
    'max-h-[75vh]';

  const chevronRotation =
    panelSize === 0 ? '' :          // points up (expand)
    panelSize === 1 ? '' :          // points up (expand more)
    'rotate-180';                    // points down (collapse)

  const panelSizeLabel =
    panelSize === 0 ? 'Expand' :
    panelSize === 1 ? 'Expand more' :
    'Collapse';

  if (!type) return null;

  // Sector lenses need their data loaded to render
  const isEnergyType = type === 'energy-overview' || type === 'energy-fuel' || type === 'energy-facility';
  const isLogisticsType = type === 'logistics-overview' || type === 'chokepoint' || type === 'port';
  const isTelecomType = type === 'telecom-overview' || type === 'cable' || type === 'satellite';
  const isTechType = type === 'technology-overview' || type === 'tech-competition' || type === 'rd-spending';

  if (isEnergyType && !energyData) return null;
  if (isLogisticsType && !logisticsData) return null;
  if (isTelecomType && !telecomData) return null;
  if (isTechType && !technologyData) return null;

  // Look up specific items from data
  const selectedFacility = (type === 'energy-facility' && energyData && selectedItemId)
    ? energyData.key_facilities.find(f => f.name.toLowerCase().replace(/\s+/g, '-') === selectedItemId)
    : undefined;
  const selectedFuel = (type === 'energy-fuel' && energyData && selectedItemId)
    ? energyData.generation_by_fuel.find(f => f.fuel.toLowerCase().replace(/\s+/g, '-') === selectedItemId)
    : undefined;
  const selectedChokepoint = (type === 'chokepoint' && logisticsData && selectedItemId)
    ? logisticsData.chokepoints.find(cp => cp.name.toLowerCase().replace(/\s+/g, '-') === selectedItemId)
    : undefined;
  const selectedPort = (type === 'port' && logisticsData && selectedItemId)
    ? logisticsData.major_ports.find(p => p.name.toLowerCase().replace(/\s+/g, '-') === selectedItemId)
    : undefined;
  const selectedCable = (type === 'cable' && telecomData && selectedItemId)
    ? telecomData.key_cables.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === selectedItemId)
    : undefined;
  const selectedSatellite = (type === 'satellite' && telecomData && selectedItemId)
    ? telecomData.satellite_constellations.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === selectedItemId)
    : undefined;
  const selectedTech = (type === 'tech-competition' && technologyData && selectedItemId)
    ? technologyData.tech_competition.find(t => t.technology.toLowerCase().replace(/\s+/g, '-') === selectedItemId)
    : undefined;
  const selectedRd = (type === 'rd-spending' && technologyData && selectedItemId)
    ? technologyData.rd_spending.find(r => r.entity.toLowerCase().replace(/\s+/g, '-') === selectedItemId)
    : undefined;

  const tabs = type === 'mineral' ? MINERAL_TABS
    : type === 'manufacturing-sector' ? SECTOR_TABS
    : type === 'energy-overview' ? ENERGY_TABS
    : (type === 'energy-fuel' || type === 'energy-facility') ? ENERGY_ITEM_TABS
    : type === 'logistics-overview' ? LOGISTICS_TABS
    : type === 'chokepoint' ? (selectedChokepoint ? LOGISTICS_ITEM_TABS : LOGISTICS_TABS)
    : type === 'port' ? (selectedPort ? LOGISTICS_ITEM_TABS : LOGISTICS_TABS)
    : type === 'telecom-overview' ? TELECOM_TABS
    : (type === 'cable' || type === 'satellite') ? TELECOM_ITEM_TABS
    : type === 'technology-overview' ? TECHNOLOGY_TABS
    : (type === 'tech-competition' || type === 'rd-spending') ? TECH_ITEM_TABS
    : ['Minerals Produced'] as const;

  const handleMineralClick = (mineralName: string) => {
    if (!onCrossSectorNav) return;
    const id = mineralName.toLowerCase().replace(/\s+/g, '-');
    onCrossSectorNav('mineral', id);
  };

  const handleSectorClickFromMineral = (naicsCode: string) => {
    if (!onCrossSectorNav) return;
    onCrossSectorNav('manufacturing-sector', naicsCode);
  };

  const containerClass = isDesktop
    ? 'absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-3'
    : 'absolute bottom-0 left-0 right-0 z-30 w-full max-w-none px-0';

  return (
    <div className={containerClass}>
      <div className={`panel ${isDesktop ? 'rounded-xl' : 'rounded-t-xl'} overflow-hidden animate-slide-up`}>
        {/* Header */}
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {type === 'mineral' && mineral?.name}
              {type === 'manufacturing-sector' && sector?.name}
              {type === 'country' && countryName}
              {type === 'energy-overview' && 'Energy Sector'}
              {type === 'energy-fuel' && (selectedFuel?.fuel || 'Energy Fuel')}
              {type === 'energy-facility' && (selectedFacility?.name || 'Energy Facility')}
              {type === 'logistics-overview' && 'Maritime & Logistics'}
              {type === 'chokepoint' && (selectedChokepoint?.name || 'Maritime & Logistics')}
              {type === 'port' && (selectedPort?.name || 'Port')}
              {type === 'telecom-overview' && 'Telecom & Space'}
              {type === 'cable' && (selectedCable?.name || 'Submarine Cable')}
              {type === 'satellite' && (selectedSatellite?.name || 'Satellite Constellation')}
              {type === 'technology-overview' && 'Technology & R&D'}
              {type === 'tech-competition' && (selectedTech?.technology || 'Technology')}
              {type === 'rd-spending' && (selectedRd?.entity || 'R&D Spending')}
            </h3>
            {type === 'mineral' && mineral && (
              <span className="text-[11px] text-gray-400 font-normal">
                Risk: {Math.round(mineral.risk_scores.overall_risk)}/100
              </span>
            )}
            {type === 'country' && countryIso && (
              <span className="text-[11px] text-gray-400 font-normal">{countryIso}</span>
            )}
            {type === 'energy-overview' && energyData && (
              <span className="text-[11px] text-gray-400 font-normal">
                {energyData.summary.total_capacity_gw} GW
              </span>
            )}
            {type === 'energy-fuel' && selectedFuel && (
              <span className="text-[11px] text-gray-400 font-normal">
                {selectedFuel.share_pct}% of generation
              </span>
            )}
            {type === 'energy-facility' && selectedFacility && (
              <span className="text-[11px] text-gray-400 font-normal">
                {selectedFacility.capacity_mw.toLocaleString()} MW
              </span>
            )}
            {type === 'logistics-overview' && logisticsData && (
              <span className="text-[11px] text-gray-400 font-normal">
                {logisticsData.summary.us_flagged_vessels} U.S. vessels
              </span>
            )}
            {type === 'chokepoint' && selectedChokepoint && (
              <span className="text-[11px] text-gray-400 font-normal">
                {selectedChokepoint.risk} risk
              </span>
            )}
            {type === 'port' && selectedPort && (
              <span className="text-[11px] text-gray-400 font-normal">
                {selectedPort.type === 'military' ? 'Naval' : `#${selectedPort.rank_global} global`}
              </span>
            )}
            {type === 'telecom-overview' && telecomData && (
              <span className="text-[11px] text-gray-400 font-normal">
                {telecomData.summary.submarine_cables} cables
              </span>
            )}
            {type === 'cable' && selectedCable && (
              <span className="text-[11px] text-gray-400 font-normal">
                {selectedCable.capacity_tbps} Tbps
              </span>
            )}
            {type === 'satellite' && selectedSatellite && (
              <span className="text-[11px] text-gray-400 font-normal">
                {selectedSatellite.satellites_deployed.toLocaleString()} deployed
              </span>
            )}
            {type === 'technology-overview' && technologyData && (
              <span className="text-[11px] text-gray-400 font-normal">
                ${technologyData.summary.dod_rd_budget_b}B DoD R&D
              </span>
            )}
            {type === 'tech-competition' && selectedTech && (
              <span className="text-[11px] text-gray-400 font-normal">
                {selectedTech.risk} risk
              </span>
            )}
            {type === 'rd-spending' && selectedRd && (
              <span className="text-[11px] text-gray-400 font-normal">
                ${selectedRd.amount_b}B
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={cyclePanelSize}
              className="p-1 hover:bg-gray-100 rounded-full"
              title={panelSizeLabel}
              aria-label={panelSizeLabel}
            >
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${chevronRotation}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full" aria-label="Close">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto" role="tablist" aria-label="Detail panel tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              role="tab"
              aria-selected={activeTab === i}
              className={`px-3 py-1.5 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === i
                  ? 'border-navy text-navy'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className={`p-4 overflow-y-auto transition-all duration-300 ease-in-out ${panelHeightClass}`}
          role="tabpanel"
        >
          {type === 'mineral' && mineral && (
            <>
              {activeTab === 0 && (
                <MineralOverviewTab
                  mineral={mineral}
                  crossSectorData={crossSectorData}
                  onSectorClick={handleSectorClickFromMineral}
                  supplyChainNotes={supplyChainNotes}
                />
              )}
              {activeTab === 1 && <SupplyChainTab mineral={mineral} supplyChainNotes={supplyChainNotes} onCountryClick={onCountryClick} />}
              {activeTab === 2 && (
                <MineralFacilitiesTab mineralName={mineral.name} facilities={facilities} supplyChainNotes={supplyChainNotes} />
              )}
              {activeTab === 3 && (
                <InvestmentsTab mineralName={mineral.name} investments={investments} />
              )}
              {activeTab === 4 && (
                <MineralDefenseTab
                  mineralName={mineral.name}
                  defensePrograms={defensePrograms}
                  graphEntities={graphEntities}
                  graphRelationships={graphRelationships}
                  minerals={metalsMiningData?.minerals || []}
                  onMineralClick={handleMineralClick}
                />
              )}
              {activeTab === 5 && (
                <IntelReportTab entityType="mineral" entityId={mineral.id} />
              )}
            </>
          )}

          {type === 'manufacturing-sector' && sector && (
            <>
              {activeTab === 0 && <SectorOverviewTab sector={sector} />}
              {activeTab === 1 && <SectorFacilitiesTab sector={sector} shipyards={shipyards} />}
              {activeTab === 2 && (
                <SectorDependenciesTab
                  naicsCode={sector.naics_code}
                  crossSectorData={crossSectorData || null}
                  onMineralClick={handleMineralClick}
                />
              )}
              {activeTab === 3 && (
                <ShipbuildingTab data={manufacturingData?.shipbuilding || []} />
              )}
              {activeTab === 4 && (
                <MunitionsTab data={manufacturingData?.munitions || []} />
              )}
              {activeTab === 5 && (
                <InternationalTab data={manufacturingData?.international || []} />
              )}
              {activeTab === 6 && <InvestmentsTab investments={investments} />}
            </>
          )}

          {type === 'country' && countryIso && metalsMiningData && (
            <CountryMineralsView
              countryIso={countryIso}
              minerals={metalsMiningData.minerals}
              onMineralClick={handleMineralClick}
            />
          )}

          {type === 'energy-overview' && energyData && (
            <>
              {activeTab === 0 && <EnergyOverviewTab data={energyData} />}
              {activeTab === 1 && <BatteryMineralsTab data={energyData} />}
              {activeTab === 2 && <IntelReportTab entityType="energy-overview" entityId="" />}
            </>
          )}

          {type === 'energy-fuel' && energyData && selectedFuel && (
            <>
              {activeTab === 0 && <EnergyFuelDetail fuel={selectedFuel} data={energyData} />}
              {activeTab === 1 && <IntelReportTab entityType="energy-fuel" entityId={selectedItemId || ''} />}
            </>
          )}

          {type === 'energy-facility' && energyData && selectedFacility && (
            <>
              {activeTab === 0 && <EnergyFacilityDetail facility={selectedFacility} />}
              {activeTab === 1 && <IntelReportTab entityType="energy-facility" entityId={selectedItemId || ''} />}
            </>
          )}

          {type === 'logistics-overview' && logisticsData && (
            <>
              {activeTab === 0 && <LogisticsOverviewTab data={logisticsData} />}
              {activeTab === 1 && <ChokepointsTab data={logisticsData} />}
              {activeTab === 2 && <MerchantFleetTab data={logisticsData} />}
              {activeTab === 3 && <PortsTab data={logisticsData} />}
              {activeTab === 4 && <IntelReportTab entityType="logistics-overview" entityId="" />}
            </>
          )}

          {type === 'chokepoint' && logisticsData && (
            <>
              {selectedChokepoint ? (
                <>
                  {activeTab === 0 && <ChokepointDetail chokepoint={selectedChokepoint} />}
                  {activeTab === 1 && <IntelReportTab entityType="chokepoint" entityId={selectedItemId || ''} />}
                </>
              ) : (
                <>
                  {activeTab === 0 && <LogisticsOverviewTab data={logisticsData} />}
                  {activeTab === 1 && <ChokepointsTab data={logisticsData} />}
                  {activeTab === 2 && <MerchantFleetTab data={logisticsData} />}
                  {activeTab === 3 && <PortsTab data={logisticsData} />}
                  {activeTab === 4 && <IntelReportTab entityType="logistics-overview" entityId="" />}
                </>
              )}
            </>
          )}

          {type === 'port' && logisticsData && (
            <>
              {selectedPort ? (
                <>
                  {activeTab === 0 && <PortDetail port={selectedPort} />}
                  {activeTab === 1 && <IntelReportTab entityType="port" entityId={selectedItemId || ''} />}
                </>
              ) : (
                <>
                  {activeTab === 0 && <LogisticsOverviewTab data={logisticsData} />}
                  {activeTab === 1 && <ChokepointsTab data={logisticsData} />}
                  {activeTab === 2 && <MerchantFleetTab data={logisticsData} />}
                  {activeTab === 3 && <PortsTab data={logisticsData} />}
                  {activeTab === 4 && <IntelReportTab entityType="logistics-overview" entityId="" />}
                </>
              )}
            </>
          )}

          {type === 'telecom-overview' && telecomData && (
            <>
              {activeTab === 0 && <TelecomOverviewTab data={telecomData} />}
              {activeTab === 1 && <CablesTab data={telecomData} />}
              {activeTab === 2 && <SatellitesTab data={telecomData} />}
              {activeTab === 3 && <IntelReportTab entityType="telecom-overview" entityId="" />}
            </>
          )}

          {type === 'cable' && telecomData && selectedCable && (
            <>
              {activeTab === 0 && <CableDetail cable={selectedCable} />}
              {activeTab === 1 && <IntelReportTab entityType="cable" entityId={selectedItemId || ''} />}
            </>
          )}

          {type === 'satellite' && telecomData && selectedSatellite && (
            <>
              {activeTab === 0 && <SatelliteDetail satellite={selectedSatellite} />}
              {activeTab === 1 && <IntelReportTab entityType="satellite" entityId={selectedItemId || ''} />}
            </>
          )}

          {type === 'technology-overview' && technologyData && (
            <>
              {activeTab === 0 && <TechnologyOverviewTab data={technologyData} />}
              {activeTab === 1 && <RdSpendingTab data={technologyData} />}
              {activeTab === 2 && <DefenseRdStatesTab data={technologyData} />}
              {activeTab === 3 && <IntelReportTab entityType="technology-overview" entityId="" />}
            </>
          )}

          {type === 'tech-competition' && technologyData && selectedTech && (
            <>
              {activeTab === 0 && <TechCompetitionDetail tech={selectedTech} />}
              {activeTab === 1 && <IntelReportTab entityType="tech-competition" entityId={selectedItemId || ''} />}
            </>
          )}

          {type === 'rd-spending' && technologyData && selectedRd && (
            <>
              {activeTab === 0 && <RdSpendingDetail rd={selectedRd} />}
              {activeTab === 1 && <IntelReportTab entityType="rd-spending" entityId={selectedItemId || ''} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Detail view for a specific energy fuel type */
function EnergyFuelDetail({ fuel, data }: { fuel: EnergyFuel; data: EnergyData }) {
  const relatedFacilities = data.key_facilities.filter(f => f.type === fuel.fuel);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold" style={{ color: fuel.color }}>{fuel.share_pct}%</div>
          <div className="text-[11px] text-gray-500">Share</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{fuel.capacity_gw}</div>
          <div className="text-[11px] text-gray-500">GW Capacity</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{fuel.generation_twh}</div>
          <div className="text-[11px] text-gray-500">TWh/yr</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${
            fuel.trend === 'growing' || fuel.trend === 'rapidly growing' ? 'text-emerald-600' :
            fuel.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {fuel.trend === 'rapidly growing' ? 'Rapid' :
             fuel.trend.charAt(0).toUpperCase() + fuel.trend.slice(1)}
          </div>
          <div className="text-[11px] text-gray-500">Trend</div>
        </div>
      </div>

      <div className="mt-2">
        <div className="gauge-bar h-4 flex items-center">
          <div
            className="gauge-fill h-full flex items-center px-2"
            style={{ width: `${Math.max(fuel.share_pct, 3)}%`, backgroundColor: fuel.color }}
          >
            <span className="text-[10px] text-white font-medium">{fuel.share_pct}%</span>
          </div>
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">Share of U.S. electricity generation</div>
      </div>

      {relatedFacilities.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-[11px] font-medium text-gray-700 mb-1.5">
            Key {fuel.fuel} Facilities ({relatedFacilities.length})
          </div>
          <div className="space-y-1">
            {relatedFacilities.map(f => (
              <div key={f.name} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="text-[11px] font-medium text-gray-900">{f.name}</div>
                  <span className="text-[11px] font-mono text-gray-600 shrink-0">{f.capacity_mw.toLocaleString()} MW</span>
                </div>
                <div className="mt-0.5 text-[11px] text-gray-500">{f.operator} · {f.state}</div>
                {f.notes && <div className="mt-0.5 text-[11px] text-gray-400">{f.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Detail view for a specific energy facility */
function EnergyFacilityDetail({ facility }: { facility: EnergyFacility }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{facility.capacity_mw.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500">MW Capacity</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{facility.type}</div>
          <div className="text-[11px] text-gray-500">Fuel Type</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">{facility.state}</div>
          <div className="text-[11px] text-gray-500">State</div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Operator</span>
          <span className="text-gray-900 font-medium">{facility.operator}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Location</span>
          <span className="text-gray-900">{facility.state} ({facility.lat.toFixed(2)}, {facility.lon.toFixed(2)})</span>
        </div>
      </div>

      {facility.notes && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-[11px] font-medium text-gray-700 mb-1">Notes</div>
          <div className="text-[11px] text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
            {facility.notes}
          </div>
        </div>
      )}
    </div>
  );
}

/** Detail view for a specific chokepoint */
function ChokepointDetail({ chokepoint }: { chokepoint: Chokepoint }) {
  const riskColors: Record<string, string> = {
    critical: 'bg-red-50 text-red-600 border-red-200',
    high: 'bg-amber-50 text-amber-600 border-amber-200',
    moderate: 'bg-blue-50 text-blue-600 border-blue-200',
    low: 'bg-green-50 text-green-600 border-green-200',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={`badge text-[11px] ${riskColors[chokepoint.risk] || riskColors.moderate}`}>
          {chokepoint.risk} risk
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{chokepoint.daily_vessels}</div>
          <div className="text-[11px] text-gray-500">Ships/Day</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {chokepoint.oil_flow_mbd > 0 ? `${chokepoint.oil_flow_mbd}M` : 'N/A'}
          </div>
          <div className="text-[11px] text-gray-500">bbl/day Oil</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{chokepoint.trade_value_pct}%</div>
          <div className="text-[11px] text-gray-500">Global Trade</div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Coordinates</span>
          <span className="text-gray-900">{chokepoint.lat.toFixed(2)}, {chokepoint.lon.toFixed(2)}</span>
        </div>
      </div>

      {chokepoint.notes && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-[11px] font-medium text-gray-700 mb-1">Strategic Assessment</div>
          <div className="text-[11px] text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
            {chokepoint.notes}
          </div>
        </div>
      )}
    </div>
  );
}

/** Detail view for a specific port */
function PortDetail({ port }: { port: Port }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {port.type === 'military' ? 'Naval' : `#${port.rank_global}`}
          </div>
          <div className="text-[11px] text-gray-500">
            {port.type === 'military' ? 'Type' : 'Global Rank'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {port.type === 'military' ? 'Military' : `${port.teu_millions}M`}
          </div>
          <div className="text-[11px] text-gray-500">
            {port.type === 'military' ? 'Purpose' : 'TEU/yr'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">{port.country}</div>
          <div className="text-[11px] text-gray-500">Country</div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Type</span>
          <span className="text-gray-900 font-medium capitalize">{port.type}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Country</span>
          <span className="text-gray-900">{port.country} ({port.country_iso})</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Location</span>
          <span className="text-gray-900">{port.lat.toFixed(2)}, {port.lon.toFixed(2)}</span>
        </div>
      </div>

      {port.notes && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-[11px] font-medium text-gray-700 mb-1">Notes</div>
          <div className="text-[11px] text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
            {port.notes}
          </div>
        </div>
      )}
    </div>
  );
}

/** Detail view for a specific submarine cable */
function CableDetail({ cable }: { cable: SubmarineCable }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{cable.capacity_tbps}</div>
          <div className="text-[11px] text-gray-500">Tbps</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{cable.length_km.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500">km Length</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">{cable.year}</div>
          <div className="text-[11px] text-gray-500">Year</div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-purple-900">{cable.from}</span>
          <span className="text-purple-400 px-2">&rarr;</span>
          <span className="font-medium text-purple-900">{cable.to}</span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Owner</span>
          <span className="text-gray-900 font-medium">{cable.owner}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Capacity</span>
          <span className="text-gray-900">{cable.capacity_tbps} Tbps</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Year operational</span>
          <span className="text-gray-900">{cable.year}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">From coordinates</span>
          <span className="text-gray-900">{cable.lat_from.toFixed(2)}, {cable.lon_from.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">To coordinates</span>
          <span className="text-gray-900">{cable.lat_to.toFixed(2)}, {cable.lon_to.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/** Detail view for a specific satellite constellation */
function SatelliteDetail({ satellite }: { satellite: SatelliteConstellation }) {
  const deployPct = satellite.satellites_planned > 0
    ? Math.round((satellite.satellites_deployed / satellite.satellites_planned) * 100)
    : 0;

  const statusColors: Record<string, string> = {
    'Operational': 'bg-green-50 text-green-600 border-green-200',
    'Early deployment': 'bg-amber-50 text-amber-600 border-amber-200',
    'Planned': 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={`badge text-[11px] ${statusColors[satellite.status] || statusColors.Planned}`}>
          {satellite.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{satellite.satellites_deployed.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500">Deployed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-500">{satellite.satellites_planned.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500">Planned</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{deployPct}%</div>
          <div className="text-[11px] text-gray-500">Complete</div>
        </div>
      </div>

      <div className="mt-1">
        <div className="gauge-bar h-3">
          <div
            className="gauge-fill h-full"
            style={{
              width: `${Math.max(deployPct, 2)}%`,
              backgroundColor: satellite.country_iso === 'US' ? '#8B5CF6' :
                satellite.country_iso === 'CN' ? '#DC2626' : '#6B7280',
            }}
          />
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          {satellite.satellites_deployed.toLocaleString()} of {satellite.satellites_planned.toLocaleString()} satellites
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Operator</span>
          <span className="text-gray-900 font-medium">{satellite.operator}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Country</span>
          <span className="text-gray-900">{satellite.country}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Orbit</span>
          <span className="text-gray-900">{satellite.orbit}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Purpose</span>
          <span className="text-gray-900">{satellite.purpose}</span>
        </div>
      </div>
    </div>
  );
}

/** Detail view for a specific technology competition area */
function TechCompetitionDetail({ tech }: { tech: TechCompetition }) {
  const riskColors: Record<string, string> = {
    critical: 'bg-red-50 text-red-600 border-red-200',
    high: 'bg-amber-50 text-amber-600 border-amber-200',
    moderate: 'bg-blue-50 text-blue-600 border-blue-200',
    low: 'bg-green-50 text-green-600 border-green-200',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={`badge text-[11px] ${riskColors[tech.risk] || riskColors.moderate}`}>
          {tech.risk} risk
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="text-[11px] font-medium text-blue-700 mb-1">U.S. Position</div>
          <div className="text-sm font-semibold text-blue-900">{tech.us_position}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <div className="text-[11px] font-medium text-red-700 mb-1">China Position</div>
          <div className="text-sm font-semibold text-red-900">{tech.china_position}</div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-500">Trend</span>
          <span className="text-gray-900 font-medium">{tech.trend}</span>
        </div>
        <div className="text-[11px]">
          <span className="text-gray-500">Defense Relevance</span>
          <div className="mt-1 text-gray-900 bg-gray-50 rounded-lg p-2 border border-gray-100">
            {tech.defense_relevance}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Detail view for a specific R&D spending entity */
function RdSpendingDetail({ rd }: { rd: RdSpending }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-600">${rd.amount_b}B</div>
          <div className="text-[11px] text-gray-500">Annual R&D Budget</div>
        </div>
        <div className="text-center flex items-center justify-center">
          <div className="text-[11px] text-gray-600 italic">{rd.source}</div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <div className="text-[11px] font-medium text-gray-700 mb-1">Focus Areas</div>
        <div className="text-[11px] text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
          {rd.focus}
        </div>
      </div>
    </div>
  );
}

/** Shows all minerals a country produces, sorted by share */
function CountryMineralsView({
  countryIso,
  minerals,
  onMineralClick,
}: {
  countryIso: string;
  minerals: Mineral[];
  onMineralClick: (name: string) => void;
}) {
  const produced: { mineral: Mineral; share: number; production: number | null }[] = [];

  for (const m of minerals) {
    const producers = m.supply_chain?.mining?.top_producers || [];
    const match = producers.find((p) => p.country_iso === countryIso);
    if (match) {
      produced.push({ mineral: m, share: match.share, production: match.production });
    }
  }

  produced.sort((a, b) => b.share - a.share);

  if (produced.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No critical mineral production data for this country.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-[11px] text-gray-500 mb-2">
        {produced.length} critical mineral{produced.length !== 1 ? 's' : ''} produced
      </div>
      {produced.map(({ mineral, share }) => {
        const risk = mineral.risk_scores.overall_risk;
        return (
          <button
            key={mineral.id}
            onClick={() => onMineralClick(mineral.name)}
            className="w-full flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-gray-900">{mineral.name}</div>
            </div>
            <div className="text-[11px] font-mono text-gray-600 w-12 text-right">
              {(share * 100).toFixed(0)}%
            </div>
            <div className="w-20">
              <div className="gauge-bar h-1.5">
                <div
                  className="gauge-fill"
                  style={{ width: `${share * 100}%`, backgroundColor: getRiskColor(risk) }}
                />
              </div>
            </div>
            <span
              className="text-[11px] font-mono w-6 text-right"
              style={{ color: getRiskColor(risk) }}
            >
              {Math.round(risk)}
            </span>
          </button>
        );
      })}
      <div className="text-[11px] text-gray-400 pt-1">
        Click a mineral to view details
      </div>
    </div>
  );
}
