# Agent Architecture Audit — Strategic Industrial Intelligence

## A. Current State Audit

### How is agent behavior defined?
**Mixed. Mostly hardcoded/ad-hoc.**
- `AGENT.md` defines the build mission but is now stale (says "no code written yet")
- `CLAUDE.md` provides developer context but is also stale
- `scripts/research.sh` has research agent behavior embedded in bash
- No SKILL.md files, no structured prompt templates
- Research agent prompts are written inline when deploying subagents
- No separation between agent identity, orchestration, and evolution

### How is routing/orchestration handled?
**Manual. Human-in-the-loop.**
- Sean manually triggers research by running scripts or deploying subagents
- No automated scheduling (cron exists in scripts but not enabled)
- No task routing — every research request is manually composed
- `_meta.json` tracks what exists but doesn't drive decisions

### What tools/integrations exist?
- `scripts/research.sh` — wraps `claude -p` with structured output
- `scripts/news-monitor.sh` — RSS keyword scanning (not active)
- `scripts/validate-reports.sh` — quality checking
- `scripts/deploy.sh` — build + deploy pipeline
- Pipeline: Python ingestion from USGS, FRED, BLS, Census, USAspending, MSHA
- Frontend: Next.js static export to Vercel

### Is there execution logging?
**Minimal.** `research.sh` writes to `logs/` but:
- No structured format (just text)
- No success/fail tracking across runs
- No cost tracking
- No quality trend tracking over time
- `_quality.json` is a point-in-time snapshot, not a time series

### Is there a feedback loop?
**No.** Instructions are static. No mechanism to:
- Detect that a research prompt produces low-quality output
- Amend prompts based on past failures
- Track which minerals get better/worse coverage over time

### Agent specialization model?
**Ad-hoc generalists.** When deploying research agents, each gets a custom prompt but:
- No reusable skill files
- No consistent quality criteria across agents
- No specialist definitions (mineral analyst vs. maritime analyst vs. tech analyst)

---

## B. Gap Analysis

| Pattern | Status | Gap | Effort | Impact |
|---------|--------|-----|--------|--------|
| 1. File Tree = Architecture | Partial — scripts/ exists, docs/ exists, but no skills/ directory, no agent definitions | Need skills/ with specialist SKILL.md files | Moderate | High |
| 2. Three Layers (Identity/Orchestration/Evolution) | Layer 1 partial (AGENT.md stale), Layer 2 manual, Layer 3 absent | Need all three layers properly separated | Significant | High |
| 3. Skills vs MCP | Over-relying on inline prompts, under-investing in skill files | Need reusable skill files for each research specialty | Moderate | High |
| 4. Observation | Minimal — logs/ exists but unstructured | Need structured execution logging | Moderate | High |
| 5. Self-Improving Loop | Absent | Need observe → inspect → amend → evaluate cycle | Significant | Medium |
| 6. One Agent Per Job | Partial — research agents are specialized per run but definitions not reusable | Need persistent specialist definitions | Low | High |
| 7. Anti-Patterns | Several present: stale AGENT.md, inline prompts, no execution logging | Clean up stale docs, extract skill files | Low | Medium |

---

## C. Recommended Changes (Priority Ordered)

### 1. Create `agents/` directory with specialist skill files
**What:** Create `agents/` with SKILL.md for each research specialty.
**Why:** Pattern 6 (one agent per job) + Pattern 3 (skills vs MCP). Reusable, versionable, improvable.
**Impact:** Every future research run uses consistent, tested prompts.

### 2. Structured execution logging
**What:** `agents/runs/` with JSONL logs.
**Why:** Pattern 4 (observation). Can't improve what you can't measure.
**Impact:** Know which agents produce good output, which need prompt refinement.

### 3. Update stale docs (AGENT.md, CLAUDE.md)
**What:** Rewrite to reflect current state.
**Why:** Pattern 7 (anti-patterns). Stale docs confuse future agents.
**Impact:** Any agent reading the project gets accurate context.

### 4. Extract research prompts into skill files
**What:** Move inline prompts from research.sh into `agents/skills/`.
**Why:** Pattern 3. Prompts should be files, not bash strings.
**Impact:** Can iterate on prompts without touching scripts.

### 5. Build intel-to-structured extraction pipeline
**What:** Agent that reads intel reports → populates structured data files.
**Why:** This is the immediate user problem — intel exists but structured data is empty.
**Impact:** All tabs populate properly for all minerals.

---

## D. Proposed File Structure

```
agents/
├── README.md                    # How the agent system works
├── skills/
│   ├── mineral-analyst/
│   │   └── SKILL.md            # Prompt, tools, output schema, quality criteria
│   ├── maritime-analyst/
│   │   └── SKILL.md
│   ├── tech-analyst/
│   │   └── SKILL.md
│   ├── telecom-analyst/
│   │   └── SKILL.md
│   ├── sector-analyst/
│   │   └── SKILL.md
│   └── data-extractor/
│       └── SKILL.md            # Extracts structured data from intel reports
├── orchestrator/
│   ├── SKILL.md                # How to prioritize and dispatch research
│   ├── schedule.json           # What runs when
│   └── budget.json             # Rate limits, cost caps
├── runs/
│   ├── runs.jsonl              # Structured execution log (append-only)
│   └── quality-trends.jsonl    # Quality scores over time
└── tools/
    ├── research.sh             # (moved from scripts/)
    ├── news-monitor.sh
    ├── validate-reports.sh
    ├── extract-structured.sh   # NEW: intel → structured data
    └── deploy.sh
```

## E. Minimum Viable Observation

### What gets logged (per execution):
```json
{
  "timestamp": "2026-03-16T14:30:00Z",
  "agent": "mineral-analyst",
  "task": "research minerals/gallium",
  "category": "minerals",
  "item_id": "gallium",
  "result": "success",
  "error": null,
  "duration_seconds": 45,
  "findings_count": 7,
  "sources_count": 10,
  "quality_score": 0.92,
  "cost_estimate_tokens": 20000
}
```

### Where stored:
`agents/runs/runs.jsonl` — append-only, one JSON object per line.

### How written:
Add to `research.sh`: after successful write, append a log entry.

### Useful queries:
```bash
# Failed runs in last 7 days
jq 'select(.result == "fail")' agents/runs/runs.jsonl | tail -20

# Average quality by agent type
jq -s 'group_by(.agent) | map({agent: .[0].agent, avg_quality: (map(.quality_score) | add / length)})' agents/runs/runs.jsonl

# Minerals with lowest quality scores
jq -s 'sort_by(.quality_score) | .[:10]' agents/runs/runs.jsonl
```
