"""USGS Mineral Commodity Summaries 2025 — data ingestion.

Migrated from critical-chain v1. Downloads and parses USGS MCS CSV files.
"""
import csv
import json
import re
from io import StringIO
from pathlib import Path

import requests

from pipeline.metals_mining.config import (
    CACHE_DIR, RAW_DIR, USGS_URLS,
    USGS_COMMODITY_MAP, USGS_SALIENT_MAP, COUNTRY_ISO_MAP,
    CRITICAL_MINERALS_2025,
)


def _download(name: str, filename: str, force: bool = False) -> Path:
    cache_path = CACHE_DIR / filename
    if cache_path.exists() and not force:
        return cache_path
    url = USGS_URLS[name]
    print(f"  Downloading {filename}...")
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_bytes(resp.content)
    print(f"  Saved {cache_path} ({len(resp.content)} bytes)")
    return cache_path


def _parse_number(val: str) -> float | None:
    if not val:
        return None
    val = val.strip()
    if val in ("W", "NA", "E", "--", "\u2014", "XX", ""):
        return None
    if val.startswith(">") or val.startswith("<"):
        val = val[1:]
    val = val.replace(",", "")
    val = re.sub(r'[a-zA-Z]+$', '', val)
    try:
        return float(val)
    except ValueError:
        return None


def _parse_import_reliance(val: str) -> float | None:
    if not val:
        return None
    val = val.strip()
    if val == "E":
        return 0.0
    if val.startswith(">") or val.startswith("<"):
        num = _parse_number(val[1:])
        return num
    return _parse_number(val)


def parse_world_data(force: bool = False) -> list[dict]:
    csv_path = _download("world_data", "MCS2025_World_Data.csv", force)
    text = csv_path.read_text(encoding="utf-8-sig")
    reader = csv.DictReader(StringIO(text))

    records = []
    for row in reader:
        commodity_raw = row.get("COMMODITY", "").strip()
        canonical = USGS_COMMODITY_MAP.get(commodity_raw) or USGS_COMMODITY_MAP.get(commodity_raw.strip())
        if canonical is None:
            continue
        if canonical not in CRITICAL_MINERALS_2025:
            continue

        country = row.get("COUNTRY", "").strip()
        skip_countries = {
            "World total (rounded)", "World total", "Other Countries",
            "United States and Canada", "World total (may be rounded)",
            "Other countries", "World total (may be  rounded)",
            "World total(rounded)", "World Total",
        }
        if country in skip_countries or country.lower().startswith("world total") or country == "Other Countries":
            if country == "World total (rounded)":
                prod_2024 = _parse_number(row.get("PROD_EST_ 2024", ""))
                if prod_2024 is not None:
                    records.append({
                        "mineral": canonical, "country": "WORLD", "country_iso": "WORLD",
                        "type": row.get("TYPE", "").strip(),
                        "unit": row.get("UNIT_MEAS", "").strip(),
                        "production_2023": _parse_number(row.get("PROD_2023", "")),
                        "production_2024": prod_2024,
                        "capacity_2024": _parse_number(row.get("CAP_EST_ 2024", "")),
                        "reserves_2024": _parse_number(row.get("RESERVES_2024", "")),
                    })
            continue

        prod_2024 = _parse_number(row.get("PROD_EST_ 2024", ""))
        prod_2023 = _parse_number(row.get("PROD_2023", ""))
        if prod_2024 is None and prod_2023 is None:
            cap = _parse_number(row.get("CAP_EST_ 2024", ""))
            res = _parse_number(row.get("RESERVES_2024", ""))
            if cap is None and res is None:
                continue

        country_iso = COUNTRY_ISO_MAP.get(country, "")
        records.append({
            "mineral": canonical, "country": country, "country_iso": country_iso,
            "type": row.get("TYPE", "").strip(),
            "unit": row.get("UNIT_MEAS", "").strip(),
            "production_2023": prod_2023, "production_2024": prod_2024,
            "capacity_2024": _parse_number(row.get("CAP_EST_ 2024", "")),
            "reserves_2024": _parse_number(row.get("RESERVES_2024", "")),
        })

    print(f"  World Data: {len(records)} production records parsed")
    return records


def parse_salient_stats(force: bool = False) -> dict[str, dict]:
    csv_path = _download("salient_stats", "MCS2025_T5_Critical_Minerals_Salient.csv", force)
    text = csv_path.read_text(encoding="utf-8-sig")
    reader = csv.DictReader(StringIO(text))

    result = {}
    for row in reader:
        mineral_raw = row.get("Critical_mineral", "").strip()
        canonical = USGS_SALIENT_MAP.get(mineral_raw) or USGS_SALIENT_MAP.get(mineral_raw.strip())
        if not canonical:
            continue

        nir = _parse_import_reliance(row.get("Net_Import_Reliance", ""))
        leading_share = _parse_number(row.get("Leading_source_precent_world", ""))

        result[canonical] = {
            "net_import_reliance": nir,
            "primary_production": _parse_number(row.get("Primary_prod", "")),
            "apparent_consumption": _parse_number(row.get("Apparent_Consumption", "")),
            "leading_source_country": row.get("Leading_source_country", "").strip(),
            "leading_country_share": leading_share / 100.0 if leading_share else None,
            "world_total_production": _parse_number(row.get("World_total_prod", "")),
            "primary_import_source": row.get("Primary_import_source", "").strip(),
        }

    print(f"  Salient Stats: {len(result)} minerals parsed")
    return result


def parse_net_import_reliance(force: bool = False) -> dict[str, dict]:
    csv_path = _download("net_import_reliance", "MCS2025_Fig2_Net_Import_Reliance.csv", force)
    text = csv_path.read_text(encoding="utf-8-sig")
    reader = csv.DictReader(StringIO(text))

    result = {}
    for row in reader:
        commodity = row.get("Commodity", "").strip()
        nir_str = row.get("Net_Import_Reliance_pct_2024", "").strip()
        nir = _parse_import_reliance(nir_str)
        sources_str = row.get("Major_Import_Sources_2020_2023", "")
        sources = [s.strip() for s in sources_str.split(",") if s.strip()]
        result[commodity] = {
            "net_import_reliance_pct": nir,
            "rank": _parse_number(row.get("Import_Share_Order", "")),
            "major_import_sources": sources,
        }

    print(f"  Net Import Reliance: {len(result)} commodities parsed")
    return result


def parse_end_use(force: bool = False) -> dict[str, str]:
    csv_path = _download("end_use", "MCS2025_T4_Critical_Minerals_End_Use.csv", force)
    text = csv_path.read_text(encoding="utf-8-sig")
    reader = csv.DictReader(StringIO(text))

    result = {}
    for row in reader:
        mineral = row.get("Critical Mineral", "").strip()
        apps = row.get("Primary Applications", "").strip()
        if mineral and apps:
            result[mineral] = apps

    print(f"  End Use: {len(result)} minerals parsed")
    return result


def run(force: bool = False) -> dict:
    """Full USGS ingestion. Returns all parsed data."""
    print("[USGS] Downloading and parsing MCS 2025 data...")
    world_data = parse_world_data(force)
    salient = parse_salient_stats(force)
    import_reliance = parse_net_import_reliance(force)
    end_use = parse_end_use(force)

    output = {
        "world_data": world_data,
        "salient_stats": salient,
        "import_reliance": import_reliance,
        "end_use": end_use,
        "source": "usgs_mcs_2025",
    }

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    output_path = RAW_DIR / "usgs_parsed.json"
    output_path.write_text(json.dumps(output, indent=2, default=str))
    print(f"[USGS] Wrote {output_path}")
    return output
