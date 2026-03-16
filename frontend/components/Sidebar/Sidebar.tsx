'use client';

import { useState } from 'react';
import type { LensId, Mineral, ManufacturingSector, EnergyData, LogisticsData, TelecomData, TechnologyData } from '@/lib/types';
import { getRiskLevel, getRiskColor, formatPct, formatNumber } from '@/lib/colors';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { useMediaQuery } from '@/lib/useMediaQuery';
import SearchBar from './SearchBar';

interface SidebarProps {
  activeLens: LensId;
  minerals?: Mineral[];
  manufacturingSectors?: ManufacturingSector[];
  energyData?: EnergyData | null;
  logisticsData?: LogisticsData | null;
  telecomData?: TelecomData | null;
  technologyData?: TechnologyData | null;
  facilityCountByMineral?: Record<string, number>;
  onItemClick?: (id: string, type: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  activeLens, minerals = [], manufacturingSectors = [],
  energyData, logisticsData, telecomData, technologyData,
  facilityCountByMineral = {},
  onItemClick, collapsed, onToggle,
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="absolute left-3 top-16 z-20 panel rounded-lg p-2 hover:bg-gray-50"
        title="Show sidebar"
        aria-label="Show sidebar"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    );
  }

  // Energy lens sidebar
  if (activeLens === 'energy') {
    const containerClass = isDesktop
      ? 'absolute left-3 top-16 bottom-3 z-20 w-72 panel rounded-xl flex flex-col overflow-hidden animate-fade-in'
      : 'absolute bottom-0 left-0 right-0 max-h-[50vh] z-20 panel rounded-t-xl flex flex-col overflow-hidden animate-fade-in';

    return (
      <div className={containerClass}>
        <div className="panel-header">
          <h2 className="text-sm font-semibold text-gray-900">Energy Generation</h2>
          <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded" aria-label="Close sidebar">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Energy generation by fuel">
          {!energyData ? (
            <SkeletonRows count={6} />
          ) : (
            <EnergyList data={energyData} onItemClick={onItemClick} />
          )}
        </div>
        <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-400">
          {energyData ? `${energyData.summary.total_capacity_gw} GW total capacity` : 'Loading...'}
          {' '}&middot; Public data only &middot; MIT License
        </div>
      </div>
    );
  }

  // Logistics lens sidebar
  if (activeLens === 'logistics') {
    const containerClass = isDesktop
      ? 'absolute left-3 top-16 bottom-3 z-20 w-72 panel rounded-xl flex flex-col overflow-hidden animate-fade-in'
      : 'absolute bottom-0 left-0 right-0 max-h-[50vh] z-20 panel rounded-t-xl flex flex-col overflow-hidden animate-fade-in';

    return (
      <div className={containerClass}>
        <div className="panel-header">
          <h2 className="text-sm font-semibold text-gray-900">Maritime & Logistics</h2>
          <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded" aria-label="Close sidebar">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Chokepoints and ports">
          {!logisticsData ? (
            <SkeletonRows count={6} />
          ) : (
            <LogisticsList data={logisticsData} onItemClick={onItemClick} />
          )}
        </div>
        <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-400">
          {logisticsData ? `${logisticsData.chokepoints.length} chokepoints · ${logisticsData.major_ports.length} ports` : 'Loading...'}
          {' '}&middot; Public data only &middot; MIT License
        </div>
      </div>
    );
  }

  // Telecom lens sidebar
  if (activeLens === 'telecom') {
    const containerClass = isDesktop
      ? 'absolute left-3 top-16 bottom-3 z-20 w-72 panel rounded-xl flex flex-col overflow-hidden animate-fade-in'
      : 'absolute bottom-0 left-0 right-0 max-h-[50vh] z-20 panel rounded-t-xl flex flex-col overflow-hidden animate-fade-in';

    return (
      <div className={containerClass}>
        <div className="panel-header">
          <h2 className="text-sm font-semibold text-gray-900">Telecom & Space</h2>
          <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded" aria-label="Close sidebar">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Cables and constellations">
          {!telecomData ? (
            <SkeletonRows count={6} />
          ) : (
            <TelecomList data={telecomData} onItemClick={onItemClick} />
          )}
        </div>
        <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-400">
          {telecomData ? `${telecomData.key_cables.length} cables · ${telecomData.satellite_constellations.length} constellations` : 'Loading...'}
          {' '}&middot; Public data only &middot; MIT License
        </div>
      </div>
    );
  }

  // Technology lens sidebar
  if (activeLens === 'technology') {
    const containerClass = isDesktop
      ? 'absolute left-3 top-16 bottom-3 z-20 w-72 panel rounded-xl flex flex-col overflow-hidden animate-fade-in'
      : 'absolute bottom-0 left-0 right-0 max-h-[50vh] z-20 panel rounded-t-xl flex flex-col overflow-hidden animate-fade-in';

    return (
      <div className={containerClass}>
        <div className="panel-header">
          <h2 className="text-sm font-semibold text-gray-900">Technology & R&D</h2>
          <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded" aria-label="Close sidebar">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Technology competition">
          {!technologyData ? (
            <SkeletonRows count={6} />
          ) : (
            <TechnologyList data={technologyData} onItemClick={onItemClick} />
          )}
        </div>
        <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-400">
          {technologyData ? `${technologyData.tech_competition.length} tech areas · $${technologyData.summary.dod_rd_budget_b}B R&D` : 'Loading...'}
          {' '}&middot; Public data only &middot; MIT License
        </div>
      </div>
    );
  }

  // Mobile layout
  if (!isDesktop) {
    const mineralCount = minerals.length;
    const sectorCount = manufacturingSectors.length;

    if (!mobileExpanded) {
      return (
        <button
          onClick={() => setMobileExpanded(true)}
          className="absolute bottom-0 left-0 right-0 z-20 panel rounded-t-xl px-4 py-3 flex items-center justify-between"
          aria-label="Expand sidebar"
        >
          <div className="flex items-center gap-2">
            {/* Drag handle */}
            <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto" />
          </div>
          <span className="text-xs text-gray-600">
            {activeLens === 'metals-mining'
              ? `${mineralCount} minerals`
              : `${sectorCount} sectors`}
            {' '}&middot; Tap to expand
          </span>
        </button>
      );
    }

    return (
      <div className="absolute bottom-0 left-0 right-0 max-h-[50vh] z-20 panel rounded-t-xl flex flex-col overflow-hidden animate-fade-in">
        {/* Drag handle */}
        <button
          onClick={() => setMobileExpanded(false)}
          className="flex justify-center py-2"
          aria-label="Collapse sidebar"
        >
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </button>
        <div className="panel-header pt-0">
          <h2 className="text-sm font-semibold text-gray-900">
            {activeLens === 'metals-mining' ? 'Minerals by Risk' : 'Manufacturing Sectors'}
          </h2>
          <button onClick={() => setMobileExpanded(false)} className="p-1 hover:bg-gray-100 rounded" aria-label="Close sidebar">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <SearchBar value={search} onChange={setSearch} />

        <div className="flex-1 overflow-y-auto" role="listbox" aria-label={activeLens === 'metals-mining' ? 'Minerals list' : 'Sectors list'}>
          {activeLens === 'metals-mining' && (
            minerals.length === 0
              ? <SkeletonRows count={8} />
              : <MineralsList minerals={minerals} search={search} facilityCountByMineral={facilityCountByMineral} onItemClick={onItemClick} />
          )}
          {activeLens === 'manufacturing' && (
            manufacturingSectors.length === 0
              ? <SkeletonRows count={8} />
              : <ManufacturingList sectors={manufacturingSectors} search={search} onItemClick={onItemClick} />
          )}
        </div>

        <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-400">
          {activeLens === 'metals-mining' && `${minerals.length} minerals`}
          {activeLens === 'manufacturing' && `${manufacturingSectors.length} sectors`}
          {' '}&middot; Public data only &middot; MIT License
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="absolute left-3 top-16 bottom-3 z-20 w-72 panel rounded-xl flex flex-col overflow-hidden animate-fade-in">
      <div className="panel-header">
        <h2 className="text-sm font-semibold text-gray-900">
          {activeLens === 'metals-mining' ? 'Minerals by Risk' : 'Manufacturing Sectors'}
        </h2>
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded" aria-label="Close sidebar">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <div className="flex-1 overflow-y-auto" role="listbox" aria-label={activeLens === 'metals-mining' ? 'Minerals list' : 'Sectors list'}>
        {activeLens === 'metals-mining' && (
          minerals.length === 0
            ? <SkeletonRows count={8} />
            : <MineralsList minerals={minerals} search={search} facilityCountByMineral={facilityCountByMineral} onItemClick={onItemClick} />
        )}
        {activeLens === 'manufacturing' && (
          manufacturingSectors.length === 0
            ? <SkeletonRows count={8} />
            : <ManufacturingList sectors={manufacturingSectors} search={search} onItemClick={onItemClick} />
        )}
      </div>

      {/* Stats footer */}
      <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-400">
        {activeLens === 'metals-mining' && `${minerals.length} minerals`}
        {activeLens === 'manufacturing' && `${manufacturingSectors.length} sectors`}
        {' '}&middot; Public data only &middot; MIT License
      </div>
    </div>
  );
}

