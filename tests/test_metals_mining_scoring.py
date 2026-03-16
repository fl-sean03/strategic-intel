"""Unit tests for metals & mining scoring functions."""
import pytest
from pipeline.metals_mining.scoring.concentration import (
    hhi, concentration_risk, adversary_dependency,
    single_source_risk, overall_risk, score_mineral,
)


def test_hhi_monopoly():
    assert hhi([1.0]) == pytest.approx(1.0)


def test_hhi_duopoly():
    assert hhi([0.5, 0.5]) == pytest.approx(0.5)


def test_hhi_competitive():
    assert hhi([0.1] * 10) == pytest.approx(0.1)


def test_hhi_empty():
    assert hhi([]) == 0.0


def test_concentration_risk_gallium():
    sc = {
        "mining": {"top_producers": [
            {"country": "China", "share": 0.98},
            {"country": "Japan", "share": 0.02},
        ]},
        "processing": {"top_processors": [
            {"country": "China", "share": 0.98},
        ]},
        "refining": {"top_refiners": [
            {"country": "China", "share": 0.98},
        ]},
    }
    risk = concentration_risk(sc)
    assert risk > 80  # Should be very high


def test_adversary_dependency_gallium():
    sc = {
        "mining": {"top_producers": [{"country": "China", "share": 0.98}]},
        "processing": {"top_processors": [{"country": "China", "share": 0.98}]},
        "refining": {"top_refiners": [{"country": "China", "share": 0.98}]},
    }
    dep = adversary_dependency(sc)
    assert dep > 80


def test_adversary_dependency_low():
    sc = {
        "mining": {"top_producers": [
            {"country": "Australia", "share": 0.5},
            {"country": "Canada", "share": 0.3},
        ]},
        "processing": {"top_processors": [
            {"country": "Australia", "share": 0.5},
        ]},
        "refining": {"top_refiners": [
            {"country": "Japan", "share": 0.4},
        ]},
    }
    dep = adversary_dependency(sc)
    assert dep == 0.0


def test_single_source_risk_true():
    sc = {"mining": {"top_producers": [{"country": "Brazil", "share": 0.90}]},
          "processing": {"top_processors": []}, "refining": {"top_refiners": []}}
    assert single_source_risk(sc) is True


def test_single_source_risk_false():
    sc = {"mining": {"top_producers": [
        {"country": "A", "share": 0.3}, {"country": "B", "share": 0.3},
    ]}, "processing": {"top_processors": []}, "refining": {"top_refiners": []}}
    assert single_source_risk(sc) is False


def test_overall_risk_range():
    risk = overall_risk(50, 50, 50, 50, 50)
    assert 0 <= risk <= 100
    assert risk == pytest.approx(50.0)


def test_score_mineral_full():
    mineral = {
        "supply_chain": {
            "mining": {"top_producers": [{"country": "China", "share": 0.98}]},
            "processing": {"top_processors": [{"country": "China", "share": 0.98}]},
            "refining": {"top_refiners": [{"country": "China", "share": 0.98}]},
        },
        "trade": {"net_import_reliance": 100},
        "defense_criticality_score": 100,
        "substitutability_score": 80,
    }
    scores = score_mineral(mineral)
    assert scores["overall_risk"] > 80
    assert scores["single_source_risk"] is True
    assert "concentration_risk" in scores


def test_score_mineral_none_values():
    mineral = {
        "supply_chain": {"mining": {}, "processing": {}, "refining": {}},
        "trade": {},
    }
    scores = score_mineral(mineral)
    assert 0 <= scores["overall_risk"] <= 100
