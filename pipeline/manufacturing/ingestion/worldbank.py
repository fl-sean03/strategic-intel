"""World Bank API client — international manufacturing comparison."""
import requests
from pipeline.shared.cache import read_cache, write_cache

WB_BASE = "https://api.worldbank.org/v2"
COMPARISON_COUNTRIES = ["US", "CN", "JP", "DE", "KR", "IN"]


def fetch_manufacturing_value_added(year: int = 2022) -> list[dict]:
    """Fetch manufacturing value added for comparison countries."""
    countries = ";".join(COMPARISON_COUNTRIES)
    url = f"{WB_BASE}/country/{countries}/indicator/NV.IND.MANF.CD"
    params = {"format": "json", "per_page": 50, "date": str(year)}

    cached = read_cache(url, params, max_age_hours=168)
    if cached:
        return cached

    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if not isinstance(data, list) or len(data) < 2:
        return []

    results = []
    for entry in data[1]:
        results.append({
            "country": entry["country"]["value"],
            "country_iso": entry["country"]["id"],
            "manufacturing_value_added": entry.get("value"),
            "year": entry.get("date"),
        })

    write_cache(url, results, params)
    print(f"  [WorldBank] Fetched manufacturing data for {len(results)} countries")
    return results


def fetch_manufacturing_pct_gdp(year: int = 2022) -> list[dict]:
    """Fetch manufacturing as % of GDP."""
    countries = ";".join(COMPARISON_COUNTRIES)
    url = f"{WB_BASE}/country/{countries}/indicator/NV.IND.MANF.ZS"
    params = {"format": "json", "per_page": 50, "date": str(year)}

    cached = read_cache(url, params, max_age_hours=168)
    if cached:
        return cached

    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if not isinstance(data, list) or len(data) < 2:
        return []

    results = []
    for entry in data[1]:
        results.append({
            "country": entry["country"]["value"],
            "country_iso": entry["country"]["id"],
            "manufacturing_pct_gdp": entry.get("value"),
        })

    write_cache(url, results, params)
    return results
