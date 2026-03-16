"""Cross-sector dependency graph.

Maps which manufacturing sectors depend on which minerals,
and which minerals are required by which industrial applications.
"""

# Mineral → Manufacturing sector dependencies
# Maps mineral names to the NAICS sectors and specific applications that depend on them
#
# NAICS codes:
#   325 - Chemicals
#   327 - Nonmetallic Mineral Products
#   331 - Primary Metals
#   332 - Fabricated Metal Products
#   333 - Machinery
#   334 - Computer & Electronic Products
#   335 - Electrical Equipment
#   336 - Transportation Equipment

MINERAL_DEPENDENCIES = {
    # ── Original 17 minerals (expanded) ──────────────────────────────────
    "Gallium": {
        "sectors": ["334", "335"],
        "applications": ["Semiconductors (GaAs/GaN)", "Radar systems", "Electronic warfare", "5G infrastructure", "LED lighting"],
        "criticality": "critical",
        "note": "China controls 98% of gallium production. No near-term substitutes for GaAs/GaN in defense electronics.",
    },
    "Germanium": {
        "sectors": ["334", "327"],
        "applications": ["Fiber optics", "Infrared optics", "Night vision", "Satellite systems", "Solar cells"],
        "criticality": "critical",
        "note": "China controls ~60% of production. Critical for defense ISR systems and IR sensor windows.",
    },
    "Cobalt": {
        "sectors": ["336", "335", "331"],
        "applications": ["Jet engine superalloys", "Military batteries", "Armor plating", "Cemented carbides"],
        "criticality": "critical",
        "note": "DRC dominates mining (76%). China dominates refining. DRC export quotas create structural deficit.",
    },
    "Lithium": {
        "sectors": ["335", "336", "325"],
        "applications": ["Military batteries", "Ceramics armor", "Nuclear applications", "Lubricating greases"],
        "criticality": "critical",
        "note": "Battery-grade lithium increasingly constrained. Chile/Australia mine, China refines 65%+.",
    },
    "Titanium": {
        "sectors": ["336", "331", "325"],
        "applications": ["Aircraft frames", "Jet engines", "Armor", "Naval vessels", "Chemical processing"],
        "criticality": "critical",
        "note": "Russia was a major supplier. Aerospace depends heavily on titanium sponge. F-35 is 15% Ti by weight.",
    },
    "Tungsten": {
        "sectors": ["332", "336", "333"],
        "applications": ["Armor-piercing munitions", "Tooling and cutting tools", "Kinetic penetrators", "Electronics"],
        "criticality": "critical",
        "note": "China controls 84% of production. Essential for kinetic energy penetrators and cemented carbide tooling.",
    },
    "Chromium": {
        "sectors": ["331", "336", "332"],
        "applications": ["Stainless steel", "Superalloys", "Armor", "Corrosion-resistant coatings"],
        "criticality": "critical",
        "note": "Zero U.S. primary production. No substitutes in stainless steel or superalloys. South Africa 45% of ferrochrome.",
    },
    "Manganese": {
        "sectors": ["331", "335", "332"],
        "applications": ["Steel production", "Battery cathodes", "Aluminum alloys", "Munition shell steel"],
        "criticality": "high",
        "note": "100% imported. South Africa, Gabon, Australia are key sources. Essential for all steel production.",
    },
    "Niobium": {
        "sectors": ["331", "336", "335"],
        "applications": ["High-strength steel", "Jet engine superalloys", "Superconductors", "HSLA hull steel"],
        "criticality": "high",
        "note": "Brazil controls 85%+ of production. Single-source risk. Critical for submarine hull steel.",
    },
    "Tantalum": {
        "sectors": ["334", "336", "332"],
        "applications": ["Capacitors", "Jet engine blades", "Surgical instruments", "Chemical processing"],
        "criticality": "high",
        "note": "DRC and Rwanda are key sources. Conflict mineral regulation applies. Essential for defense electronics.",
    },
    "Graphite": {
        "sectors": ["335", "331", "327"],
        "applications": ["Battery anodes", "Nuclear reactor moderators", "Crucibles", "Carbon fiber composites"],
        "criticality": "high",
        "note": "China produces ~77% of natural graphite. Critical for EV battery and stealth composite supply chains.",
    },
    "Antimony": {
        "sectors": ["332", "325", "336"],
        "applications": ["Ammunition primers", "Flame retardants", "Lead-acid batteries", "IR detectors"],
        "criticality": "critical",
        "note": "China military end-use ban in force. Used in 200+ DOD ammunition types. Zero U.S. production since 2001.",
    },
    "Vanadium": {
        "sectors": ["331", "335", "336"],
        "applications": ["High-strength steel alloys", "Armor", "Energy storage (flow batteries)", "Aerospace Ti alloys"],
        "criticality": "moderate",
        "note": "China and Russia are major producers. Ti-6Al-4V alloy is primary aerospace titanium. Flow battery demand growing.",
    },
    "Beryllium": {
        "sectors": ["336", "334", "325"],
        "applications": ["Aerospace structures", "Nuclear weapons components", "X-ray windows", "Satellite mirrors"],
        "criticality": "critical",
        "note": "U.S. dominates via Materion Corp (60%+ global). Single-producer concentration risk. Irreplaceable in defense.",
    },
    "Nickel": {
        "sectors": ["331", "335", "336"],
        "applications": ["Superalloys", "Batteries", "Armor steel", "Submarine hulls (HY-80/100)"],
        "criticality": "high",
        "note": "Indonesia dominates new production. Class 1 nickel for batteries is constrained. Essential for naval vessels.",
    },
    "Aluminum": {
        "sectors": ["336", "331", "332"],
        "applications": ["Aircraft structures", "Armor", "Naval vessels", "Munitions casings", "Grid conductors"],
        "criticality": "high",
        "note": "Only 4 domestic smelters at 50% utilization. 47-60% import reliant. On all 4 federal critical mineral lists.",
    },
    "Uranium": {
        "sectors": ["325", "336"],
        "applications": ["Nuclear weapons", "Naval propulsion reactors", "Power generation", "DU armor"],
        "criticality": "critical",
        "note": "Kazakhstan is top producer. Russia controls enrichment. U.S. rebuilding domestic enrichment capacity.",
    },

    # ── Remaining 43 minerals ────────────────────────────────────────────

    "Arsenic": {
        "sectors": ["334", "325"],
        "applications": ["GaAs semiconductors", "Wood preservatives", "Pesticides", "LED manufacturing"],
        "criticality": "critical",
        "note": "100% import-dependent since 1985. China supplies 96% of arsenic metal. Essential for GaAs defense electronics.",
    },
    "Barite": {
        "sectors": ["325", "327"],
        "applications": ["Oil/gas drilling fluids", "Barium chemicals", "Medical imaging contrast", "Radiation shielding"],
        "criticality": "moderate",
        "note": "75%+ import reliant. Over 90% used in drilling. India (40%) and China (25%) dominate imports.",
    },
    "Bismuth": {
        "sectors": ["334", "332", "325"],
        "applications": ["Lead-free solder", "Pharmaceuticals", "Cosmetics", "Fusible alloys"],
        "criticality": "critical",
        "note": "China controls 80% production. 700% price surge in 2025. Leading impacted material in weapons systems by part count.",
    },
    "Boron": {
        "sectors": ["327", "331", "336"],
        "applications": ["Armor ceramics (B4C)", "NdFeB permanent magnets", "Nuclear shielding", "Fiberglass", "Agriculture"],
        "criticality": "high",
        "note": "U.S. supply depends on single Rio Tinto operation. China controls 80% of boron carbide for defense armor.",
    },
    "Cerium": {
        "sectors": ["336", "327", "325"],
        "applications": ["Catalytic converters", "Glass polishing for defense optics", "Diesel fuel additives", "UV filters"],
        "criticality": "moderate",
        "note": "Most abundant rare earth but China controls 80%+ processing. Essential for defense optics polishing.",
    },
    "Cesium": {
        "sectors": ["334", "325"],
        "applications": ["Atomic clocks (GPS/missile guidance)", "Drilling fluids (cesium formate)", "Photoelectric cells"],
        "criticality": "critical",
        "note": "Chinese company Sinomine controls both active global production facilities. 100% U.S. import dependent.",
    },
    "Copper": {
        "sectors": ["331", "332", "335", "336"],
        "applications": ["Electrical wiring", "Ammunition", "Heat exchangers", "Motor windings", "Naval systems"],
        "criticality": "high",
        "note": "45% import reliant. 65% from Chile. 50% Section 232 tariffs imposed Aug 2025. 24-year mine development timeline.",
    },
    "Dysprosium": {
        "sectors": ["334", "335", "336"],
        "applications": ["Heat-resistant NdFeB magnets", "Guided munitions", "Jet engine actuators", "EV motors"],
        "criticality": "critical",
        "note": "China controls 98% of processing. Military end-user export ban. Irreplaceable in high-temp permanent magnets.",
    },
    "Erbium": {
        "sectors": ["334", "335"],
        "applications": ["Fiber optic amplifiers (EDFA)", "Laser systems", "Nuclear applications", "Glass colorant"],
        "criticality": "high",
        "note": "Backbone of all long-distance fiber optic communications including military networks. China 85-90% processing.",
    },
    "Europium": {
        "sectors": ["334", "325"],
        "applications": ["Anti-counterfeiting phosphors", "Military displays", "Nuclear control rods", "X-ray screens"],
        "criticality": "high",
        "note": "Irreplaceable for anti-counterfeiting features in U.S. currency. China 85% processing. Military end-user ban.",
    },
    "Fluorspar": {
        "sectors": ["325", "331", "334"],
        "applications": ["Hydrofluoric acid", "Aluminum smelting flux", "Semiconductor etching", "Uranium enrichment"],
        "criticality": "high",
        "note": "100% import dependent for decades. Precursor to HF which underpins batteries, semiconductors, and aluminum.",
    },
    "Gadolinium": {
        "sectors": ["334", "336", "325"],
        "applications": ["Nuclear reactor shielding", "MRI contrast agents", "Sonar systems", "Magnetostrictive actuators"],
        "criticality": "high",
        "note": "China 85%+ processing. Used in submarine sonar, nuclear shielding, and MRI. Co-produced with other rare earths.",
    },
    "Hafnium": {
        "sectors": ["336", "331", "334"],
        "applications": ["Nuclear reactor control rods", "Superalloy additive", "Semiconductor gate dielectric", "Plasma cutting"],
        "criticality": "critical",
        "note": "Essential for Virginia/Columbia-class submarine reactor control rods. Co-produced with zirconium. Limited global supply.",
    },
    "Holmium": {
        "sectors": ["334", "335"],
        "applications": ["High-strength magnets", "Nuclear reactor components", "Laser systems", "Flux concentrators"],
        "criticality": "moderate",
        "note": "Strongest magnetic moment of any element. Used in specialized magnetic and nuclear applications. China 85%+ processing.",
    },
    "Indium": {
        "sectors": ["334", "335"],
        "applications": ["ITO display coatings", "Semiconductors (InSb IR detectors)", "Solders", "Solar cells (CIGS)"],
        "criticality": "high",
        "note": "China export controls imposed Feb 2025. Essential for cockpit displays (ITO) and IR missile seekers (InSb).",
    },
    "Iridium": {
        "sectors": ["334", "336", "325"],
        "applications": ["Spark plugs (jet engines)", "Crucibles", "Electrodes", "Catalysts", "Satellite thrusters"],
        "criticality": "moderate",
        "note": "South Africa dominates production. Used in jet engine spark plugs and satellite propulsion. Extremely rare.",
    },
    "Lanthanum": {
        "sectors": ["334", "336", "327"],
        "applications": ["Night vision optics", "Catalytic converters", "Battery alloys (NiMH)", "Camera lenses"],
        "criticality": "moderate",
        "note": "Most abundant light rare earth after cerium. Essential for night vision optics. China 80%+ processing.",
    },
    "Lead": {
        "sectors": ["332", "335", "331"],
        "applications": ["Ammunition", "Lead-acid batteries", "Radiation shielding", "Cable sheathing"],
        "criticality": "moderate",
        "note": "Domestic production significant but declining. Used in ammunition, military batteries, and nuclear shielding.",
    },
    "Lutetium": {
        "sectors": ["334", "325"],
        "applications": ["PET scan detectors", "LED phosphors", "Nuclear applications", "Catalysts"],
        "criticality": "moderate",
        "note": "Rarest and most expensive stable rare earth. Used in medical imaging and specialized nuclear applications.",
    },
    "Magnesium": {
        "sectors": ["336", "331", "332"],
        "applications": ["Aerospace alloy castings", "Military flares and incendiary", "Aluminum alloying", "Steel desulfurization"],
        "criticality": "high",
        "note": "China produces 84% of global supply. U.S. has one primary producer (US Magnesium). Essential for aerospace and munitions.",
    },
    "Metallurgical Coal": {
        "sectors": ["331"],
        "applications": ["Steel production (coke for blast furnaces)", "Carbon additives"],
        "criticality": "moderate",
        "note": "U.S. is a major producer and exporter. Essential for steelmaking — all military armor, hulls, and munitions need steel.",
    },
    "Neodymium": {
        "sectors": ["335", "334", "336"],
        "applications": ["NdFeB permanent magnets", "Guided munitions", "EV motors", "Wind turbines", "Headphones/speakers"],
        "criticality": "critical",
        "note": "China controls 85%+ processing. NdFeB magnets are in every guided weapon, jet engine, and submarine motor.",
    },
    "Palladium": {
        "sectors": ["336", "334", "325"],
        "applications": ["Catalytic converters", "Electronics", "Hydrogen purification", "Fuel cells", "Dental alloys"],
        "criticality": "moderate",
        "note": "Russia and South Africa produce 80%+ of global supply. Essential for catalytic converters and hydrogen economy.",
    },
    "Phosphate Rock": {
        "sectors": ["325"],
        "applications": ["Fertilizers", "Phosphoric acid", "Animal feed supplements", "Water treatment"],
        "criticality": "low",
        "note": "U.S. is a major producer (Florida, Idaho). Critical for food security. Morocco holds 70% of global reserves.",
    },
    "Platinum": {
        "sectors": ["336", "334", "325"],
        "applications": ["Catalytic converters", "Fuel cells", "Electronics", "Petroleum refining catalysts"],
        "criticality": "moderate",
        "note": "South Africa produces 72% of global supply. Essential for hydrogen fuel cells and catalytic converters.",
    },
    "Potash": {
        "sectors": ["325"],
        "applications": ["Fertilizers (potassium chloride)", "Chemical manufacturing", "Water softening"],
        "criticality": "low",
        "note": "Canada, Russia, Belarus dominate. Critical for agriculture/food security. U.S. imports ~93% of potash.",
    },
    "Praseodymium": {
        "sectors": ["335", "334", "336"],
        "applications": ["NdPr permanent magnets", "Aircraft engine alloys", "Ceramic colorants", "Arc carbons"],
        "criticality": "critical",
        "note": "Co-produced with neodymium (NdPr alloy). Essential component of all NdFeB permanent magnets for defense.",
    },
    "Rare Earths": {
        "sectors": ["334", "335", "336"],
        "applications": ["Permanent magnets", "Radar systems", "Guided munitions", "EV motors", "Wind turbines"],
        "criticality": "critical",
        "note": "China controls 85%+ of processing. Pentagon invested $400M in MP Materials. Suspension expires Nov 2026.",
    },
    "Rhenium": {
        "sectors": ["336", "331"],
        "applications": ["Single-crystal turbine blades", "Petroleum reforming catalysts", "Jet engine superalloys"],
        "criticality": "critical",
        "note": "Only ~60 tonnes produced annually worldwide. Chile and U.S. lead production. Irreplaceable in single-crystal turbine blades.",
    },
    "Rhodium": {
        "sectors": ["336", "334", "325"],
        "applications": ["Catalytic converters", "Electrical contacts", "Glass manufacturing", "Chemical catalysts"],
        "criticality": "moderate",
        "note": "South Africa produces 80%+ of global supply. Extremely rare PGM. Used in autocatalysts and electronics.",
    },
    "Rubidium": {
        "sectors": ["334"],
        "applications": ["Atomic clocks", "GPS systems", "Fiber optic telecoms", "Medical imaging"],
        "criticality": "moderate",
        "note": "Similar strategic applications to cesium in atomic clocks. Limited global production, mostly from lepidolite.",
    },
    "Ruthenium": {
        "sectors": ["334", "335", "325"],
        "applications": ["Hard disk coatings", "Chip resistors", "Fuel cells", "Chemical catalysts", "Solar cells"],
        "criticality": "moderate",
        "note": "South Africa produces 93% of global supply. Critical for data storage and emerging hydrogen economy.",
    },
    "Samarium": {
        "sectors": ["335", "334", "336"],
        "applications": ["SmCo permanent magnets", "Radar systems", "Guided missiles", "Jet engine actuators"],
        "criticality": "high",
        "note": "SmCo magnets operate at higher temperatures than NdFeB. Used in missile seekers and radar gimbals.",
    },
    "Scandium": {
        "sectors": ["336", "331"],
        "applications": ["Aluminum-scandium alloys", "Solid oxide fuel cells", "Sports equipment", "Aerospace castings"],
        "criticality": "moderate",
        "note": "Extremely limited production. Al-Sc alloys are lightweight and weldable for aerospace. China export controls applied.",
    },
    "Silicon": {
        "sectors": ["334", "331", "335"],
        "applications": ["Semiconductors", "Solar cells", "Aluminum alloys", "Silicones", "Ferrosilicon for steelmaking"],
        "criticality": "high",
        "note": "Foundation of all electronics. U.S. has some production but imports high-purity polysilicon. China dominates solar-grade.",
    },
    "Silver": {
        "sectors": ["334", "335", "332"],
        "applications": ["Electronics (contacts, conductors)", "Solar panels", "Brazing alloys", "Antimicrobial coatings"],
        "criticality": "moderate",
        "note": "Mexico, Peru, China lead production. Highest electrical conductivity of any element. Essential for electronics and solar.",
    },
    "Tellurium": {
        "sectors": ["334", "335"],
        "applications": ["CdTe solar cells", "Thermoelectric devices", "Infrared detectors", "Alloying agent"],
        "criticality": "high",
        "note": "China export controls imposed Feb 2025. 60-70% of supply from China. Essential for CdTe solar and IR detectors.",
    },
    "Terbium": {
        "sectors": ["335", "334", "336"],
        "applications": ["Heat-resistant magnets", "Sonar systems", "Radar actuators", "Green phosphors"],
        "criticality": "critical",
        "note": "Co-additive with dysprosium for NdFeB magnet thermal stability. China 98% processing. Military end-user ban.",
    },
    "Thulium": {
        "sectors": ["334", "325"],
        "applications": ["Portable X-ray machines", "Laser systems", "Nuclear applications", "High-temperature superconductors"],
        "criticality": "moderate",
        "note": "Rarest naturally occurring lanthanide. Military X-ray and laser applications. China 85%+ processing.",
    },
    "Tin": {
        "sectors": ["334", "332", "331"],
        "applications": ["Solder (electronics assembly)", "Tin plate (food cans)", "Bronze alloys", "Chemicals"],
        "criticality": "high",
        "note": "China and Indonesia produce 60%+ of global supply. Lead-free solder mandate makes tin essential for all electronics.",
    },
    "Ytterbium": {
        "sectors": ["334", "335"],
        "applications": ["Fiber lasers", "Stress gauges", "Metallurgical applications", "Quantum computing"],
        "criticality": "moderate",
        "note": "Used in high-power fiber lasers for military and industrial applications. China 85%+ processing.",
    },
    "Yttrium": {
        "sectors": ["334", "336", "331"],
        "applications": ["Thermal barrier coatings (YSZ)", "LED phosphors", "Superconductors", "Jet engine coatings"],
        "criticality": "high",
        "note": "Yttria-stabilized zirconia coatings on jet engine turbine blades. China export controls. Co-produced with heavy RE.",
    },
    "Zinc": {
        "sectors": ["331", "332", "336"],
        "applications": ["Galvanizing steel", "Brass ammunition components", "Die casting", "Zinc-carbon batteries"],
        "criticality": "moderate",
        "note": "U.S. is a significant producer but imports ~57%. Essential for corrosion protection on all military steel and brass ammo.",
    },
    "Zirconium": {
        "sectors": ["336", "331", "327"],
        "applications": ["Nuclear fuel cladding", "Ceramics", "Corrosion-resistant alloys", "Foundry molds"],
        "criticality": "critical",
        "note": "Essential for Virginia/Columbia-class reactor fuel cladding. Transparent to neutrons. Co-produced with hafnium.",
    },
}

