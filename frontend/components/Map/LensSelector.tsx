'use client';

import { LENSES } from '@/lib/constants';
import type { LensId } from '@/lib/types';

interface LensSelectorProps {
  activeLens: LensId;
  onLensChange: (lens: LensId) => void;
}

export default function LensSelector({ activeLens, onLensChange }: LensSelectorProps) {
  return (
    <div className="flex items-center gap-1.5" role="tablist" aria-label="Sector lenses">
      {LENSES.map((lens) => {
        const isActive = lens.id === activeLens;

        return (
          <button
            key={lens.id}
            onClick={() => onLensChange(lens.id)}
            role="tab"
            aria-selected={isActive}
            className={`lens-pill ${
              isActive ? 'lens-pill-active' : 'lens-pill-inactive'
            }`}
            title={lens.description}
          >
            {lens.label}
          </button>
        );
      })}
    </div>
  );
}
