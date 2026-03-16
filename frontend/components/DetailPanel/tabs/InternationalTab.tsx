'use client';

import type { InternationalComparison } from '@/lib/types';
import ComparisonBar from '@/components/charts/ComparisonBar';
import { formatNumber } from '@/lib/colors';

export function InternationalTab({ data }: { data: InternationalComparison[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No international comparison data available.
      </div>
    );
  }

  // Sort by manufacturing value added descending
  const sortedByValue = [...data]
    .filter((d) => d.manufacturing_value_added != null)
    .sort((a, b) => (b.manufacturing_value_added ?? 0) - (a.manufacturing_value_added ?? 0));

  // Sort by manufacturing % of GDP descending
  const sortedByPct = [...data]
    .filter((d) => d.manufacturing_pct_gdp != null)
    .sort((a, b) => (b.manufacturing_pct_gdp ?? 0) - (a.manufacturing_pct_gdp ?? 0));

  const usEntry = data.find((d) => d.country_iso === 'US' || d.country === 'United States');
  const usRankValue = sortedByValue.findIndex((d) => d.country_iso === 'US' || d.country === 'United States') + 1;
  const usRankPct = sortedByPct.findIndex((d) => d.country_iso === 'US' || d.country === 'United States') + 1;

  const valueItems = sortedByValue.map((d) => ({
    label: d.country,
    value: d.manufacturing_value_added ?? 0,
    color: d.country_iso === 'US' ? '#1E3A5F' : '#94A3B8',
  }));

  const pctItems = sortedByPct.map((d) => ({
    label: d.country,
    value: d.manufacturing_pct_gdp ?? 0,
    color: d.country_iso === 'US' ? '#1E3A5F' : '#94A3B8',
  }));

  return (
    <div className="space-y-5">
      {/* U.S. position summary */}
      {usEntry && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">U.S. ranks #{usRankValue}</span> in manufacturing value
            added ({formatNumber(usEntry.manufacturing_value_added)})
            {usRankPct > 0 && (
              <>
                {' '}and <span className="font-semibold">#{usRankPct}</span> in manufacturing as % of GDP
                ({usEntry.manufacturing_pct_gdp != null ? `${usEntry.manufacturing_pct_gdp.toFixed(1)}%` : 'N/A'})
              </>
            )}
            {' '}among tracked peers.
          </p>
        </div>
      )}

      <ComparisonBar
        title="Manufacturing Value Added ($)"
        items={valueItems}
        formatValue={(v) => formatNumber(v)}
      />

      <ComparisonBar
        title="Manufacturing as % of GDP"
        items={pctItems}
        formatValue={(v) => `${v.toFixed(1)}%`}
      />
    </div>
  );
}
