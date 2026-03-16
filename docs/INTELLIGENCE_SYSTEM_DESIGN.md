# Intelligence System Design — v2 (Enhanced)

**Last updated:** 2026-03-16
**Status:** 37 reports live. Manual research pipeline working. Automation-ready architecture.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ TRIGGER LAYER                                                │
│  ├─ Manual: `./scripts/research.sh <category> <id>`         │
│  ├─ Scheduled: cron → news-monitor.sh (RSS keyword scan)    │
│  └─ On-demand: UI "Research" button (future)                │
├─────────────────────────────────────────────────────────────┤
│ ORCHESTRATOR                                                 │
│  ├─ research-orchestrator.sh                                │
│  │   ├─ Reads _meta.json for staleness                     │
│  │   ├─ Prioritizes by: age, severity, news triggers        │
│  │   ├─ Dispatches claude -p with --json-schema             │
│  │   └─ Rate limits: max 5 concurrent, 50/day              │
│  └─ Quality: validate JSON, check sources, score output     │
├─────────────────────────────────────────────────────────────┤
│ AGENT LAYER                                                  │
│  ├─ claude -p with structured output                        │
│  │   ├─ --output-format json                                │
│  │   ├─ --json-schema (IntelligenceReport)                  │
│  │   ├─ --allowedTools "WebSearch,WebFetch"                 │
│  │   └─ --max-turns 15                                      │
│  └─ Post-processing: URL validation, dedup, merge           │
├─────────────────────────────────────────────────────────────┤
│ STORAGE LAYER                                                │
│  ├─ /data/intelligence/{category}/{id}.json                 │
│  ├─ /data/intelligence/_meta.json (index + freshness)       │
│  ├─ /data/intelligence/_changelog.json (diffs)              │
│  └─ /data/intelligence/_quality.json (scores)               │
├─────────────────────────────────────────────────────────────┤
│ FRONTEND                                                     │
│  ├─ IntelReportTab (renders report, download button)        │
│  ├─ Freshness indicator (green/yellow/red by age)           │
│  └─ Quality badge (verified sources count)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Report Schema (v2 — Enhanced)

```typescript
interface IntelligenceReport {
  // Identity
  id: string;
  category: string;
  subject: string;

  // Metadata
  generated_at: string;           // ISO timestamp
  generated_by: string;           // "claude-research-agent" | "manual"
  version: number;                // Increments on update
  previous_version_at?: string;   // When last version was generated
  staleness_days?: number;        // Auto-calculated

  // Content
  executive_summary: string;
  key_findings: Finding[];
  recent_developments: Development[];
  risk_assessment: RiskAssessment;
  data_tables?: DataTable[];

  // Quality
  quality_score?: {
    factual_accuracy: number;     // 0-1
    citation_accuracy: number;    // 0-1
    completeness: number;         // 0-1
    source_quality: number;       // 0-1
    overall: number;              // 0-1
  };
  verified_sources_count?: number;
  total_sources_count?: number;

  // Sources
  sources: Source[];
}
```

---

## Scripts

### 1. `scripts/research.sh` — Manual Research Trigger

```bash
#!/bin/bash
# Usage: ./scripts/research.sh <category> <id>
# Example: ./scripts/research.sh minerals gallium
#          ./scripts/research.sh chokepoints strait-of-hormuz
```

Runs `claude -p` with the structured schema, validates output, writes to intelligence directory, updates _meta.json.

### 2. `scripts/news-monitor.sh` — RSS Keyword Scanner

Checks Google News RSS for trigger keywords. If new articles found matching our watch list, logs them to `_triggers.json`. Does NOT auto-run research — just flags what needs attention.

Watch keywords organized by category:
- Minerals: "export ban", "export controls", "critical minerals", "rare earth", "lithium", "gallium"
- Maritime: "strait of hormuz", "suez canal", "malacca", "houthi", "shipping disruption"
- Defense: "munitions", "shipbuilding", "defense industrial", "F-35 production"
- Tech: "semiconductor", "CHIPS Act", "AI safety", "quantum", "hypersonic"

### 3. `scripts/validate-reports.sh` — Quality Check

For each report in _meta.json:
- Validates JSON schema
- Checks all source URLs return 200 (HEAD request)
- Scores freshness (green <7 days, yellow 7-30 days, red >30 days)
- Writes results to `_quality.json`

### 4. `scripts/update-meta.sh` — Index Rebuilder

Scans intelligence directory, rebuilds _meta.json with freshness info.

---

## Freshness Model

| Age | Status | Action |
|-----|--------|--------|
| <7 days | Fresh (green) | No action |
| 7-30 days | Aging (yellow) | Consider refresh |
| 30-90 days | Stale (orange) | Refresh recommended |
| >90 days | Expired (red) | Refresh required |

Exceptions: Fast-moving topics (chokepoints, tech competition) have shorter thresholds (3/14/30).

---

## Quality Scoring (5 Dimensions)

Following Anthropic's own multi-agent quality framework:

1. **Factual accuracy** (0-1) — Do claims match cited sources?
2. **Citation accuracy** (0-1) — Do URLs exist and support claims?
3. **Completeness** (0-1) — Are all requested aspects covered?
4. **Source quality** (0-1) — Government/academic > news > blogs
5. **Recency** (0-1) — How recent are the sources?

Score = weighted average: accuracy(0.3) + citations(0.25) + completeness(0.2) + quality(0.15) + recency(0.1)

---

## Integration with Frontend

The IntelReportTab already renders reports. Enhancements:

1. **Freshness badge** — show green/yellow/red dot next to "Intel" tab based on report age
2. **Quality badge** — "X/Y sources verified" indicator
3. **Version history** — "Updated 3 days ago (v2)" with changelog
4. **Stale warning** — "This report is 45 days old. Information may be outdated."

---

## Cost Model (Claude Max $200/mo)

| Operation | Est. tokens | Frequency | Monthly cost |
|-----------|-------------|-----------|-------------|
| Manual research (1 report) | ~20K | ~10/month | Included in Max |
| News monitor (RSS check) | ~0 (bash only) | 4x/day | $0 |
| News trigger (Claude analysis) | ~5K | ~2x/week | Included in Max |
| Full refresh (37 reports) | ~740K | 1x/month | Included in Max |
| Quality validation | ~0 (bash HEAD reqs) | 1x/week | $0 |

Total: **$0 incremental** — all within Claude Max subscription.

---

## Future: Automated Pipeline

When ready to activate automatic research:

1. Enable `news-monitor.sh` in cron (every 6h)
2. Enable `research-orchestrator.sh` in cron (daily at 6am)
3. Orchestrator checks _triggers.json + _meta.json staleness
4. Auto-refreshes top 3 highest-priority stale reports per day
5. Max 5 research runs per day (rate limit)
6. Results auto-deployed via `npx vercel --prod`
