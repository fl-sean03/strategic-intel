#!/usr/bin/env bash
# validate-entity-registry.sh
# Verifies that every entity type in the registry has valid intel paths
# and graph entity prefixes backed by real data files.
#
# Usage: bash scripts/validate-entity-registry.sh
# Run from the frontend/ directory.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

python3 - "$FRONTEND_DIR" <<'PYEOF'
import json
import os
import sys

frontend_dir = sys.argv[1]
data_dir = os.path.join(frontend_dir, "public", "data")

# --- Entity Registry (mirrors lib/entityRegistry.ts) ---
ENTITY_REGISTRY = {
    "mineral": {
        "label": "Mineral",
        "color": "#B45309",
        "intelCategory": "minerals",
        "graphPrefix": "mineral/",
        "tabs": ["overview", "supply-chain", "facilities", "investments", "defense", "intel"],
    },
    "manufacturing-sector": {
        "label": "Manufacturing Sector",
        "color": "#1E3A5F",
        "intelCategory": "sectors",
        "graphPrefix": "sector/",
        "tabs": ["overview", "states-facilities", "dependencies", "shipbuilding", "munitions", "international", "investments"],
        "intelFallbackId": "manufacturing",
    },
    "country": {
        "label": "Country",
        "color": "#6B7280",
        "intelCategory": "countries",
        "graphPrefix": "country/",
        "tabs": ["minerals-produced"],
    },
    "energy-overview": {
        "label": "Energy Sector",
        "color": "#7C3AED",
        "intelCategory": "sectors",
        "graphPrefix": "",
        "tabs": ["overview", "battery-minerals", "intel"],
        "intelFallbackId": "energy",
    },
    "energy-fuel": {
        "label": "Energy Fuel",
        "color": "#7C3AED",
        "intelCategory": "sectors",
        "graphPrefix": "",
        "tabs": ["detail", "intel"],
        "intelFallbackId": "energy",
    },
    "energy-facility": {
        "label": "Energy Facility",
        "color": "#7C3AED",
        "intelCategory": "sectors",
        "graphPrefix": "",
        "tabs": ["detail", "intel"],
        "intelFallbackId": "energy",
    },
    "chokepoint": {
        "label": "Chokepoint",
        "color": "#0891B2",
        "intelCategory": "chokepoints",
        "graphPrefix": "chokepoint/",
        "tabs": ["detail", "intel"],
    },
    "port": {
        "label": "Port",
        "color": "#0891B2",
        "intelCategory": "sectors",
        "graphPrefix": "port/",
        "tabs": ["detail", "intel"],
        "intelFallbackId": "logistics",
    },
    "logistics-overview": {
        "label": "Logistics Sector",
        "color": "#0891B2",
        "intelCategory": "sectors",
        "graphPrefix": "",
        "tabs": ["overview", "chokepoints", "merchant-fleet", "ports", "intel"],
        "intelFallbackId": "logistics",
    },
    "telecom-overview": {
        "label": "Telecom Sector",
        "color": "#8B5CF6",
        "intelCategory": "sectors",
        "graphPrefix": "",
        "tabs": ["overview", "cables", "satellites", "intel"],
        "intelFallbackId": "telecom",
    },
    "cable": {
        "label": "Submarine Cable",
        "color": "#8B5CF6",
        "intelCategory": "cables",
        "graphPrefix": "cable/",
        "tabs": ["detail", "intel"],
    },
    "satellite": {
        "label": "Satellite",
        "color": "#8B5CF6",
        "intelCategory": "satellites",
        "graphPrefix": "constellation/",
        "tabs": ["detail", "intel"],
    },
    "technology-overview": {
        "label": "Technology Sector",
        "color": "#EC4899",
        "intelCategory": "sectors",
        "graphPrefix": "",
        "tabs": ["overview", "rd-spending", "defense-rd-states", "intel"],
        "intelFallbackId": "technology",
    },
    "tech-competition": {
        "label": "Technology",
        "color": "#EC4899",
        "intelCategory": "technologies",
        "graphPrefix": "technology/",
        "tabs": ["detail", "intel"],
    },
    "rd-spending": {
        "label": "R&D Spending",
        "color": "#EC4899",
        "intelCategory": "sectors",
        "graphPrefix": "",
        "tabs": ["detail", "intel"],
        "intelFallbackId": "technology",
    },
}


def get_intel_path(entity_type, entity_id):
    config = ENTITY_REGISTRY[entity_type]
    category = config["intelCategory"]
    eid = config.get("intelFallbackId", entity_id)
    return f"intelligence/{category}/{eid}.json"


# --- Load data ---
graph_path = os.path.join(data_dir, "graph", "entities.json")
meta_path = os.path.join(data_dir, "intelligence", "_meta.json")

with open(graph_path) as f:
    graph_data = json.load(f)
entity_ids = {e["id"] for e in graph_data["entities"]}

with open(meta_path) as f:
    meta_data = json.load(f)
intel_reports = {f"{r['category']}/{r['id']}" for r in meta_data["reports"]}

# Also check actual files on disk
intel_base = os.path.join(data_dir, "intelligence")

errors = 0
warnings = 0

print("=" * 60)
print("Entity Registry Validation")
print("=" * 60)

for etype, config in ENTITY_REGISTRY.items():
    print(f"\n--- {etype} ({config['label']}) ---")
    print(f"  Intel category:  {config['intelCategory']}")
    fallback = config.get("intelFallbackId", None)
    print(f"  Fallback ID:     {fallback or '(none — uses entity ID)'}")

    # Check intel reports for this category
    matching_reports = [r for r in intel_reports if r.startswith(config["intelCategory"] + "/")]
    print(f"  Intel reports:   {len(matching_reports)}")

    # If there's a fallback, check that the fallback file exists
    if fallback:
        fallback_key = f"{config['intelCategory']}/{fallback}"
        fallback_file = os.path.join(intel_base, config["intelCategory"], f"{fallback}.json")
        if os.path.isfile(fallback_file):
            print(f"  Fallback file:   OK ({fallback_key}.json)")
        else:
            print(f"  Fallback file:   MISSING ({fallback_file})")
            errors += 1

    # Check graph entities with this prefix
    prefix = config["graphPrefix"]
    if prefix:
        matching_entities = [e for e in entity_ids if e.startswith(prefix)]
        print(f"  Graph entities:  {len(matching_entities)} (prefix: '{prefix}')")
        if len(matching_entities) == 0:
            print(f"  WARNING: No graph entities found with prefix '{prefix}'")
            warnings += 1
    else:
        print(f"  Graph entities:  N/A (no graph prefix — overview type)")

    # For entity types WITH graph entities AND no fallback, spot-check
    # that intel reports exist for at least some of those entities
    if prefix and not fallback:
        sample_ids = [e.replace(prefix, "") for e in entity_ids if e.startswith(prefix)][:5]
        found = 0
        for sid in sample_ids:
            report_key = f"{config['intelCategory']}/{sid}"
            if report_key in intel_reports:
                found += 1
        if sample_ids:
            print(f"  Intel coverage:  {found}/{len(sample_ids)} sampled entities have reports")

print("\n" + "=" * 60)
print(f"Summary: {errors} errors, {warnings} warnings")
if errors == 0:
    print("PASS: All fallback intel paths resolve to existing files.")
else:
    print("FAIL: Some intel paths are broken. Fix the entity registry.")
print("=" * 60)
sys.exit(1 if errors > 0 else 0)
PYEOF
