#!/bin/bash
# Strategic Industrial Intelligence — News Monitor
#
# Checks Google News RSS for trigger keywords related to critical minerals,
# defense industrial base, and supply chain disruptions.
#
# Does NOT auto-run research — writes triggers to _triggers.json for review.
#
# Usage: ./scripts/news-monitor.sh
# Cron: 0 */6 * * * /path/to/scripts/news-monitor.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INTEL_DIR="$PROJECT_ROOT/frontend/public/data/intelligence"
TRIGGERS_FILE="$INTEL_DIR/_triggers.json"
SEEN_FILE="/tmp/si-news-seen-hashes"
LOG_FILE="$PROJECT_ROOT/logs/news-monitor-$(date +%Y%m%d).log"

mkdir -p "$PROJECT_ROOT/logs"
touch "$SEEN_FILE"

echo "$(date): News monitor starting" >> "$LOG_FILE"

# Define keyword groups with their category mapping
declare -A QUERIES
QUERIES["minerals"]="critical+minerals+OR+rare+earth+export+OR+gallium+ban+OR+lithium+supply+OR+cobalt+shortage"
QUERIES["maritime"]="strait+hormuz+OR+suez+canal+disruption+OR+malacca+OR+houthi+shipping+OR+taiwan+strait+military"
QUERIES["defense"]="defense+industrial+base+OR+munitions+production+OR+shipbuilding+crisis+OR+155mm+shells"
QUERIES["tech"]="semiconductor+export+controls+OR+CHIPS+Act+OR+quantum+computing+defense+OR+hypersonic+weapon"
QUERIES["energy"]="power+grid+vulnerability+OR+nuclear+plant+OR+battery+supply+chain+OR+DOE+loan"

NEW_TRIGGERS=0
TRIGGER_ENTRIES=""

for CATEGORY in "${!QUERIES[@]}"; do
    QUERY="${QUERIES[$CATEGORY]}"
    RSS_URL="https://news.google.com/rss/search?q=${QUERY}+when:12h&hl=en-US&gl=US&ceid=US:en"

    # Fetch RSS feed
    FEED=$(curl -sL --max-time 15 "$RSS_URL" 2>/dev/null || echo "")

    if [[ -z "$FEED" ]]; then
        echo "$(date): WARN — failed to fetch RSS for $CATEGORY" >> "$LOG_FILE"
        continue
    fi

    # Extract titles and links using simple XML parsing
    # (feedparser would be better but keeping it dependency-free)
    ITEMS=$(echo "$FEED" | python3 -c "
import sys, re, hashlib, json

feed = sys.stdin.read()
items = re.findall(r'<item>(.*?)</item>', feed, re.DOTALL)

results = []
for item in items[:10]:  # Max 10 per category
    title_match = re.search(r'<title>(.*?)</title>', item)
    link_match = re.search(r'<link>(.*?)</link>', item)
    pubdate_match = re.search(r'<pubDate>(.*?)</pubDate>', item)

    if title_match and link_match:
        title = title_match.group(1).replace('<![CDATA[','').replace(']]>','').strip()
        link = link_match.group(1).strip()
        pubdate = pubdate_match.group(1).strip() if pubdate_match else ''
        url_hash = hashlib.md5(link.encode()).hexdigest()[:12]

        results.append({
            'title': title,
            'url': link,
            'date': pubdate,
            'hash': url_hash
        })

json.dump(results, sys.stdout)
" 2>/dev/null || echo "[]")

    # Check for new items not in seen hashes
    echo "$ITEMS" | python3 -c "
import sys, json

items = json.load(sys.stdin)
seen_file = '$SEEN_FILE'

with open(seen_file, 'r') as f:
    seen = set(f.read().strip().split('\n'))

new_items = []
new_hashes = []
for item in items:
    if item['hash'] not in seen:
        new_items.append(item)
        new_hashes.append(item['hash'])

if new_items:
    for item in new_items:
        trigger = {
            'category': '$CATEGORY',
            'title': item['title'],
            'url': item['url'],
            'date': item['date'],
            'detected_at': '$(date -Iseconds)',
            'processed': False
        }
        print(json.dumps(trigger))

    # Append new hashes to seen file
    with open(seen_file, 'a') as f:
        for h in new_hashes:
            f.write(h + '\n')

    print('NEW:' + str(len(new_items)), file=sys.stderr)
" 2>>/tmp/si-news-count || true

    # Count new items
    COUNT=$(cat /tmp/si-news-count 2>/dev/null | grep "^NEW:" | tail -1 | sed 's/NEW://' || echo "0")
    rm -f /tmp/si-news-count

    if [[ "$COUNT" -gt 0 ]]; then
        echo "$(date): Found $COUNT new articles for $CATEGORY" >> "$LOG_FILE"
        NEW_TRIGGERS=$((NEW_TRIGGERS + COUNT))
    fi
done

echo "$(date): Monitor complete. $NEW_TRIGGERS new triggers found." >> "$LOG_FILE"

# Trim seen hashes file to last 5000 entries
if [[ $(wc -l < "$SEEN_FILE") -gt 5000 ]]; then
    tail -5000 "$SEEN_FILE" > "$SEEN_FILE.tmp"
    mv "$SEEN_FILE.tmp" "$SEEN_FILE"
fi

echo "$NEW_TRIGGERS"
