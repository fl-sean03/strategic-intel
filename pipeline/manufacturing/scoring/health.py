"""Manufacturing health scoring.

Scores each NAICS sector on a 0-100 scale based on:
- Capacity utilization (30%)
- Employment trend (25%)
- Output trend (20%)
- Geographic diversity (15%)
- Investment pipeline (10%)
"""
from pipeline.manufacturing.config import HEALTH_WEIGHTS, CAP_UTIL_MIN, CAP_UTIL_MAX


def score_capacity_utilization(cap_util: float | None) -> float:
    """Score capacity utilization on 0-100 scale.

    60% → 0, 85% → 100, linear interpolation.
    """
    if cap_util is None:
        return 50.0  # Default mid-score
    clamped = max(CAP_UTIL_MIN, min(cap_util, CAP_UTIL_MAX))
    return round((clamped - CAP_UTIL_MIN) / (CAP_UTIL_MAX - CAP_UTIL_MIN) * 100, 1)


def score_employment_trend(trend_pct: float | None) -> float:
    """Score employment trend. -5%/yr → 0, +5%/yr → 100, 0% → 50."""
    if trend_pct is None:
        return 50.0
    clamped = max(-5.0, min(trend_pct, 5.0))
    return round((clamped + 5.0) / 10.0 * 100, 1)


def score_geographic_diversity(state_shares: list[float]) -> float:
    """Score geographic diversity using inverse HHI.

    Lower HHI (more distributed) → higher score.
    """
    if not state_shares:
        return 50.0
    hhi = sum(s ** 2 for s in state_shares)
    # HHI ranges from ~0.02 (perfectly distributed) to 1.0 (single state)
    # Map: HHI 0.05 → 100, HHI 0.5 → 0
    score = max(0, min(100, (0.5 - hhi) / 0.45 * 100))
    return round(score, 1)


def score_manufacturing_health(
    capacity_utilization: float | None,
    employment_trend: float | None,
    output_trend: float | None = None,
    state_shares: list[float] | None = None,
    investment_score: float = 50.0,
) -> float:
    """Compute composite manufacturing health score (0-100)."""
    cap_score = score_capacity_utilization(capacity_utilization)
    emp_score = score_employment_trend(employment_trend)
    output_score = score_employment_trend(output_trend)  # Same scale
    geo_score = score_geographic_diversity(state_shares or [])

    health = (
        HEALTH_WEIGHTS["capacity_utilization"] * cap_score
        + HEALTH_WEIGHTS["employment_trend"] * emp_score
        + HEALTH_WEIGHTS["output_trend"] * output_score
        + HEALTH_WEIGHTS["geographic_diversity"] * geo_score
        + HEALTH_WEIGHTS["investment_pipeline"] * investment_score
    )
    return round(health, 1)


def score_defense_concentration(state_amounts: list[float]) -> float:
    """Score defense contract geographic concentration (0-100).

    Higher = more concentrated = higher risk.
    """
    if not state_amounts:
        return 0.0
    total = sum(state_amounts)
    if total == 0:
        return 0.0
    shares = [a / total for a in state_amounts]
    hhi = sum(s ** 2 for s in shares)
    # Normalize: HHI 0.02 → 0 (distributed), HHI 0.3 → 100 (concentrated)
    score = min(100, max(0, hhi / 0.3 * 100))
    return round(score, 1)
