"""USAspending API client — DoD contract data by geography."""
import requests
from pipeline.shared.cache import read_cache, write_cache

API_BASE = "https://api.usaspending.gov/api/v2"


def fetch_dod_contracts_by_state(fiscal_year: int = 2024) -> list[dict]:
    """Fetch DoD contract spending by state."""
    url = f"{API_BASE}/search/spending_by_geography/"
    payload = {
        "scope": "place_of_performance",
        "geo_layer": "state",
        "filters": {
            "agencies": [{"type": "awarding", "tier": "toptier",
                          "name": "Department of Defense"}],
            "time_period": [
                {"start_date": f"{fiscal_year}-01-01",
                 "end_date": f"{fiscal_year}-12-31"}
            ],
        },
    }

    cached = read_cache(url, payload, max_age_hours=168)
    if cached:
        return cached

    resp = requests.post(url, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    results = []
    for r in data.get("results", []):
        results.append({
            "state_abbrev": r.get("shape_code", ""),
            "state_name": r.get("display_name", ""),
            "total_amount": r.get("aggregated_amount", 0),
            "per_capita": r.get("per_capita", 0),
            "population": r.get("population", 0),
        })

    write_cache(url, results, payload)
    print(f"  [USAspending] Fetched DoD contracts for {len(results)} states")
    return results
