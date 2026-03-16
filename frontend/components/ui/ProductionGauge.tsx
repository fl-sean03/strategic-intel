'use client';

const SEVERITY_COLORS = {
  critical: '#DC2626',
  severe: '#D97706',
  moderate: '#2563EB',
  low: '#059669',
};

interface ProductionGaugeProps {
  name: string;
  currentRate: string;
  targetRate: string;
  severity: 'critical' | 'severe' | 'moderate' | 'low';
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

export default function ProductionGauge({
  name, currentRate, targetRate, severity, confidence, notes,
}: ProductionGaugeProps) {
  const color = SEVERITY_COLORS[severity];

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-gray-900 text-sm">{name}</h4>
        <span
          className="badge text-[11px]"
          style={{
            backgroundColor: color + '15',
            color: color,
            borderColor: color + '30',
          }}
        >
          {severity}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500 text-xs">Current</span>
          <div className="font-medium text-gray-900">{currentRate}</div>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Target</span>
          <div className="font-medium text-gray-900">{targetRate}</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500 leading-relaxed">{notes}</p>
      <div className="mt-2 text-[11px] text-gray-400 uppercase tracking-wider">
        Confidence: {confidence}
      </div>
    </div>
  );
}
