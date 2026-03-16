"""Transform raw manufacturing data into the unified data model."""
from pipeline.shared.geo import STATE_FIPS, FIPS_TO_ABBREV, state_abbrev_to_fips
from pipeline.manufacturing.config import NAICS_SECTORS


def build_sector_employment(census_state_data: list[dict]) -> list[dict]:
    """Build state employment distribution from Census CBP data."""
    total_emp = sum(r["employment"] for r in census_state_data)
    if total_emp == 0:
        return []

    result = []
    for r in sorted(census_state_data, key=lambda x: x["employment"], reverse=True):
        fips = r["state_fips"]
        name = STATE_FIPS.get(fips, "")
        abbrev = FIPS_TO_ABBREV.get(fips, "")
        if not name:
            continue
        result.append({
            "state_fips": fips,
            "state_name": name,
            "state_abbrev": abbrev,
            "employment": r["employment"],
            "share": round(r["employment"] / total_emp, 4) if total_emp > 0 else 0,
        })

    return result


def build_defense_contracts(usaspending_data: list[dict]) -> list[dict]:
    """Normalize USAspending DoD contract data."""
    result = []
    for r in sorted(usaspending_data, key=lambda x: x.get("total_amount", 0), reverse=True):
        abbrev = r.get("state_abbrev", "")
        if not abbrev or len(abbrev) != 2:
            continue
        result.append({
            "state_abbrev": abbrev,
            "state_name": r.get("state_name", ""),
            "total_amount": r.get("total_amount", 0),
            "per_capita": r.get("per_capita", 0),
        })
    return result


def build_international_comparison(wb_value_added: list[dict],
                                    wb_pct_gdp: list[dict]) -> list[dict]:
    """Merge World Bank data into international comparison."""
    pct_by_country = {r["country_iso"]: r.get("manufacturing_pct_gdp") for r in wb_pct_gdp}

    result = []
    for r in sorted(wb_value_added, key=lambda x: x.get("manufacturing_value_added") or 0, reverse=True):
        result.append({
            "country": r["country"],
            "country_iso": r["country_iso"],
            "manufacturing_value_added": r.get("manufacturing_value_added"),
            "manufacturing_pct_gdp": pct_by_country.get(r["country_iso"]),
        })
    return result


def extract_latest_value(observations: list[dict]) -> float | None:
    """Get the most recent non-null value from a BLS series."""
    if not observations:
        return None
    # observations should be sorted by date ascending
    for obs in reversed(observations):
        if obs.get("value") is not None:
            return obs["value"]
    return None


def compute_trend(observations: list[dict], years: int = 3) -> float | None:
    """Compute % change over the last N years from BLS observations.

    Returns annualized % change.
    """
    if not observations or len(observations) < 13:
        return None

    # Get latest and N-years-ago values (monthly data)
    months_back = years * 12
    recent = extract_latest_value(observations)
    if recent is None:
        return None

    idx = max(0, len(observations) - months_back - 1)
    old = observations[idx].get("value")
    if old is None or old == 0:
        return None

    total_change = (recent - old) / old * 100
    return round(total_change / years, 2)
