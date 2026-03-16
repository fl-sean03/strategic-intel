'use client';

import { useState, useEffect, useMemo } from 'react';
import type { DefenseProgram, Mineral, Dependency, CrossSectorData, IntelligenceReport } from '@/lib/types';
import { getRiskColor } from '@/lib/colors';
import { ExternalLink } from '@/components/ui/SourceLink';

/** Gray box showing supplementary intelligence context for defense */
function DefenseIntelFallback({ mineralName }: { mineralName: string }) {
  const [intelData, setIntelData] = useState<IntelligenceReport | null>(null);

  useEffect(() => {
    const id = mineralName.toLowerCase().replace(/\s+/g, '-');
    fetch(`/data/intelligence/minerals/${id}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setIntelData)
      .catch(() => {});
  }, [mineralName]);

  if (!intelData) return null;

  const keywords = ['defense', 'military', 'weapon', 'munition', 'army', 'navy', 'air force', 'missile', 'armor', 'aircraft', 'warhead', 'dod', 'pentagon', 'strategic', 'flare', 'countermeasure'];
  const findings = intelData.key_findings.filter((f) => {
    const text = `${f.headline} ${f.detail}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });

  if (findings.length === 0) return null;

  return (
    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 text-left">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        <span className="text-[11px] font-medium text-gray-600">
          Intelligence context
        </span>
      </div>
      <div className="text-[10px] text-gray-400 mb-2 italic">
        From intelligence report — no defense programs mapped
      </div>
      <div className="space-y-2">
        {findings.map((f, i) => (
          <div key={i}>
            <div className="text-[11px] font-medium text-gray-700">{f.headline}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              {f.detail.length > 300 ? f.detail.slice(0, 300) + '...' : f.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** ADVERSARY country ISOs for highlighting */
const ADVERSARY_ISOS = new Set(['CN', 'RU']);

/** Get risk badge classes for a mineral risk score */
function getRiskBadgeClasses(risk: number): string {
  if (risk > 60) return 'bg-red-50 text-red-700 border-red-200';
  if (risk >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-green-50 text-green-700 border-green-200';
}

/** Check if a mineral has adversary-nation dominant supply */
function hasAdversaryDominance(mineral: Mineral): boolean {
  const producers = mineral.supply_chain?.mining?.top_producers || [];
  const adversaryShare = producers
    .filter(p => ADVERSARY_ISOS.has(p.country_iso))
    .reduce((sum, p) => sum + p.share, 0);
  return adversaryShare > 0.5;
}

/** Defense program dependencies for a mineral */
export function MineralDefenseTab({
  mineralName,
  defensePrograms,
  graphEntities = [],
  graphRelationships = [],
  minerals = [],
  onMineralClick,
}: {
  mineralName: string;
  defensePrograms: DefenseProgram[];
  graphEntities?: any[];
  graphRelationships?: any[];
  minerals?: Mineral[];
  onMineralClick?: (mineralName: string) => void;
}) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const relevantPrograms = defensePrograms.filter((p) =>
    p.materials.some((m) => m.toLowerCase() === mineralName.toLowerCase())
  );

  // Build a lookup from graph program id to all required minerals
  const programMineralsMap = useMemo(() => {
    const map: Record<string, { mineralId: string; mineralName: string; detail: string }[]> = {};
    if (graphRelationships.length === 0 || graphEntities.length === 0) return map;

    // Build entity id -> entity lookup
    const entityById = new Map<string, any>();
    for (const e of graphEntities) {
      entityById.set(e.id, e);
    }

    // Find all required_by relationships (mineral -> program)
    for (const rel of graphRelationships) {
      if (rel.type !== 'required_by') continue;
      const mineralEntity = entityById.get(rel.from);
      const programEntity = entityById.get(rel.to);
      if (!mineralEntity || !programEntity) continue;

      if (!map[programEntity.name]) map[programEntity.name] = [];
      map[programEntity.name].push({
        mineralId: mineralEntity.slug || mineralEntity.id.replace('mineral/', ''),
        mineralName: mineralEntity.name,
        detail: rel.detail || '',
      });
    }
    return map;
  }, [graphEntities, graphRelationships]);

  // Build mineral name -> Mineral lookup for risk scores
  const mineralByName = useMemo(() => {
    const map = new Map<string, Mineral>();
    for (const m of minerals) {
      map.set(m.name.toLowerCase(), m);
    }
    return map;
  }, [minerals]);

  if (relevantPrograms.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No defense program dependencies mapped for {mineralName}.
        <DefenseIntelFallback mineralName={mineralName} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-gray-500 mb-1">
        {relevantPrograms.length} program{relevantPrograms.length !== 1 ? 's' : ''} depend on {mineralName}
      </div>
      <div className="space-y-1.5 max-h-[20rem] overflow-y-auto">
        {relevantPrograms.map((prog) => {
          const detail = prog.material_details[mineralName] || '';
          const isExpanded = expandedProgram === prog.id;
          const programMinerals = programMineralsMap[prog.name] || [];

          // Count risk levels for the summary
          let criticalCount = 0;
          let moderateCount = 0;
          let lowCount = 0;
          for (const pm of programMinerals) {
            const m = mineralByName.get(pm.mineralName.toLowerCase());
            if (m) {
              const risk = m.risk_scores.overall_risk;
              if (risk > 60) criticalCount++;
              else if (risk >= 40) moderateCount++;
              else lowCount++;
            }
          }

          return (
            <div
              key={prog.id}
              className="bg-gray-50 rounded-lg p-2 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setExpandedProgram(isExpanded ? null : prog.id)}
                    className="text-[11px] font-medium text-gray-900 hover:text-navy transition-colors text-left flex items-center gap-1"
                  >
                    <svg
                      className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{prog.name}</span>
                    {programMinerals.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-normal">
                        ({programMinerals.length} materials)
                      </span>
                    )}
                  </button>
                  <div className="text-[11px] text-gray-500 ml-4">{prog.prime_contractor}</div>
                </div>
                <span className="badge bg-navy/5 text-navy border-navy/10 text-[11px] py-0 shrink-0">
                  {prog.type}
                </span>
              </div>
              {detail && (
                <div className="mt-1 text-[11px] text-gray-600 ml-4">
                  <span className="font-medium">{mineralName}:</span> {detail}
                </div>
              )}
              <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400 ml-4">
                <span>{prog.annual_production}</span>
                <span>&middot; {prog.unit_cost}/unit</span>
              </div>
              {prog.source_urls && prog.source_urls.length > 0 && (
                <div className="mt-1 flex items-center gap-2 ml-4">
                  {prog.source_urls.map((s, i) => (
                    <ExternalLink key={i} url={s.url} label={s.label} />
                  ))}
                </div>
              )}

              {/* Expanded: show all minerals this program requires */}
              {isExpanded && programMinerals.length > 0 && (
                <div className="mt-2 ml-4 pt-2 border-t border-gray-200">
                  <div className="text-[11px] font-medium text-gray-600 mb-1.5 flex items-center gap-2">
                    All required materials
                    {criticalCount > 0 && (
                      <span className="text-[10px] text-red-600 font-normal">
                        {criticalCount} critical risk
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {programMinerals
                      .slice()
                      .sort((a, b) => {
                        const mA = mineralByName.get(a.mineralName.toLowerCase());
                        const mB = mineralByName.get(b.mineralName.toLowerCase());
                        return (mB?.risk_scores.overall_risk || 0) - (mA?.risk_scores.overall_risk || 0);
                      })
                      .map((pm) => {
                        const m = mineralByName.get(pm.mineralName.toLowerCase());
                        const risk = m?.risk_scores.overall_risk || 0;
                        const isCurrentMineral = pm.mineralName.toLowerCase() === mineralName.toLowerCase();
                        const adversary = m ? hasAdversaryDominance(m) : false;

                        return (
                          <div key={pm.mineralId} className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                if (!isCurrentMineral && onMineralClick) {
                                  onMineralClick(pm.mineralName);
                                }
                              }}
                              disabled={isCurrentMineral}
                              className={`flex items-center gap-1 text-[11px] transition-colors ${
                                isCurrentMineral
                                  ? 'text-gray-400 cursor-default font-medium'
                                  : 'text-gray-900 hover:text-navy cursor-pointer'
                              }`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: getRiskColor(risk) }}
                              />
                              <span>{pm.mineralName}</span>
                              {isCurrentMineral && (
                                <span className="text-[10px] text-gray-400">(current)</span>
                              )}
                            </button>
                            <span
                              className={`badge text-[10px] py-0 px-1 ${getRiskBadgeClasses(risk)}`}
                            >
                              {Math.round(risk)}
                            </span>
                            {adversary && (
                              <span className="text-[10px] text-red-500" title="Adversary nation dominant supplier">
                                adversary
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  {programMinerals.length > 0 && (
                    <div className="mt-1.5 text-[10px] text-gray-400">
                      Click a mineral to navigate to its full view
                    </div>
                  )}
                </div>
              )}
              {isExpanded && programMinerals.length === 0 && (
                <div className="mt-2 ml-4 pt-2 border-t border-gray-200 text-[11px] text-gray-400 italic">
                  No graph data available for this program&apos;s material requirements.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Cross-sector dependencies for a manufacturing sector */
export function SectorDependenciesTab({
  naicsCode,
  crossSectorData,
  onMineralClick,
}: {
  naicsCode: string;
  crossSectorData: CrossSectorData | null;
  onMineralClick?: (mineralName: string) => void;
}) {
  const deps = (crossSectorData?.dependencies || []).filter(
    (d) => d.from?.naics === naicsCode
  );

  if (deps.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No mineral dependencies mapped for this sector.
      </div>
    );
  }

  // Group by criticality
  const critical = deps.filter((d) => d.criticality === 'critical');
  const high = deps.filter((d) => d.criticality === 'high');
  const moderate = deps.filter((d) => d.criticality === 'moderate' || d.criticality === 'low');

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-gray-500">
        {deps.length} mineral dependencies ({critical.length} critical)
      </div>

      {[
        { label: 'Critical', items: critical, color: 'text-red-600 bg-red-50 border-red-200' },
        { label: 'High', items: high, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        { label: 'Moderate', items: moderate, color: 'text-blue-600 bg-blue-50 border-blue-200' },
      ].map(
        ({ label, items, color }) =>
          items.length > 0 && (
            <div key={label}>
              <div className="text-[11px] font-medium text-gray-500 mb-1">{label}</div>
              <div className="flex flex-wrap gap-1">
                {items.map((dep) => (
                  <button
                    key={dep.to.entity}
                    onClick={() => onMineralClick?.(dep.to.entity)}
                    className={`badge ${color} text-[11px] py-0 cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    {dep.to.entity}
                  </button>
                ))}
              </div>
            </div>
          )
      )}

      {critical.length > 0 && (
        <div className="mt-2 text-[11px] text-gray-400">
          Click a mineral to switch to Metals & Mining view
        </div>
      )}
    </div>
  );
}
