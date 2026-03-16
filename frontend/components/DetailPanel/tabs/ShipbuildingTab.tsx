'use client';

import type { ShipbuildingComparison } from '@/lib/types';
import ComparisonBar from '@/components/charts/ComparisonBar';

export function ShipbuildingTab({ data }: { data: ShipbuildingComparison[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No shipbuilding comparison data available.
      </div>
    );
  }

  // Sort by global share descending for consistent ordering
  const sorted = [...data].sort((a, b) => b.global_share_pct - a.global_share_pct);

  const usEntry = sorted.find((d) => d.country_iso === 'US' || d.country === 'United States');
  const chinaEntry = sorted.find((d) => d.country_iso === 'CN' || d.country === 'China');

  const shipyardItems = sorted.map((d) => ({
    label: d.country,
    value: d.active_shipyards,
    color: d.country_iso === 'US' ? '#1E3A5F' : '#94A3B8',
  }));

  const vesselItems = sorted.map((d) => ({
    label: d.country,
    value: d.vessels_on_order,
    color: d.country_iso === 'US' ? '#1E3A5F' : '#94A3B8',
  }));

  const shareItems = sorted.map((d) => ({
    label: d.country,
    value: d.global_share_pct,
    color: d.country_iso === 'US' ? '#1E3A5F' : '#94A3B8',
  }));

  return (
    <div className="space-y-5">
      {/* Summary callout */}
      {usEntry && chinaEntry && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">U.S. has {usEntry.global_share_pct}%</span> of global
            shipbuilding vs China&apos;s <span className="font-semibold">{chinaEntry.global_share_pct}%</span>.
            The U.S. operates {usEntry.active_shipyards} active shipyard{usEntry.active_shipyards !== 1 ? 's' : ''} compared
            to China&apos;s {chinaEntry.active_shipyards}.
          </p>
        </div>
      )}

      <ComparisonBar
        title="Active Shipyards"
        items={shipyardItems}
        formatValue={(v) => v.toLocaleString()}
      />

      <ComparisonBar
        title="Vessels on Order"
        items={vesselItems}
        formatValue={(v) => v.toLocaleString()}
      />

      <ComparisonBar
        title="Global Market Share (%)"
        items={shareItems}
        formatValue={(v) => `${v}%`}
      />
    </div>
  );
}
