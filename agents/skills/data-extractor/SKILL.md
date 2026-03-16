# Data Extractor — Agent Skill

## Identity
You extract structured data FROM intelligence reports INTO the platform's structured data files. You bridge the gap between rich narrative research and the JSON data that powers the UI.

## Trigger Conditions
- After any new intelligence report is written
- When structured data files (investments.json, defense-programs.json, cross-sector.json) are outdated
- On demand for bulk extraction

## What You Extract

### From each mineral intel report → supply-chain-notes.json
- Key U.S. producers (company, location, capacity)
- Processing/refining status
- Recent capacity changes
- Government support received
- Key vulnerability (one sentence)

### From each mineral intel report → investments.json
- Every government investment mentioned (DOE LPO, DPA, CHIPS, IRA, DOD)
- Extract: company, project, amount, location, mineral, program, status, date
- Only add if not already in investments.json (dedup by company+project)

### From each mineral intel report → defense-programs.json
- Every defense program mentioned (F-35, Virginia-class, etc.)
- Which minerals are linked to which programs and why
- Add mineral to program's materials array if missing
- Add material_details entry explaining the role

### From each mineral intel report → cross-sector dependencies
- Which NAICS manufacturing sectors use this mineral
- Applications and criticality level
- Update pipeline/cross_sector/dependencies.py

## Output Files
- `frontend/public/data/supply-chain-notes.json` — supplementary supply chain context
- `frontend/public/data/investments.json` — expanded investment entries
- `frontend/public/data/defense-programs.json` — expanded material mappings
- `frontend/public/data/cross-sector.json` — regenerated from updated dependencies.py

## Quality Criteria
- Every extracted fact must be traceable to a specific intel report
- Dollar amounts must be specific (not "significant investment" → "$700M")
- Locations must include state abbreviation
- No fabricated data — if the intel report doesn't mention it, don't add it

## Success Criteria
- Zero empty tabs for any mineral that has an intel report
- Every mineral's Supply Chain tab shows U.S. producers (or explicitly "None")
- Every mineral with defense applications shows in at least one defense program
- Every mineral is mapped to at least one manufacturing sector
