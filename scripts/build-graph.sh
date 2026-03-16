#!/usr/bin/env bash
# build-graph.sh — Generate knowledge graph from all sector data files.
# Reads JSON data from frontend/public/data/ and outputs:
#   frontend/public/data/graph/entities.json
#   frontend/public/data/graph/relationships.json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="$PROJECT_ROOT/frontend/public/data"
OUT_DIR="$DATA_DIR/graph"

mkdir -p "$OUT_DIR"

echo "Building knowledge graph..."
echo "  Data dir: $DATA_DIR"
echo "  Output:   $OUT_DIR"

python3 - "$DATA_DIR" "$OUT_DIR" << 'PYTHON_SCRIPT'
#!/usr/bin/env python3
"""
Knowledge Graph Generator for Strategic Industrial Intelligence Platform.

Reads all sector data files and produces a normalized knowledge graph
with entities (nodes) and relationships (edges).
"""

import json
import re
import sys
from collections import Counter
from pathlib import Path


def slugify(text: str) -> str:
    """Convert text to a URL-safe slug."""
    s = text.lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s-]+', '-', s)
    return s.strip('-')


def load_json(path: Path):
    """Load JSON file, return None if missing."""
    if not path.exists():
        print(f"  WARNING: {path.name} not found, skipping")
        return None
    with open(path) as f:
        return json.load(f)


