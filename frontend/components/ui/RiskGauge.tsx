'use client';

import { getRiskColor } from '@/lib/colors';

interface RiskGaugeProps {
  label: string;
  score: number;
  maxScore?: number;
}

export default function RiskGauge({ label, score, maxScore = 100 }: RiskGaugeProps) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const color = getRiskColor(score);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-mono font-medium" style={{ color }}>
          {Math.round(score)}
        </span>
      </div>
      <div className="gauge-bar h-2">
        <div
          className="gauge-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
