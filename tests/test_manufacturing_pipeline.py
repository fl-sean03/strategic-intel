"""Integration tests for the manufacturing pipeline output."""
import json
from pathlib import Path

import pytest

DATA_DIR = Path(__file__).parent.parent / "data" / "processed"
FRONTEND_DIR = Path(__file__).parent.parent / "frontend" / "public" / "data"


@pytest.fixture
def mfg_data():
    path = DATA_DIR / "manufacturing.json"
    if not path.exists():
        pytest.skip("Manufacturing pipeline has not been run yet")
    return json.loads(path.read_text())


def test_manufacturing_json_exists():
    assert (DATA_DIR / "manufacturing.json").exists()


def test_manufacturing_frontend_data():
    assert (FRONTEND_DIR / "manufacturing.json").exists()


def test_sectors_present(mfg_data):
    assert len(mfg_data["sectors"]) >= 7


def test_sectors_have_health_scores(mfg_data):
    for s in mfg_data["sectors"]:
        assert "health_score" in s, f"Sector {s['name']} missing health_score"
        assert 0 <= s["health_score"] <= 100


def test_defense_contracts_present(mfg_data):
    assert len(mfg_data["defense_contracts"]) > 0
    total = sum(c["total_amount"] for c in mfg_data["defense_contracts"])
    assert total > 0, "Defense contracts should have non-zero total"


def test_shipbuilding_data(mfg_data):
    assert len(mfg_data["shipbuilding"]) >= 4
    us = next((s for s in mfg_data["shipbuilding"] if s["country_iso"] == "US"), None)
    cn = next((s for s in mfg_data["shipbuilding"] if s["country_iso"] == "CN"), None)
    assert us is not None
    assert cn is not None
    assert cn["active_shipyards"] > us["active_shipyards"] * 10


def test_munitions_data(mfg_data):
    assert len(mfg_data["munitions"]) >= 4
    for m in mfg_data["munitions"]:
        assert "name" in m
        assert "gap_severity" in m
        assert m["gap_severity"] in ("critical", "severe", "moderate", "low")


def test_international_comparison(mfg_data):
    assert len(mfg_data["international"]) >= 5
    china = next((c for c in mfg_data["international"] if c["country_iso"] == "CN"), None)
    assert china is not None
    assert china["manufacturing_value_added"] is not None
    assert china["manufacturing_value_added"] > 1_000_000_000_000  # > $1T


def test_total_employment_reasonable(mfg_data):
    emp = mfg_data["summary"]["total_employment"]
    assert emp > 10_000_000, "Total manufacturing employment should be > 10M"
    assert emp < 20_000_000, "Total manufacturing employment should be < 20M"


def test_data_freshness(mfg_data):
    assert "data_freshness" in mfg_data
    assert "bls" in mfg_data["data_freshness"]
