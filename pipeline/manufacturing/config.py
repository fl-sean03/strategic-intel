"""Manufacturing module configuration.

NAICS codes, API series IDs, scoring weights, and static reference data.
"""
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent.parent
DATA_DIR = ROOT_DIR / "data"
RAW_DIR = DATA_DIR / "raw" / "manufacturing"

# Defense-relevant NAICS manufacturing sectors
NAICS_SECTORS = {
    "331": {"name": "Primary Metals", "defense_relevance": "Steel, aluminum, titanium, specialty alloys",
            "fred_cap_util": "CAPUTLG331S", "bls_ces": "CES3133100001"},
    "332": {"name": "Fabricated Metal Products", "defense_relevance": "Ammunition, armor, structural components",
            "fred_cap_util": "CAPUTLG332S", "bls_ces": "CES3133200001"},
    "334": {"name": "Computer & Electronic Products", "defense_relevance": "Semiconductors, radar, guidance systems",
            "fred_cap_util": "CAPUTLG334S", "bls_ces": "CES3133400001"},
    "335": {"name": "Electrical Equipment", "defense_relevance": "Batteries, power systems, motors",
            "fred_cap_util": "CAPUTLG335S", "bls_ces": "CES3133500001"},
    "336": {"name": "Transportation Equipment", "defense_relevance": "Aircraft, ships, vehicles, missiles",
            "fred_cap_util": "CAPUTLG336S", "bls_ces": "CES3133600001"},
    "325": {"name": "Chemicals", "defense_relevance": "Propellants, explosives, materials",
            "fred_cap_util": "CAPUTLG325S", "bls_ces": "CES3132500001"},
    "327": {"name": "Nonmetallic Mineral Products", "defense_relevance": "Ceramics, glass, advanced materials",
            "fred_cap_util": "CAPUTLG327S", "bls_ces": "CES3132700001"},
    "333": {"name": "Machinery", "defense_relevance": "Industrial machinery, engines, turbines",
            "fred_cap_util": "CAPUTLG333S", "bls_ces": "CES3133300001"},
}

# FRED series for aggregate manufacturing
FRED_AGGREGATE_SERIES = {
    "MCUMFN": "Manufacturing Capacity Utilization (Total)",
    "IPMAN": "Industrial Production: Manufacturing",
    "MANEMP": "Manufacturing Employment (Total, Thousands)",
}

# BLS CES series for total manufacturing
BLS_TOTAL_MANUFACTURING = "CES3000000001"

# Manufacturing health score weights
HEALTH_WEIGHTS = {
    "capacity_utilization": 0.30,
    "employment_trend": 0.25,
    "output_trend": 0.20,
    "geographic_diversity": 0.15,
    "investment_pipeline": 0.10,
}

# Capacity utilization normalization
CAP_UTIL_MIN = 60.0   # Score = 0
CAP_UTIL_MAX = 85.0   # Score = 100

# Shipbuilding comparison data (from CRS/GAO/UNCTAD/White House Maritime Action Plan)
SHIPBUILDING_DATA = [
    {"country": "United States", "country_iso": "US", "active_shipyards": 8,
     "vessels_on_order": 3, "global_share_pct": 0.06},
    {"country": "China", "country_iso": "CN", "active_shipyards": 400,
     "vessels_on_order": 3800, "global_share_pct": 70.0},
    {"country": "South Korea", "country_iso": "KR", "active_shipyards": 7,
     "vessels_on_order": 850, "global_share_pct": 15.6},
    {"country": "Japan", "country_iso": "JP", "active_shipyards": 15,
     "vessels_on_order": 500, "global_share_pct": 9.2},
]

# Munitions production data (from public reporting — approximate)
MUNITIONS_DATA = [
    {"name": "155mm Artillery Shells", "current_rate": "~40,000/month",
     "target_rate": "100,000/month", "gap_severity": "severe",
     "notes": "Army goal by end of FY2025. New lines at multiple facilities.",
     "confidence": "medium"},
    {"name": "Javelin Missiles", "current_rate": "~400/month (est.)",
     "target_rate": "800/month", "gap_severity": "severe",
     "notes": "~7,000 sent to Ukraine in Year 1. Multi-year replacement cycle.",
     "confidence": "low"},
    {"name": "Stinger Missiles", "current_rate": "Production restarted 2023",
     "target_rate": "~720/year", "gap_severity": "critical",
     "notes": "Production line had been cold for 20 years. Stockpile depleted.",
     "confidence": "low"},
    {"name": "GMLRS Rockets", "current_rate": "~14,000/year",
     "target_rate": "Increasing", "gap_severity": "moderate",
     "notes": "High demand signal from Ukraine. Lockheed expanding capacity.",
     "confidence": "medium"},
    {"name": "PAC-3 Interceptors", "current_rate": "~500/year (est.)",
     "target_rate": "Increasing", "gap_severity": "moderate",
     "notes": "Key for air/missile defense. Long lead times for components.",
     "confidence": "low"},
]
