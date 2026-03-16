"""Tests for shared geo normalization utilities."""
from pipeline.shared.geo import (
    normalize_country, normalize_state_fips, state_abbrev_to_fips,
    is_adversary, is_adversary_name,
)


def test_normalize_country_basic():
    assert normalize_country("China") == "CN"
    assert normalize_country("United States") == "US"
    assert normalize_country("Japan") == "JP"


def test_normalize_country_variants():
    assert normalize_country("Korea, Republic of") == "KR"
    assert normalize_country("Russian Federation") == "RU"
    assert normalize_country("Türkiye") == "TR"


def test_normalize_country_none():
    assert normalize_country("") is None
    assert normalize_country("Narnia") is None


def test_normalize_state_fips():
    result = normalize_state_fips("06")
    assert result["name"] == "California"
    assert result["abbrev"] == "CA"


def test_normalize_state_fips_padding():
    result = normalize_state_fips("6")
    assert result["name"] == "California"


def test_state_abbrev_to_fips():
    assert state_abbrev_to_fips("CA") == "06"
    assert state_abbrev_to_fips("TX") == "48"
    assert state_abbrev_to_fips("XX") is None


def test_is_adversary():
    assert is_adversary("CN") is True
    assert is_adversary("RU") is True
    assert is_adversary("JP") is False
    assert is_adversary("US") is False


def test_is_adversary_name():
    assert is_adversary_name("China") is True
    assert is_adversary_name("Russia") is True
    assert is_adversary_name("Japan") is False
