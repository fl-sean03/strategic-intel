#!/usr/bin/env python3
"""Strategic Industrial Intelligence — Pipeline Orchestrator.

Runs all sector pipelines: ingest → transform → score → export.
"""
import json
import os
import sys
from pathlib import Path

# Ensure project root is on path
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

# Load .env file
from dotenv import load_dotenv
load_dotenv(ROOT / ".env")

from pipeline.shared.export import export_sector_data, export_stats, export_frontend_json
from pipeline.metals_mining.ingestion.usgs import run as run_usgs_ingest
from pipeline.metals_mining.transform.normalize import build_minerals
from pipeline.metals_mining.scoring.concentration import score_mineral
from pipeline.manufacturing.config import NAICS_SECTORS, SHIPBUILDING_DATA, MUNITIONS_DATA
from pipeline.manufacturing.ingestion.bls import get_manufacturing_employment
from pipeline.manufacturing.ingestion.census import fetch_manufacturing_by_state, fetch_manufacturing_by_naics_state
from pipeline.manufacturing.ingestion.usaspending import fetch_dod_contracts_by_state
from pipeline.manufacturing.ingestion.worldbank import fetch_manufacturing_value_added, fetch_manufacturing_pct_gdp
from pipeline.manufacturing.transform.normalize import (
    build_sector_employment, build_defense_contracts,
    build_international_comparison, extract_latest_value, compute_trend,
)
from pipeline.manufacturing.scoring.health import score_manufacturing_health, score_defense_concentration
from pipeline.manufacturing.ingestion.fred import get_all_capacity_utilization
from pipeline.cross_sector.dependencies import build_cross_sector_data
from pipeline.cross_sector.defense_programs import get_defense_programs
from pipeline.facilities.ingestion.msha import run as run_msha_ingest
from pipeline.facilities.transform.normalize import normalize_facilities


def run_metals_mining(force: bool = False) -> dict:
    """Run the Metals & Mining sector pipeline."""
    print("\n" + "=" * 60)
    print("SECTOR: METALS & MINING")
    print("=" * 60)

    # Ingest
    usgs_data = run_usgs_ingest(force=force)

    # Transform
    minerals = build_minerals(usgs_data)

    # Score
    print(f"[Scoring] Scoring {len(minerals)} minerals...")
    for mineral in minerals:
        mineral["risk_scores"] = score_mineral(mineral)

    minerals.sort(
        key=lambda m: m.get("risk_scores", {}).get("overall_risk", 0),
        reverse=True,
    )

    # Print top 10
    print("\n  Top 10 Highest Risk:")
    for i, m in enumerate(minerals[:10]):
        rs = m["risk_scores"]
        print(f"  {i+1:2d}. {m['name']:<20s} overall={rs['overall_risk']:5.1f}  "
              f"conc={rs['concentration_risk']:5.1f}  adv={rs['adversary_dependency']:5.1f}")

    # Compute summary stats
    high_risk = [m for m in minerals if m["risk_scores"]["overall_risk"] > 60]
    single_source = [m for m in minerals if m["risk_scores"]["single_source_risk"]]
    adv_dep_high = [m for m in minerals if m["risk_scores"]["adversary_dependency"] > 50]
    avg_risk = sum(m["risk_scores"]["overall_risk"] for m in minerals) / len(minerals) if minerals else 0

    risk_distribution = {
        "critical": len([m for m in minerals if m["risk_scores"]["overall_risk"] > 80]),
        "high": len([m for m in minerals if 60 < m["risk_scores"]["overall_risk"] <= 80]),
        "moderate": len([m for m in minerals if 40 < m["risk_scores"]["overall_risk"] <= 60]),
        "low": len([m for m in minerals if m["risk_scores"]["overall_risk"] <= 40]),
    }

    sector_data = {
        "sector": "metals-mining",
        "summary": {
            "total_minerals": len(minerals),
            "high_risk_count": len(high_risk),
            "single_source_count": len(single_source),
            "adversary_dependent_count": len(adv_dep_high),
            "avg_overall_risk": round(avg_risk, 1),
        },
        "minerals": minerals,
        "risk_distribution": risk_distribution,
    }

    # Export
    path = export_sector_data("metals-mining", sector_data)
    print(f"[Export] Wrote {path}")

    return sector_data


