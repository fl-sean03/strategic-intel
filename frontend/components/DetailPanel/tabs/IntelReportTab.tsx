'use client';

import { useState, useEffect } from 'react';
import type { IntelligenceReport } from '@/lib/types';
import { ENTITY_REGISTRY } from '@/lib/entityRegistry';

interface IntelReportTabProps {
  /** Entity type key from the registry (e.g. 'mineral', 'satellite') */
  entityType: string;
  /** Entity-specific ID (e.g. 'gallium', 'starlink') */
  entityId: string;
  // Legacy props — kept for backward compatibility during migration
  category?: string;
  id?: string;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  moderate: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

const TREND_ICONS: Record<string, { label: string; color: string }> = {
  worsening: { label: 'Worsening', color: 'text-red-600' },
  stable: { label: 'Stable', color: 'text-gray-600' },
  improving: { label: 'Improving', color: 'text-green-600' },
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  government: 'bg-blue-50 text-blue-700 border-blue-200',
  industry: 'bg-purple-50 text-purple-700 border-purple-200',
  academic: 'bg-green-50 text-green-700 border-green-200',
  news: 'bg-amber-50 text-amber-700 border-amber-200',
};

function formatReportAsMarkdown(report: IntelligenceReport): string {
  let md = `# Intelligence Report: ${report.subject}\n`;
  md += `Generated: ${report.generated_at} by ${report.generated_by}\n\n`;

  md += `## Executive Summary\n${report.executive_summary}\n\n`;

  md += `## Key Findings\n`;
  report.key_findings.forEach((f, i) => {
    md += `${i + 1}. **${f.headline}** [${f.severity}] -- ${f.detail}\n`;
    if (f.source_url) md += `   Source: ${f.source_url}\n`;
  });
  md += '\n';

  md += `## Recent Developments\n`;
  report.recent_developments.forEach((d) => {
    md += `- **${d.date}**: ${d.headline} -- ${d.summary}\n`;
    md += `  Impact: ${d.impact}\n`;
    md += `  Source: ${d.source_url}\n`;
  });
  md += '\n';

  md += `## Risk Assessment\n`;
  md += `Current: ${report.risk_assessment.current_risk}\n`;
  md += `Trend: ${report.risk_assessment.trend}\n\n`;
  md += `Key Drivers:\n`;
  report.risk_assessment.key_drivers.forEach((d) => {
    md += `- ${d}\n`;
  });
  md += `\nMitigation Actions:\n`;
  report.risk_assessment.mitigation_actions.forEach((a) => {
    md += `- ${a}\n`;
  });
  md += '\n';

  md += `## Sources\n`;
  report.sources.forEach((s) => {
    md += `- ${s.title} -- ${s.url} (accessed ${s.accessed}, ${s.type})\n`;
  });

  return md;
}

function triggerDownload(report: IntelligenceReport) {
  const markdown = formatReportAsMarkdown(report);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const slug = report.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug}-intelligence-report.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function IntelReportTab({ entityType, entityId, category: legacyCategory, id: legacyId }: IntelReportTabProps) {
  // Derive category and id from registry; fall back to legacy props during migration
  const config = entityType ? ENTITY_REGISTRY[entityType] : undefined;
  const category = config?.intelCategory || legacyCategory || 'sectors';
  const id = config?.intelFallbackId || entityId || legacyId || '';

  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setReport(null);

    fetch(`/data/intelligence/${category}/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: IntelligenceReport) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [category, id]);

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center">
        <div className="text-[11px] text-gray-400 animate-pulse">Loading intelligence report...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-6">
        <svg className="w-8 h-8 text-gray-400 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
        <div className="text-xs font-medium text-gray-700 mb-1">No Intelligence Report Available</div>
        <div className="text-[11px] text-gray-500 max-w-xs mx-auto">
          No intelligence report has been generated for this item yet.
          Reports will appear here as they are produced by the intelligence pipeline.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with download button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] text-gray-400">
            Generated {report.generated_at} by {report.generated_by}
          </div>
        </div>
        <button
          onClick={() => triggerDownload(report)}
          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded hover:bg-blue-50"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Report
        </button>
      </div>

      {/* Executive Summary */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="text-[11px] font-medium text-gray-700 mb-1">Executive Summary</div>
        <div className="text-[11px] text-gray-600 leading-relaxed">{report.executive_summary}</div>
      </div>

      {/* Key Findings */}
      {report.key_findings.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-[11px] font-medium text-gray-700 mb-1.5">
            Key Findings ({report.key_findings.length})
          </div>
          <div className="space-y-1.5">
            {report.key_findings.map((finding, i) => {
              const colors = SEVERITY_COLORS[finding.severity] || SEVERITY_COLORS.moderate;
              return (
                <div key={i} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <div className="flex items-start gap-2">
                    <span className={`badge text-[10px] py-0 shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}>
                      {finding.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-gray-900">{finding.headline}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{finding.detail}</div>
                      {finding.source_url && (
                        <a
                          href={finding.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline mt-0.5 inline-block"
                        >
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Developments */}
      {report.recent_developments.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-[11px] font-medium text-gray-700 mb-1.5">
            Recent Developments ({report.recent_developments.length})
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {report.recent_developments.map((dev, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="text-[11px] font-medium text-gray-900">{dev.headline}</div>
                  <span className="text-[10px] text-gray-400 shrink-0 ml-2">{dev.date}</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">{dev.summary}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-400">Impact: {dev.impact}</span>
                  <a
                    href={dev.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    Source
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      <div className="pt-2 border-t border-gray-100">
        <div className="text-[11px] font-medium text-gray-700 mb-1.5">Risk Assessment</div>
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-500">Current Risk</span>
            <span className="text-gray-900 font-medium">{report.risk_assessment.current_risk}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-500">Trend</span>
            <span className={`font-medium ${TREND_ICONS[report.risk_assessment.trend]?.color || 'text-gray-600'}`}>
              {TREND_ICONS[report.risk_assessment.trend]?.label || report.risk_assessment.trend}
            </span>
          </div>

          {report.risk_assessment.key_drivers.length > 0 && (
            <div>
              <div className="text-[11px] text-gray-500 mb-0.5">Key Drivers</div>
              <ul className="space-y-0.5">
                {report.risk_assessment.key_drivers.map((driver, i) => (
                  <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                    <span className="text-gray-300 shrink-0">-</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.risk_assessment.mitigation_actions.length > 0 && (
            <div>
              <div className="text-[11px] text-gray-500 mb-0.5">Mitigation Actions</div>
              <ul className="space-y-0.5">
                {report.risk_assessment.mitigation_actions.map((action, i) => (
                  <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                    <span className="text-gray-300 shrink-0">-</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Sources */}
      {report.sources.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-[11px] font-medium text-gray-700 mb-1.5">
            Sources ({report.sources.length})
          </div>
          <div className="space-y-1">
            {report.sources.map((source, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className={`badge text-[9px] py-0 shrink-0 ${SOURCE_TYPE_COLORS[source.type] || SOURCE_TYPE_COLORS.news}`}>
                  {source.type}
                </span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate flex-1"
                >
                  {source.title}
                </a>
                <span className="text-gray-400 shrink-0">{source.accessed}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
