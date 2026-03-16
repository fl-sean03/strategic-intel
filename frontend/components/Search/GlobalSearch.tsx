'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  Mineral, ManufacturingSector, Facility, Investment, DefenseProgram,
  EnergyData, LogisticsData, TelecomData, TechnologyData,
} from '@/lib/types';
import { useMediaQuery } from '@/lib/useMediaQuery';

interface SearchResult {
  type: 'mineral' | 'sector' | 'facility' | 'investment' | 'program'
    | 'chokepoint' | 'port' | 'cable' | 'satellite' | 'tech-competition' | 'energy-facility';
  id: string;
  name: string;
  subtitle: string;
  score?: number;
}

interface GlobalSearchProps {
  minerals: Mineral[];
  sectors: ManufacturingSector[];
  facilities: Facility[];
  investments: Investment[];
  defensePrograms: DefenseProgram[];
  energyData?: EnergyData | null;
  logisticsData?: LogisticsData | null;
  telecomData?: TelecomData | null;
  technologyData?: TechnologyData | null;
  onSelect: (result: SearchResult) => void;
}

function searchAll(
  query: string,
  minerals: Mineral[],
  sectors: ManufacturingSector[],
  facilities: Facility[],
  investments: Investment[],
  defensePrograms: DefenseProgram[],
  energyData?: EnergyData | null,
  logisticsData?: LogisticsData | null,
  telecomData?: TelecomData | null,
  technologyData?: TechnologyData | null,
): SearchResult[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const m of minerals) {
    if (m.name.toLowerCase().includes(q) || m.primary_applications?.toLowerCase().includes(q)) {
      results.push({
        type: 'mineral',
        id: m.id,
        name: m.name,
        subtitle: `Risk: ${Math.round(m.risk_scores.overall_risk)} · ${m.trade.primary_import_source || 'N/A'}`,
      });
    }
  }

  for (const s of sectors) {
    if (s.name.toLowerCase().includes(q) || s.naics_code.includes(q)) {
      results.push({
        type: 'sector',
        id: s.naics_code,
        name: s.name,
        subtitle: `NAICS ${s.naics_code} · Health: ${Math.round(s.health_score)}`,
      });
    }
  }

  for (const f of facilities) {
    if (f.name.toLowerCase().includes(q) || f.operator.toLowerCase().includes(q) ||
        f.mineral_match.some(m => m.toLowerCase().includes(q))) {
      results.push({
        type: 'facility',
        id: f.id,
        name: f.name,
        subtitle: `${f.operator} · ${f.state} · ${f.mineral_match.join(', ')}`,
      });
    }
    if (results.length >= 20) break;
  }

  for (const inv of investments) {
    if (inv.project.toLowerCase().includes(q) || inv.company.toLowerCase().includes(q) ||
        inv.mineral?.toLowerCase().includes(q)) {
      results.push({
        type: 'investment',
        id: inv.id,
        name: inv.project,
        subtitle: `${inv.company} · ${inv.program} · $${(inv.amount / 1e9).toFixed(1)}B`,
      });
    }
  }

  for (const p of defensePrograms) {
    if (p.name.toLowerCase().includes(q) || p.prime_contractor.toLowerCase().includes(q) ||
        p.materials.some(m => m.toLowerCase().includes(q))) {
      results.push({
        type: 'program',
        id: p.id,
        name: p.name,
        subtitle: `${p.prime_contractor} · ${p.type}`,
      });
    }
  }

  // Chokepoints
  if (logisticsData?.chokepoints) {
    for (const cp of logisticsData.chokepoints) {
      if (cp.name.toLowerCase().includes(q)) {
        results.push({
          type: 'chokepoint',
          id: cp.name,
          name: cp.name,
          subtitle: `${cp.daily_vessels} ships/day · Risk: ${cp.risk}`,
        });
      }
    }
  }

  // Ports
  if (logisticsData?.major_ports) {
    for (const port of logisticsData.major_ports) {
      if (port.name.toLowerCase().includes(q)) {
        results.push({
          type: 'port',
          id: port.name,
          name: port.name,
          subtitle: `${port.country} · ${port.teu_millions}M TEU · #${port.rank_global} global`,
        });
      }
    }
  }

  // Submarine cables
  if (telecomData?.key_cables) {
    for (const cable of telecomData.key_cables) {
      if (cable.name.toLowerCase().includes(q) || cable.owner.toLowerCase().includes(q)) {
        results.push({
          type: 'cable',
          id: cable.name,
          name: cable.name,
          subtitle: `${cable.owner} · ${cable.capacity_tbps} Tbps`,
        });
      }
    }
  }

  // Satellite constellations
  if (telecomData?.satellite_constellations) {
    for (const sat of telecomData.satellite_constellations) {
      if (sat.name.toLowerCase().includes(q) || sat.operator.toLowerCase().includes(q)) {
        results.push({
          type: 'satellite',
          id: sat.name,
          name: sat.name,
          subtitle: `${sat.operator} · ${sat.satellites_deployed} deployed · ${sat.orbit}`,
        });
      }
    }
  }

  // Technology competition areas
  if (technologyData?.tech_competition) {
    for (const tc of technologyData.tech_competition) {
      if (tc.technology.toLowerCase().includes(q)) {
        results.push({
          type: 'tech-competition',
          id: tc.technology,
          name: tc.technology,
          subtitle: `U.S.: ${tc.us_position} · China: ${tc.china_position} · Risk: ${tc.risk}`,
        });
      }
    }
  }

  // Energy facilities
  if (energyData?.key_facilities) {
    for (const ef of energyData.key_facilities) {
      if (ef.name.toLowerCase().includes(q) || ef.operator.toLowerCase().includes(q)) {
        results.push({
          type: 'energy-facility',
          id: ef.name,
          name: ef.name,
          subtitle: `${ef.operator} · ${ef.type} · ${ef.capacity_mw.toLocaleString()} MW`,
        });
      }
    }
  }

  return results.slice(0, 15);
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  mineral: { label: 'Mineral', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  sector: { label: 'Sector', color: 'bg-navy/5 text-navy border-navy/10' },
  facility: { label: 'Facility', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  investment: { label: 'Investment', color: 'bg-green-50 text-green-700 border-green-200' },
  program: { label: 'Program', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  chokepoint: { label: 'Chokepoint', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  port: { label: 'Port', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  cable: { label: 'Cable', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  satellite: { label: 'Satellite', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  'tech-competition': { label: 'Tech', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  'energy-facility': { label: 'Energy', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function GlobalSearch({
  minerals, sectors, facilities, investments, defensePrograms,
  energyData, logisticsData, telecomData, technologyData, onSelect,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const results = searchAll(query, minerals, sectors, facilities, investments, defensePrograms,
    energyData, logisticsData, telecomData, technologyData);
  const showResults = focused && results.length > 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
        if (!isDesktop) setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isDesktop]);

  const handleSelect = useCallback((result: SearchResult) => {
    setQuery('');
    setFocused(false);
    setMobileOpen(false);
    onSelect(result);
  }, [onSelect]);

  // Mobile: show icon button that expands to full-width overlay
  if (!isDesktop && !mobileOpen) {
    return (
      <button
        onClick={() => { setMobileOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="panel rounded-xl px-3 py-2"
        aria-label="Open search"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    );
  }

  // Mobile overlay
  if (!isDesktop && mobileOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 animate-fade-in" ref={containerRef}>
        <div className="absolute top-0 left-0 right-0 bg-white p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search minerals, facilities, programs..."
              data-search-input
              role="combobox"
              aria-expanded={showResults}
              aria-label="Search"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
            <button
              onClick={() => { setQuery(''); setMobileOpen(false); setFocused(false); }}
              className="p-1 text-gray-400 hover:text-gray-600"
              aria-label="Close search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {showResults && (
            <div className="mt-2 max-h-[60vh] overflow-y-auto border-t border-gray-100" role="listbox">
              {results.map((result) => {
                const { label, color } = TYPE_LABELS[result.type];
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    role="option"
                    aria-selected={false}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`badge ${color} text-[11px] py-0 shrink-0`}>{label}</span>
                      <span className="text-xs font-medium text-gray-900 truncate">{result.name}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 truncate">{result.subtitle}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop: inline search
  return (
    <div ref={containerRef} className="relative" role="combobox" aria-expanded={showResults}>
      <div className="panel rounded-xl px-3 py-1.5 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search minerals, facilities, programs..."
          data-search-input
          aria-label="Search"
          className="bg-transparent text-xs text-gray-900 placeholder-gray-400 dark:placeholder-gray-500 outline-none w-48"
        />
        {!query && !focused && (
          <kbd className="hidden sm:inline text-[11px] text-gray-400 border border-gray-200 rounded px-1 py-0.5 font-mono">
            /
          </kbd>
        )}
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="text-gray-400 hover:text-gray-600" aria-label="Clear search">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full mt-1 left-0 right-0 w-80 panel rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in" role="listbox">
          <div className="max-h-64 overflow-y-auto">
            {results.map((result) => {
              const { label, color } = TYPE_LABELS[result.type];
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  role="option"
                  aria-selected={false}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={`badge ${color} text-[11px] py-0 shrink-0`}>{label}</span>
                    <span className="text-xs font-medium text-gray-900 truncate">{result.name}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 truncate">{result.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
