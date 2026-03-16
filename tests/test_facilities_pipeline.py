"""Tests for the MSHA facilities pipeline.

Tests mineral matching, coordinate validation, normalization, and
defense programs linkage.
"""
import pytest

from pipeline.facilities.ingestion.msha import match_minerals_from_sic, MINERAL_SIC_KEYWORDS
from pipeline.facilities.transform.normalize import (
    normalize_facilities, _is_valid_coordinate, _parse_float, _parse_int,
    _normalize_commodity,
)
from pipeline.cross_sector.defense_programs import get_defense_programs, get_programs_for_mineral


# ---------------------------------------------------------------------------
# Mineral SIC matching tests
# ---------------------------------------------------------------------------

class TestMineralSICMatching:
    """Test that SIC descriptions are correctly matched to critical minerals."""

    def test_copper_ores_matches_copper(self):
        result = match_minerals_from_sic("Copper Ores")
        assert "Copper" in result

    def test_gold_ores_does_not_match(self):
        """Gold is not in the critical minerals list keywords unless it is."""
        result = match_minerals_from_sic("Gold Ores")
        # Gold is not a critical mineral in CRITICAL_MINERALS_2025
        assert "Gold" not in result

    def test_lithium_mining_matches(self):
        result = match_minerals_from_sic("Lithium Mining")
        assert "Lithium" in result

    def test_rare_earth_matches_multiple(self):
        result = match_minerals_from_sic("Rare Earth Mining NEC")
        # Should match all rare earth elements
        assert "Cerium" in result
        assert "Neodymium" in result
        assert "Dysprosium" in result

    def test_uranium_radium_vanadium_ores(self):
        result = match_minerals_from_sic("Uranium-Radium-Vanadium Ores")
        assert "Uranium" in result
        assert "Vanadium" in result

    def test_phosphate_rock(self):
        result = match_minerals_from_sic("Phosphate Rock")
        assert "Phosphate" in result

    def test_case_insensitive(self):
        result = match_minerals_from_sic("COPPER ORES")
        assert "Copper" in result

    def test_empty_string_returns_empty(self):
        assert match_minerals_from_sic("") == []

    def test_none_returns_empty(self):
        assert match_minerals_from_sic(None) == []

    def test_no_match_returns_empty(self):
        result = match_minerals_from_sic("Dimension Stone")
        assert result == []

    def test_titanium_ilmenite_match(self):
        result = match_minerals_from_sic("Ilmenite Concentrate")
        assert "Titanium" in result

    def test_chromite_matches_chromium(self):
        result = match_minerals_from_sic("Chromite Ore")
        assert "Chromium" in result

    def test_tungsten_wolfram_match(self):
        result = match_minerals_from_sic("Wolfram Ore")
        assert "Tungsten" in result

    def test_columbium_matches_niobium(self):
        result = match_minerals_from_sic("Columbium Ore")
        assert "Niobium" in result

    def test_potash_matches(self):
        result = match_minerals_from_sic("Potash Mining")
        assert "Potash" in result

    def test_all_critical_minerals_have_keywords(self):
        """Every critical mineral from config should have keyword mappings."""
        from pipeline.metals_mining.config import CRITICAL_MINERALS_2025
        for mineral in CRITICAL_MINERALS_2025:
            assert mineral in MINERAL_SIC_KEYWORDS, (
                f"Critical mineral '{mineral}' has no SIC keyword mapping"
            )


# ---------------------------------------------------------------------------
# Coordinate validation tests
# ---------------------------------------------------------------------------

class TestCoordinateValidation:
    """Test that invalid coordinates are properly filtered."""

    def test_valid_conus_coordinates(self):
        assert _is_valid_coordinate(39.7392, -104.9903) is True

    def test_valid_alaska_coordinates(self):
        assert _is_valid_coordinate(64.2008, -149.4937) is True

    def test_valid_hawaii_coordinates(self):
        assert _is_valid_coordinate(19.8968, -155.5828) is True

    def test_zero_zero_is_invalid(self):
        """0,0 is off the coast of Africa, not a US mine."""
        assert _is_valid_coordinate(0.0, 0.0) is False

    def test_none_latitude(self):
        assert _is_valid_coordinate(None, -104.0) is False

    def test_none_longitude(self):
        assert _is_valid_coordinate(39.0, None) is False

    def test_both_none(self):
        assert _is_valid_coordinate(None, None) is False

    def test_latitude_too_low(self):
        assert _is_valid_coordinate(10.0, -100.0) is False

    def test_latitude_too_high(self):
        assert _is_valid_coordinate(80.0, -100.0) is False

    def test_longitude_too_high(self):
        assert _is_valid_coordinate(39.0, -50.0) is False

    def test_longitude_too_low(self):
        assert _is_valid_coordinate(39.0, -200.0) is False