def main():
    data_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])

    # ------------------------------------------------------------------
    # Load all data files
    # ------------------------------------------------------------------
    metals_mining = load_json(data_dir / "metals-mining.json")
    investments = load_json(data_dir / "investments.json")
    defense_programs = load_json(data_dir / "defense-programs.json")
    facilities = load_json(data_dir / "facilities.json")
    cross_sector = load_json(data_dir / "cross-sector.json")
    supply_chain_notes = load_json(data_dir / "supply-chain-notes.json")
    shipyards = load_json(data_dir / "shipyards.json")
    energy = load_json(data_dir / "energy.json")
    logistics = load_json(data_dir / "logistics.json")
    telecom = load_json(data_dir / "telecom.json")
    technology = load_json(data_dir / "technology.json")

    # ------------------------------------------------------------------
    # Entity and relationship accumulators
    # ------------------------------------------------------------------
    entities = {}  # id -> entity dict
    relationships = []  # list of edge dicts

    def add_entity(eid: str, etype: str, name: str, slug: str = None):
        """Add an entity if not already present."""
        if eid not in entities:
            entities[eid] = {
                "id": eid,
                "type": etype,
                "name": name,
                "slug": slug or slugify(name),
            }

    def add_relationship(from_id: str, to_id: str, rel_type: str,
                         detail: str = None, strength: float = None):
        """Add an edge."""
        edge = {"from": from_id, "to": to_id, "type": rel_type}
        if detail:
            edge["detail"] = detail
        if strength is not None:
            edge["strength"] = round(strength, 4)
        relationships.append(edge)

    # Build a mineral name -> id lookup from metals-mining
    mineral_name_to_id = {}
    if metals_mining:
        for m in metals_mining.get("minerals", []):
            mineral_name_to_id[m["name"]] = m["id"]
            mineral_name_to_id[m["name"].lower()] = m["id"]

    def mineral_slug(name: str) -> str:
        """Resolve a mineral name to its canonical slug/id."""
        lower = name.lower().strip()
        if lower in mineral_name_to_id:
            return mineral_name_to_id[lower]
        return slugify(name)

    # ==================================================================
    # 1. MINERALS from metals-mining.json
    # ==================================================================
    if metals_mining:
        for m in metals_mining.get("minerals", []):
            mid = f"mineral/{m['id']}"
            add_entity(mid, "mineral", m["name"], m["id"])

            # 2. PRODUCES edges: country -> mineral (top_producers)
            producers = m.get("supply_chain", {}).get("mining", {}).get("top_producers", [])
            for p in producers:
                iso = p.get("country_iso", "")
                if not iso:
                    continue
                cid = f"country/{iso}"
                add_entity(cid, "country", p["country"], iso.lower())
                share = p.get("share", 0)
                detail = f"{round(share * 100, 1)}% of global production"
                add_relationship(cid, mid, "produces", detail=detail, strength=share)

        print(f"  Minerals: {len([e for e in entities if e.startswith('mineral/')])}")

    # ==================================================================
    # 3. REQUIRED_BY edges: defense-programs -> minerals
    # ==================================================================
    if defense_programs:
        for prog in defense_programs:
            pid = f"program/{prog['id']}"
            add_entity(pid, "program", prog["name"], prog["id"])

            material_details = prog.get("material_details", {})
            for mat in prog.get("materials", []):
                ms = mineral_slug(mat)
                mid = f"mineral/{ms}"
                # Ensure mineral entity exists even if not in metals-mining
                add_entity(mid, "mineral", mat, ms)
                detail = material_details.get(mat, "")
                add_relationship(mid, pid, "required_by", detail=detail or None, strength=1.0)

        print(f"  Defense programs: {len([e for e in entities if e.startswith('program/')])}")

    # ==================================================================
    # 4. MINES edges: facility -> mineral
    # ==================================================================
    if facilities:
        for fac in facilities:
            fid = f"facility/{fac['id']}"
            add_entity(fid, "facility", fac["name"], fac["id"])

            for mat in fac.get("mineral_match", []):
                ms = mineral_slug(mat)
                mid = f"mineral/{ms}"
                add_entity(mid, "mineral", mat, ms)
                add_relationship(fid, mid, "mines", strength=1.0)

        print(f"  Facilities: {len([e for e in entities if e.startswith('facility/')])}")

    # ==================================================================
    # 5. FUNDS edges: investment -> mineral
    # ==================================================================
    if investments:
        # Compute max amount for normalization
        amounts = [inv.get("amount", 0) for inv in investments if inv.get("amount")]
        max_amount = max(amounts) if amounts else 1

        for inv in investments:
            iid = f"investment/{inv['id']}"
            add_entity(iid, "investment", inv.get("project", inv["id"]), inv["id"])

            # Also create company entity from investment
            company_name = inv.get("company", "")
            if company_name:
                cslug = slugify(company_name)
                comp_id = f"company/{cslug}"
                add_entity(comp_id, "company", company_name, cslug)
                add_relationship(iid, comp_id, "awarded_to",
                                 detail=inv.get("project", ""), strength=1.0)

            mineral_name = inv.get("mineral")
            if mineral_name:
                ms = mineral_slug(mineral_name)
                mid = f"mineral/{ms}"
                add_entity(mid, "mineral", mineral_name, ms)
                amt = inv.get("amount", 0)
                strength = round(amt / max_amount, 4) if max_amount > 0 else 0
                detail = inv.get("notes", inv.get("project", ""))
                add_relationship(iid, mid, "funds", detail=detail, strength=strength)

        print(f"  Investments: {len([e for e in entities if e.startswith('investment/')])}")

    # ==================================================================
    # 6. DEPENDS_ON edges: sector -> mineral (cross-sector)
    # ==================================================================
    if cross_sector:
        for dep in cross_sector.get("dependencies", []):
            from_info = dep.get("from", {})
            to_info = dep.get("to", {})

            naics = from_info.get("naics", slugify(from_info.get("entity", "unknown")))
            sector_id = f"sector/{naics}"
            add_entity(sector_id, "sector", from_info.get("entity", naics), naics)

            to_name = to_info.get("entity", "")
            ms = mineral_slug(to_name)
            mid = f"mineral/{ms}"
            add_entity(mid, "mineral", to_name, ms)

            note = dep.get("note", "")
            apps = dep.get("applications", [])
            detail = note if note else (", ".join(apps) if apps else None)
            add_relationship(sector_id, mid, "depends_on", detail=detail, strength=1.0)

        print(f"  Cross-sector dependencies: {len(cross_sector.get('dependencies', []))}")

    # ==================================================================
    # 7. SUPPLIES edges: company -> mineral (supply-chain-notes)
    # ==================================================================
    if supply_chain_notes:
        minerals_data = supply_chain_notes.get("minerals", {})
        for mineral_key, info in minerals_data.items():
            ms = mineral_slug(mineral_key)
            mid = f"mineral/{ms}"
            # Capitalize mineral name for display
            display_name = mineral_key.replace("-", " ").title()
            add_entity(mid, "mineral", display_name, ms)

            for prod in info.get("us_producers", []):
                company_name = prod.get("company", "").strip()
                if not company_name or company_name.lower() in ("none", "n/a", ""):
                    continue
                cslug = slugify(company_name)
                comp_id = f"company/{cslug}"
                add_entity(comp_id, "company", company_name, cslug)
                detail = prod.get("notes", "")
                add_relationship(comp_id, mid, "supplies",
                                 detail=detail or None, strength=1.0)

        print(f"  Supply chain companies: {len([e for e in entities if e.startswith('company/')])}")

    # ==================================================================
    # 8. SHIPYARDS
    # ==================================================================
    if shipyards:
        for sy in shipyards:
            sid = f"shipyard/{sy['id']}"
            add_entity(sid, "shipyard", sy["name"], sy["id"])

            # Link shipyard to country
            iso = sy.get("country_iso", "")
            if iso:
                cid = f"country/{iso}"
                add_entity(cid, "country", sy.get("country", iso), iso.lower())
                add_relationship(sid, cid, "located_in", strength=1.0)

        print(f"  Shipyards: {len([e for e in entities if e.startswith('shipyard/')])}")

    # ==================================================================
    # 9. ENERGY FACILITIES
    # ==================================================================
    if energy:
        for fac in energy.get("key_facilities", []):
            fslug = slugify(fac["name"])
            fid = f"energy-facility/{fslug}"
            add_entity(fid, "energy-facility", fac["name"], fslug)

        # Battery mineral dependencies -> mineral links
        for dep in energy.get("battery_minerals", {}).get("dependencies", []):
            mineral_name = dep.get("mineral", "")
            if mineral_name:
                ms = mineral_slug(mineral_name)
                mid = f"mineral/{ms}"
                add_entity(mid, "mineral", mineral_name, ms)
                sid = "sector/energy-storage"
                add_entity(sid, "sector", "Energy Storage (Batteries)", "energy-storage")
                detail = dep.get("use", "")
                reliance = dep.get("us_import_reliance_pct", 0)
                add_relationship(sid, mid, "depends_on",
                                 detail=f"{detail} ({reliance}% import reliance)",
                                 strength=reliance / 100.0 if reliance else 1.0)

        print(f"  Energy facilities: {len([e for e in entities if e.startswith('energy-facility/')])}")

    # ==================================================================
    # 10. LOGISTICS: chokepoints, ports, fleets
    # ==================================================================
    if logistics:
        # Chokepoints
        for cp in logistics.get("chokepoints", []):
            cslug = slugify(cp["name"])
            cpid = f"chokepoint/{cslug}"
            add_entity(cpid, "chokepoint", cp["name"], cslug)
            # Chokepoints transit global trade
            detail = f"{cp.get('daily_vessels', 0)} vessels/day, {cp.get('trade_value_pct', 0)}% of global trade"
            add_relationship(cpid, "sector/global-trade", "transits",
                             detail=detail,
                             strength=cp.get("trade_value_pct", 0) / 100.0)
        add_entity("sector/global-trade", "sector", "Global Trade", "global-trade")

        # Ports
        for port in logistics.get("major_ports", []):
            pslug = slugify(port["name"])
            pid = f"port/{pslug}"
            add_entity(pid, "port", port["name"], pslug)

            iso = port.get("country_iso", "")
            if iso:
                cid = f"country/{iso}"
                add_entity(cid, "country", port.get("country", iso), iso.lower())
                detail = f"{port.get('teu_millions', 0)}M TEU, rank #{port.get('rank_global', 'N/A')}"
                add_relationship(pid, cid, "serves",
                                 detail=detail,
                                 strength=min(port.get("teu_millions", 0) / 50.0, 1.0))

        # Merchant fleets -> country
        for fleet in logistics.get("merchant_fleet_comparison", []):
            iso = fleet.get("country_iso", "")
            if iso:
                cid = f"country/{iso}"
                add_entity(cid, "country", fleet.get("country", iso), iso.lower())

        print(f"  Chokepoints: {len([e for e in entities if e.startswith('chokepoint/')])}")
        print(f"  Ports: {len([e for e in entities if e.startswith('port/')])}")

    # ==================================================================
    # 11. TELECOM: cables, satellites
    # ==================================================================
    if telecom:
        # Submarine cables connect landing points (approximate as country-to-country)
        for cable in telecom.get("key_cables", []):
            cslug = slugify(cable["name"])
            cid = f"cable/{cslug}"
            add_entity(cid, "cable", cable["name"], cslug)

            # Extract country references from "from" and "to" fields
            from_text = cable.get("from", "")
            to_text = cable.get("to", "")
            detail = f"{cable.get('length_km', 0)} km, {cable.get('capacity_tbps', 0)} Tbps"
            # Create landing-point entities
            from_slug = slugify(from_text)
            to_slug = slugify(to_text)
            from_id = f"landing-point/{from_slug}"
            to_id = f"landing-point/{to_slug}"
            add_entity(from_id, "landing-point", from_text, from_slug)
            add_entity(to_id, "landing-point", to_text, to_slug)
            add_relationship(cid, from_id, "connects", detail=detail,
                             strength=min(cable.get("capacity_tbps", 0) / 350.0, 1.0))
            add_relationship(cid, to_id, "connects", detail=detail,
                             strength=min(cable.get("capacity_tbps", 0) / 350.0, 1.0))

        # Satellite constellations
        for sat in telecom.get("satellite_constellations", []):
            sslug = slugify(sat["name"])
            sid = f"constellation/{sslug}"
            add_entity(sid, "constellation", sat["name"], sslug)

            iso = sat.get("country_iso", "")
            if iso:
                cid = f"country/{iso}"
                add_entity(cid, "country", sat.get("country", iso), iso.lower())
                detail = f"{sat.get('satellites_deployed', 0)} deployed, {sat.get('satellites_planned', 0)} planned"
                add_relationship(sid, cid, "operated_by", detail=detail, strength=1.0)

        print(f"  Cables: {len([e for e in entities if e.startswith('cable/')])}")
        print(f"  Constellations: {len([e for e in entities if e.startswith('constellation/')])}")

    # ==================================================================
    # 12. TECHNOLOGY: tech competition areas
    # ==================================================================
    if technology:
        for tech in technology.get("tech_competition", []):
            tslug = slugify(tech["technology"])
            tid = f"technology/{tslug}"
            add_entity(tid, "technology", tech["technology"], tslug)

            # US position
            us_id = "country/US"
            add_entity(us_id, "country", "United States", "us")
            detail = f"Position: {tech.get('us_position', 'N/A')}. {tech.get('defense_relevance', '')}"
            add_relationship(us_id, tid, "competes_in", detail=detail, strength=1.0)

            # China position
            cn_id = "country/CN"
            add_entity(cn_id, "country", "China", "cn")
            detail = f"Position: {tech.get('china_position', 'N/A')}. Trend: {tech.get('trend', '')}"
            add_relationship(cn_id, tid, "competes_in", detail=detail, strength=1.0)

        # R&D spending entities
        for rd in technology.get("rd_spending", []):
            rslug = slugify(rd["entity"])
            rid = f"rd-entity/{rslug}"
            add_entity(rid, "rd-entity", rd["entity"], rslug)

        print(f"  Technologies: {len([e for e in entities if e.startswith('technology/')])}")

    # ==================================================================
    # Build output
    # ==================================================================
    entity_list = sorted(entities.values(), key=lambda e: (e["type"], e["name"]))
    by_type = Counter(e["type"] for e in entity_list)
    rel_by_type = Counter(r["type"] for r in relationships)

    entities_output = {
        "total": len(entity_list),
        "by_type": dict(sorted(by_type.items())),
        "entities": entity_list,
    }

    relationships_output = {
        "total": len(relationships),
        "by_type": dict(sorted(rel_by_type.items())),
        "relationships": relationships,
    }

    # Write output files
    entities_path = out_dir / "entities.json"
    relationships_path = out_dir / "relationships.json"

    with open(entities_path, "w") as f:
        json.dump(entities_output, f, indent=2, ensure_ascii=False)

    with open(relationships_path, "w") as f:
        json.dump(relationships_output, f, indent=2, ensure_ascii=False)

    print()
    print(f"  === Knowledge Graph Summary ===")
    print(f"  Total entities:      {entities_output['total']}")
    print(f"  Total relationships: {relationships_output['total']}")
    print()
    print(f"  Entities by type:")
    for t, c in sorted(by_type.items()):
        print(f"    {t:20s} {c:>6d}")
    print()
    print(f"  Relationships by type:")
    for t, c in sorted(rel_by_type.items()):
        print(f"    {t:20s} {c:>6d}")
    print()
    print(f"  Written: {entities_path}")
    print(f"  Written: {relationships_path}")


if __name__ == "__main__":
    main()
PYTHON_SCRIPT

echo ""
echo "Knowledge graph build complete."
