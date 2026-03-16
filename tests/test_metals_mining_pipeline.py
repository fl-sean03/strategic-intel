"""Integration tests for the metals & mining pipeline output."""
import json
from pathlib import Path

import pytest

DATA_DIR = Path(__file__).parent.parent / "data" / "processed"
FRONTEND_DIR = Path(__file__).parent.parent / "frontend" / "public" / "data"


@pytest.fixture
def scored_data():
    path = DATA_DIR / "metals-mining.json"
    if not path.exists():
        pytest.skip("Pipeline has not been run yet")
    return json.loads(path.read_text())


@pytest.fixture
def minerals(scored_data):
    return scored_data["minerals"]


@pytest.fixture
def stats():
    path = FRONTEND_DIR / "stats.json"
    if not path.exists():
        pytest.skip("Stats not exported yet")
    return json.loads(path.read_text())


def test_metals_mining_json_exists():
    assert (DATA_DIR / "metals-mining.json").exists()


def test_frontend_data_exists():
    assert (FRONTEND_DIR / "metals-mining.json").exists()
    assert (FRONTEND_DIR / "stats.json").exists()


def test_60_minerals(minerals):
    assert len(minerals) == 60


def test_gallium_high_risk(minerals):
    gallium = next((m for m in minerals if m["name"] == "Gallium"), None)
    assert gallium is not None
    assert gallium["risk_scores"]["overall_risk"] > 80
    assert gallium["risk_scores"]["concentration_risk"] > 80
    assert gallium["risk_scores"]["adversary_dependency"] > 80
    assert gallium["risk_scores"]["single_source_risk"] is True


def test_cobalt_single_source(minerals):
    cobalt = next((m for m in minerals if m["name"] == "Cobalt"), None)
    assert cobalt is not None
    assert cobalt["risk_scores"]["single_source_risk"] is True


def test_niobium_brazil_dominance(minerals):
    niobium = next((m for m in minerals if m["name"] == "Niobium"), None)
    assert niobium is not None
    assert niobium["risk_scores"]["single_source_risk"] is True


def test_aluminum_lower_risk(minerals):
    aluminum = next((m for m in minerals if m["name"] == "Aluminum"), None)
    assert aluminum is not None
    assert aluminum["risk_scores"]["concentration_risk"] < 50


def test_rare_earth_data_propagated(minerals):
    cerium = next((m for m in minerals if m["name"] == "Cerium"), None)
    assert cerium is not None
    producers = cerium["supply_chain"]["mining"]["top_producers"]
    assert len(producers) > 0, "Cerium should have producers propagated from Rare Earths"


def test_stats_json(stats):
    assert stats["metals_mining"]["total_minerals"] == 60
    assert stats["headline_stats"]
    assert len(stats["headline_stats"]) >= 4


def test_all_minerals_have_scores(minerals):
    for m in minerals:
        assert "risk_scores" in m, f"{m['name']} missing risk_scores"
        rs = m["risk_scores"]
        assert 0 <= rs["overall_risk"] <= 100, f"{m['name']} overall_risk out of range"
        assert isinstance(rs["single_source_risk"], bool)


def test_minerals_sorted_by_risk(minerals):
    risks = [m["risk_scores"]["overall_risk"] for m in minerals]
    assert risks == sorted(risks, reverse=True), "Minerals should be sorted by overall_risk descending"