def run_manufacturing(force: bool = False) -> dict:
    """Run the Manufacturing & Industrial Capacity pipeline."""
    print("\n" + "=" * 60)
    print("SECTOR: MANUFACTURING & INDUSTRIAL CAPACITY")
    print("=" * 60)

    # Ingest from all APIs
    print("\n[Ingestion] Fetching data from FRED, BLS, Census, USAspending, World Bank...")

    fred_cap_util = get_all_capacity_utilization()
    bls_data = get_manufacturing_employment()
    census_state = fetch_manufacturing_by_state()
    dod_contracts = fetch_dod_contracts_by_state()
    wb_value_added = fetch_manufacturing_value_added()
    wb_pct_gdp = fetch_manufacturing_pct_gdp()

    # Transform
    state_employment = build_sector_employment(census_state)
    defense_contracts = build_defense_contracts(dod_contracts)
    international = build_international_comparison(wb_value_added, wb_pct_gdp)

    total_manufacturing_emp = sum(r["employment"] for r in census_state)

    # Build sector-level data
    sectors = []
    for naics_code, info in NAICS_SECTORS.items():
        # Get BLS employment data for this sector
        ces_series = info.get("bls_ces", "")
        emp_data = bls_data.get(ces_series, [])
        latest_emp = extract_latest_value(emp_data)
        emp_trend = compute_trend(emp_data)

        # Convert BLS thousands to actual (BLS CES reports in thousands)
        if latest_emp is not None:
            latest_emp = latest_emp * 1000

        # Get Census geographic distribution for this sector
        try:
            naics_state = fetch_manufacturing_by_naics_state(naics_code)
            geo_dist = build_sector_employment(naics_state)
        except Exception:
            geo_dist = []

        state_shares = [s["share"] for s in geo_dist]

        # Capacity utilization from FRED (live or fallback)
        fred_series = info.get("fred_cap_util", "")
        cap_util = fred_cap_util.get(fred_series)

        # Score
        health = score_manufacturing_health(
            capacity_utilization=cap_util,
            employment_trend=emp_trend,
            state_shares=state_shares,
        )

        # Defense contracts for this sector (we don't have NAICS-level contract data easily,
        # so use total DoD amount as placeholder)
        defense_total = sum(c["total_amount"] for c in defense_contracts)

        sectors.append({
            "naics_code": naics_code,
            "name": info["name"],
            "defense_relevance": info["defense_relevance"],
            "capacity_utilization": cap_util,
            "employment": int(latest_emp) if latest_emp else None,
            "employment_trend": emp_trend,
            "value_of_shipments": None,  # Would come from Census ASM
            "health_score": health,
            "geographic_distribution": geo_dist[:10],
            "defense_contracts_total": defense_total,
        })

    sectors.sort(key=lambda s: s["health_score"])

    # Defense concentration score
    defense_amounts = [c["total_amount"] for c in defense_contracts]
    defense_concentration = score_defense_concentration(defense_amounts)

    # Print summary
    print(f"\n  Manufacturing Sectors Scored: {len(sectors)}")
    for s in sectors:
        emp_str = f"{s['employment']:>10,}" if s['employment'] else "       N/A"
        print(f"    {s['naics_code']} {s['name']:<35s} health={s['health_score']:5.1f}  emp={emp_str}")

    print(f"\n  Defense contract concentration score: {defense_concentration}")
    print(f"  Total manufacturing employment (Census): {total_manufacturing_emp:,}")
    print(f"  International comparison countries: {len(international)}")

    total_cap_util = fred_cap_util.get("MCUMFN")

    sector_data = {
        "sector": "manufacturing",
        "data_freshness": {
            "fred": "2025 (fallback)" if not __import__("os").environ.get("FRED_API_KEY") else "2025 (live)",
            "bls": "2025",
            "census_cbp": "2022",
            "usaspending": "2024",
            "worldbank": "2022",
        },
        "summary": {
            "total_employment": total_manufacturing_emp,
            "capacity_utilization": total_cap_util,
            "headline_stat": "U.S. shipbuilding output is 1/300th of China's",
        },
        "sectors": sectors,
        "defense_contracts": defense_contracts,
        "defense_concentration_score": defense_concentration,
        "shipbuilding": SHIPBUILDING_DATA,
        "munitions": MUNITIONS_DATA,
        "international": international,
    }

    path = export_sector_data("manufacturing", sector_data)
    print(f"[Export] Wrote {path}")

    return sector_data


def run_facilities(force: bool = False) -> dict:
    """Run the Facilities pipeline (MSHA mines)."""
    print("\n" + "=" * 60)
    print("SECTOR: FACILITIES (MSHA MINES)")
    print("=" * 60)

    # Ingest
    raw_records = run_msha_ingest(force=force)

    # Transform / Normalize
    facilities = normalize_facilities(raw_records)

    # Build sector data
    mineral_counts: dict[str, int] = {}
    state_counts: dict[str, int] = {}
    total_employees = 0

    for f in facilities:
        for m in f["mineral_match"]:
            mineral_counts[m] = mineral_counts.get(m, 0) + 1
        state = f.get("state")
        if state:
            state_counts[state] = state_counts.get(state, 0) + 1
        if f.get("employment"):
            total_employees += f["employment"]

    top_minerals = sorted(mineral_counts.items(), key=lambda x: x[1], reverse=True)
    top_states = sorted(state_counts.items(), key=lambda x: x[1], reverse=True)

    sector_data = {
        "sector": "facilities",
        "summary": {
            "total_facilities": len(facilities),
            "total_employees": total_employees,
            "minerals_represented": len(mineral_counts),
            "states_represented": len(state_counts),
        },
        "top_minerals": [{"mineral": m, "facility_count": c} for m, c in top_minerals[:20]],
        "top_states": [{"state": s, "facility_count": c} for s, c in top_states[:20]],
        "facilities": facilities,
    }

    # Export full sector data to processed/
    path = export_sector_data("facilities", sector_data, copy_to_frontend=False)
    print(f"[Export] Wrote {path}")

    # Export flat array for frontend (frontend expects Facility[])
    fe_path = export_frontend_json("facilities.json", facilities)
    print(f"[Export] Wrote frontend {fe_path}")

    # Print summary
    print(f"\n  Total facilities: {len(facilities)}")
    print(f"  Total employees: {total_employees:,}")
    print(f"  Minerals represented: {len(mineral_counts)}")
    print(f"  States represented: {len(state_counts)}")

    return sector_data


