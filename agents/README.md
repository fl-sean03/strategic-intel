# Agent System — Strategic Industrial Intelligence

## Architecture

```
agents/
├── skills/          ← Specialist agent definitions (SKILL.md per agent)
├── orchestrator/    ← Scheduling, prioritization, rate limiting
├── runs/            ← Execution logs (JSONL, append-only)
└── tools/           ← Scripts for research, extraction, validation, deployment
```

## Specialists

| Agent | Skill File | Scope |
|-------|-----------|-------|
| Mineral Analyst | `skills/mineral-analyst/SKILL.md` | 60 critical minerals — supply chains, trade, defense deps |
| Maritime Analyst | `skills/maritime-analyst/SKILL.md` | Chokepoints, ports, shipping, merchant fleet |
| Tech Analyst | `skills/tech-analyst/SKILL.md` | Technology competition, R&D, defense programs |
| Telecom Analyst | `skills/telecom-analyst/SKILL.md` | Submarine cables, satellites, 5G, spectrum |
| Sector Analyst | `skills/sector-analyst/SKILL.md` | Sector-level overviews (energy, manufacturing, etc.) |
| Data Extractor | `skills/data-extractor/SKILL.md` | Extract structured data FROM intel reports INTO data files |

## How It Works

### Manual Research
```bash
# Research a specific item
./agents/tools/research.sh minerals gallium

# Extract structured data from all intel reports
./agents/tools/extract-structured.sh

# Validate all reports
./agents/tools/validate-reports.sh

# Build + deploy
./agents/tools/deploy.sh
```

### Automated (Future)
```bash
# Enable in crontab:
# 0 */6 * * * /path/to/agents/tools/news-monitor.sh
# 0 6 * * * /path/to/agents/tools/orchestrator.sh
```

## Execution Logging

Every research run appends to `runs/runs.jsonl`:
```json
{"timestamp":"...","agent":"mineral-analyst","task":"minerals/gallium","result":"success","quality_score":0.92}
```

## Quality Criteria

Every report is scored on 5 dimensions (0-1 each):
1. Factual accuracy — claims match cited sources
2. Citation accuracy — URLs exist and support claims
3. Completeness — all requested aspects covered
4. Source quality — government/academic preferred over news/blogs
5. Recency — sources from last 12 months preferred