# NAICS sector names for display
NAICS_NAMES = {
    "325": "Chemicals",
    "327": "Nonmetallic Mineral Products",
    "331": "Primary Metals",
    "332": "Fabricated Metal Products",
    "333": "Machinery",
    "334": "Computer & Electronic Products",
    "335": "Electrical Equipment",
    "336": "Transportation Equipment",
}


def build_dependency_graph() -> list[dict]:
    """Build the cross-sector dependency graph."""
    dependencies = []

    for mineral, info in MINERAL_DEPENDENCIES.items():
        for naics in info["sectors"]:
            sector_name = NAICS_NAMES.get(naics, naics)
            dependencies.append({
                "from": {"sector": "manufacturing", "entity": sector_name, "naics": naics},
                "to": {"sector": "metals-mining", "entity": mineral},
                "relationship": "requires",
                "criticality": info["criticality"],
                "applications": info["applications"],
                "note": info["note"],
            })

    return dependencies


def get_minerals_for_sector(naics_code: str) -> list[dict]:
    """Get all minerals required by a given manufacturing sector."""
    results = []
    for mineral, info in MINERAL_DEPENDENCIES.items():
        if naics_code in info["sectors"]:
            results.append({
                "mineral": mineral,
                "applications": info["applications"],
                "criticality": info["criticality"],
                "note": info["note"],
            })
    return sorted(results, key=lambda x: {"critical": 0, "high": 1, "moderate": 2, "low": 3}[x["criticality"]])


def get_sectors_for_mineral(mineral_name: str) -> list[dict]:
    """Get all manufacturing sectors that depend on a given mineral."""
    info = MINERAL_DEPENDENCIES.get(mineral_name)
    if not info:
        return []
    return [
        {"naics": naics, "name": NAICS_NAMES.get(naics, naics)}
        for naics in info["sectors"]
    ]


def build_cross_sector_data() -> dict:
    """Build the full cross-sector dataset for export."""
    dependencies = build_dependency_graph()

    # Summary stats
    minerals_with_deps = len(MINERAL_DEPENDENCIES)
    critical_deps = [d for d in dependencies if d["criticality"] == "critical"]
    sectors_affected = set()
    for d in dependencies:
        sectors_affected.add(d["from"]["naics"])

    return {
        "sector": "cross-sector",
        "summary": {
            "total_dependencies": len(dependencies),
            "critical_dependencies": len(critical_deps),
            "minerals_mapped": minerals_with_deps,
            "sectors_affected": len(sectors_affected),
        },
        "dependencies": dependencies,
    }
