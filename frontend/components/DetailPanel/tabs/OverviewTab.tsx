'use client';

import type { Mineral, ManufacturingSector, CrossSectorData } from '@/lib/types';
import { getRiskColor, formatPct, formatNumber } from '@/lib/colors';
import { ExternalLink } from '@/components/ui/SourceLink';

export function MineralOverviewTab({
  mineral,
  crossSectorData,
  onSectorClick,
  supplyChainNotes,
}: {
  mineral: Mineral;
  crossSectorData?: CrossSectorData | null;
  onSectorClick?: (naicsCode: string) => void;
  supplyChainNotes?: Record<string, any>;
}) {
  const scores = mineral.risk_scores;
  const items = [
    { label: 'Overall', value: scores.overall_risk },
    { label: 'Concentration', value: scores.concentration_risk },
    { label: 'Adversary', value: scores.adversary_dependency },
    { label: 'Import', value: scores.import_dependency },
    { label: 'Defense', value: scores.defense_criticality },
    { label: 'Substit.', value: scores.substitutability },
  ];

  // Build USGS source URL from mineral name
  const usgsSlug = mineral.name.toLowerCase().replace(/\s+/g, '-');
  const usgsUrl = `https://pubs.usgs.gov/periodicals/mcs2025/mcs2025-${usgsSlug}.pdf`;

  // Cross-sector: find sectors that depend on this mineral
  const dependentSectors = crossSectorData?.dependencies?.filter(
    d => d.to.entity.toLowerCase() === mineral.name.toLowerCase()
  ) || [];
  // Deduplicate by naics code
  const uniqueSectors = Array.from(new Map(dependentSectors.map(d => [d.from.naics, d])).values());

  // Group by criticality
  const criticalSectors = uniqueSectors.filter(d => d.criticality === 'critical');
  const highSectors = uniqueSectors.filter(d => d.criticality === 'high');
  const moderateSectors = uniqueSectors.filter(d => d.criticality === 'moderate' || d.criticality === 'low');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-2">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-lg font-bold" style={{ color: getRiskColor(item.value) }}>
              {Math.round(item.value)}
            </div>
            <div className="text-[11px] text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Key vulnerability from intel — the "brief me in 30 seconds" line */}
      {(() => {
        const notes = supplyChainNotes?.[mineral.id] || supplyChainNotes?.[mineral.name.toLowerCase()];
        return notes?.key_vulnerability ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 border border-red-100 dark:border-red-800 text-[11px] text-red-700 dark:text-red-300">
            <span className="font-medium">Key risk: </span>{notes.key_vulnerability}
          </div>
        ) : null;
      })()}

      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        <div>
          <span className="text-gray-900 font-medium">Import reliance:</span>{' '}
          {formatPct(mineral.trade.net_import_reliance)}
        </div>
        <div>
          <span className="text-gray-900 font-medium">Source:</span>{' '}
          {mineral.trade.primary_import_source || 'N/A'}
        </div>
        {scores.single_source_risk && (
          <span className="badge bg-red-50 text-red-600 border-red-200 text-[11px]">
            Single Source
          </span>
        )}
      </div>

      {mineral.defense_applications.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {mineral.defense_applications.map((app) => (
            <span key={app} className="badge bg-navy/5 text-navy border-navy/10 text-[11px]">
              {app}
            </span>
          ))}
        </div>
      )}

      {/* Dependent Sectors - Cross-sector navigation */}
      {uniqueSectors.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-[11px] text-gray-500 mb-1.5">
            {uniqueSectors.length} dependent sector{uniqueSectors.length !== 1 ? 's' : ''}
          </div>
          {[
            { label: 'Critical', items: criticalSectors, color: 'text-red-600 bg-red-50 border-red-200' },
            { label: 'High', items: highSectors, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { label: 'Moderate', items: moderateSectors, color: 'text-blue-600 bg-blue-50 border-blue-200' },
          ].map(
            ({ label, items: groupItems, color }) =>
              groupItems.length > 0 && (
                <div key={label} className="mb-1.5">
                  <div className="text-[11px] font-medium text-gray-500 mb-1">{label}</div>
                  <div className="flex flex-wrap gap-1">
                    {groupItems.map((dep) => (
                      <button
                        key={dep.from.naics || dep.from.entity}
                        onClick={() => dep.from.naics && onSectorClick?.(dep.from.naics)}
                        className={`badge ${color} text-[11px] py-0 cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        {dep.from.entity}
                      </button>
                    ))}
                  </div>
                </div>
              )
          )}
          {onSectorClick && (
            <div className="text-[11px] text-gray-400 mt-1">
              Click a sector to switch to Manufacturing view
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">Source:</span>
        <ExternalLink url={usgsUrl} label="USGS MCS 2025" />
      </div>
    </div>
  );
}

export function SectorOverviewTab({ sector }: { sector: ManufacturingSector }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {sector.capacity_utilization != null
              ? `${Math.round(sector.capacity_utilization * 10) / 10}%`
              : 'N/A'}
          </div>
          <div className="text-[11px] text-gray-500">Capacity Util.</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{formatNumber(sector.employment)}</div>
          <div className="text-[11px] text-gray-500">Employment</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{Math.round(sector.health_score)}</div>
          <div className="text-[11px] text-gray-500">Health Score</div>
        </div>
      </div>

      {sector.defense_contracts_total > 0 && (
        <div className="text-xs text-gray-600">
          <span className="text-gray-900 font-medium">Defense contracts:</span>{' '}
          {formatNumber(sector.defense_contracts_total)}
        </div>
      )}

      {sector.employment_trend != null && (
        <div className="text-xs text-gray-600">
          <span className="text-gray-900 font-medium">Employment trend (3yr):</span>{' '}
          <span className={sector.employment_trend >= 0 ? 'text-green-600' : 'text-red-600'}>
            {sector.employment_trend >= 0 ? '+' : ''}{sector.employment_trend.toFixed(1)}%
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">Sources:</span>
        <ExternalLink url={`https://fred.stlouisfed.org/series/MCUMFN`} label="FRED" />
        <ExternalLink url="https://data.bls.gov/timeseries/CES3000000001" label="BLS" />
        <ExternalLink url="https://www.usaspending.gov/" label="USAspending" />
      </div>
    </div>
  );
}
