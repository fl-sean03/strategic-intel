#!/bin/bash
# Strategic Industrial Intelligence — Manual Research Trigger
#
# Usage:
#   ./scripts/research.sh <category> <id> [--force]
#
# Examples:
#   ./scripts/research.sh minerals gallium
#   ./scripts/research.sh chokepoints strait-of-hormuz
#   ./scripts/research.sh technologies artificial-intelligence
#   ./scripts/research.sh sectors energy
#   ./scripts/research.sh cables marea
#
# Categories: minerals, chokepoints, technologies, cables, sectors

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INTEL_DIR="$PROJECT_ROOT/frontend/public/data/intelligence"
LOG_DIR="$PROJECT_ROOT/logs"
mkdir -p "$LOG_DIR"

CATEGORY="${1:-}"
ID="${2:-}"
FORCE="${3:-}"

if [[ -z "$CATEGORY" || -z "$ID" ]]; then
    echo "Usage: $0 <category> <id> [--force]"
    echo "Categories: minerals, chokepoints, technologies, cables, sectors"
    exit 1
fi

OUTPUT_DIR="$INTEL_DIR/$CATEGORY"
OUTPUT_FILE="$OUTPUT_DIR/$ID.json"
LOCK_FILE="/tmp/si-research-$CATEGORY-$ID.lock"
LOG_FILE="$LOG_DIR/research-$(date +%Y%m%d-%H%M%S)-$CATEGORY-$ID.log"

mkdir -p "$OUTPUT_DIR"

# Check if already running
if [[ -f "$LOCK_FILE" ]]; then
    LOCK_AGE=$(( $(date +%s) - $(stat -c%Y "$LOCK_FILE" 2>/dev/null || echo 0) ))
    if [[ "$LOCK_AGE" -lt 600 ]]; then
        echo "Research already running for $CATEGORY/$ID (lock age: ${LOCK_AGE}s)"
        exit 0
    fi
    rm -f "$LOCK_FILE"
fi

# Check freshness (skip if <7 days old and not --force)
if [[ -f "$OUTPUT_FILE" && "$FORCE" != "--force" ]]; then
    FILE_AGE_DAYS=$(( ($(date +%s) - $(stat -c%Y "$OUTPUT_FILE")) / 86400 ))
    if [[ "$FILE_AGE_DAYS" -lt 7 ]]; then
        echo "Report is fresh ($FILE_AGE_DAYS days old). Use --force to refresh."
        exit 0
    fi
    echo "Report is $FILE_AGE_DAYS days old. Refreshing..."
fi

touch "$LOCK_FILE"

# Build the research prompt based on category
SUBJECT="$ID"
case "$CATEGORY" in
    minerals)
        SUBJECT_DISPLAY="${ID^}"  # Capitalize
        RESEARCH_FOCUS="Research this critical mineral for the U.S. defense industrial base:
- Current global production landscape and top producers
- Recent export restrictions, trade actions, or policy changes (2024-2026)
- U.S. domestic production status and investment pipeline
- Defense program dependencies
- Price trends and market dynamics
- Supply chain vulnerabilities and single points of failure
- Substitution research and alternatives"
        ;;
    chokepoints)
        SUBJECT_DISPLAY="$(echo "$ID" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')"
        RESEARCH_FOCUS="Research this maritime chokepoint:
- Current traffic volume and strategic importance
- Recent incidents, disruptions, or military activity (2024-2026)
- Geopolitical tensions and threat actors
- Alternative routes and cost implications
- U.S. military presence and posture
- Economic impact if disrupted"
        ;;
    technologies)
        SUBJECT_DISPLAY="$(echo "$ID" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')"
        RESEARCH_FOCUS="Research this critical technology for U.S. national security:
- U.S. vs China capability comparison
- Key programs, contractors, and funding levels
- Recent breakthroughs or deployments (2024-2026)
- Critical supply chain dependencies
- Defense applications and integration status
- Export control status and tech transfer concerns"
        ;;
    cables)
        SUBJECT_DISPLAY="$(echo "$ID" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')"
        RESEARCH_FOCUS="Research this submarine cable:
- Route details, landing points, capacity
- Owner/consortium and geopolitical implications
- Security concerns and vulnerabilities
- Strategic importance for data flows
- Alternative/redundant routes"
        ;;
    sectors)
        SUBJECT_DISPLAY="$(echo "$ID" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')"
        RESEARCH_FOCUS="Research the current state of this sector from a U.S. national security perspective:
- Major vulnerabilities and dependencies
- Comparison with adversary capabilities
- Recent policy actions and investments (2024-2026)
- Key risks and trend direction
- What's being done to address gaps"
        ;;
    *)
        echo "Unknown category: $CATEGORY"
        rm -f "$LOCK_FILE"
        exit 1
        ;;
esac