def run_defense_programs() -> dict:
    """Export defense programs data."""
    print("\n" + "=" * 60)
    print("CROSS-SECTOR: DEFENSE PROGRAMS")
    print("=" * 60)

    programs = get_defense_programs()

    # Compute summary
    all_materials = set()
    all_contractors = set()
    for p in programs:
        all_materials.update(p["materials"])
        all_contractors.add(p["prime_contractor"])

    defense_data = {
        "sector": "defense-programs",
        "summary": {
            "total_programs": len(programs),
            "unique_materials": len(all_materials),
            "unique_contractors": len(all_contractors),
        },
        "programs": programs,
    }

    path = export_sector_data("defense-programs", defense_data, copy_to_frontend=False)
    print(f"[Export] Wrote {path}")

    # Export flat array for frontend (frontend expects DefenseProgram[])
    fe_path = export_frontend_json("defense-programs.json", programs)
    print(f"[Export] Wrote frontend {fe_path}")
    print(f"  {len(programs)} defense programs mapped")
    print(f"  {len(all_materials)} unique materials across programs")

    return defense_data


def run_all(force: bool = False):
    """Run all sector pipelines and export aggregate stats."""
    print("=" * 60)
    print("Strategic Industrial Intelligence — Full Pipeline")
    print("=" * 60)

    metals = run_metals_mining(force=force)
    manufacturing = run_manufacturing(force=force)
    facilities_data = run_facilities(force=force)
    defense_programs_data = run_defense_programs()

    # Cross-sector dependencies
    print("\n" + "=" * 60)
    print("CROSS-SECTOR DEPENDENCIES")
    print("=" * 60)
    cross_sector = build_cross_sector_data()
    cross_path = export_sector_data("cross-sector", cross_sector)
    print(f"  {cross_sector['summary']['total_dependencies']} dependencies mapped")
    print(f"  {cross_sector['summary']['critical_dependencies']} critical")
    print(f"[Export] Wrote {cross_path}")

    total_emp = manufacturing["summary"]["total_employment"]
    cap_util = manufacturing["summary"]["capacity_utilization"]
    defense_total = sum(c["total_amount"] for c in manufacturing["defense_contracts"])

    # Aggregate stats
    fac_summary = facilities_data["summary"]
    stats = {
        "metals_mining": metals["summary"],
        "manufacturing": {
            "total_employment": total_emp,
            "capacity_utilization": cap_util,
            "defense_contract_total": defense_total,
        },
        "facilities": fac_summary,
        "defense_programs": defense_programs_data["summary"],
        "headline_stats": [
            {
                "label": "Critical Minerals Tracked",
                "value": str(metals["summary"]["total_minerals"]),
                "subtext": f"{metals['summary']['single_source_count']} dominated by single country",
            },
            {
                "label": "Active U.S. Mines",
                "value": str(fac_summary["total_facilities"]),
                "subtext": f"Across {fac_summary['states_represented']} states, {fac_summary['minerals_represented']} minerals",
            },
            {
                "label": "Federal Capital Being Deployed",
                "value": "$200B",
                "subtext": "Across 6 sector teams",
            },
            {
                "label": "U.S. Shipbuilding vs. China",
                "value": "1/300th",
                "subtext": "8 yards vs. 400+",
            },
            {
                "label": "Manufacturing Capacity",
                "value": f"{cap_util}%" if cap_util else "N/A",
                "subtext": "Below 80% healthy threshold" if cap_util and cap_util < 80 else "Capacity utilization",
            },
            {
                "label": "Defense Programs Mapped",
                "value": str(defense_programs_data["summary"]["total_programs"]),
                "subtext": f"{defense_programs_data['summary']['unique_materials']} critical materials",
            },
        ],
    }
    export_stats(stats)

    print(f"\nPipeline complete.")
    print(f"  Metals & Mining: {metals['summary']['total_minerals']} minerals scored")
    print(f"  Manufacturing: {len(manufacturing['sectors'])} sectors scored")
    print(f"  Facilities: {fac_summary['total_facilities']} mines mapped")
    print(f"  Defense Programs: {defense_programs_data['summary']['total_programs']} programs")


def main():
    force = "--force" in sys.argv
    run_all(force=force)


if __name__ == "__main__":
    main()