# ---------------------------------------------------------------------------
# Parse helpers tests
# ---------------------------------------------------------------------------

class TestParseHelpers:

    def test_parse_float_valid(self):
        assert _parse_float("39.7392") == 39.7392

    def test_parse_float_empty(self):
        assert _parse_float("") is None

    def test_parse_float_none(self):
        assert _parse_float(None) is None

    def test_parse_float_whitespace(self):
        assert _parse_float("  39.7  ") == 39.7

    def test_parse_float_garbage(self):
        assert _parse_float("not-a-number") is None

    def test_parse_int_valid(self):
        assert _parse_int("150") == 150

    def test_parse_int_float_string(self):
        assert _parse_int("150.7") == 150

    def test_parse_int_empty(self):
        assert _parse_int("") is None

    def test_parse_int_none(self):
        assert _parse_int(None) is None


# ---------------------------------------------------------------------------
# Commodity normalization tests
# ---------------------------------------------------------------------------

class TestCommodityNormalize:

    def test_copper_ores(self):
        assert _normalize_commodity("Copper Ores") == "Copper"

    def test_phosphate_rock(self):
        assert _normalize_commodity("Phosphate Rock Mining") == "Phosphate"

    def test_rare_earth(self):
        assert _normalize_commodity("Rare Earth Elements NEC") == "Rare Earths"

    def test_empty(self):
        assert _normalize_commodity("") is None

    def test_none(self):
        assert _normalize_commodity(None) is None

    def test_unknown_passthrough(self):
        """Unknown SIC descriptions pass through as-is."""
        assert _normalize_commodity("Dimension Stone") == "Dimension Stone"


# ---------------------------------------------------------------------------
# Normalize facilities integration tests
# ---------------------------------------------------------------------------

class TestNormalizeFacilities:

    def _make_record(self, **overrides):
        """Create a minimal MSHA record with defaults matching actual MSHA columns."""
        base = {
            "MINE_ID": "1234567",
            "CURRENT_MINE_NAME": "Test Mine Current",
            "CURRENT_MINE_TYPE": "Surface",
            "CURRENT_MINE_STATUS": "Active",
            "STATE": "CO",
            "FIPS_CNTY_CD": "08031",
            "FIPS_CNTY_NM": "Denver",
            "LATITUDE": "39.7392",
            "LONGITUDE": "-104.9903",
            "PRIMARY_SIC_CD": "1021",
            "PRIMARY_SIC": "Copper Ores",
            "SECONDARY_SIC_CD": "",
            "SECONDARY_SIC": "",
            "CURRENT_OPERATOR_NAME": "Test Operator Inc",
            "AVG_MINE_EMP_CNT": "50",
            "NO_EMPLOYEES": "50",
            "matched_minerals": ["Copper"],
        }
        base.update(overrides)
        return base

    def test_basic_normalization(self):
        records = [self._make_record()]
        facilities = normalize_facilities(records)
        assert len(facilities) == 1
        f = facilities[0]
        assert f["id"] == "msha-1234567"
        assert f["name"] == "Test Mine Current"
        assert f["lat"] == 39.7392
        assert f["lon"] == -104.9903
        assert "Copper" in f["mineral_match"]
        assert f["employment"] == 50
        assert f["state"] == "CO"

    def test_invalid_coordinates_filtered(self):
        records = [
            self._make_record(LATITUDE="0.0", LONGITUDE="0.0"),
        ]
        facilities = normalize_facilities(records)
        assert len(facilities) == 0

    def test_missing_coordinates_filtered(self):
        records = [
            self._make_record(LATITUDE="", LONGITUDE=""),
        ]
        facilities = normalize_facilities(records)
        assert len(facilities) == 0

    def test_empty_name_defaults_to_unknown(self):
        records = [
            self._make_record(CURRENT_MINE_NAME=""),
        ]
        facilities = normalize_facilities(records)
        assert len(facilities) == 1
        assert facilities[0]["name"] == "Unknown"

    def test_multiple_mineral_matches(self):
        records = [
            self._make_record(
                PRIMARY_SIC="Uranium-Radium-Vanadium Ores",
                matched_minerals=["Uranium", "Vanadium"],
            ),
        ]
        facilities = normalize_facilities(records)
        assert len(facilities) == 1
        minerals = facilities[0]["mineral_match"]
        assert "Uranium" in minerals
        assert "Vanadium" in minerals

    def test_no_minerals_filtered(self):
        records = [
            self._make_record(
                PRIMARY_SIC="Dimension Stone",
                SECONDARY_SIC="",
                matched_minerals=[],
            ),
        ]
        facilities = normalize_facilities(records)
        assert len(facilities) == 0

    def test_expected_fields_present(self):
        """Verify all expected fields are in the output."""
        records = [self._make_record()]
        facilities = normalize_facilities(records)
        assert len(facilities) == 1
        f = facilities[0]
        expected_fields = [
            "id", "name", "operator", "commodity", "mineral_match",
            "state", "county", "lat", "lon", "employment",
            "status", "mine_type",
        ]
        for field in expected_fields:
            assert field in f, f"Missing field: {field}"

    def test_employee_count_parsed(self):
        records = [self._make_record(NO_EMPLOYEES="250", AVG_MINE_EMP_CNT="200")]
        facilities = normalize_facilities(records)
        assert facilities[0]["employment"] == 250  # NO_EMPLOYEES takes priority

    def test_employee_count_zero_when_empty(self):
        records = [self._make_record(NO_EMPLOYEES="", AVG_MINE_EMP_CNT="")]
        facilities = normalize_facilities(records)
        assert facilities[0]["employment"] == 0


