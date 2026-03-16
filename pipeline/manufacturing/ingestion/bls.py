"""BLS API v2 client — manufacturing employment data."""
import os
import requests
from pipeline.shared.cache import read_cache, write_cache

BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"


def fetch_series(series_ids: list[str], start_year: int = 2020,
                 end_year: int = 2025) -> dict[str, list[dict]]:
    """Fetch one or more BLS time series.

    Returns dict of series_id → list of observations.
    """
    cache_key = f"bls_{'_'.join(series_ids)}_{start_year}_{end_year}"
    cached = read_cache(BLS_API_URL, {"key": cache_key}, max_age_hours=168)
    if cached:
        return cached

    api_key = os.environ.get("BLS_API_KEY", "")
    payload = {
        "seriesid": series_ids,
        "startyear": str(start_year),
        "endyear": str(end_year),
    }
    if api_key:
        payload["registrationkey"] = api_key

    resp = requests.post(BLS_API_URL, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if data.get("status") != "REQUEST_SUCCEEDED":
        print(f"  [BLS] Warning: {data.get('message', 'Unknown error')}")
        return {}

    result = {}
    for series in data.get("Results", {}).get("series", []):
        sid = series["seriesID"]
        observations = []
        for obs in series.get("data", []):
            observations.append({
                "year": int(obs["year"]),
                "period": obs["period"],
                "value": float(obs["value"]) if obs["value"] != "-" else None,
            })
        result[sid] = sorted(observations, key=lambda x: (x["year"], x["period"]))

    write_cache(BLS_API_URL, result, {"key": cache_key})
    print(f"  [BLS] Fetched {len(result)} series")
    return result


def get_manufacturing_employment(start_year: int = 2020, end_year: int = 2025) -> dict:
    """Get total manufacturing employment from CES data."""
    from pipeline.manufacturing.config import BLS_TOTAL_MANUFACTURING, NAICS_SECTORS

    all_series = [BLS_TOTAL_MANUFACTURING]
    for code, info in NAICS_SECTORS.items():
        all_series.append(info["bls_ces"])

    # BLS allows max 50 series per request
    return fetch_series(all_series, start_year, end_year)
