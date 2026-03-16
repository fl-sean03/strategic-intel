'use client';

import type { EnergyData } from '@/lib/types';
import { ExternalLink } from '@/components/ui/SourceLink';

export function EnergyOverviewTab({ data }: { data: EnergyData }) {
  const { summary, generation_by_fuel, grid_challenges } = data;

  return (
    <div className="space-y-3">
      {/* Generation mix bars */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-medium text-gray-700 mb-1">
          Generation Mix ({summary.total_capacity_gw} GW total capacity)
        </div>
        {generation_by_fuel.map((fuel) => (
          <div key={fuel.fuel} className="flex items-center gap-2">
            <div className="w-20 text-[11px] text-gray-600 text-right shrink-0">{fuel.fuel}</div>
            <div className="flex-1 gauge-bar h-4 flex items-center">
              <div
                className="gauge-fill h-full flex items-center px-1.5"
                style={{
                  width: `${Math.max(fuel.share_pct, 3)}%`,
                  backgroundColor: fuel.color,
                }}
              >
                <span className="text-[10px] text-white font-medium whitespace-nowrap">
                  {fuel.share_pct}%
                </span>
              </div>
            </div>
            <div className="w-14 text-[11px] text-gray-500 text-right shrink-0">
              {fuel.generation_twh} TWh
            </div>
          </div>
        ))}
      </div>

      {/* Grid challenges */}
      <div className="pt-2 border-t border-gray-100">
        <div className="text-[11px] font-medium text-gray-700 mb-1.5">Grid Challenges</div>
        <div className="space-y-1">
          {grid_challenges.map((ch) => (
            <div key={ch.issue} className="flex items-start gap-2 py-0.5">
              <span className={`badge text-[10px] py-0 shrink-0 ${
                ch.severity === 'high' ? 'bg-red-50 text-red-600 border-red-200' :
                'bg-amber-50 text-amber-600 border-amber-200'
              }`}>
                {ch.severity}
              </span>
              <div>
                <div className="text-[11px] font-medium text-gray-900">{ch.issue}</div>
                <div className="text-[11px] text-gray-500">{ch.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <span className="text-[11px] text-gray-400">Sources:</span>
        {data.source_urls.map((s, i) => (
          <ExternalLink key={i} url={s.url} label={s.label} />
        ))}
      </div>
    </div>
  );
}

export function BatteryMineralsTab({ data }: { data: EnergyData }) {
  const { battery_minerals } = data;

  if (!battery_minerals || !battery_minerals.dependencies || battery_minerals.dependencies.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No battery mineral dependency data available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-gray-500 mb-1">{battery_minerals.note}</div>
      <div className="space-y-1.5">
        {battery_minerals.dependencies.map((dep) => (
          <div key={dep.mineral} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium text-gray-900">{dep.mineral}</div>
              <span className={`text-[11px] font-mono ${
                dep.us_import_reliance_pct >= 90 ? 'text-red-600' :
                dep.us_import_reliance_pct >= 50 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {dep.us_import_reliance_pct}% imported
              </span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Use: {dep.use} · Source: {dep.top_source}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
