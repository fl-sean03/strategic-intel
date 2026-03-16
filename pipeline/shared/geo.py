"""Geographic normalization utilities.

Common functions for normalizing country names, state FIPS codes,
and county FIPS codes across all sector pipelines.
"""

# ISO 3166-1 alpha-2 country codes
COUNTRY_ISO_MAP = {
    "United States": "US", "China": "CN", "Russia": "RU", "Japan": "JP",
    "South Korea": "KR", "Germany": "DE", "India": "IN", "Brazil": "BR",
    "Australia": "AU", "Canada": "CA", "Mexico": "MX", "United Kingdom": "GB",
    "France": "FR", "Italy": "IT", "Turkey": "TR", "Indonesia": "ID",
    "Saudi Arabia": "SA", "Iran": "IR", "North Korea": "KP", "Taiwan": "TW",
    "Vietnam": "VN", "Thailand": "TH", "Malaysia": "MY", "Philippines": "PH",
    "Poland": "PL", "Netherlands": "NL", "Spain": "ES", "Sweden": "SE",
    "Norway": "NO", "Finland": "FI", "Chile": "CL", "Peru": "PE",
    "Argentina": "AR", "Colombia": "CO", "South Africa": "ZA",
    "Democratic Republic of the Congo": "CD", "Congo (Kinshasa)": "CD",
    "Dem. Rep. of the Congo": "CD", "Zambia": "ZM", "Zimbabwe": "ZW",
    "Myanmar": "MM", "Burma": "MM", "Kazakhstan": "KZ", "Ukraine": "UA",
    "Uzbekistan": "UZ", "Morocco": "MA", "Egypt": "EG", "Nigeria": "NG",
    "Ghana": "GH", "Tanzania": "TZ", "Mozambique": "MZ", "Madagascar": "MG",
    "New Caledonia": "NC", "Cuba": "CU", "Gabon": "GA", "Guinea": "GN",
    "Sierra Leone": "SL", "Guyana": "GY", "Suriname": "SR", "Bolivia": "BO",
    "Papua New Guinea": "PG", "Fiji": "FJ", "Mongolia": "MN",
    "Tajikistan": "TJ", "Kyrgyzstan": "KG", "Georgia": "GE",
    "Armenia": "AM", "Azerbaijan": "AZ", "Belarus": "BY",
    "Czech Republic": "CZ", "Czechia": "CZ", "Slovakia": "SK",
    "Hungary": "HU", "Romania": "RO", "Bulgaria": "BG",
    "Serbia": "RS", "Croatia": "HR", "Slovenia": "SI",
    "Belgium": "BE", "Austria": "AT", "Switzerland": "CH",
    "Denmark": "DK", "Ireland": "IE", "Portugal": "PT",
    "Greece": "GR", "Israel": "IL", "Singapore": "SG",
    "Hong Kong": "HK", "New Zealand": "NZ", "Pakistan": "PK",
    "Bangladesh": "BD", "Sri Lanka": "LK", "Nepal": "NP",
    "Cambodia": "KH", "Laos": "LA", "Lao People's Dem. Rep.": "LA",
    "Korea, Republic of": "KR", "Korea, Dem. People's Rep. of": "KP",
    "Russian Federation": "RU", "Iran (Islamic Republic of)": "IR",
    "Viet Nam": "VN", "Türkiye": "TR",
}

# Adversary nations for dependency scoring
ADVERSARY_NATIONS = {"CN", "RU", "IR", "KP"}
ADVERSARY_NAMES = {"China", "Russia", "Iran", "North Korea"}

# U.S. state FIPS codes
STATE_FIPS = {
    "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas",
    "06": "California", "08": "Colorado", "09": "Connecticut", "10": "Delaware",
    "11": "District of Columbia", "12": "Florida", "13": "Georgia", "15": "Hawaii",
    "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa",
    "20": "Kansas", "21": "Kentucky", "22": "Louisiana", "23": "Maine",
    "24": "Maryland", "25": "Massachusetts", "26": "Michigan", "27": "Minnesota",
    "28": "Mississippi", "29": "Missouri", "30": "Montana", "31": "Nebraska",
    "32": "Nevada", "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico",
    "36": "New York", "37": "North Carolina", "38": "North Dakota", "39": "Ohio",
    "40": "Oklahoma", "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island",
    "45": "South Carolina", "46": "South Dakota", "47": "Tennessee", "48": "Texas",
    "49": "Utah", "50": "Vermont", "51": "Virginia", "53": "Washington",
    "54": "West Virginia", "55": "Wisconsin", "56": "Wyoming",
}

STATE_ABBREV = {
    "AL": "01", "AK": "02", "AZ": "04", "AR": "05", "CA": "06", "CO": "08",
    "CT": "09", "DE": "10", "DC": "11", "FL": "12", "GA": "13", "HI": "15",
    "ID": "16", "IL": "17", "IN": "18", "IA": "19", "KS": "20", "KY": "21",
    "LA": "22", "ME": "23", "MD": "24", "MA": "25", "MI": "26", "MN": "27",
    "MS": "28", "MO": "29", "MT": "30", "NE": "31", "NV": "32", "NH": "33",
    "NJ": "34", "NM": "35", "NY": "36", "NC": "37", "ND": "38", "OH": "39",
    "OK": "40", "OR": "41", "PA": "42", "RI": "44", "SC": "45", "SD": "46",
    "TN": "47", "TX": "48", "UT": "49", "VT": "50", "VA": "51", "WA": "53",
    "WV": "54", "WI": "55", "WY": "56",
}

FIPS_TO_ABBREV = {v: k for k, v in STATE_ABBREV.items()}


def normalize_country(name: str) -> str | None:
    """Return ISO 3166-1 alpha-2 code for a country name, or None."""
    if not name:
        return None
    cleaned = name.strip()
    return COUNTRY_ISO_MAP.get(cleaned)


def normalize_state_fips(fips: str) -> dict | None:
    """Return state info dict from FIPS code."""
    fips = str(fips).zfill(2)
    name = STATE_FIPS.get(fips)
    if not name:
        return None
    return {
        "fips": fips,
        "name": name,
        "abbrev": FIPS_TO_ABBREV.get(fips, ""),
    }


def state_abbrev_to_fips(abbrev: str) -> str | None:
    """Convert state abbreviation to FIPS code."""
    return STATE_ABBREV.get(abbrev.upper())


def is_adversary(country_iso: str) -> bool:
    """Check if a country ISO code is an adversary nation."""
    return country_iso in ADVERSARY_NATIONS


def is_adversary_name(country_name: str) -> bool:
    """Check if a country name is an adversary nation."""
    return country_name.strip() in ADVERSARY_NAMES
