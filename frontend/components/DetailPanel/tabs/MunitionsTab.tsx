'use client';

import type { MunitionsItem } from '@/lib/types';

const SEVERITY_COLORS: Record<MunitionsItem['gap_severity'], { bg: string; text: string; border: string; bar: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: '#DC2626' },
  severe: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: '#EA580C' },
  moderate: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: '#2563EB' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', bar: '#059669' },
};

const CONFIDENCE_DOTS: Record<MunitionsItem['confidence'], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function parseRate(rate: string): number | null {
  // Try to extract a number from rate strings like "14,000/month", "50/month", "~5/year"
  const cleaned = rate.replace(/[~,]/g, '');
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

export function MunitionsTab({ data }: { data: MunitionsItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No munitions production data available.
      </div>
    );
  }

  // Sort by severity: critical first, then severe, moderate, low
  const severityOrder: Record<string, number> = { critical: 0, severe: 1, moderate: 2, low: 3 };
  const sorted = [...data].sort((a, b) => (severityOrder[a.gap_severity] ?? 4) - (severityOrder[b.gap_severity] ?? 4));

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-gray-500 mb-1">
        {data.length} weapon system{data.length !== 1 ? 's' : ''} tracked.
        Production rate vs target with gap analysis.
      </div>

      {sorted.map((item) => {
        const colors = SEVERITY_COLORS[item.gap_severity] || SEVERITY_COLORS.moderate;
        const currentNum = parseRate(item.current_rate);
        const targetNum = parseRate(item.target_rate);

        // Calculate fill percentage for gauge (current / target)
        let fillPct = 100;
        if (currentNum != null && targetNum != null && targetNum > 0) {
          fillPct = Math.min((currentNum / targetNum) * 100, 100);
        }

        const confidenceDots = CONFIDENCE_DOTS[item.confidence] || 1;

        return (
          <div key={item.name} className="border border-gray-100 rounded-lg p-3">
            {/* Header: name + severity badge */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-900">{item.name}</h4>
              <span className={`badge ${colors.bg} ${colors.text} ${colors.border} text-[11px]`}>
                {item.gap_severity}
              </span>
            </div>

            {/* Rate comparison */}
            <div className="flex items-center gap-3 mb-2 text-[11px]">
              <div>
                <span className="text-gray-500">Current:</span>{' '}
                <span className="font-medium text-gray-900">{item.current_rate}</span>
              </div>
              <div>
                <span className="text-gray-500">Target:</span>{' '}
                <span className="font-medium text-gray-900">{item.target_rate}</span>
              </div>
            </div>

            {/* Gauge bar */}
            <div className="gauge-bar h-3 mb-2">
              <div
                className="gauge-fill h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(fillPct, 2)}%`,
                  backgroundColor: colors.bar,
                }}
              />
            </div>

            {/* Notes */}
            {item.notes && (
              <p className="text-[11px] text-gray-500 mb-1.5">{item.notes}</p>
            )}

            {/* Confidence indicator */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-gray-400">Confidence:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className={`w-1.5 h-1.5 rounded-full ${
                      dot <= confidenceDots ? 'bg-gray-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-gray-400 ml-0.5">{item.confidence}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
