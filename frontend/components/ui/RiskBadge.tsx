'use client';

import { getRiskLevel, getRiskColor } from '@/lib/colors';

interface RiskBadgeProps {
  score: number;
  showScore?: boolean;
}

export default function RiskBadge({ score, showScore = true }: RiskBadgeProps) {
  const level = getRiskLevel(score);
  const color = getRiskColor(score);

  return (
    <span
      className="badge"
      style={{
        backgroundColor: color + '15',
        color: color,
        borderColor: color + '30',
      }}
    >
      {showScore && <span className="font-mono mr-1">{Math.round(score)}</span>}
      {level}
    </span>
  );
}
