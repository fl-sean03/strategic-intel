"""MSHA Mine Dataset Ingestion.

Downloads the MSHA mine dataset from https://arlweb.msha.gov/OpenGovernmentData/DataSets/Mines.zip,
parses the CSV, and filters to active mines producing critical minerals.
"""

import csv
import io
import zipfile
from pathlib import Path

import requests

from pipeline.shared.cache import read_cache, write_cache
from pipeline.metals_mining.config import CRITICAL_MINERALS_2025

MSHA_MINES_URL = "https://arlweb.msha.gov/OpenGovernmentData/DataSets/Mines.zip"

# Cache key used with shared cache module
CACHE_KEY = "msha-mines-dataset"

# How long to cache the MSHA dataset (hours)
CACHE_MAX_AGE_HOURS = 72

# Columns we extract from the MSHA CSV
# Note: MSHA column names differ from documentation:
#   PRIMARY_SIC = description (e.g. "Copper Ores"), PRIMARY_SIC_CD = numeric code
#   SECONDARY_SIC = description, SECONDARY_SIC_CD = numeric code
#   CURRENT_MINE_NAME = name (MINE_NAME column doesn't exist)
#   CURRENT_MINE_STATUS = status (MINE_STATUS column doesn't exist)
#   CURRENT_MINE_TYPE = type
COLUMNS_OF_INTEREST = [
    "MINE_ID",
    "CURRENT_MINE_NAME",
    "CURRENT_MINE_TYPE",
    "CURRENT_MINE_STATUS",
    "STATE",
    "FIPS_CNTY_CD",
    "FIPS_CNTY_NM",
    "LATITUDE",
    "LONGITUDE",
    "PRIMARY_SIC_CD",
    "PRIMARY_SIC",
    "SECONDARY_SIC_CD",
    "SECONDARY_SIC",
    "CURRENT_OPERATOR_NAME",
    "AVG_MINE_EMP_CNT",
    "NO_EMPLOYEES",
]

# Mineral name variations to match against SIC descriptions.
# Keys are canonical mineral names from CRITICAL_MINERALS_2025,
# values are lists of substrings to look for in SIC description text.
MINERAL_SIC_KEYWORDS = {
    "Aluminum": ["aluminum", "alumina", "bauxite", "feldspar"],
    "Antimony": ["antimony"],
    "Arsenic": ["arsenic"],
    "Barite": ["barite", "barium"],
    "Beryllium": ["beryllium"],
    "Bismuth": ["bismuth"],
    "Boron": ["boron", "borax", "borate", "trona"],
    "Cerium": ["cerium", "rare earth"],
    "Cesium": ["cesium"],
    "Chromium": ["chromium", "chromite"],
    "Cobalt": ["cobalt"],
    "Copper": ["copper"],
    "Dysprosium": ["dysprosium", "rare earth"],
    "Erbium": ["erbium", "rare earth"],
    "Europium": ["europium", "rare earth"],
    "Fluorspar": ["fluorspar", "fluorite", "fluorine"],
    "Gadolinium": ["gadolinium", "rare earth"],
    "Gallium": ["gallium"],
    "Germanium": ["germanium"],
    "Graphite": ["graphite"],
    "Hafnium": ["hafnium", "zirconium"],
    "Holmium": ["holmium", "rare earth"],
    "Indium": ["indium"],
    "Iridium": ["iridium", "platinum group", "platinum-group"],
    "Lanthanum": ["lanthanum", "rare earth"],
    "Lead": ["lead"],
    "Lithium": ["lithium"],
    "Lutetium": ["lutetium", "rare earth"],
    "Magnesium": ["magnesium", "magnesia", "magnesite"],
    "Manganese": ["manganese"],
    "Metallurgical Coal": ["metallurgical coal", "coking coal"],
    "Neodymium": ["neodymium", "rare earth"],
    "Nickel": ["nickel"],
    "Niobium": ["niobium", "columbium"],
    "Palladium": ["palladium", "platinum group", "platinum-group"],
    "Phosphate": ["phosphate", "phosphorus"],
    "Platinum": ["platinum"],
    "Potash": ["potash", "potassium"],
    "Praseodymium": ["praseodymium", "rare earth"],
    "Rhenium": ["rhenium", "molybdenum"],
    "Rhodium": ["rhodium", "platinum group", "platinum-group"],
    "Rubidium": ["rubidium"],
    "Ruthenium": ["ruthenium", "platinum group", "platinum-group"],
    "Samarium": ["samarium", "rare earth"],
    "Scandium": ["scandium", "rare earth"],
    "Silicon": ["silicon", "silica", "quartz", "sand, industrial", "ferrosilicon"],
    "Silver": ["silver", "gold ore", "gold ores"],
    "Tantalum": ["tantalum"],
    "Tellurium": ["tellurium"],
    "Terbium": ["terbium", "rare earth"],
    "Thulium": ["thulium", "rare earth"],
    "Tin": ["tin ore", "tin ores", "cassiterite", "tin mining"],
    "Titanium": ["titanium", "ilmenite", "rutile"],
    "Tungsten": ["tungsten", "wolfram"],
    "Uranium": ["uranium"],
    "Vanadium": ["vanadium"],
    "Ytterbium": ["ytterbium", "rare earth"],
    "Yttrium": ["yttrium", "rare earth"],
    "Zinc": ["zinc"],
    "Zirconium": ["zirconium"],
}