# JSON Schema for structured output
SCHEMA='{
  "type": "object",
  "properties": {
    "id": {"type": "string"},
    "category": {"type": "string"},
    "subject": {"type": "string"},
    "generated_at": {"type": "string"},
    "generated_by": {"type": "string"},
    "executive_summary": {"type": "string"},
    "key_findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "headline": {"type": "string"},
          "detail": {"type": "string"},
          "severity": {"type": "string", "enum": ["critical", "high", "moderate", "low"]},
          "source_url": {"type": "string"}
        },
        "required": ["headline", "detail", "severity"]
      }
    },
    "recent_developments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "date": {"type": "string"},
          "headline": {"type": "string"},
          "summary": {"type": "string"},
          "source_url": {"type": "string"},
          "impact": {"type": "string"}
        },
        "required": ["date", "headline", "summary"]
      }
    },
    "risk_assessment": {
      "type": "object",
      "properties": {
        "current_risk": {"type": "string"},
        "trend": {"type": "string", "enum": ["worsening", "stable", "improving"]},
        "key_drivers": {"type": "array", "items": {"type": "string"}},
        "mitigation_actions": {"type": "array", "items": {"type": "string"}}
      },
      "required": ["current_risk", "trend", "key_drivers", "mitigation_actions"]
    },
    "sources": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {"type": "string"},
          "url": {"type": "string"},
          "accessed": {"type": "string"},
          "type": {"type": "string", "enum": ["government", "industry", "academic", "news"]}
        },
        "required": ["title", "url", "accessed", "type"]
      }
    }
  },
  "required": ["id", "category", "subject", "generated_at", "generated_by", "executive_summary", "key_findings", "recent_developments", "risk_assessment", "sources"]
}'

PROMPT="You are a strategic intelligence analyst producing a research report on: $SUBJECT_DISPLAY

$RESEARCH_FOCUS

Requirements:
- At least 5 key findings with severity ratings (critical/high/moderate/low)
- At least 3 recent developments from 2024-2026 with dates
- Risk assessment with trend direction and specific drivers
- Every claim must have a source URL
- Be specific with data points (production amounts, percentages, dollar values)
- Focus on U.S. national security implications

Output the report as JSON with:
- id: \"$ID\"
- category: \"$CATEGORY\"
- subject: \"$SUBJECT_DISPLAY\"
- generated_at: current ISO timestamp
- generated_by: \"claude-research-agent\""

echo "$(date): Starting research for $CATEGORY/$ID" | tee "$LOG_FILE"
echo "Prompt: $PROMPT" >> "$LOG_FILE"

# Run claude -p with structured output
RESULT=$(claude -p "$PROMPT" \
    --allowedTools "WebSearch,WebFetch" \
    --output-format json \
    --max-turns 15 \
    2>>"$LOG_FILE")

EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]]; then
    echo "$(date): ERROR — claude -p exited with code $EXIT_CODE" | tee -a "$LOG_FILE"
    rm -f "$LOCK_FILE"
    exit 1
fi

# Extract structured output or result
REPORT=$(echo "$RESULT" | jq -r '.result // empty' 2>/dev/null)

if [[ -z "$REPORT" ]]; then
    echo "$(date): ERROR — empty result from claude -p" | tee -a "$LOG_FILE"
    rm -f "$LOCK_FILE"
    exit 1
fi

# Try to parse as JSON (claude -p result is often the raw text, we need the JSON)
# The structured output should be valid JSON
echo "$REPORT" > "$OUTPUT_FILE.tmp"

# Validate JSON
if python3 -c "import json; json.load(open('$OUTPUT_FILE.tmp'))" 2>/dev/null; then
    mv "$OUTPUT_FILE.tmp" "$OUTPUT_FILE"
    echo "$(date): SUCCESS — wrote $OUTPUT_FILE" | tee -a "$LOG_FILE"
else
    # Try extracting JSON from the text (claude sometimes wraps in markdown)
    python3 -c "
import json, re, sys
text = open('$OUTPUT_FILE.tmp').read()
# Try to find JSON block
match = re.search(r'\{[\s\S]*\}', text)
if match:
    data = json.loads(match.group())
    with open('$OUTPUT_FILE', 'w') as f:
        json.dump(data, f, indent=2)
    print('Extracted JSON from text response')
    sys.exit(0)
sys.exit(1)
" 2>/dev/null

    if [[ $? -ne 0 ]]; then
        echo "$(date): ERROR — could not parse JSON from response" | tee -a "$LOG_FILE"
        rm -f "$OUTPUT_FILE.tmp"
        rm -f "$LOCK_FILE"
        exit 1
    fi
    rm -f "$OUTPUT_FILE.tmp"
    echo "$(date): SUCCESS (extracted) — wrote $OUTPUT_FILE" | tee -a "$LOG_FILE"
fi

# Update _meta.json
python3 << PYEOF
import json, os, glob

intel_dir = "$INTEL_DIR"
reports = []
for path in sorted(glob.glob(os.path.join(intel_dir, '**', '*.json'), recursive=True)):
    if '_meta.json' in path or '_changelog' in path or '_quality' in path or '_triggers' in path:
        continue
    try:
        with open(path) as f:
            json.load(f)
        rel = os.path.relpath(path, intel_dir)
        parts = rel.replace('.json','').split('/')
        reports.append({'category': parts[0], 'id': parts[1]})
    except:
        pass

meta = {'last_updated': '$(date -Iseconds)', 'total_reports': len(reports), 'reports': reports}
with open(os.path.join(intel_dir, '_meta.json'), 'w') as f:
    json.dump(meta, f, indent=2)
print('Updated _meta.json: %d reports' % len(reports))
PYEOF

rm -f "$LOCK_FILE"
echo "$(date): Research complete for $CATEGORY/$ID" | tee -a "$LOG_FILE"