# ---------------------------------------------------------------------------
# Defense programs tests
# ---------------------------------------------------------------------------

class TestDefensePrograms:

    def test_get_defense_programs_returns_list(self):
        programs = get_defense_programs()
        assert isinstance(programs, list)
        assert len(programs) == 10

    def test_program_has_required_fields(self):
        programs = get_defense_programs()
        for p in programs:
            assert "id" in p
            assert "name" in p
            assert "type" in p
            assert "prime_contractor" in p
            assert "materials" in p
            assert "material_details" in p
            assert isinstance(p["materials"], list)
            assert len(p["materials"]) > 0

    def test_f35_materials(self):
        programs = get_defense_programs()
        f35 = next(p for p in programs if p["id"] == "f35")
        assert "Titanium" in f35["materials"]
        assert "Gallium" in f35["materials"]

    def test_get_programs_for_titanium(self):
        results = get_programs_for_mineral("Titanium")
        assert len(results) > 0
        program_ids = [r["program_id"] for r in results]
        assert "f35" in program_ids
        assert "virginia-class" in program_ids
        assert "b21" in program_ids

    def test_get_programs_for_tungsten(self):
        results = get_programs_for_mineral("Tungsten")
        program_ids = [r["program_id"] for r in results]
        assert "patriot" in program_ids
        assert "abrams" in program_ids
        assert "155mm" in program_ids

    def test_get_programs_for_unknown_mineral(self):
        results = get_programs_for_mineral("Unobtainium")
        assert results == []

    def test_rare_earth_element_matches_rare_earths(self):
        """Individual REE elements should match programs requiring Rare Earths."""
        results = get_programs_for_mineral("Neodymium")
        assert len(results) > 0
        # F-35 requires Rare Earths, so Neodymium should match it
        program_ids = [r["program_id"] for r in results]
        assert "f35" in program_ids

    def test_program_result_has_material_role(self):
        results = get_programs_for_mineral("Gallium")
        assert len(results) > 0
        for r in results:
            assert "material_role" in r
            assert r["material_role"] != ""

    def test_antimony_matches_javelin_and_munitions(self):
        results = get_programs_for_mineral("Antimony")
        program_ids = [r["program_id"] for r in results]
        assert "javelin" in program_ids
        assert "gmlrs" in program_ids
        assert "155mm" in program_ids

    def test_all_material_details_keys_in_materials_list(self):
        """Every key in material_details should be in the materials list."""
        programs = get_defense_programs()
        for p in programs:
            for mat in p["material_details"]:
                assert mat in p["materials"], (
                    f"Program {p['id']}: material_details key '{mat}' "
                    f"not in materials list {p['materials']}"
                )
