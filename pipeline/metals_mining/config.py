"""Metals & Mining module configuration.

Migrated from critical-chain v1. Contains mineral lists, USGS URLs,
commodity mappings, and scoring weights.
"""
from pathlib import Path

# Paths relative to v2 root
ROOT_DIR = Path(__file__).parent.parent.parent
DATA_DIR = ROOT_DIR / "data"
RAW_DIR = DATA_DIR / "raw" / "metals-mining"
CACHE_DIR = RAW_DIR / "cache"

# USGS Data — direct download URLs from ScienceBase
USGS_URLS = {
    "world_data": "https://www.sciencebase.gov/catalog/file/get/6798fd34d34ea8c18376e8ee?f=__disk__92%2Ff6%2F90%2F92f690853b1b1dc6a8000c1da24a7bbfd9f670d0",
    "salient_stats": "https://www.sciencebase.gov/catalog/file/get/6798fc89d34ea8c18376e8e7?f=__disk__2c%2F86%2Fd6%2F2c86d688118857b3c3d6fda236ce7de929c4b009",
    "net_import_reliance": "https://www.sciencebase.gov/catalog/file/get/6798fc89d34ea8c18376e8e7?f=__disk__d4%2Fac%2Fdf%2Fd4acdf66ab5feb4dad5ae8feed47e3cc71ea2cdd",
    "import_sources": "https://www.sciencebase.gov/catalog/file/get/6798fc89d34ea8c18376e8e7?f=__disk__e9%2F07%2Fdf%2Fe907df424475a89d834efb86eacf4b944bb39fdf",
    "end_use": "https://www.sciencebase.gov/catalog/file/get/6798fc89d34ea8c18376e8e7?f=__disk__16%2Fdf%2F7f%2F16df7f9bb084a611a9741f872dd405412d624c90",
}

# Official 2025 Critical Minerals List (60 minerals)
CRITICAL_MINERALS_2025 = [
    "Aluminum", "Antimony", "Arsenic", "Barite", "Beryllium", "Bismuth",
    "Boron", "Cerium", "Cesium", "Chromium", "Cobalt", "Copper",
    "Dysprosium", "Erbium", "Europium", "Fluorspar", "Gadolinium", "Gallium",
    "Germanium", "Graphite", "Hafnium", "Holmium", "Indium", "Iridium",
    "Lanthanum", "Lead", "Lithium", "Lutetium", "Magnesium", "Manganese",
    "Metallurgical Coal", "Neodymium", "Nickel", "Niobium", "Palladium",
    "Phosphate", "Platinum", "Potash", "Praseodymium", "Rhenium",
    "Rhodium", "Rubidium", "Ruthenium", "Samarium", "Scandium",
    "Silicon", "Silver", "Tantalum", "Tellurium", "Terbium", "Thulium",
    "Tin", "Titanium", "Tungsten", "Uranium", "Vanadium", "Ytterbium",
    "Yttrium", "Zinc", "Zirconium",
]

ADVERSARY_NATIONS = ["China", "Russia", "Iran", "North Korea"]

STAGE_WEIGHTS = {"mining": 0.25, "processing": 0.40, "refining": 0.35}

RISK_WEIGHTS = {
    "concentration": 0.30,
    "adversary_dependency": 0.25,
    "import_dependency": 0.20,
    "defense_criticality": 0.15,
    "substitutability": 0.10,
}

# USGS commodity name → canonical name
USGS_COMMODITY_MAP = {
    "Aluminum": "Aluminum", "Antimony": "Antimony", "Arsenic": "Arsenic",
    "Barite  ": "Barite", "Barite": "Barite",
    "Beryllium  ": "Beryllium", "Beryllium": "Beryllium",
    "Bismuth": "Bismuth", "Boron ": "Boron", "Boron": "Boron",
    "Chromium": "Chromium", "Cobalt": "Cobalt",
    "Copper ": "Copper", "Copper": "Copper",
    "Fluorspar": "Fluorspar",
    "Gallium ": "Gallium", "Gallium": "Gallium",
    "Gemanium": "Germanium", "Germanium": "Germanium",
    "Graphite": "Graphite", "Indium": "Indium", "Lead": "Lead",
    "Lithium ": "Lithium", "Lithium": "Lithium",
    "Magnesium Compounds": "Magnesium", "Magnesium metal": "Magnesium",
    "Manganese": "Manganese", "Molybdenum ": "Molybdenum",
    "Nickel": "Nickel", "Niobium": "Niobium",
    "Phosphate rock ": "Phosphate", "Phosphate rock": "Phosphate",
    "Platinum-Group metals": "Platinum",
    "Potash  ": "Potash", "Potash": "Potash",
    "Rare earths": "Rare Earths", "Rhenium": "Rhenium",
    "Selenium": "Selenium", "Silicon": "Silicon", "Silver": "Silver",
    "Tantalum": "Tantalum", "Tellurium": "Tellurium",
    "Tin": "Tin",
    "Titanium Mineral Concentrates": "Titanium",
    "Titanium & titanium dioxide": "Titanium",
    "Tungsten ": "Tungsten", "Tungsten": "Tungsten",
    "Vanadium": "Vanadium", "Zinc": "Zinc",
    "Zirconium and Hafnium": "Zirconium",
    "Bauxite": "Aluminum",
    "Iron Ore  ": None, "Iron and Steel": None, "Gold ": None, "Cement": None,
}

