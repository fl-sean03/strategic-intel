# Data Gap Analysis

## Problem

The platform has two data layers that don't communicate:

1. **Structured data** (JSON files) — powers the Overview, Supply Chain, Facilities, Investments, Defense tabs
2. **Intelligence reports** (JSON files) — powers the Intel tab only

For many minerals, the structured data is incomplete (0 facilities, 0 investments, 0 defense programs) while the intel report has rich contextual information about those exact topics.

## Root Cause

- `investments.json` was manually curated with only 18 entries covering ~10 minerals
- `defense-programs.json` was manually curated with only 10 programs covering ~16 minerals
- `cross-sector/dependencies.py` maps only 17 minerals to manufacturing sectors
- `facilities.json` depends on MSHA SIC matching which misses many minerals
- Intelligence reports contain rich supplementary data but it's unstructured text

## Solution: Enhanced Structured Data

### 1. Expand investments.json
Currently 18 entries. Should include ALL known government investments in critical minerals:
- DOE LPO loans (dozens more beyond our 18)
- DPA Title III grants (many more exist)
- IRA 48C tax credits
- DOD stockpile purchases
- State-level incentives for mining/processing

### 2. Expand defense-programs.json
Currently 10 programs. Should map more materials:
- Magnesium → flares, incendiary devices, aerospace alloys
- Many rare earths have specific program dependencies not captured

### 3. Expand cross-sector dependencies
Currently 17 minerals mapped. All 60 should have at least basic sector linkages.

### 4. Intel-to-structured extraction
When intel reports contain structured facts (specific facility names, investment amounts, defense program links), those should be extractable into the structured data. This could be:
- A post-processing step after research
- A separate "extract structured facts" agent
- Manual curation triggered by intel report findings

## Implementation Priority

1. Run agents to research and expand investments.json (more DOE/DPA/CHIPS investments)
2. Run agents to expand defense-programs.json (more programs, more mineral mappings)
3. Expand cross-sector dependencies (all 60 minerals)
4. Build "intel summary" into the non-Intel tabs — show key findings from intel report as supplementary context
