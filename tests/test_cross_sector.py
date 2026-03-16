"""Tests for cross-sector dependency graph."""
from pipeline.cross_sector.dependencies import (
    build_dependency_graph, get_minerals_for_sector,
    get_sectors_for_mineral, build_cross_sector_data,
)


def test_dependency_graph_not_empty():
    deps = build_dependency_graph()
    assert len(deps) > 0


def test_dependencies_have_required_fields():
    deps = build_dependency_graph()
    for d in deps:
        assert "from" in d
        assert "to" in d
        assert "criticality" in d
        assert d["criticality"] in ("critical", "high", "moderate", "low")


def test_gallium_depends_on_semiconductors():
    sectors = get_sectors_for_mineral("Gallium")
    naics_codes = [s["naics"] for s in sectors]
    assert "334" in naics_codes  # Computer & Electronic Products


def test_transportation_needs_titanium():
    minerals = get_minerals_for_sector("336")
    mineral_names = [m["mineral"] for m in minerals]
    assert "Titanium" in mineral_names


def test_tungsten_in_fabricated_metals():
    minerals = get_minerals_for_sector("332")
    mineral_names = [m["mineral"] for m in minerals]
    assert "Tungsten" in mineral_names


def test_minerals_sorted_by_criticality():
    minerals = get_minerals_for_sector("336")
    criticality_order = {"critical": 0, "high": 1, "moderate": 2, "low": 3}
    scores = [criticality_order[m["criticality"]] for m in minerals]
    assert scores == sorted(scores)


def test_unknown_mineral_returns_empty():
    assert get_sectors_for_mineral("Unobtainium") == []


def test_cross_sector_data_structure():
    data = build_cross_sector_data()
    assert "summary" in data
    assert "dependencies" in data
    assert data["summary"]["total_dependencies"] > 0
    assert data["summary"]["critical_dependencies"] > 0
    assert data["summary"]["minerals_mapped"] > 10
