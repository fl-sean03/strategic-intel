"""Curated defense program to material dependency data.

Maps major U.S. defense programs to the critical minerals they require,
with details on specific material applications, production rates, and costs.
"""

DEFENSE_PROGRAMS = [
    {
        "id": "f35",
        "name": "F-35 Lightning II",
        "type": "Aircraft",
        "prime_contractor": "Lockheed Martin",
        "materials": ["Titanium", "Gallium", "Germanium", "Cobalt", "Lithium", "Rare Earths"],
        "material_details": {
            "Titanium": "Airframe structural components, 15% of airframe by weight",
            "Gallium": "GaAs in AESA radar (AN/APG-81), electronic warfare suite",
            "Germanium": "Infrared sensor windows (EOTS, DAS)",
            "Cobalt": "F135 engine superalloys",
            "Lithium": "Onboard battery systems",
            "Rare Earths": "Permanent magnets in actuators, guidance",
        },
        "annual_production": "~156 aircraft/year",
        "unit_cost": "$80M (LRIP)",
        "notes": "Most complex weapons system ever built. 1,700+ suppliers.",
    },
    {
        "id": "virginia-class",
        "name": "Virginia-class Submarine",
        "type": "Naval",
        "prime_contractor": "General Dynamics / HII",
        "materials": ["Nickel", "Chromium", "Cobalt", "Titanium", "Copper", "Rare Earths"],
        "material_details": {
            "Nickel": "HY-80/HY-100 hull steel",
            "Chromium": "Corrosion-resistant steel alloys",
            "Cobalt": "High-temperature engine components",
            "Titanium": "Seawater systems, sonar dome",
            "Copper": "Electrical systems, 200+ miles of cable per boat",
            "Rare Earths": "Sonar transducers, electric motors",
        },
        "annual_production": "2 per year (target)",
        "unit_cost": "$3.4B",
        "notes": "Industrial base cannot currently meet 2/year rate.",
    },
    {
        "id": "jltv",
        "name": "Joint Light Tactical Vehicle (JLTV)",
        "type": "Ground Vehicle",
        "prime_contractor": "Oshkosh Defense",
        "materials": ["Aluminum", "Manganese", "Chromium", "Lithium"],
        "material_details": {
            "Aluminum": "Armor and structural components",
            "Manganese": "High-strength steel armor",
            "Chromium": "Armor steel alloy",
            "Lithium": "Battery systems",
        },
        "annual_production": "~2,700/year",
        "unit_cost": "$0.4M",
        "notes": "Replacing HMMWV fleet. 49,099 total program.",
    },
    {
        "id": "patriot",
        "name": "Patriot Air Defense (PAC-3 MSE)",
        "type": "Missile Defense",
        "prime_contractor": "Lockheed Martin / RTX",
        "materials": ["Gallium", "Germanium", "Tungsten", "Tantalum", "Rare Earths"],
        "material_details": {
            "Gallium": "GaAs in phased array radar",
            "Germanium": "Infrared seeker windows",
            "Tungsten": "Kinetic warhead fragments",
            "Tantalum": "Capacitors in electronics",
            "Rare Earths": "Guidance system magnets",
        },
        "annual_production": "~550 MSE interceptors/year",
        "unit_cost": "$4M per interceptor",
        "notes": "Demand surged post-Ukraine. Production expanding.",
    },
    {
        "id": "abrams",
        "name": "M1A2 Abrams SEPv3",
        "type": "Ground Vehicle",
        "prime_contractor": "General Dynamics Land Systems",
        "materials": ["Tungsten", "Chromium", "Nickel", "Uranium", "Cobalt"],
        "material_details": {
            "Tungsten": "Armor-piercing ammunition (M829 APFSDS)",
            "Chromium": "Armor steel alloys",
            "Nickel": "Armor and engine superalloys",
            "Uranium": "Depleted uranium armor composite",
            "Cobalt": "AGT1500 turbine engine",
        },
        "annual_production": "~30 new + upgrades",
        "unit_cost": "$10M (new)",
        "notes": "Lima Army Tank Plant is sole source.",
    },
    {
        "id": "javelin",
        "name": "Javelin Anti-Tank Missile",
        "type": "Missile",
        "prime_contractor": "RTX / Lockheed Martin",
        "materials": ["Germanium", "Gallium", "Tantalum", "Antimony", "Rare Earths"],
        "material_details": {
            "Germanium": "IR seeker window",
            "Gallium": "Electronic components",
            "Tantalum": "Capacitors",
            "Antimony": "Warhead liner",
            "Rare Earths": "Guidance magnets",
        },
        "annual_production": "~4,000/year (target, up from 2,100)",
        "unit_cost": "$0.18M per missile",
        "notes": "Ukraine war depleted stockpiles. Production doubling.",
    },
    {
        "id": "gmlrs",
        "name": "GMLRS / HIMARS Ammunition",
        "type": "Munitions",
        "prime_contractor": "Lockheed Martin",
        "materials": ["Tungsten", "Antimony", "Aluminum", "Tantalum"],
        "material_details": {
            "Tungsten": "Fragmentation warhead elements",
            "Antimony": "Propellant additives",
            "Aluminum": "Rocket motor casing",
            "Tantalum": "Electronics",
        },
        "annual_production": "~10,000 rockets/year (expanding)",
        "unit_cost": "$0.11M per rocket",
        "notes": "Expanding to 14,000/year by 2025. Critical Ukraine munition.",
    },
    {
        "id": "155mm",
        "name": "155mm Artillery Shell",
        "type": "Munitions",
        "prime_contractor": "General Dynamics OTS / multiple",
        "materials": ["Tungsten", "Antimony", "Manganese", "Copper"],
        "material_details": {
            "Tungsten": "Penetrator cores (Excalibur variant)",
            "Antimony": "Primer compound, propellant",
            "Manganese": "Shell steel",
            "Copper": "Rotating band, fuze components",
        },
        "annual_production": "~100,000/month (target, was 14,000)",
        "unit_cost": "$3K-$68K (standard to Excalibur)",
        "notes": "Massive ramp-up underway. New Mesquite TX plant.",
    },
    {
        "id": "ddg51",
        "name": "Arleigh Burke-class Destroyer (DDG-51)",
        "type": "Naval",
        "prime_contractor": "HII / General Dynamics BIW",
        "materials": ["Nickel", "Chromium", "Copper", "Aluminum", "Cobalt", "Rare Earths"],
        "material_details": {
            "Nickel": "Hull and structural steel",
            "Chromium": "Corrosion-resistant alloys",
            "Copper": "Electrical systems, 300+ miles cable",
            "Aluminum": "Superstructure",
            "Cobalt": "Gas turbine engines (LM2500)",
            "Rare Earths": "SPY-6 radar, Aegis electronics",
        },
        "annual_production": "2-3 per year",
        "unit_cost": "$2.2B (Flight III)",
        "notes": "Backbone of surface fleet. SPY-6 radar is GaN (Gallium Nitride).",
    },
    {
        "id": "b21",
        "name": "B-21 Raider Stealth Bomber",
        "type": "Aircraft",
        "prime_contractor": "Northrop Grumman",
        "materials": ["Titanium", "Cobalt", "Gallium", "Germanium", "Graphite", "Rare Earths"],
        "material_details": {
            "Titanium": "Structural components",
            "Cobalt": "Engine superalloys",
            "Gallium": "Radar and EW systems (GaN)",
            "Germanium": "Sensor windows",
            "Graphite": "Composite materials (carbon fiber)",
            "Rare Earths": "Avionics, permanent magnets",
        },
        "annual_production": "Classified (est. 3-5/year at full rate)",
        "unit_cost": "$700M+ (est.)",
        "notes": "100 planned. First flight Dec 2023. Most classified program.",
    },
]