function MineralsList({ minerals, search, facilityCountByMineral, onItemClick }: {
  minerals: Mineral[]; search: string;
  facilityCountByMineral: Record<string, number>;
  onItemClick?: (id: string, type: string) => void;
}) {
  const filtered = minerals
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.risk_scores.overall_risk - a.risk_scores.overall_risk);

  return (
    <div className="divide-y divide-gray-50">
      {filtered.map((mineral) => {
        const risk = mineral.risk_scores.overall_risk;
        const facilityCount = facilityCountByMineral[mineral.name.toLowerCase()] || 0;
        return (
          <button
            key={mineral.id}
            onClick={() => onItemClick?.(mineral.id, 'mineral')}
            role="option"
            aria-label={`${mineral.name}, risk score ${Math.round(risk)}`}
            className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-900">{mineral.name}</span>
              <span
                className="badge text-[11px] py-0"
                style={{
                  backgroundColor: getRiskColor(risk) + '15',
                  color: getRiskColor(risk),
                  borderColor: getRiskColor(risk) + '30',
                }}
              >
                {Math.round(risk)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="truncate">
                {mineral.trade.primary_import_source || 'N/A'}
              </span>
              {mineral.risk_scores.single_source_risk && (
                <span className="shrink-0">· Single source</span>
              )}
              {facilityCount > 0 && (
                <span className="shrink-0 text-emerald-600">· {facilityCount} U.S. sites</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ManufacturingList({ sectors, search, onItemClick }: {
  sectors: ManufacturingSector[]; search: string;
  onItemClick?: (id: string, type: string) => void;
}) {
  const filtered = sectors
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.health_score - b.health_score);

  return (
    <div className="divide-y divide-gray-50">
      {filtered.map((sector) => (
        <button
          key={sector.naics_code}
          onClick={() => onItemClick?.(sector.naics_code, 'manufacturing-sector')}
          role="option"
          aria-label={`${sector.name}, health score ${Math.round(sector.health_score)}`}
          className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-900">{sector.name}</span>
            <span className="text-[11px] font-mono text-gray-500">
              {formatPct(sector.capacity_utilization)}
            </span>
          </div>
          <div className="mt-1">
            <div className="gauge-bar h-1">
              <div
                className="gauge-fill"
                style={{
                  width: `${Math.min(sector.health_score, 100)}%`,
                  backgroundColor: getRiskColor(100 - sector.health_score),
                }}
              />
            </div>
          </div>
          <div className="flex justify-between mt-0.5 text-[11px] text-gray-400">
            <span>{sector.employment ? formatNumber(sector.employment) : 'N/A'} emp</span>
            <span>Health: {sector.health_score.toFixed(0)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function EnergyList({ data, onItemClick }: {
  data: EnergyData;
  onItemClick?: (id: string, type: string) => void;
}) {
  return (
    <div className="divide-y divide-gray-50">
      {/* Sector Overview button */}
      <button
        onClick={() => onItemClick?.('energy', 'energy-overview')}
        className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors border-b border-gray-100"
      >
        <div className="text-xs font-medium text-gray-900">Sector Overview</div>
        <div className="text-[11px] text-gray-400">Grid challenges, battery minerals, sector intel</div>
      </button>
      {/* Summary stat */}
      <div className="px-3 py-2 bg-gray-50/50">
        <div className="text-[11px] text-gray-500">{data.summary.headline}</div>
      </div>
      {/* Generation by fuel */}
      {data.generation_by_fuel.map((fuel) => (
        <button
          key={fuel.fuel}
          onClick={() => onItemClick?.(fuel.fuel.toLowerCase().replace(/\s+/g, '-'), 'energy-fuel')}
          role="option"
          aria-label={`${fuel.fuel}, ${fuel.share_pct}% of generation`}
          className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: fuel.color }}
              />
              <span className="text-xs font-medium text-gray-900">{fuel.fuel}</span>
            </div>
            <span className="text-[11px] font-mono text-gray-600">
              {fuel.share_pct}%
            </span>
          </div>
          <div className="mt-1 ml-[18px]">
            <div className="gauge-bar h-1.5">
              <div
                className="gauge-fill"
                style={{
                  width: `${Math.max(fuel.share_pct, 2)}%`,
                  backgroundColor: fuel.color,
                }}
              />
            </div>
          </div>
          <div className="flex justify-between mt-0.5 ml-[18px] text-[11px] text-gray-400">
            <span>{fuel.capacity_gw} GW capacity</span>
            <span className={
              fuel.trend === 'growing' || fuel.trend === 'rapidly growing' ? 'text-emerald-600' :
              fuel.trend === 'declining' ? 'text-red-500' : 'text-gray-400'
            }>
              {fuel.trend}
            </span>
          </div>
        </button>
      ))}
      {/* Key Facilities section */}
      <div className="px-3 py-1.5">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Key Facilities</div>
      </div>
      {data.key_facilities.map((facility) => (
        <button
          key={facility.name}
          onClick={() => onItemClick?.(facility.name.toLowerCase().replace(/\s+/g, '-'), 'energy-facility')}
          role="option"
          aria-label={`${facility.name}, ${facility.capacity_mw} MW`}
          className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-900 truncate">{facility.name}</span>
            <span className="text-[11px] font-mono text-gray-500 shrink-0 ml-1">
              {facility.capacity_mw.toLocaleString()} MW
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400">
            {facility.operator} · {facility.state} · {facility.type}
          </div>
        </button>
      ))}
    </div>
  );
}

function TelecomList({ data, onItemClick }: {
  data: TelecomData;
  onItemClick?: (id: string, type: string) => void;
}) {
  return (
    <div className="divide-y divide-gray-50">
      {/* Summary stat */}
      <div className="px-3 py-2 bg-purple-50/50">
        <div className="text-[11px] text-purple-700">{data.summary.headline}</div>
      </div>
      {/* Cables section */}
      <div className="px-3 py-1.5">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Submarine Cables</div>
      </div>
      {data.key_cables.map((cable) => (
        <button
          key={cable.name}
          onClick={() => onItemClick?.(cable.name.toLowerCase().replace(/\s+/g, '-'), 'cable')}
          role="option"
          aria-label={`${cable.name}, ${cable.capacity_tbps} Tbps`}
          className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-900">{cable.name}</span>
            <span className="text-[11px] font-mono text-purple-600">
              {cable.capacity_tbps} Tbps
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400">
            {cable.owner} · {cable.length_km.toLocaleString()} km · {cable.year}
          </div>
        </button>
      ))}
      {/* Constellations section */}
      <div className="px-3 py-1.5">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Satellite Constellations</div>
      </div>
      {data.satellite_constellations.map((sat) => (
        <button
          key={sat.name}
          onClick={() => onItemClick?.(sat.name.toLowerCase().replace(/\s+/g, '-'), 'satellite')}
          role="option"
          aria-label={`${sat.name}, ${sat.satellites_deployed} satellites`}
          className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-900">{sat.name}</span>
            <span className={`badge text-[10px] py-0 ${
              sat.status === 'Operational' ? 'bg-green-50 text-green-600 border-green-200' :
              sat.status === 'Early deployment' ? 'bg-amber-50 text-amber-600 border-amber-200' :
              'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              {sat.status}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span>{sat.operator} ({sat.country})</span>
            <span>· {sat.satellites_deployed.toLocaleString()} deployed</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function TechnologyList({ data, onItemClick }: {
  data: TechnologyData;
  onItemClick?: (id: string, type: string) => void;
}) {
  const riskOrder: Record<string, number> = { critical: 0, high: 1, moderate: 2, low: 3 };
  const sorted = [...data.tech_competition].sort(
    (a, b) => (riskOrder[a.risk] ?? 4) - (riskOrder[b.risk] ?? 4)
  );

  return (
    <div className="divide-y divide-gray-50">
      {/* Summary stat */}
      <div className="px-3 py-2 bg-pink-50/50">
        <div className="text-[11px] text-pink-700">{data.summary.headline}</div>
      </div>
      {/* Tech competition */}
      <div className="px-3 py-1.5">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Technology Competition</div>
      </div>
      {sorted.map((tech) => (
        <button
          key={tech.technology}
          onClick={() => onItemClick?.(tech.technology.toLowerCase().replace(/\s+/g, '-'), 'tech-competition')}
          role="option"
          aria-label={`${tech.technology}, risk: ${tech.risk}`}
          className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-900">{tech.technology}</span>
            <span className={`badge text-[10px] py-0 ${
              tech.risk === 'critical' ? 'bg-red-50 text-red-600 border-red-200' :
              tech.risk === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
              tech.risk === 'moderate' ? 'bg-blue-50 text-blue-600 border-blue-200' :
              'bg-green-50 text-green-600 border-green-200'
            }`}>
              {tech.risk}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span>U.S.: {tech.us_position}</span>
            <span>· CN: {tech.china_position}</span>
          </div>
        </button>
      ))}
      {/* R&D Spending */}
      <div className="px-3 py-1.5">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">R&D Spending</div>
      </div>
      {data.rd_spending.map((r) => (
        <button
          key={r.entity}
          onClick={() => onItemClick?.(r.entity.toLowerCase().replace(/\s+/g, '-'), 'rd-spending')}
          role="option"
          aria-label={`${r.entity}, $${r.amount_b}B`}
          className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-900">{r.entity}</span>
            <span className="text-[11px] font-mono text-pink-600">
              ${r.amount_b}B
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400 truncate">
            {r.focus}
          </div>
        </button>
      ))}
    </div>
  );
}

function LogisticsList({ data, onItemClick }: {
  data: LogisticsData;
  onItemClick?: (id: string, type: string) => void;
}) {
  const riskOrder: Record<string, number> = { critical: 0, high: 1, moderate: 2, low: 3 };
  const sortedChokepoints = [...data.chokepoints].sort(
    (a, b) => (riskOrder[a.risk] ?? 4) - (riskOrder[b.risk] ?? 4)
  );
  const usPorts = data.major_ports.filter((p) => p.country_iso === 'US');
  const globalPorts = data.major_ports.filter((p) => p.country_iso !== 'US');

  return (
    <div className="divide-y divide-gray-50">
      {/* Sector Overview button */}
      <button
        onClick={() => onItemClick?.('logistics', 'logistics-overview')}
        className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors border-b border-gray-100"
      >
        <div className="text-xs font-medium text-gray-900">Sector Overview</div>
        <div className="text-[11px] text-gray-400">Sealift readiness, merchant fleet, sector intel</div>
      </button>
      {/* Summary stat */}
      <div className="px-3 py-2 bg-red-50/50">
        <div className="text-[11px] text-red-700">{data.summary.headline}</div>
      </div>
      {/* Chokepoints section */}
      <div className="px-3 py-1.5">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Chokepoints</div>
      </div>
      {sortedChokepoints.map((cp) => (
        <button
          key={cp.name}
          onClick={() => onItemClick?.(cp.name.toLowerCase().replace(/\s+/g, '-'), 'chokepoint')}
          role="option"
          aria-label={`${cp.name}, risk: ${cp.risk}`}
          className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-900">{cp.name}</span>
            <span className={`badge text-[10px] py-0 ${
              cp.risk === 'critical' ? 'bg-red-50 text-red-600 border-red-200' :
              cp.risk === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
              cp.risk === 'moderate' ? 'bg-blue-50 text-blue-600 border-blue-200' :
              'bg-green-50 text-green-600 border-green-200'
            }`}>
              {cp.risk}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span>{cp.daily_vessels} ships/day</span>
            {cp.oil_flow_mbd > 0 && <span>· {cp.oil_flow_mbd}M bbl/day</span>}
            <span>· {cp.trade_value_pct}% trade</span>
          </div>
        </button>
      ))}
      {/* Ports section */}
      <div className="px-3 py-1.5">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">U.S. Ports</div>
      </div>
      {usPorts.map((port) => (
        <button
          key={port.name}
          onClick={() => onItemClick?.(port.name.toLowerCase().replace(/\s+/g, '-'), 'port')}
          role="option"
          aria-label={`${port.name}, ${port.type}`}
          className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-900">{port.name}</span>
            <span className="text-[11px] font-mono text-gray-500">
              {port.type === 'military' ? 'Naval' : `#${port.rank_global}`}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-gray-400">
            {port.type === 'military' ? (port.notes || 'Military port') : `${port.teu_millions}M TEU`}
          </div>
        </button>
      ))}
      {/* Global Ports section */}
      {globalPorts.length > 0 && (
        <>
          <div className="px-3 py-1.5">
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Global Ports</div>
          </div>
          {globalPorts.map((port) => (
            <button
              key={port.name}
              onClick={() => onItemClick?.(port.name.toLowerCase().replace(/\s+/g, '-'), 'port')}
              role="option"
              aria-label={`${port.name}, ${port.country}, #${port.rank_global} global`}
              className="w-full text-left px-3 py-2 hover:bg-gray-50/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-900">{port.name}</span>
                <span className="text-[11px] font-mono text-gray-500">
                  {port.type === 'military' ? 'Naval' : `#${port.rank_global}`}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-gray-400">
                {port.country} · {port.type === 'military' ? (port.notes || 'Military port') : `${port.teu_millions}M TEU`}
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
