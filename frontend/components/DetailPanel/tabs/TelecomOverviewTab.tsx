'use client';

import type { TelecomData } from '@/lib/types';
import { ExternalLink } from '@/components/ui/SourceLink';

export function TelecomOverviewTab({ data }: { data: TelecomData }) {
  const { summary, key_cables, satellite_constellations, vulnerabilities } = data;

  return (
    <div className="space-y-3">
      {/* Key stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{summary.submarine_cables}</div>
          <div className="text-[11px] text-gray-500">Cables</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{(summary.total_cable_length_km / 1000000).toFixed(1)}M</div>
          <div className="text-[11px] text-gray-500">km total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{summary.satellite_constellations}</div>
          <div className="text-[11px] text-gray-500">Constellations</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-500">{summary.us_5g_coverage_pct}%</div>
          <div className="text-[11px] text-gray-500">5G Coverage</div>
        </div>
      </div>

      <div className="text-[11px] text-gray-600 bg-purple-50 rounded-lg p-2 border border-purple-100">
        {summary.headline}
      </div>

      {/* Top cables */}
      <div className="pt-2 border-t border-gray-100">
        <div className="text-[11px] font-medium text-gray-700 mb-1.5">Key Submarine Cables</div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {key_cables.map((cable) => (
            <div key={cable.name} className="flex items-center justify-between py-0.5">
              <div>
                <div className="text-[11px] font-medium text-gray-900">{cable.name}</div>
                <div className="text-[10px] text-gray-400">{cable.owner}</div>
              </div>
              <div className="text-[11px] text-gray-600 text-right shrink-0">
                {cable.capacity_tbps} Tbps
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerabilities */}
      <div className="pt-2 border-t border-gray-100">
        <div className="text-[11px] font-medium text-gray-700 mb-1.5">Vulnerabilities</div>
        <div className="space-y-1">
          {vulnerabilities.map((v) => (
            <div key={v.issue} className="flex items-start gap-2 py-0.5">
              <span className={`badge text-[10px] py-0 shrink-0 ${
                v.severity === 'critical' ? 'bg-red-50 text-red-600 border-red-200' :
                v.severity === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                {v.severity}
              </span>
              <div>
                <div className="text-[11px] font-medium text-gray-900">{v.issue}</div>
                <div className="text-[11px] text-gray-500">{v.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 flex-wrap">
        <span className="text-[11px] text-gray-400">Sources:</span>
        {data.source_urls.map((s, i) => (
          <ExternalLink key={i} url={s.url} label={s.label} />
        ))}
      </div>
    </div>
  );
}

export function CablesTab({ data }: { data: TelecomData }) {
  const sorted = [...data.key_cables].sort((a, b) => b.capacity_tbps - a.capacity_tbps);

  if (sorted.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No submarine cable data available.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto">
      {sorted.map((cable) => (
        <div key={cable.name} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="text-[11px] font-medium text-gray-900">{cable.name}</div>
            <span className="text-[11px] font-mono text-purple-600 shrink-0">
              {cable.capacity_tbps} Tbps
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
            <span>{cable.from} &rarr; {cable.to}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-gray-400">
            <span>{cable.owner}</span>
            <span>{cable.length_km.toLocaleString()} km</span>
            <span>{cable.year}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SatellitesTab({ data }: { data: TelecomData }) {
  const sorted = [...data.satellite_constellations].sort(
    (a, b) => b.satellites_deployed - a.satellites_deployed
  );

  if (sorted.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No satellite constellation data available.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto">
      {sorted.map((sat) => {
        const deployPct = sat.satellites_planned > 0
          ? Math.round((sat.satellites_deployed / sat.satellites_planned) * 100)
          : 0;

        return (
          <div key={sat.name} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-medium text-gray-900">{sat.name}</div>
                <div className="text-[10px] text-gray-400">{sat.operator} ({sat.country})</div>
              </div>
              <span className={`badge text-[10px] py-0 shrink-0 ${
                sat.status === 'Operational' ? 'bg-green-50 text-green-600 border-green-200' :
                sat.status === 'Early deployment' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-gray-50 text-gray-600 border-gray-200'
              }`}>
                {sat.status}
              </span>
            </div>
            <div className="mt-1">
              <div className="gauge-bar h-1.5">
                <div
                  className="gauge-fill"
                  style={{
                    width: `${Math.max(deployPct, 2)}%`,
                    backgroundColor: sat.country_iso === 'US' ? '#8B5CF6' :
                      sat.country_iso === 'CN' ? '#DC2626' : '#6B7280',
                  }}
                />
              </div>
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[11px] text-gray-500">
              <span>{sat.satellites_deployed.toLocaleString()} / {sat.satellites_planned.toLocaleString()} satellites</span>
              <span>{sat.orbit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
