"""Concentration risk scoring for critical minerals.

Migrated from critical-chain v1.
"""
from pipeline.metals_mining.config import ADVERSARY_NATIONS, STAGE_WEIGHTS, RISK_WEIGHTS


def hhi(shares: list[float]) -> float:
    """Herfindahl-Hirschman Index. 0 = competitive, 1 = monopoly."""
    return sum(s ** 2 for s in shares)


def concentration_risk(supply_chain: dict) -> float:
    """Weighted concentration risk across supply chain stages. Returns 0-100."""
    stage_hhis = {}
    stage_keys = {
        "mining": "top_producers",
        "processing": "top_processors",
        "refining": "top_refiners",
    }
    for stage, key in stage_keys.items():
        entries = supply_chain.get(stage, {}).get(key, [])
        shares = [e["share"] for e in entries]
        stage_hhis[stage] = hhi(shares) if shares else 0.0

    score = sum(STAGE_WEIGHTS[s] * stage_hhis.get(s, 0) for s in STAGE_WEIGHTS)
    return round(score * 100, 1)


def adversary_dependency(supply_chain: dict) -> float:
    """Share of supply chain controlled by adversary nations. Returns 0-100."""
    stage_keys = {
        "mining": "top_producers",
        "processing": "top_processors",
        "refining": "top_refiners",
    }
    stage_scores = {}
    for stage, key in stage_keys.items():
        entries = supply_chain.get(stage, {}).get(key, [])
        adv_share = sum(e["share"] for e in entries if e["country"] in ADVERSARY_NATIONS)
        stage_scores[stage] = min(adv_share, 1.0)

    score = sum(STAGE_WEIGHTS[s] * stage_scores.get(s, 0) for s in STAGE_WEIGHTS)
    return round(score * 100, 1)


def single_source_risk(supply_chain: dict) -> bool:
    """True if any country controls >50% of any supply chain stage."""
    stage_keys = {
        "mining": "top_producers",
        "processing": "top_processors",
        "refining": "top_refiners",
    }
    for stage, key in stage_keys.items():
        entries = supply_chain.get(stage, {}).get(key, [])
        for e in entries:
            if e["share"] > 0.50:
                return True
    return False


def overall_risk(concentration: float, adversary: float, import_dep: float,
                 defense_crit: float, substitutability: float = 50.0) -> float:
    """Composite risk score. All inputs 0-100. Returns 0-100."""
    score = (
        RISK_WEIGHTS["concentration"] * concentration
        + RISK_WEIGHTS["adversary_dependency"] * adversary
        + RISK_WEIGHTS["import_dependency"] * import_dep
        + RISK_WEIGHTS["defense_criticality"] * defense_crit
        + RISK_WEIGHTS["substitutability"] * substitutability
    )
    return round(score, 1)


def score_mineral(mineral_data: dict) -> dict:
    """Score a single mineral across all risk dimensions."""
    sc = mineral_data.get("supply_chain", {})
    trade = mineral_data.get("trade", {})

    conc = concentration_risk(sc)
    adv = adversary_dependency(sc)
    imp = trade.get("net_import_reliance") or 50.0
    defense = mineral_data.get("defense_criticality_score") or 50.0
    subs = mineral_data.get("substitutability_score") or 50.0
    ss_risk = single_source_risk(sc)

    return {
        "concentration_risk": conc,
        "adversary_dependency": adv,
        "import_dependency": imp,
        "defense_criticality": defense,
        "substitutability": subs,
        "single_source_risk": ss_risk,
        "overall_risk": overall_risk(conc, adv, imp, defense, subs),
    }
