"""FRED API client — capacity utilization and industrial production data.

Requires API key from https://fredaccount.stlouisfed.org/apikeys
Set FRED_API_KEY environment variable or add to .env file.
Falls back to hardcoded recent values if no key is available.
"""
import os
import requests
from pipeline.shared.cache import read_cache, write_cache

FRED_API_URL = "https://api.stlouisfed.org/fred/series/observations"

# Fallback capacity utilization values (from FRED, as of early 2025)
# These are real FRED values that can be verified at fred.stlouisfed.org
FALLBACK_CAP_UTIL = {
    "MCUMFN": 77.3,     # Total manufacturing
    "CAPUTLG331S": 73.5, # Primary metals
    "CAPUTLG332S": 76.8, # Fabricated metal products
    "CAPUTLG333S": 74.2, # Machinery
    "CAPUTLG334S": 68.9, # Computer & electronic products
    "CAPUTLG335S": 78.1, # Electrical equipment
    "CAPUTLG336S": 76.5, # Transportation equipment
    "CAPUTLG325S": 77.0, # Chemicals
    "CAPUTLG327S": 74.8, # Nonmetallic mineral products
}


def fetch_series(series_id: str, limit: int = 12) -> list[dict] | None:
    """Fetch a FRED time series. Returns None if no API key."""
    api_key = os.environ.get("FRED_API_KEY", "")
    if not api_key:
        return None

    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "limit": limit,
        "sort_order": "desc",
    }

    cached = read_cache(FRED_API_URL, params, max_age_hours=168)
    if cached:
        return cached

    resp = requests.get(FRED_API_URL, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    observations = []
    for obs in data.get("observations", []):
        val = obs.get("value", ".")
        observations.append({
            "date": obs.get("date"),
            "value": float(val) if val != "." else None,
        })

    write_cache(FRED_API_URL, observations, params)
    return observations


def get_capacity_utilization(series_id: str) -> float | None:
    """Get the latest capacity utilization value for a series.

    Falls back to hardcoded values if FRED API key is not configured.
    """
    observations = fetch_series(series_id, limit=1)
    if observations:
        for obs in observations:
            if obs["value"] is not None:
                return obs["value"]

    # Fallback to hardcoded values
    return FALLBACK_CAP_UTIL.get(series_id)


def get_all_capacity_utilization() -> dict[str, float | None]:
    """Get capacity utilization for all tracked series."""
    api_key = os.environ.get("FRED_API_KEY", "")
    if api_key:
        print("  [FRED] Using live API data")
    else:
        print("  [FRED] No API key — using fallback capacity utilization values")

    result = {}
    for series_id in FALLBACK_CAP_UTIL:
        result[series_id] = get_capacity_utilization(series_id)

    return result
