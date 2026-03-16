"""Normalize MSHA mine records into facility dicts.

Takes raw filtered MSHA records and:
- Matches each mine to one or more of the 60 critical minerals
- Cleans coordinates (valid lat/lon only)
- Normalizes commodity names
- Outputs list of standardized facility dicts
"""

from pipeline.facilities.ingestion.msha import match_minerals_from_sic
from pipeline.metals_mining.config import CRITICAL_MINERALS_2025

# Canonical commodity name mapping for common SIC descriptions
COMMODITY_NORMALIZE = {
    "gold ore": "Gold",
    "gold ores": "Gold",
    "silver ore": "Silver",
    "silver ores": "Silver",
    "copper ore": "Copper",
    "copper ores": "Copper",
    "copper-zinc ore": "Copper",
    "lead ore": "Lead",
    "lead ores": "Lead",
    "lead-zinc ore": "Lead",
    "zinc ore": "Zinc",
    "zinc ores": "Zinc",
    "iron ore": "Iron",
    "iron ores": "Iron",
    "uranium ore": "Uranium",
    "uranium ores": "Uranium",
    "uranium-radium-vanadium ore": "Uranium",
    "uranium-radium-vanadium ores": "Uranium",
    "nickel ore": "Nickel",
    "nickel ores": "Nickel",
    "titanium ore": "Titanium",
    "lithium mining": "Lithium",
    "lithium ore": "Lithium",
    "rare earth": "Rare Earths",
    "rare earths": "Rare Earths",
    "tungsten ore": "Tungsten",
    "tungsten ores": "Tungsten",
    "molybdenum ore": "Molybdenum",
    "molybdenum ores": "Molybdenum",
    "chromite ore": "Chromium",
    "chromium ore": "Chromium",
    "manganese ore": "Manganese",
    "manganese ores": "Manganese",
    "bauxite": "Aluminum",
    "aluminum ore": "Aluminum",
    "phosphate": "Phosphate",
    "phosphate rock": "Phosphate",
    "potash": "Potash",
    "fluorspar": "Fluorspar",
    "graphite": "Graphite",
    "boron": "Boron",
    "barite": "Barite",
    "beryllium": "Beryllium",
    "tantalum ore": "Tantalum",
    "niobium ore": "Niobium",
    "columbium ore": "Niobium",
    "antimony ore": "Antimony",
    "tin ore": "Tin",
    "tin ores": "Tin",
    "vanadium ore": "Vanadium",
    "zirconium ore": "Zirconium",
    "cobalt ore": "Cobalt",
    "cobalt ores": "Cobalt",
    "platinum group": "Platinum",
    "platinum ore": "Platinum",
    "silica": "Silicon",
    "silicon": "Silicon",
}


def _is_valid_coordinate(lat: float | None, lon: float | None) -> bool:
    """Check if lat/lon are valid geographic coordinates within CONUS/US range."""
    if lat is None or lon is None:
        return False
    # Valid latitude range for US (including Alaska and territories)
    if lat < 17.0 or lat > 72.0:
        return False
    # Valid longitude range for US (including Alaska: -180 to -130, CONUS/HI: -65 to -180)
    if lon < -180.0 or lon > -65.0:
        return False
    # Exclude exactly 0,0 which is often a data error
    if lat == 0.0 and lon == 0.0:
        return False
    return True


def _parse_float(val: str) -> float | None:
    """Safely parse a string to float, returning None on failure."""
    if not val or not val.strip():
        return None
    try:
        return float(val.strip())
    except (ValueError, TypeError):
        return None


def _parse_int(val: str) -> int | None:
    """Safely parse a string to int, returning None on failure."""
    if not val or not val.strip():
        return None
    try:
        return int(float(val.strip()))
    except (ValueError, TypeError):
        return None


def _normalize_commodity(sic_desc: str) -> str | None:
    """Normalize an SIC description to a canonical commodity name."""
    if not sic_desc:
        return None
    desc_lower = sic_desc.lower().strip()
    for key, canonical in COMMODITY_NORMALIZE.items():
        if key in desc_lower:
            return canonical
    return sic_desc.strip()


def normalize_facilities(raw_records: list[dict]) -> list[dict]:
    """Transform raw MSHA records into normalized facility dicts.

    Args:
        raw_records: List of MSHA mine record dicts from ingestion,
                     each having a 'matched_minerals' field.

    Returns:
        List of normalized facility dicts with cleaned coordinates,
        canonical commodity names, and matched minerals.
    """
    facilities = []
    skipped_coords = 0

    for rec in raw_records:
        lat = _parse_float(rec.get("LATITUDE", ""))
        lon = _parse_float(rec.get("LONGITUDE", ""))

        if not _is_valid_coordinate(lat, lon):
            skipped_coords += 1
            continue

        mine_name = rec.get("CURRENT_MINE_NAME", "").strip()
        if not mine_name:
            mine_name = "Unknown"

        # Get matched minerals from ingestion step
        matched_minerals = rec.get("matched_minerals", [])

        # Re-check both SIC descriptions (PRIMARY_SIC and SECONDARY_SIC hold descriptions in MSHA)
        primary_desc = rec.get("PRIMARY_SIC", "")
        secondary_desc = rec.get("SECONDARY_SIC", "")
        from_primary = match_minerals_from_sic(primary_desc)
        from_secondary = match_minerals_from_sic(secondary_desc)
        all_minerals = sorted(set(matched_minerals + from_primary + from_secondary))

        if not all_minerals:
            continue

        # Normalize primary commodity
        primary_commodity = _normalize_commodity(primary_desc)
        secondary_commodity = _normalize_commodity(secondary_desc)

        # Parse employee count — try NO_EMPLOYEES first (current), then AVG_MINE_EMP_CNT
        emp_count = _parse_int(rec.get("NO_EMPLOYEES", ""))
        if emp_count is None:
            emp_count = _parse_int(rec.get("AVG_MINE_EMP_CNT", ""))

        facility = {
            "id": f"msha-{rec.get('MINE_ID', 'unknown')}",
            "name": mine_name,
            "operator": rec.get("CURRENT_OPERATOR_NAME", "").strip() or "Unknown",
            "commodity": primary_commodity or "Unknown",
            "mineral_match": all_minerals,
            "state": rec.get("STATE", "").strip() or "Unknown",
            "county": rec.get("FIPS_CNTY_NM", "").strip() or rec.get("FIPS_CNTY_CD", "").strip() or "",
            "lat": lat,
            "lon": lon,
            "employment": emp_count if emp_count is not None else 0,
            "status": rec.get("CURRENT_MINE_STATUS", "").strip(),
            "mine_type": rec.get("CURRENT_MINE_TYPE", "").strip() or "Unknown",
        }

        facilities.append(facility)

    if skipped_coords > 0:
        print(f"[Normalize] Skipped {skipped_coords} records with invalid coordinates")
    print(f"[Normalize] Produced {len(facilities)} normalized facilities")

    # Summary by mineral
    mineral_counts: dict[str, int] = {}
    for f in facilities:
        for m in f["mineral_match"]:
            mineral_counts[m] = mineral_counts.get(m, 0) + 1

    top_minerals = sorted(mineral_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    print("[Normalize] Top minerals by facility count:")
    for mineral, count in top_minerals:
        print(f"  {mineral}: {count}")

    return facilities
