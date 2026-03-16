"""Census Bureau CBP client — manufacturing employment by state."""
import os
import requests
from pipeline.shared.cache import read_cache, write_cache

CBP_BASE = "https://api.census.gov/data/2022/cbp"


def fetch_manufacturing_by_state() -> list[dict]:
    """Fetch manufacturing employment by state from County Business Patterns."""
    params = {
        "get": "EMP,ESTAB,NAICS2017_LABEL,PAYANN",
        "for": "state:*",
        "NAICS2017": "31-33",
    }
    api_key = os.environ.get("CENSUS_API_KEY", "")
    if api_key:
        params["key"] = api_key

    cached = read_cache(CBP_BASE, params, max_age_hours=168)
    if cached:
        return cached

    resp = requests.get(CBP_BASE, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    # First row is headers
    headers = data[0]
    records = []
    for row in data[1:]:
        record = dict(zip(headers, row))
        records.append({
            "state_fips": record.get("state", ""),
            "employment": int(record.get("EMP", 0)),
            "establishments": int(record.get("ESTAB", 0)),
            "payroll_annual": int(record.get("PAYANN", 0)),
        })

    write_cache(CBP_BASE, records, params)
    print(f"  [Census] Fetched manufacturing employment for {len(records)} states")
    return records


def fetch_manufacturing_by_naics_state(naics_code: str) -> list[dict]:
    """Fetch employment for a specific NAICS code by state."""
    params = {
        "get": "EMP,ESTAB",
        "for": "state:*",
        "NAICS2017": naics_code,
    }
    api_key = os.environ.get("CENSUS_API_KEY", "")
    if api_key:
        params["key"] = api_key

    cached = read_cache(CBP_BASE, params, max_age_hours=168)
    if cached:
        return cached

    resp = requests.get(CBP_BASE, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    headers = data[0]
    records = []
    for row in data[1:]:
        record = dict(zip(headers, row))
        records.append({
            "state_fips": record.get("state", ""),
            "employment": int(record.get("EMP", 0)),
            "establishments": int(record.get("ESTAB", 0)),
        })

    write_cache(CBP_BASE, records, params)
    return records
