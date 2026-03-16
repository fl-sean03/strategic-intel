"""Unit tests for manufacturing health scoring."""
import pytest
from pipeline.manufacturing.scoring.health import (
    score_capacity_utilization, score_employment_trend,
    score_geographic_diversity, score_manufacturing_health,
    score_defense_concentration,
)


def test_cap_util_healthy():
    assert score_capacity_utilization(85.0) == 100.0


def test_cap_util_low():
    assert score_capacity_utilization(60.0) == 0.0


def test_cap_util_mid():
    score = score_capacity_utilization(72.5)
    assert 40 < score < 60


def test_cap_util_none():
    assert score_capacity_utilization(None) == 50.0


def test_employment_trend_positive():
    score = score_employment_trend(5.0)
    assert score == 100.0


def test_employment_trend_negative():
    score = score_employment_trend(-5.0)
    assert score == 0.0


def test_employment_trend_flat():
    score = score_employment_trend(0.0)
    assert score == 50.0


def test_employment_trend_none():
    assert score_employment_trend(None) == 50.0


def test_geo_diversity_distributed():
    shares = [0.1] * 10  # 10 equal states
    score = score_geographic_diversity(shares)
    assert score > 70


def test_geo_diversity_concentrated():
    shares = [0.8, 0.1, 0.1]  # One state dominates
    score = score_geographic_diversity(shares)
    assert score < 30


def test_geo_diversity_empty():
    assert score_geographic_diversity([]) == 50.0


def test_health_score_range():
    score = score_manufacturing_health(75.0, 0.0, 0.0, [0.1] * 10)
    assert 0 <= score <= 100


def test_health_score_all_defaults():
    score = score_manufacturing_health(None, None, None, None)
    assert score == 50.0


def test_defense_concentration_distributed():
    amounts = [100_000_000] * 20  # Equal across 20 states
    score = score_defense_concentration(amounts)
    assert score < 20


def test_defense_concentration_single():
    amounts = [1_000_000_000, 10_000, 10_000]  # One state dominates
    score = score_defense_concentration(amounts)
    assert score > 50


def test_defense_concentration_empty():
    assert score_defense_concentration([]) == 0.0
