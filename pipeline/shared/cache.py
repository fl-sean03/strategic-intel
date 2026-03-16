"""HTTP response caching for pipeline data downloads."""

import hashlib
import json
import time
from pathlib import Path

CACHE_DIR = Path(__file__).parent.parent.parent / "data" / "raw"


def get_cache_path(url: str, params: dict | None = None) -> Path:
    """Generate a deterministic cache file path from URL + params."""
    key = url
    if params:
        key += json.dumps(params, sort_keys=True)
    h = hashlib.sha256(key.encode()).hexdigest()[:16]
    return CACHE_DIR / f"{h}.json"


def read_cache(url: str, params: dict | None = None, max_age_hours: int = 24) -> dict | None:
    """Read cached response if it exists and is fresh enough."""
    path = get_cache_path(url, params)
    if not path.exists():
        return None
    age_hours = (time.time() - path.stat().st_mtime) / 3600
    if age_hours > max_age_hours:
        return None
    with open(path) as f:
        return json.load(f)


def write_cache(url: str, data: dict, params: dict | None = None) -> Path:
    """Write response data to cache."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = get_cache_path(url, params)
    with open(path, "w") as f:
        json.dump(data, f)
    return path
