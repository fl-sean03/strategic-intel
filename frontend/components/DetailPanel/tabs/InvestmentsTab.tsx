'use client';

import { useState, useEffect } from 'react';
import type { Investment, IntelligenceReport } from '@/lib/types';
import { formatNumber } from '@/lib/colors';
import { ExternalLink } from '@/components/ui/SourceLink';

/** Gray box showing supplementary intelligence context for investments */
function InvestmentIntelFallback({ mineralName }: { mineralName: string }) {
  const [intelData, setIntelData] = useState<IntelligenceReport | null>(null);

  useEffect(() => {
    const id = mineralName.toLowerCase().replace(/\s+/g, '-');
    fetch(`/data/intelligence/minerals/${id}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setIntelData)
      .catch(() => {});
  }, [mineralName]);

  if (!intelData) return null;

  const keywords = ['invest', 'fund', 'grant', 'loan', 'dpa', 'doe', 'ira', 'subsid', 'appropriat', 'budget', 'financ', 'capital'];
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
        From intelligence report — no tracked investments found
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

/** Investment timeline for a mineral or sector */
export function InvestmentsTab({
  mineralName,
  investments,
}: {
  mineralName?: string;
  investments: Investment[];
}) {
  const filtered = mineralName
    ? investments.filter((inv) =>
        inv.mineral?.toLowerCase() === mineralName.toLowerCase()
      )
    : investments;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic py-4 text-center">
        No investment data found{mineralName ? ` for ${mineralName}` : ''}.
        {mineralName && <InvestmentIntelFallback mineralName={mineralName} />}
      </div>
    );
  }

  const totalAmount = sorted.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-gray-500">
          {sorted.length} investment{sorted.length !== 1 ? 's' : ''}
        </div>
        <div className="text-[11px] font-medium text-gray-900">
          Total: {formatNumber(totalAmount)}
        </div>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {sorted.map((inv) => (
          <div
            key={inv.id}
            className="bg-gray-50 rounded-lg p-2 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {inv.source_url ? (
                  <a
                    href={inv.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-gray-900 hover:text-blue-700 hover:underline truncate block transition-colors"
                    title={`Open source: ${inv.project}`}
                  >
                    {inv.project}
                  </a>
                ) : (
                  <div className="text-[11px] font-medium text-gray-900 truncate">
                    {inv.project}
                  </div>
                )}
                <div className="text-[11px] text-gray-600">{inv.company}</div>
              </div>
              <div className="text-[11px] font-mono font-medium text-green-700 shrink-0 ml-2">
                {formatNumber(inv.amount)}
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px]">
              <span className="badge bg-blue-50 text-blue-700 border-blue-200 py-0">
                {inv.program}
              </span>
              <span className="text-gray-500">{inv.location.state}</span>
              <span className="text-gray-400">{inv.date}</span>
              <span className={
                inv.status === 'Active' ? 'text-green-600' :
                inv.status === 'Under construction' ? 'text-blue-600' :
                'text-gray-500'
              }>
                {inv.status}
              </span>
            </div>
            {inv.notes && (
              <div className="mt-1 text-[11px] text-gray-400">{inv.notes}</div>
            )}
            {inv.source_url && (
              <div className="mt-1">
                <ExternalLink url={inv.source_url} label="Source" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
