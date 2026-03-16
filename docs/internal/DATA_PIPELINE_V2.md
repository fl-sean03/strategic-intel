# Data Pipeline v2 — Intel-Driven Structured Data

## Flow

```
Intel Report (research)
    → Extract structured facts (agent or script)
        → investments.json (expanded)
        → defense-programs.json (expanded material mappings)
        → cross-sector.json (all 60 minerals mapped)
        → supply-chain-notes.json (NEW: supplementary supply chain context per mineral)
    → Version tracking (_versions.json)
    → Build + Deploy
```

## Key Principle

The intel report is the source of truth. Structured data files are DERIVED from intel reports + government APIs. When an intel report is updated, the structured data should be re-extracted.

## New Data File: supply-chain-notes.json

For each mineral, stores supplementary context that the USGS pipeline doesn't capture:
- Key U.S. producers (company names, locations)
- Processing/refining status
- Recent capacity changes
- Government support received

This fills the gap between "USGS says 75% import reliance" and "US Magnesium LLC in Rowley, Utah is the sole domestic producer and went bankrupt in 2024."

## Versioning

Each data file gets a version entry in `_versions.json`:
```json
{
  "investments.json": {
    "version": 3,
    "last_updated": "2026-03-16T...",
    "entries": 45,
    "updated_by": "intel-extraction-agent"
  }
}
```

Future: git-based versioning via commits with structured messages.
