'use client';

import type { LogisticsData } from '@/lib/types';
import { ExternalLink } from '@/components/ui/SourceLink';
import ComparisonBar from '@/components/charts/ComparisonBar';

export function LogisticsOverviewTab({ data }: { data: LogisticsData }) {
  const { summary, strategic_sealift } = data;

  return (
    <div className="space-y-3">
      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{summary.us_flagged_vessels}</div>
          <div className="text-[11px] text-gray-500">U.S. Vessels</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{summary.china_flagged_vessels.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500">China Vessels</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-500">#{summary.us_merchant_fleet_rank}</div>
          <div className="text-[11px] text-gray-500">U.S. Global Rank</div>
        </div>
      </div>

      <div className="text-[11px] text-gray-600 bg-red-50 rounded-lg p-2 border border-red-100">
        {summary.headline}
      </div>

      {/* Strategic sealift */}
      <div className="pt-2 border-t border-gray-100">
        <div className="text-[11px] font-medium text-gray-700 mb-1">Strategic Sealift Readiness</div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Ready Reserve Force</span>
            <span className="text-gray-900 font-medium">{strategic_sealift.ready_reserve_force} vessels</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Military Sealift Command</span>
            <span className="text-gray-900 font-medium">{strategic_sealift.military_sealift_command} vessels</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Activation time</span>
            <span className="text-gray-900">{strategic_sealift.days_to_activate}</span>
          </div>
        </div>
        <div className="mt-1.5 text-[11px] text-red-600 font-medium">
          Assessment: {strategic_sealift.capacity_assessment}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">{strategic_sealift.notes}</div>
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

export function ChokepointsTab({ data }: { data: LogisticsData }) {
  const sorted = [...data.chokepoints].sort((a, b) => b.oil_flow_mbd - a.oil_flow_mbd);

  if (sorted.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No chokepoint data available.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-48 overflow-y-auto">
      {sorted.map((cp) => (
        <div key={cp.name} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="text-[11px] font-medium text-gray-900">{cp.name}</div>
            <span className={`badge text-[10px] py-0 shrink-0 ${
              cp.risk === 'critical' ? 'bg-red-50 text-red-600 border-red-200' :
              cp.risk === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
              'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              {cp.risk}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
            <span>{cp.daily_vessels} ships/day</span>
            {cp.oil_flow_mbd > 0 && <span>{cp.oil_flow_mbd}M bbl/day</span>}
            <span>{cp.trade_value_pct}% global trade</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-400">{cp.notes}</div>
        </div>
      ))}
    </div>
  );
}

export function MerchantFleetTab({ data }: { data: LogisticsData }) {
  return (
    <div className="space-y-3">
      <ComparisonBar
        title="Merchant Fleet Size (vessels)"
        items={data.merchant_fleet_comparison.map((f) => ({
          label: f.country,
          value: f.vessels,
          color: f.country_iso === 'US' ? '#DC2626' : '#1E3A5F',
        }))}
      />
      <div className="pt-2 border-t border-gray-100">
        <div className="text-[11px] font-medium text-gray-700 mb-1.5">Fleet Details</div>
        <div className="space-y-1.5">
          {data.merchant_fleet_comparison.map((f) => (
            <div key={f.country_iso} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-gray-900">{f.country}</div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <span>{f.vessels.toLocaleString()} vessels</span>
                  <span className="text-gray-300">|</span>
                  <span>{f.dwt_millions}M DWT</span>
                  <span className="text-gray-300">|</span>
                  <span>{f.global_share_pct}% global</span>
                </div>
              </div>
              {f.notes && (
                <div className="mt-1 text-[11px] text-gray-500">{f.notes}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PortsTab({ data }: { data: LogisticsData }) {
  const usPorts = data.major_ports.filter((p) => p.country_iso === 'US');
  const globalPorts = data.major_ports.filter((p) => p.country_iso !== 'US');

  if (data.major_ports.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No port data available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-medium text-gray-700">U.S. Ports</div>
      <div className="space-y-1">
        {usPorts.map((p) => (
          <div key={p.name} className="flex items-center justify-between py-0.5">
            <div>
              <div className="text-[11px] text-gray-900">{p.name}</div>
              {p.notes && <div className="text-[11px] text-gray-400">{p.notes}</div>}
            </div>
            <div className="text-[11px] text-gray-600 text-right shrink-0">
              {p.type === 'military' ? 'Naval' : `${p.teu_millions}M TEU (#${p.rank_global})`}
            </div>
          </div>
        ))}
      </div>
      <div className="text-[11px] font-medium text-gray-700 mt-2">Top Global Ports</div>
      <div className="space-y-1">
        {globalPorts.slice(0, 6).map((p) => (
          <div key={p.name} className="flex items-center justify-between py-0.5">
            <div className="text-[11px] text-gray-900">{p.name} <span className="text-gray-400">({p.country})</span></div>
            <div className="text-[11px] text-gray-600 shrink-0">{p.teu_millions}M TEU (#{p.rank_global})</div>
          </div>
        ))}
      </div>
    </div>
  );
}
