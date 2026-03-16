'use client';

import type { Mineral } from '@/lib/types';

interface SupplyChainTabProps {
  mineral: Mineral;
  supplyChainNotes?: Record<string, any>;
  onCountryClick?: (iso: string, name: string) => void;
}

/** Horizontal multi-stage supply chain diagram */
export function SupplyChainTab({ mineral, supplyChainNotes, onCountryClick }: SupplyChainTabProps) {
  const stages = [
    { key: 'mining', label: 'Mining', data: mineral.supply_chain?.mining },
    { key: 'processing', label: 'Processing', data: mineral.supply_chain?.processing },
    { key: 'refining', label: 'Refining', data: mineral.supply_chain?.refining },
  ];

  const notes = supplyChainNotes?.[mineral.id] || supplyChainNotes?.[mineral.name.toLowerCase()]
    || supplyChainNotes?.[mineral.name.toLowerCase().replace(/\s+/g, '-')];
  const hasEmergingProducers = notes?.us_producers?.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-stretch gap-1">
        {stages.map((stage, i) => {
          const producers = stage.data?.top_producers || stage.data?.top_processors || stage.data?.top_refiners || [];
          const quality = stage.data?.data_quality || 'unknown';

          return (
            <div key={stage.key} className="flex-1 flex items-stretch">
              <div className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-100">
                <div className="text-[11px] font-medium text-gray-700 mb-1.5">
                  {stage.label}
                  {quality === 'estimated' && (
                    <span className="ml-1 text-amber-500" title="Estimated data">*</span>
                  )}
                </div>
                {producers.length > 0 ? (
                  <div className="space-y-1">
                    {producers.slice(0, 4).map((p, j) => (
                      <div key={j} className="flex items-center gap-1">
                        <div className="flex-1 min-w-0">
                          {onCountryClick && p.country_iso ? (
                            <button
                              onClick={() => onCountryClick(p.country_iso, p.country)}
                              className="text-[11px] text-gray-600 hover:text-navy hover:underline truncate block text-left transition-colors"
                              title={`View ${p.country} mineral production`}
                            >
                              {p.country}
                            </button>
                          ) : (
                            <div className="text-[11px] text-gray-600 truncate">
                              {p.country}
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-gray-900 shrink-0">
                          {(p.share * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                    {producers.length > 4 && (
                      <div className="text-[11px] text-gray-400">
                        +{producers.length - 4} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 italic">No data</div>
                )}

                {/* U.S. position flag */}
                {producers.length > 0 && (
                  <div className="mt-1.5 pt-1 border-t border-gray-100">
                    {producers.some((p) => p.country_iso === 'US') ? (
                      <div className="text-[11px] text-green-600 font-medium">
                        U.S.: {((producers.find((p) => p.country_iso === 'US')?.share || 0) * 100).toFixed(0)}%
                      </div>
                    ) : hasEmergingProducers ? (
                      <div className="text-[11px] text-amber-600 font-medium">
                        No current U.S. production — {notes.us_producers.length} emerging
                      </div>
                    ) : (
                      <div className="text-[11px] text-red-500 font-medium">
                        No U.S. production
                      </div>
                    )}
                  </div>
                )}
              </div>
              {i < stages.length - 1 && (
                <div className="flex items-center px-0.5 text-gray-300">&rarr;</div>
              )}
            </div>
          );
        })}
      </div>

      {/* End uses */}
      {mineral.primary_applications && (
        <div className="text-xs text-gray-600">
          <span className="font-medium text-gray-900">End uses:</span>{' '}
          {mineral.primary_applications}
        </div>
      )}

      {/* Supply chain notes from intelligence reports */}
      {notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-[11px] font-medium text-gray-700 mb-2">U.S. Supply Chain Status</div>

          {notes.us_producers?.length > 0 && (
            <div className="mb-2">
              <div className="text-[11px] text-gray-500 mb-1">Domestic Producers</div>
              {notes.us_producers.map((p: any, i: number) => (
                <div key={i} className="text-[11px] text-gray-700 ml-2">
                  <span className="font-medium">{p.company}</span>
                  {p.location && <span className="text-gray-400"> &mdash; {p.location}</span>}
                  {p.notes && <div className="text-gray-400 ml-2">{p.notes}</div>}
                </div>
              ))}
            </div>
          )}

          {notes.processing_status && (
            <div className="mb-1">
              <span className="text-[11px] text-gray-500">Processing: </span>
              <span className="text-[11px] text-gray-700">{notes.processing_status}</span>
            </div>
          )}

          {notes.government_support && (
            <div className="mb-1">
              <span className="text-[11px] text-gray-500">Gov&apos;t support: </span>
              <span className="text-[11px] text-gray-700">{notes.government_support}</span>
            </div>
          )}

          {notes.recent_changes && (
            <div className="mb-1">
              <span className="text-[11px] text-gray-500">Recent changes: </span>
              <span className="text-[11px] text-gray-700">{notes.recent_changes}</span>
            </div>
          )}

          {notes.key_vulnerability && (
            <div className="bg-red-50 rounded-lg p-2 border border-red-100 mt-2">
              <span className="text-[11px] font-medium text-red-700">Key vulnerability: </span>
              <span className="text-[11px] text-red-600">{notes.key_vulnerability}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
