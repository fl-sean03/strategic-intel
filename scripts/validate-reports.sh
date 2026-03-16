#!/bin/bash
# Strategic Industrial Intelligence — Report Validator
#
# Validates all intelligence reports:
# - JSON schema compliance
# - Source URL existence (HEAD request)
# - Freshness scoring
# - Outputs _quality.json
#
# Usage: ./scripts/validate-reports.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INTEL_DIR="$PROJECT_ROOT/frontend/public/data/intelligence"
QUALITY_FILE="$INTEL_DIR/_quality.json"

echo "=== Intelligence Report Validator ==="
echo "Date: $(date)"
echo ""

python3 << 'PYEOF'
import json, os, glob, time, urllib.request, urllib.error
from datetime import datetime, timezone

intel_dir = os.environ.get('INTEL_DIR', 'frontend/public/data/intelligence')
if not os.path.isabs(intel_dir):
    intel_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), intel_dir)

quality_results = []
total_reports = 0
total_sources = 0
verified_sources = 0
schema_errors = 0

REQUIRED_FIELDS = ['id', 'category', 'subject', 'generated_at', 'executive_summary',
                   'key_findings', 'recent_developments', 'risk_assessment', 'sources']

for path in sorted(glob.glob(os.path.join(intel_dir, '**', '*.json'), recursive=True)):
    basename = os.path.basename(path)
    if basename.startswith('_'):
        continue

    total_reports += 1
    rel = os.path.relpath(path, intel_dir)
    parts = rel.replace('.json', '').split('/')
    category = parts[0]
    report_id = parts[1]

    result = {
        'category': category,
        'id': report_id,
        'valid_json': False,
        'schema_complete': False,
        'findings_count': 0,
        'developments_count': 0,
        'sources_count': 0,
        'verified_urls': 0,
        'failed_urls': [],
        'freshness': 'unknown',
        'freshness_days': -1,
        'quality_score': 0.0,
        'issues': []
    }

    # 1. JSON validity
    try:
        with open(path) as f:
            data = json.load(f)
        result['valid_json'] = True
    except Exception as e:
        result['issues'].append(f'Invalid JSON: {e}')
        schema_errors += 1
        quality_results.append(result)
        continue

    # 2. Schema completeness
    missing = [f for f in REQUIRED_FIELDS if f not in data]
    if missing:
        result['issues'].append(f'Missing fields: {", ".join(missing)}')
        schema_errors += 1
    else:
        result['schema_complete'] = True

    # 3. Content metrics
    result['findings_count'] = len(data.get('key_findings', []))
    result['developments_count'] = len(data.get('recent_developments', []))
    result['sources_count'] = len(data.get('sources', []))
    total_sources += result['sources_count']

    if result['findings_count'] < 3:
        result['issues'].append(f'Only {result["findings_count"]} findings (min 3)')
    if result['developments_count'] < 2:
        result['issues'].append(f'Only {result["developments_count"]} developments (min 2)')
    if result['sources_count'] < 5:
        result['issues'].append(f'Only {result["sources_count"]} sources (min 5)')

    # 4. Freshness
    gen_at = data.get('generated_at', '')
    if gen_at:
        try:
            gen_time = datetime.fromisoformat(gen_at.replace('Z', '+00:00'))
            age_days = (datetime.now(timezone.utc) - gen_time).days
            result['freshness_days'] = age_days
            if age_days < 7:
                result['freshness'] = 'fresh'
            elif age_days < 30:
                result['freshness'] = 'aging'
            elif age_days < 90:
                result['freshness'] = 'stale'
            else:
                result['freshness'] = 'expired'
        except:
            result['freshness'] = 'unknown'

    # 5. URL spot-check (check first 3 sources only — full check is slow)
    sources = data.get('sources', [])
    checked = 0
    for source in sources[:3]:
        url = source.get('url', '')
        if not url or not url.startswith('http'):
            continue
        checked += 1
        try:
            req = urllib.request.Request(url, method='HEAD')
            req.add_header('User-Agent', 'Mozilla/5.0 (Strategic Intel Validator)')
            resp = urllib.request.urlopen(req, timeout=10)
            if resp.status < 400:
                result['verified_urls'] += 1
                verified_sources += 1
        except (urllib.error.URLError, urllib.error.HTTPError, OSError, TimeoutError):
            result['failed_urls'].append(url)
        except Exception:
            pass

    # 6. Quality score
    scores = {
        'completeness': min(1.0, (result['findings_count'] / 5 + result['developments_count'] / 3 + result['sources_count'] / 8) / 3),
        'source_quality': 1.0 if result['verified_urls'] >= 2 else (result['verified_urls'] / 2),
        'freshness': max(0, 1.0 - (max(0, result['freshness_days']) / 90)) if result['freshness_days'] >= 0 else 0.5,
        'schema': 1.0 if result['schema_complete'] else 0.3,
    }
    result['quality_score'] = round(
        scores['completeness'] * 0.3 +
        scores['source_quality'] * 0.25 +
        scores['freshness'] * 0.25 +
        scores['schema'] * 0.2, 2
    )

    quality_results.append(result)
    status = '✓' if result['quality_score'] >= 0.7 else '⚠' if result['quality_score'] >= 0.4 else '✗'
    print(f'  {status} {category}/{report_id}: score={result["quality_score"]:.2f} '
          f'findings={result["findings_count"]} devs={result["developments_count"]} '
          f'sources={result["sources_count"]} fresh={result["freshness"]} '
          f'urls={result["verified_urls"]}/{min(3, result["sources_count"])} verified')

    if result['issues']:
        for issue in result['issues']:
            print(f'    ⚠ {issue}')

# Summary
print(f'\n=== Summary ===')
print(f'Total reports: {total_reports}')
print(f'Schema errors: {schema_errors}')
print(f'Total sources: {total_sources}')
print(f'Sources spot-checked: {verified_sources} verified')
avg_score = sum(r['quality_score'] for r in quality_results) / len(quality_results) if quality_results else 0
print(f'Average quality score: {avg_score:.2f}')

fresh = sum(1 for r in quality_results if r['freshness'] == 'fresh')
aging = sum(1 for r in quality_results if r['freshness'] == 'aging')
stale = sum(1 for r in quality_results if r['freshness'] in ('stale', 'expired'))
print(f'Freshness: {fresh} fresh, {aging} aging, {stale} stale/expired')

# Write quality file
quality_output = {
    'validated_at': datetime.now(timezone.utc).isoformat(),
    'total_reports': total_reports,
    'average_quality_score': round(avg_score, 2),
    'total_sources': total_sources,
    'schema_errors': schema_errors,
    'freshness_summary': {'fresh': fresh, 'aging': aging, 'stale': stale},
    'reports': quality_results
}

quality_path = os.path.join(intel_dir, '_quality.json')
with open(quality_path, 'w') as f:
    json.dump(quality_output, f, indent=2)
print(f'\nWrote {quality_path}')
PYEOF
