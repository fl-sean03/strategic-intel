'use client';

import type { LensId, LayerVisibility } from '@/lib/types';

interface LayerControlsProps {
  activeLens: LensId;
  layers: LayerVisibility;
  onToggle: (layer: keyof LayerVisibility) => void;
}

const LAYER_CONFIG: Record<string, {
  label: string;
  key: keyof LayerVisibility;
  lenses: LensId[];
}[]> = {
  'metals-mining': [
    { label: 'U.S. Mines', key: 'facilities', lenses: ['metals-mining'] },
    { label: 'Trade Flows', key: 'tradeFlows', lenses: ['metals-mining'] },
    { label: 'Investments', key: 'investments', lenses: ['metals-mining'] },
  ],
  manufacturing: [
    { label: 'Shipyards', key: 'shipyards', lenses: ['manufacturing'] },
    { label: 'Defense Contracts', key: 'usStates', lenses: ['manufacturing'] },
    { label: 'Investments', key: 'investments', lenses: ['manufacturing'] },
  ],
  energy: [
    { label: 'Power Plants', key: 'facilities', lenses: ['energy'] },
    { label: 'Investments', key: 'investments', lenses: ['energy'] },
  ],
  logistics: [
    { label: 'Ports', key: 'shipyards', lenses: ['logistics'] },
    { label: 'Chokepoints', key: 'usStates', lenses: ['logistics'] },
  ],
  telecom: [
    { label: 'Cable Routes', key: 'tradeFlows', lenses: ['telecom'] },
  ],
  technology: [
    { label: 'R&D by State', key: 'usStates', lenses: ['technology'] },
  ],
};

export default function LayerControls({ activeLens, layers, onToggle }: LayerControlsProps) {
  const availableLayers = LAYER_CONFIG[activeLens] || [];
  if (availableLayers.length === 0) return null;

  return (
    <div className="absolute top-16 right-3 z-20 panel rounded-xl p-2 animate-fade-in">
      <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5 px-1">
        Layers
      </div>
      <div className="space-y-0.5">
        {availableLayers.map(({ label, key }) => (
          <label
            key={key}
            className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => onToggle(key)}
              className="w-3 h-3 rounded border-gray-300 text-navy focus:ring-navy/50 accent-[#1E3A5F]"
            />
            <span className="text-xs text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
