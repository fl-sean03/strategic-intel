"""Transform USGS data into the unified minerals data model.

Migrated from critical-chain v1.
"""
import json
import re
from collections import defaultdict
from pathlib import Path

from pipeline.metals_mining.config import (
    RAW_DIR, CRITICAL_MINERALS_2025, ADVERSARY_NATIONS,
    COUNTRY_ISO_MAP, DEFENSE_APPLICATIONS,
)


def _slugify(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


COUNTRY_DISPLAY_NAMES = {
    "Korea, Republic of": "South Korea", "Korea, Republic of ": "South Korea",
    "Republic of Korea": "South Korea", " Republic of Korea": "South Korea",
    "Congo (Kinshasa)": "DR Congo", "Russian Federation": "Russia",
}


def _country_display(country: str) -> str:
    country = country.strip().rstrip(',')
    return COUNTRY_DISPLAY_NAMES.get(country, country)


def build_minerals(usgs_data: dict) -> list[dict]:
    """Build the full mineral data model from parsed USGS data."""
    world_data = usgs_data.get("world_data", [])
    salient = usgs_data.get("salient_stats", {})
    import_reliance = usgs_data.get("import_reliance", {})
    end_use = usgs_data.get("end_use", {})

    mineral_production = defaultdict(lambda: defaultdict(dict))
    mineral_world_totals = {}
    mineral_units = {}

    for rec in world_data:
        mineral = rec["mineral"]
        country = rec["country"]
        prod = rec.get("production_2024") or rec.get("production_2023")

        if country == "WORLD":
            if prod is not None:
                mineral_world_totals[mineral] = prod
                mineral_units[mineral] = rec.get("unit", "metric tons")
            continue

        if prod is not None:
            existing = mineral_production[mineral][country].get("production", 0)
            if prod > existing:
                mineral_production[mineral][country] = {
                    "production": prod,
                    "country_iso": rec.get("country_iso", ""),
                    "reserves": rec.get("reserves_2024"),
                    "type": rec.get("type", ""),
                }

    minerals = []
    for mineral_name in CRITICAL_MINERALS_2025:
        slug = _slugify(mineral_name)
        salient_data = salient.get(mineral_name, {})
        end_use_text = end_use.get(mineral_name, "")
        defense_apps = DEFENSE_APPLICATIONS.get(mineral_name, [])

        country_data = mineral_production.get(mineral_name, {})
        world_total = mineral_world_totals.get(mineral_name)
        unit = mineral_units.get(mineral_name, "metric tons")

        if world_total is None and country_data:
            world_total = sum(d["production"] for d in country_data.values())
        if world_total is None:
            world_total = salient_data.get("world_total_production")

        top_producers = []
        if world_total and world_total > 0:
            country_sum = sum(d["production"] for d in country_data.values())
            denominator = country_sum if country_sum > 0 else world_total
            if country_sum > world_total * 5 and world_total > 0:
                denominator = country_sum

            for country, data in sorted(
                country_data.items(), key=lambda x: x[1]["production"], reverse=True
            ):
                share = data["production"] / denominator
                if share < 0.001:
                    continue
                top_producers.append({
                    "country": _country_display(country),
                    "country_iso": data.get("country_iso", COUNTRY_ISO_MAP.get(country, "")),
                    "share": round(min(share, 1.0), 4),
                    "production": data["production"],
                })
        elif salient_data.get("leading_source_country") and salient_data.get("leading_country_share"):
            top_producers.append({
                "country": salient_data["leading_source_country"],
                "country_iso": COUNTRY_ISO_MAP.get(salient_data["leading_source_country"], ""),
                "share": salient_data["leading_country_share"],
                "production": None,
            })

        supply_chain = {
            "mining": {
                "global_production": world_total, "unit": unit,
                "top_producers": top_producers[:10],
                "data_quality": "measured" if country_data else "estimated",
            },
            "processing": {
                "top_processors": top_producers[:10],
                "data_quality": "approximated_from_mining",
                "note": "Processing data approximated from mining production.",
            },
            "refining": {
                "top_refiners": top_producers[:10],
                "data_quality": "approximated_from_mining",
                "note": "Refining data approximated from mining production.",
            },
        }

        nir = salient_data.get("net_import_reliance")
        if nir is None:
            for key, ir_data in import_reliance.items():
                if mineral_name.upper() in key.upper():
                    nir = ir_data.get("net_import_reliance_pct")
                    break

        import_sources = []
        for key, ir_data in import_reliance.items():
            if mineral_name.upper() in key.upper() or _slugify(mineral_name) in _slugify(key):
                import_sources = ir_data.get("major_import_sources", [])
                break

        trade = {
            "net_import_reliance": nir,
            "primary_import_source": salient_data.get("primary_import_source", ""),
            "major_import_sources": import_sources,
            "apparent_consumption": salient_data.get("apparent_consumption"),
        }

        defense_score = min(len(defense_apps) * 20, 100) if defense_apps else 25

        minerals.append({
            "id": slug, "name": mineral_name,
            "critical_mineral": True, "critical_mineral_year": 2025,
            "primary_applications": end_use_text,
            "defense_applications": defense_apps,
            "defense_criticality_score": defense_score,
            "supply_chain": supply_chain, "trade": trade,
            "substitutability_score": 50.0,
        })

    # Propagate aggregate data to individual REEs and PGMs
    rare_earth_names = [
        "Cerium", "Dysprosium", "Erbium", "Europium", "Gadolinium",
        "Holmium", "Lanthanum", "Lutetium", "Neodymium", "Praseodymium",
        "Samarium", "Terbium", "Thulium", "Ytterbium",
    ]
    pgm_names = ["Iridium", "Palladium", "Platinum", "Rhodium", "Ruthenium"]

    by_name = {m["name"]: m for m in minerals}
    rare_earth_agg = mineral_production.get("Rare Earths", {})
    re_salient = salient.get("Rare Earths", {})

    re_world_total = mineral_world_totals.get("Rare Earths")
    if re_world_total is None:
        re_world_total = re_salient.get("world_total_production")
    re_producers = []
    if rare_earth_agg and re_world_total:
        country_sum = sum(d["production"] for d in rare_earth_agg.values())
        denom = country_sum if country_sum > re_world_total * 5 else (country_sum if country_sum > 0 else re_world_total)
        for country, data in sorted(rare_earth_agg.items(), key=lambda x: x[1]["production"], reverse=True):
            share = data["production"] / denom
            if share < 0.001:
                continue
            re_producers.append({
                "country": _country_display(country),
                "country_iso": data.get("country_iso", COUNTRY_ISO_MAP.get(country, "")),
                "share": round(min(share, 1.0), 4),
                "production": data["production"],
            })
    elif re_salient.get("leading_source_country"):
        re_producers = [{
            "country": re_salient["leading_source_country"],
            "country_iso": COUNTRY_ISO_MAP.get(re_salient["leading_source_country"], ""),
            "share": re_salient.get("leading_country_share", 0.69),
            "production": None,
        }]

    for ree_name in rare_earth_names:
        if ree_name in by_name and not by_name[ree_name]["supply_chain"]["mining"]["top_producers"]:
            by_name[ree_name]["supply_chain"]["mining"]["top_producers"] = re_producers
            by_name[ree_name]["supply_chain"]["processing"]["top_processors"] = re_producers
            by_name[ree_name]["supply_chain"]["refining"]["top_refiners"] = re_producers
            by_name[ree_name]["supply_chain"]["mining"]["data_quality"] = "propagated_from_aggregate"
            if re_salient.get("net_import_reliance") is not None:
                by_name[ree_name]["trade"]["net_import_reliance"] = re_salient["net_import_reliance"]

    for pgm_name in pgm_names:
        if pgm_name in by_name and not by_name[pgm_name]["supply_chain"]["mining"]["top_producers"]:
            pgm_m = by_name.get("Platinum", {})
            if pgm_m.get("supply_chain", {}).get("mining", {}).get("top_producers"):
                by_name[pgm_name]["supply_chain"]["mining"]["top_producers"] = pgm_m["supply_chain"]["mining"]["top_producers"]
                by_name[pgm_name]["supply_chain"]["processing"]["top_processors"] = pgm_m["supply_chain"]["mining"]["top_producers"]
                by_name[pgm_name]["supply_chain"]["refining"]["top_refiners"] = pgm_m["supply_chain"]["mining"]["top_producers"]
                by_name[pgm_name]["supply_chain"]["mining"]["data_quality"] = "propagated_from_pgm_aggregate"

    print(f"[Transform] Built {len(minerals)} mineral records")
    return minerals


def run() -> list[dict]:
    """Load parsed USGS data and build minerals dataset."""
    usgs_path = RAW_DIR / "usgs_parsed.json"
    if not usgs_path.exists():
        raise FileNotFoundError(f"Run USGS ingestion first: {usgs_path}")

    usgs_data = json.loads(usgs_path.read_text())
    return build_minerals(usgs_data)