USGS_SALIENT_MAP = {
    "Aluminum (bauxite)": "Aluminum", "Antimony": "Antimony",
    "Arsenic ": "Arsenic", "Arsenic": "Arsenic",
    "Barite": "Barite", "Beryllium": "Beryllium", "Bismuth": "Bismuth",
    "Chromium": "Chromium", "Cobalt": "Cobalt", "Fluorspar": "Fluorspar",
    "Gallium": "Gallium", "Germanium": "Germanium",
    "Graphite (natural)": "Graphite", "Indium": "Indium",
    "Lithium": "Lithium", "Magnesium": "Magnesium", "Manganese": "Manganese",
    "Nickel": "Nickel", "Niobium": "Niobium",
    "Palladium ": "Palladium", "Palladium": "Palladium",
    "Platinum ": "Platinum", "Platinum": "Platinum",
    "Rare earths (compounds and metals)": "Rare Earths",
    "Scandium": "Scandium", "Tantalum": "Tantalum",
    "Tellurium": "Tellurium",
    "Tin ": "Tin", "Tin": "Tin",
    "Titanium (metal)": "Titanium", "Tungsten": "Tungsten",
    "Vanadium": "Vanadium", "Yttrium": "Yttrium",
    "Zinc": "Zinc", "Zirconium (ores and concentrates)": "Zirconium",
}

COUNTRY_ISO_MAP = {
    "United States": "US", "China": "CN", "Russia": "RU", "Australia": "AU",
    "Brazil": "BR", "Canada": "CA", "Canada ": "CA", "India": "IN", "Japan": "JP",
    "South Africa": "ZA", "Chile": "CL", "Peru": "PE", "Indonesia": "ID",
    "Mexico": "MX", "Germany": "DE", "France": "FR", "Norway": "NO",
    "Finland": "FI", "Sweden": "SE", "Belgium": "BE", "Netherlands": "NL",
    "Spain": "ES", "Italy": "IT", "United Kingdom": "UK", "Poland": "PL",
    "Turkey": "TR", "Saudi Arabia": "SA", "Iran": "IR", "Kazakhstan": "KZ",
    "Congo (Kinshasa)": "CD", "Gabon": "GA", "Guinea": "GN", "Morocco": "MA",
    "Mozambique": "MZ", "Zimbabwe": "ZW", "Zambia": "ZM", "Tanzania": "TZ",
    "Philippines": "PH", "Vietnam": "VN", "Thailand": "TH", "Malaysia": "MY",
    "Republic of Korea": "KR", " Republic of Korea": "KR",
    "Korea, Republic of": "KR", "Korea, Republic of ": "KR",
    "South Korea": "KR", "North Korea": "KP",
    "Taiwan": "TW", "Myanmar": "MM", "Argentina": "AR", "Bolivia": "BO",
    "Colombia": "CO", "Jamaica": "JA", "Guyana": "GY", "Bahrain": "BH",
    "Iceland": "IS", "Oman": "OM", "United Arab Emirates": "AE",
    "New Zealand": "NZ", "Romania": "RO", "Ukraine": "UA", "Greece": "GR",
    "Austria": "AT", "Czechia": "CZ", "Slovakia": "SK", "Serbia": "RS",
    "Madagascar": "MG", "Senegal": "SN", "Egypt": "EG", "Israel": "IL",
    "Belarus": "BY", "Estonia": "EE", "Ireland": "IE", "Georgia": "GE",
}

DEFENSE_APPLICATIONS = {
    "Gallium": ["semiconductors", "radar", "electronic_warfare", "LEDs", "5G"],
    "Germanium": ["fiber_optics", "infrared_optics", "night_vision", "satellites"],
    "Cobalt": ["jet_engines", "superalloys", "batteries", "armor"],
    "Lithium": ["batteries", "ceramics", "nuclear_weapons"],
    "Rare Earths": ["magnets", "guidance_systems", "sonar", "radar", "lasers", "night_vision"],
    "Titanium": ["airframes", "jet_engines", "armor", "naval_vessels"],
    "Tungsten": ["armor_piercing", "munitions", "tooling", "electronics"],
    "Chromium": ["stainless_steel", "superalloys", "armor"],
    "Manganese": ["steel_production", "batteries", "aluminum_alloys"],
    "Tantalum": ["capacitors", "electronics", "jet_engines", "surgical_instruments"],
    "Niobium": ["superalloys", "jet_engines", "superconductors", "steel"],
    "Beryllium": ["aerospace_structures", "nuclear_weapons", "satellites", "X-ray_windows"],
    "Antimony": ["ammunition", "flame_retardants", "batteries", "infrared_detectors"],
    "Graphite": ["batteries", "nuclear_reactors", "crucibles", "lubricants"],
    "Vanadium": ["steel_alloys", "armor", "jet_engines", "energy_storage"],
    "Indium": ["displays", "semiconductors", "solders", "photovoltaics"],
    "Hafnium": ["nuclear_control_rods", "superalloys", "plasma_cutting"],
    "Scandium": ["aluminum_alloys", "solid_oxide_fuel_cells", "aerospace"],
    "Tellurium": ["solar_cells", "thermoelectrics", "defense_optics"],
    "Bismuth": ["pharmaceuticals", "ammunition_replacement", "solders"],
    "Zirconium": ["nuclear_fuel_cladding", "ceramics", "chemical_processing"],
    "Tin": ["solders", "electronics", "coatings", "ammunition"],
    "Nickel": ["superalloys", "batteries", "armor", "submarines"],
    "Aluminum": ["aircraft", "armor", "naval_vessels", "munitions"],
    "Zinc": ["galvanizing", "brass_munitions", "batteries"],
    "Magnesium": ["aerospace_alloys", "flares", "incendiary"],
    "Fluorite": ["uranium_enrichment", "aluminum_production", "optics"],
    "Uranium": ["nuclear_weapons", "nuclear_propulsion", "power_generation"],
}
