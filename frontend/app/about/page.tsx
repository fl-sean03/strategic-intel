'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">About & Methodology</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                How scores are calculated, where data comes from, and how to use the platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {/* Overview */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Project Overview</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>
              Strategic Industrial Intelligence is an open-source dashboard for U.S. industrial base health
              and supply chain dependencies across national security sectors. It provides a map-first interface
              for exploring critical mineral supply chains, defense manufacturing capacity, energy infrastructure,
              and global logistics.
            </p>
            <p>
              The platform uses exclusively public data. No classified or proprietary inputs are used.
              Anyone can reproduce the analysis. All scores are relative rankings, not absolute predictions &mdash;
              they provide structural insight into where vulnerabilities exist.
            </p>
            <p>
              Users switch between sector &ldquo;lenses&rdquo; (Metals &amp; Mining, Manufacturing, Energy, Logistics)
              and the map transforms to show that sector&apos;s data. The unique value is cross-sector connection mapping:
              click on a mineral and see which manufacturing sectors depend on it.
            </p>
          </div>
        </section>

        {/* Principles */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Scoring Principles</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Transparency', desc: 'Every score is decomposable. Users can click through to see exactly which inputs produced which number.' },
                { title: 'Public data only', desc: 'No classified or proprietary inputs. Anyone can reproduce the analysis.' },
                { title: 'Directional, not precise', desc: 'Structural insight, not precision forecasting. All scores are relative rankings.' },
                { title: 'Cross-sector awareness', desc: 'Scores reflect dependencies between sectors where possible.' },
              ].map((p) => (
                <div key={p.title} className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Metals & Mining Methodology */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Metals &amp; Mining Scoring</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
            {/* HHI */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">HHI (Herfindahl-Hirschman Index)</h3>
              <code className="block bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                HHI = &Sigma;(market_share_i&sup2;) for all countries i
              </code>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Range: 0.0 (perfect competition) to 1.0 (monopoly). Applied per mineral per supply chain stage (mining, processing, refining).
              </p>
            </div>

            {/* Concentration Risk */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Concentration Risk (0&ndash;100)</h3>
              <code className="block bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                concentration_risk = (0.25 * HHI_mining + 0.40 * HHI_processing + 0.35 * HHI_refining) * 100
              </code>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Processing weighted highest: hardest to replicate, where China has invested most aggressively.
              </p>
            </div>

            {/* Adversary Dependency */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Adversary Dependency (0&ndash;100)</h3>
              <code className="block bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                adversary_share = &Sigma;(share_i) for i in &#123;China, Russia, Iran, North Korea, ...&#125;<br/>
                adversary_dependency = (0.25 * adv_mining + 0.40 * adv_processing + 0.35 * adv_refining) * 100
              </code>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Measures total share of supply controlled by adversary nations across all stages.
              </p>
            </div>

            {/* Single Source Risk */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Single Source Risk (boolean)</h3>
              <code className="block bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                True if any country controls &gt;50% of any supply chain stage
              </code>
            </div>

            {/* Overall Risk */}
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Overall Mineral Risk (0&ndash;100)</h3>
              <code className="block bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                overall_risk = (0.30 * concentration_risk +<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.25 * adversary_dependency +<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.20 * import_dependency +<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.15 * defense_criticality_score +<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.10 * substitutability_penalty)
              </code>
            </div>
          </div>
        </section>

        {/* Manufacturing Methodology */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Manufacturing Health Scoring</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sector Health Score (0&ndash;100, per NAICS sector)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2 text-gray-500 dark:text-gray-400 font-medium">Component</th>
                      <th className="pb-2 text-gray-500 dark:text-gray-400 font-medium">Weight</th>
                      <th className="pb-2 text-gray-500 dark:text-gray-400 font-medium">Source</th>
                      <th className="pb-2 text-gray-500 dark:text-gray-400 font-medium">Measures</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 dark:text-gray-300">
                    <tr><td className="py-1">Capacity utilization</td><td>0.30</td><td>FRED</td><td>Are factories running? 80%+ = healthy</td></tr>
                    <tr><td className="py-1">Employment trend</td><td>0.25</td><td>BLS</td><td>Growing = positive (3-year trend)</td></tr>
                    <tr><td className="py-1">Output trend</td><td>0.20</td><td>Census ASM</td><td>Value of shipments trend (3-year)</td></tr>
                    <tr><td className="py-1">Geographic diversity</td><td>0.15</td><td>BLS/Census</td><td>HHI of employment by state</td></tr>
                    <tr><td className="py-1">Investment pipeline</td><td>0.10</td><td>IndustrialSage/CHIPS</td><td>New facilities announced or under construction</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Defense Concentration Risk (0&ndash;100)</h3>
              <code className="block bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                defense_concentration = (<br/>
                &nbsp;&nbsp;0.40 * contract_hhi +<br/>
                &nbsp;&nbsp;0.30 * sole_source_pct +<br/>
                &nbsp;&nbsp;0.30 * facility_density<br/>
                )
              </code>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Higher score = more concentrated = higher risk. Measures how much critical defense manufacturing
                is concentrated in a single area.
              </p>
            </div>
          </div>
        </section>

        {/* Cross-Sector Disruption */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Cross-Sector Disruption Modeling</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A disruption scenario consists of a trigger (country X restricts resource Y), direct impact
              (supply drops by N%), cascade analysis (which downstream sectors depend on Y), severity
              assessment (based on substitutability and stockpile levels), and estimated recovery time.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1 text-xs font-mono text-gray-600 dark:text-gray-400">
              <div>Trigger: China restricts gallium exports</div>
              <div className="pl-2">&rarr; Direct: Gallium supply drops 98%</div>
              <div className="pl-2">&rarr; Cascade: Semiconductor fabs lose feedstock</div>
              <div className="pl-2">&rarr; Cascade: Radar/EW systems lose GaAs components</div>
              <div className="pl-2">&rarr; Severity: Critical (no near-term substitutes)</div>
              <div className="pl-2">&rarr; Recovery: 5&ndash;8 years</div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Explore scenarios interactively on the{' '}
              <a href="/scenarios" className="text-navy dark:text-blue-400 hover:underline">Disruption Scenarios</a> page.
            </p>
          </div>
        </section>

        {/* Confidence Levels */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Confidence Levels</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="space-y-3">
              {[
                { level: 'High', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', desc: 'Based on structured, regularly updated government data (FRED, EIA, USGS, USAspending).' },
                { level: 'Medium', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', desc: 'Based on compiled public reports and estimates (munitions rates, reshoring announcements).' },
                { level: 'Low', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', desc: 'Based on press reports, expert estimates, or extrapolation (sub-tier suppliers, stockpile adequacy).' },
              ].map((c) => (
                <div key={c.level} className="flex items-start gap-3">
                  <span className={`badge ${c.color} text-[11px] shrink-0 mt-0.5`}>{c.level}</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Data Sources</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
            {[
              { name: 'USGS Mineral Commodity Summaries', year: '2025', url: 'https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries', desc: 'Production, trade, and reserve data for 90+ minerals.' },
              { name: 'FRED (Federal Reserve Economic Data)', year: 'Current', url: 'https://fred.stlouisfed.org/', desc: 'Capacity utilization, industrial production indices.' },
              { name: 'BLS (Bureau of Labor Statistics)', year: 'Current', url: 'https://www.bls.gov/', desc: 'Manufacturing employment by sector and state.' },
              { name: 'Census Bureau (County Business Patterns / ASM)', year: '2022-2023', url: 'https://www.census.gov/programs-surveys/cbp.html', desc: 'Establishment counts, employment, and output by NAICS code.' },
              { name: 'USAspending.gov', year: 'FY2024', url: 'https://www.usaspending.gov/', desc: 'Federal contract obligations including DoD contracts by state.' },
              { name: 'World Bank Open Data', year: '2022', url: 'https://data.worldbank.org/', desc: 'Manufacturing value added, GDP composition by country.' },
              { name: 'MSHA (Mine Safety & Health Administration)', year: 'Current', url: 'https://www.msha.gov/', desc: 'Active mine locations, operators, employment, commodities.' },
              { name: 'DOE Loan Programs Office', year: 'Current', url: 'https://www.energy.gov/lpo', desc: 'Loan guarantees for critical mineral and energy projects.' },
              { name: 'EIA (Energy Information Administration)', year: 'Current', url: 'https://www.eia.gov/', desc: 'Electricity generation, capacity, fuel mix, and grid data.' },
              { name: 'UNCTAD Review of Maritime Transport', year: '2024', url: 'https://unctad.org/rmt', desc: 'Shipping fleet statistics, port throughput, chokepoint data.' },
              { name: 'CRS/GAO Reports', year: 'Various', url: 'https://www.gao.gov/', desc: 'Shipbuilding assessments, defense industrial base studies, sealift capacity.' },
            ].map((s) => (
              <div key={s.name} className="p-4 flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{s.year}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</p>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-gray-400 hover:text-navy dark:hover:text-blue-400 transition-colors"
                  aria-label={`Open ${s.name}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">How to Use</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
            {[
              { step: '1', title: 'Choose a sector lens', desc: 'Use the pills at the top of the map (or press 1-4) to switch between Metals & Mining, Manufacturing, Energy, and Logistics.' },
              { step: '2', title: 'Explore the sidebar', desc: 'The left panel lists entities for the active lens, sorted by risk. Click any item to see its detail panel.' },
              { step: '3', title: 'Drill into details', desc: 'The right panel shows risk scores, supply chain breakdown, trade data, defense applications, and linked cross-sector dependencies.' },
              { step: '4', title: 'Use the map', desc: 'Markers show mine locations, shipyards, investments, and trade flow arcs. Toggle layers with the controls in the bottom-left corner.' },
              { step: '5', title: 'Search anything', desc: 'Press / to focus the search bar. Find minerals, sectors, facilities, investments, or defense programs by name.' },
              { step: '6', title: 'Compare minerals', desc: 'Visit the Compare page to see side-by-side risk scores for any two minerals.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-navy/10 dark:bg-navy/30 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-navy dark:text-blue-300">{s.step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Keyboard Shortcuts</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: '/', desc: 'Focus search' },
                { key: 'Esc', desc: 'Close panel / blur search' },
                { key: '1', desc: 'Metals & Mining' },
                { key: '2', desc: 'Manufacturing' },
                { key: '3', desc: 'Energy' },
                { key: '4', desc: 'Logistics' },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-2">
                  <kbd className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-600 dark:text-gray-300 min-w-[24px] text-center">{s.key}</kbd>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Known Limitations</h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <ul className="space-y-2">
              {[
                'No classified data. Cannot replicate DoD internal tools (Govini, Advana, SCREEn). Sub-tier supplier data is not available publicly.',
                'Data lag. FRED is ~2 weeks. Census ASM is ~2 years. USGS is ~1 year. We show structural trends, not current-day status.',
                'Processing/refining data is weakest. USGS tracks production, not processing capacity. This is the biggest blind spot in critical minerals analysis globally.',
                'Munitions data is approximate. Production rates assembled from press reports, not official databases.',
                'Scores are relative, not absolute. A score of 75 means "high risk relative to other entities in this dataset," not "75% probability of disruption."',
                'No demand-side modeling. We show supply concentration but not consumption patterns or inventory levels (mostly classified for defense).',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5 text-xs">{i + 1}.</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pb-4 space-y-2">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Public data only. No classified inputs. MIT License.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <a href="/" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Map
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a href="/compare" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Compare
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <a href="/scenarios" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Scenarios
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
