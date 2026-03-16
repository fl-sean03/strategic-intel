"""JSON export utilities for pipeline output."""

import json
from datetime import datetime, timezone
from pathlib import Path

PROCESSED_DIR = Path(__file__).parent.parent.parent / "data" / "processed"
FRONTEND_DATA_DIR = Path(__file__).parent.parent.parent / "frontend" / "public" / "data"


def export_sector_data(sector: str, data: dict, copy_to_frontend: bool = True) -> Path:
    """Export sector data to processed JSON and optionally copy to frontend."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    data["generated_at"] = datetime.now(timezone.utc).isoformat()

    output_path = PROCESSED_DIR / f"{sector}.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2, default=str)

    if copy_to_frontend:
        FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
        frontend_path = FRONTEND_DATA_DIR / f"{sector}.json"
        with open(frontend_path, "w") as f:
            json.dump(data, f, indent=2, default=str)

    return output_path


def export_stats(stats: dict) -> Path:
    """Export platform-wide aggregate stats."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    stats["generated_at"] = datetime.now(timezone.utc).isoformat()

    output_path = PROCESSED_DIR / "stats.json"
    with open(output_path, "w") as f:
        json.dump(stats, f, indent=2, default=str)

    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    frontend_path = FRONTEND_DATA_DIR / "stats.json"
    with open(frontend_path, "w") as f:
        json.dump(stats, f, indent=2, default=str)

    return output_path


def export_frontend_json(filename: str, data) -> Path:
    """Export any JSON data directly to frontend/public/data/ as-is.

    Unlike export_sector_data, this does NOT wrap data — it writes exactly what's given.
    Use this for flat arrays that the frontend expects without a wrapper.
    """
    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = FRONTEND_DATA_DIR / filename
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)
    return path


def validate_sector_output(path: Path, required_keys: list[str]) -> list[str]:
    """Validate exported JSON has required keys and non-empty data. Returns list of errors."""
    errors = []
    if not path.exists():
        return [f"File does not exist: {path}"]

    with open(path) as f:
        data = json.load(f)

    for key in required_keys:
        if key not in data:
            errors.append(f"Missing key: {key}")
        elif isinstance(data[key], list) and len(data[key]) == 0:
            errors.append(f"Empty list: {key}")
        elif isinstance(data[key], dict) and len(data[key]) == 0:
            errors.append(f"Empty dict: {key}")

    return errors
