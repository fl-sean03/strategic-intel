# Agent Instructions — Strategic Industrial Intelligence Platform v2

## What This Is

A 6-sector strategic intelligence platform for the U.S. defense industrial base. Live at https://strategic-intel-flax.vercel.app.

**Status: SHIPPED.** All sectors live, 101 intelligence reports, full research pipeline.

## Architecture

```
Frontend (Next.js 14, static export → Vercel)
  ↕ reads from
Data Layer (16 structured JSON + 101 intel reports)
  ↕ populated by
Pipeline (Python: USGS, FRED, BLS, Census, MSHA, curated data)
  ↕ enriched by
Agent System (agents/ — specialist research agents producing intel reports)
  ↕ extracted to
Structured Data (investments.json, defense-programs.json, cross-sector.json, supply-chain-notes.json)
```

## Agent System

See `agents/README.md` for full documentation.

- **6 specialist agents** with SKILL.md definitions in `agents/skills/`
- **Execution logging** in `agents/runs/runs.jsonl`
- **Scripts** in `agents/tools/` (research, monitor, validate, extract, deploy)
- **101 intel reports** in `frontend/public/data/intelligence/`

## Key Commands

```bash
# Research a specific item
./agents/tools/research.sh minerals gallium

# Validate all reports
./agents/tools/validate-reports.sh

# Build + deploy
./agents/tools/deploy.sh

# Run the full pipeline (USGS, BLS, FRED, etc.)
cd pipeline && python3 run.py
```

## What's Built

| Sector | Status | Data Sources |
|--------|--------|-------------|
| Metals & Mining | Complete | USGS MCS, MSHA, curated |
| Manufacturing | Complete | FRED, BLS, Census, USAspending, World Bank |
| Energy | Complete | Curated (EIA API integration future) |
| Logistics | Complete | Curated (MARAD/UNCTAD future) |
| Telecom & Space | Complete | Curated (TeleGeography future) |
| Technology & R&D | Complete | Curated (ASPI/USPTO future) |

## Tests

```bash
cd /home/sfhs1/Workspace/strategic-intelligence/v2
python3 -m pytest tests/ -v  # 126 tests
```
