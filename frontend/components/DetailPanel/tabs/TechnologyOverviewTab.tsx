'use client';

import type { TechnologyData } from '@/lib/types';
import { ExternalLink } from '@/components/ui/SourceLink';
import ComparisonBar from '@/components/charts/ComparisonBar';

export function TechnologyOverviewTab({ data }: { data: TechnologyData }) {
  const { summary, tech_competition } = data;
  // Count critical/high risk items
  const criticalCount = tech_competition.filter((t) => t.risk === 'critical').length;
  const highCount = tech_competition.filter((t) => t.risk === 'high').length;

  return (
    <div className="space-y-3">
      {/* Key stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-lg font-bold text-pink-600">${summary.dod_rd_budget_b}B</div>
          <div className="text-[11px] text-gray-500">DoD R&D</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{summary.critical_tech_areas}</div>
          <div className="text-[11px] text-gray-500">Critical Techs</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{(summary.us_defense_patents_annual / 1000).toFixed(0)}K</div>
          <div className="text-[11px] text-gray-500">Patents/yr</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-500">{(summary.sbir_awards_annual / 1000).toFixed(0)}K</div>
          <div className="text-[11px] text-gray-500">SBIR Awards</div>
        </div>
      </div>

      <div className="text-[11px] text-gray-600 bg-pink-50 rounded-lg p-2 border border-pink-100">
        {summary.headline}
      </div>

      {/* Tech competition table */}
      <div className="pt-2 border-t border-gray-100">
        <div className="text-[11px] font-medium text-gray-700 mb-1.5">
          U.S. vs China Technology Competition
          <span className="text-gray-400 font-normal ml-1">
            ({criticalCount} critical, {highCount} high risk)
          </span>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {tech_competition.map((tech) => (
            <div key={tech.technology} className="flex items-center gap-2 py-0.5">
              <span className={`badge text-[10px] py-0 shrink-0 ${
                tech.risk === 'critical' ? 'bg-red-50 text-red-600 border-red-200' :
                tech.risk === 'high' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                tech.risk === 'moderate' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                'bg-green-50 text-green-600 border-green-200'
              }`}>
                {tech.risk}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-gray-900 truncate">{tech.technology}</div>
                <div className="text-[10px] text-gray-400 truncate">
                  U.S.: {tech.us_position} | CN: {tech.china_position}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 shrink-0 max-w-[80px] truncate" title={tech.trend}>
                {tech.trend}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 flex-wrap">
        <span className="text-[11px] text-gray-400">Sources:</span>
        {data.source_urls.map((s, i) => (
          <ExternalLink key={i} url={s.url} label={s.label} />
        ))}
      </div>
    </div>
  );
}

export function RdSpendingTab({ data }: { data: TechnologyData }) {
  return (
    <ComparisonBar
      title="R&D Spending ($B)"
      items={data.rd_spending.map((r) => ({
        label: r.entity,
        value: r.amount_b,
        color: r.entity === 'China PLA' ? '#DC2626' : '#1E3A5F',
      }))}
      formatValue={(v) => `$${v}B`}
    />
  );
}

export function DefenseRdStatesTab({ data }: { data: TechnologyData }) {
  return (
    <ComparisonBar
      title="Top Defense R&D States ($B)"
      items={data.top_defense_rd_states.map((s) => ({
        label: s.state,
        value: s.amount_b,
        color: '#EC4899',
      }))}
      formatValue={(v) => `$${v}B`}
    />
  );
}
