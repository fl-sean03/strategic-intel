'use client';

import type { Facility, ManufacturingSector, Shipyard } from '@/lib/types';
import { ExternalLink } from '@/components/ui/SourceLink';

/** MSHA facility table for a mineral */
export function MineralFacilitiesTab({
  mineralName,
  facilities,
  supplyChainNotes,
}: {
  mineralName: string;
  facilities: Facility[];
  supplyChainNotes?: Record<string, any>;
}) {
  const matched = facilities
    .filter((f) =>
      f.mineral_match.some((m) => m.toLowerCase() === mineralName.toLowerCase())
    )
    .sort((a, b) => (b.employment || 0) - (a.employment || 0));

  // Always look up supply-chain-notes producers
  const notes = supplyChainNotes?.[mineralName.toLowerCase().replace(/\s+/g, '-')]
    || supplyChainNotes?.[mineralName.toLowerCase()];
  const notesProducers = notes?.us_producers;

  if (matched.length === 0 && (!notesProducers || notesProducers.length === 0)) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No U.S. mine/facility data found for {mineralName}.
        <div className="mt-1 text-[11px] text-gray-400">
          This may be processed abroad or produced as a byproduct.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {matched.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] text-gray-500">
              {matched.length} U.S. site{matched.length !== 1 ? 's' : ''} found
            </div>
            <ExternalLink url="https://www.msha.gov/mine-data-retrieval-system" label="MSHA Data" />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="text-left py-1 font-medium">Name</th>
                  <th className="text-left py-1 font-medium">Operator</th>
                  <th className="text-left py-1 font-medium">State</th>
                  <th className="text-right py-1 font-medium">Emp</th>
                  <th className="text-left py-1 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {matched.slice(0, 20).map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-1 text-gray-900 max-w-[120px] truncate">{f.name}</td>
                    <td className="py-1 text-gray-600 max-w-[100px] truncate">{f.operator}</td>
                    <td className="py-1 text-gray-600">{f.state}</td>
                    <td className="py-1 text-gray-600 text-right">{f.employment || '-'}</td>
                    <td className="py-1">
                      <span className={`${f.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {matched.length > 20 && (
              <div className="text-[11px] text-gray-400 py-1 text-center">
                Showing 20 of {matched.length}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-[11px] text-gray-500 mb-1">
          No MSHA-registered mines found.
        </div>
      )}

      {/* Always show supply-chain-notes producers if available */}
      {notesProducers && notesProducers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-[11px] font-medium text-gray-700 mb-1.5">
            Known Producers (from intelligence)
          </div>
          {notesProducers.map((p: any, i: number) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2 border border-gray-100 mb-1">
              <div className="text-[11px] font-medium text-gray-900">{p.company}</div>
              {p.location && <div className="text-[11px] text-gray-500">{p.location}</div>}
              {p.notes && <div className="text-[11px] text-gray-400 mt-1">{p.notes}</div>}
            </div>
          ))}
          {notes.processing_status && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-500">Processing: </span>
              <span className="text-[11px] text-gray-700">{notes.processing_status}</span>
            </div>
          )}
          {notes.government_support && (
            <div>
              <span className="text-[11px] text-gray-500">Gov&apos;t support: </span>
              <span className="text-[11px] text-gray-700">{notes.government_support}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Key facilities for a manufacturing sector (shipyards for 336, etc.) */
export function SectorFacilitiesTab({
  sector,
  shipyards,
}: {
  sector: ManufacturingSector;
  shipyards: Shipyard[];
}) {
  // For Transportation Equipment (336), show shipyards
  if (sector.naics_code === '336') {
    const usYards = shipyards.filter((s) => s.country_iso === 'US');
    const foreignYards = shipyards.filter((s) => s.country_iso !== 'US');

    return (
      <div className="space-y-2">
        <div className="text-[11px] font-medium text-gray-700">U.S. Shipyards</div>
        <div className="space-y-1">
          {usYards.map((y) => (
            <div key={y.id} className="flex items-center justify-between py-0.5">
              <div>
                <div className="text-[11px] text-gray-900">{y.name}</div>
                <div className="text-[11px] text-gray-500">
                  {y.capabilities.slice(0, 2).join(', ')}
                </div>
              </div>
              <div className="text-[11px] text-gray-600 text-right">
                {y.employees?.toLocaleString()} emp
              </div>
            </div>
          ))}
        </div>

        {foreignYards.length > 0 && (
          <>
            <div className="text-[11px] font-medium text-gray-700 mt-2">International</div>
            <div className="space-y-1">
              {foreignYards.map((y) => (
                <div key={y.id} className="flex items-center justify-between py-0.5">
                  <div>
                    <div className="text-[11px] text-gray-900">{y.name}</div>
                    <div className="text-[11px] text-gray-500">{y.country}</div>
                  </div>
                  <div className="text-[11px] text-gray-600 text-right">
                    {y.employees?.toLocaleString()} emp
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // For other sectors, show geographic distribution
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-medium text-gray-700">Top States by Employment</div>
      {sector.geographic_distribution.length > 0 ? (
        <div className="space-y-1">
          {sector.geographic_distribution.slice(0, 8).map((state) => (
            <div key={state.state_fips} className="flex items-center gap-2">
              <div className="w-8 text-[11px] font-medium text-gray-700">{state.state_abbrev}</div>
              <div className="flex-1">
                <div className="gauge-bar h-1.5">
                  <div
                    className="gauge-fill"
                    style={{
                      width: `${Math.min(state.share * 100 * 5, 100)}%`,
                      backgroundColor: '#1E3A5F',
                    }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-gray-600 w-16 text-right">
                {state.employment.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-gray-400 italic">No geographic data available</div>
      )}
    </div>
  );
}
