#!/bin/bash
# Strategic Industrial Intelligence — Build & Deploy
#
# Rebuilds _meta.json, builds frontend, deploys to Vercel.
#
# Usage: ./scripts/deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Strategic Industrial Intelligence — Deploy ==="
echo "Date: $(date)"

# 1. Rebuild _meta.json
echo ""
echo "--- Rebuilding intelligence index ---"
python3 << 'PYEOF'
import json, os, glob
from datetime import datetime, timezone

intel_dir = os.path.join(os.environ.get('PROJECT_ROOT', '.'), 'frontend/public/data/intelligence')
reports = []
for path in sorted(glob.glob(os.path.join(intel_dir, '**', '*.json'), recursive=True)):
    if os.path.basename(path).startswith('_'):
        continue
    try:
        with open(path) as f:
            json.load(f)
        rel = os.path.relpath(path, intel_dir)
        parts = rel.replace('.json','').split('/')
        reports.append({'category': parts[0], 'id': parts[1]})
    except:
        pass

meta = {
    'last_updated': datetime.now(timezone.utc).isoformat(),
    'total_reports': len(reports),
    'reports': reports
}
with open(os.path.join(intel_dir, '_meta.json'), 'w') as f:
    json.dump(meta, f, indent=2)
print('Intelligence index: %d reports' % len(reports))
PYEOF

# 2. Run tests
echo ""
echo "--- Running tests ---"
cd "$PROJECT_ROOT"
python3 -m pytest tests/ -q 2>&1 | tail -3

# 3. Build frontend
echo ""
echo "--- Building frontend ---"
cd "$PROJECT_ROOT/frontend"
npx next build 2>&1 | tail -10

# 4. Deploy
echo ""
echo "--- Deploying to Vercel ---"
npx vercel --prod 2>&1 | grep -E "Aliased|Production" || echo "Deploy completed"

echo ""
echo "=== Deploy complete ==="
echo "Live at: https://strategic-intel-flax.vercel.app"