# Active mine statuses to include
ACTIVE_STATUSES = {"Active", "Intermittent", "New Mine"}


def match_minerals_from_sic(sic_desc: str) -> list[str]:
    """Match critical mineral names from an SIC description string.

    Uses fuzzy matching: checks if any mineral keyword appears as a substring
    in the lowercased SIC description.

    Returns a list of canonical mineral names that match.
    """
    if not sic_desc:
        return []
    desc_lower = sic_desc.lower().strip()
    if not desc_lower:
        return []

    matched = []
    for mineral, keywords in MINERAL_SIC_KEYWORDS.items():
        for keyword in keywords:
            if keyword in desc_lower:
                matched.append(mineral)
                break
    return matched


def _download_and_parse_csv() -> list[dict]:
    """Download Mines.zip from MSHA, extract CSV, parse rows."""
    print("[MSHA] Downloading Mines.zip from MSHA...")
    resp = requests.get(MSHA_MINES_URL, timeout=120)
    resp.raise_for_status()

    print(f"[MSHA] Downloaded {len(resp.content) / 1024 / 1024:.1f} MB")

    # The zip contains a single CSV file (Mines.txt, pipe-delimited)
    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        # Find the CSV/TXT file inside
        csv_names = [n for n in zf.namelist() if n.lower().endswith((".txt", ".csv"))]
        if not csv_names:
            raise ValueError(f"No CSV/TXT file found in Mines.zip. Contents: {zf.namelist()}")

        csv_filename = csv_names[0]
        print(f"[MSHA] Extracting {csv_filename}...")

        with zf.open(csv_filename) as f:
            # MSHA uses pipe-delimited format
            text = f.read().decode("latin-1")

    # Parse pipe-delimited CSV
    reader = csv.DictReader(io.StringIO(text), delimiter="|")

    records = []
    for row in reader:
        # Only keep columns of interest
        record = {}
        for col in COLUMNS_OF_INTEREST:
            record[col] = row.get(col, "").strip() if row.get(col) else ""
        records.append(record)

    print(f"[MSHA] Parsed {len(records)} total mine records")
    return records


def _filter_active_critical(records: list[dict]) -> list[dict]:
    """Filter to active mines that produce critical minerals."""
    filtered = []

    for rec in records:
        # Check mine status — MSHA uses CURRENT_MINE_STATUS (MINE_STATUS is often empty)
        status = rec.get("CURRENT_MINE_STATUS", "").strip()
        if not status:
            status = rec.get("MINE_STATUS", "").strip()
        if status not in ACTIVE_STATUSES:
            continue

        # Check SIC descriptions for critical mineral matches
        # In MSHA data, PRIMARY_SIC and SECONDARY_SIC hold the description text
        primary_desc = rec.get("PRIMARY_SIC", "")
        secondary_desc = rec.get("SECONDARY_SIC", "")

        primary_matches = match_minerals_from_sic(primary_desc)
        secondary_matches = match_minerals_from_sic(secondary_desc)

        all_matches = list(set(primary_matches + secondary_matches))
        if not all_matches:
            continue

        rec["matched_minerals"] = all_matches
        filtered.append(rec)

    print(f"[MSHA] {len(filtered)} active mines matched to critical minerals")
    return filtered


def run(force: bool = False, max_age_hours: int = CACHE_MAX_AGE_HOURS) -> list[dict]:
    """Run the MSHA ingestion pipeline.

    Downloads the MSHA mine dataset, parses it, and filters to active mines
    producing critical minerals. Uses caching to avoid re-downloading.

    Args:
        force: If True, bypass cache and re-download.
        max_age_hours: Maximum cache age before re-downloading.

    Returns:
        List of mine record dicts, each with a 'matched_minerals' field.
    """
    if not force:
        cached = read_cache(MSHA_MINES_URL, max_age_hours=max_age_hours)
        if cached is not None:
            print(f"[MSHA] Using cached data ({len(cached)} records)")
            return cached

    # Download and parse
    all_records = _download_and_parse_csv()

    # Filter to active critical mineral mines
    filtered = _filter_active_critical(all_records)

    # Cache the filtered results
    write_cache(MSHA_MINES_URL, filtered)
    print(f"[MSHA] Cached {len(filtered)} filtered records")

    return filtered