def get_defense_programs() -> list[dict]:
    """Return the full list of curated defense programs with material dependencies.

    Returns:
        List of defense program dicts, each containing id, name, type,
        prime_contractor, materials, material_details, annual_production,
        unit_cost, and notes.
    """
    return DEFENSE_PROGRAMS


def get_programs_for_mineral(mineral_name: str) -> list[dict]:
    """Get all defense programs that depend on a given mineral.

    Performs case-insensitive matching against the materials list of each
    program. Also matches "Rare Earths" for individual rare earth elements.

    Args:
        mineral_name: Canonical mineral name (e.g., "Titanium", "Gallium").

    Returns:
        List of program dicts that require the specified mineral,
        each augmented with a 'material_role' field describing
        the specific use of that mineral in the program.
    """
    # Individual rare earth elements should also match "Rare Earths"
    RARE_EARTH_ELEMENTS = {
        "Cerium", "Dysprosium", "Erbium", "Europium", "Gadolinium",
        "Holmium", "Lanthanum", "Lutetium", "Neodymium", "Praseodymium",
        "Samarium", "Scandium", "Terbium", "Thulium", "Ytterbium", "Yttrium",
    }

    search_names = {mineral_name}
    if mineral_name in RARE_EARTH_ELEMENTS:
        search_names.add("Rare Earths")
    if mineral_name == "Rare Earths":
        search_names.add("Rare Earths")

    results = []
    for program in DEFENSE_PROGRAMS:
        program_materials_lower = {m.lower() for m in program["materials"]}
        matched_name = None
        for name in search_names:
            if name.lower() in program_materials_lower:
                matched_name = name
                break

        if matched_name:
            result = {
                "program_id": program["id"],
                "program_name": program["name"],
                "type": program["type"],
                "prime_contractor": program["prime_contractor"],
                "material_role": program["material_details"].get(matched_name, "Used in system"),
                "annual_production": program["annual_production"],
                "unit_cost": program["unit_cost"],
                "notes": program["notes"],
            }
            results.append(result)

    return results
