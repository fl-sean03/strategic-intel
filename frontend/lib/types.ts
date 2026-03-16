// Shared types for all sector data

export interface SourceLink {
  label: string;
  url: string;
}

export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';

export type LensId = 'manufacturing' | 'energy' | 'logistics' | 'metals-mining' | 'telecom' | 'technology' | 'all';

export interface Lens {
  id: LensId;
  label: string;
  description: string;
  color: string;
}

// --- Metals & Mining Types (migrated from v1) ---

export interface Producer {
  country: string;
  country_iso: string;
  share: number;
  production: number | null;
}

export interface SupplyChainStage {
  global_production?: number | null;
  unit?: string;
  top_producers?: Producer[];
  top_processors?: Producer[];
  top_refiners?: Producer[];
  data_quality: string;
  note?: string;
}

export interface MineralTrade {
  net_import_reliance: number | null;
  primary_import_source: string;
  major_import_sources: string[];
  apparent_consumption: number | null;
}

export interface RiskScores {
  concentration_risk: number;
  adversary_dependency: number;
  import_dependency: number;
  defense_criticality: number;
  substitutability: number;
  single_source_risk: boolean;
  overall_risk: number;
}

export interface Mineral {
  id: string;
  name: string;
  critical_mineral: boolean;
  critical_mineral_year: number;
  primary_applications: string;
  defense_applications: string[];
  defense_criticality_score: number;
  supply_chain: {
    mining: SupplyChainStage;
    processing: SupplyChainStage;
    refining: SupplyChainStage;
  };
  trade: MineralTrade;
  substitutability_score: number;
  risk_scores: RiskScores;
}

export interface MetalsMiningData {
  sector: 'metals-mining';
  generated_at: string;
  summary: {
    total_minerals: number;
    high_risk_count: number;
    single_source_count: number;
    adversary_dependent_count: number;
    avg_overall_risk: number;
  };
  minerals: Mineral[];
  risk_distribution: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
}

// --- Manufacturing Types ---

export interface ManufacturingSector {
  naics_code: string;
  name: string;
  capacity_utilization: number | null;
  employment: number | null;
  employment_trend: number | null;  // % change over 3 years
  value_of_shipments: number | null;
  health_score: number;
  geographic_distribution: StateEmployment[];
  defense_contracts_total: number;
}

export interface StateEmployment {
  state_fips: string;
  state_name: string;
  state_abbrev: string;
  employment: number;
  share: number;  // share of national employment
}

export interface DefenseContract {
  state_abbrev: string;
  state_name: string;
  total_amount: number;
  per_capita: number;
}

export interface ShipbuildingComparison {
  country: string;
  country_iso: string;
  active_shipyards: number;
  vessels_on_order: number;
  global_share_pct: number;
}

export interface MunitionsItem {
  name: string;
  current_rate: string;
  target_rate: string;
  gap_severity: 'critical' | 'severe' | 'moderate' | 'low';
  notes: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface InternationalComparison {
  country: string;
  country_iso: string;
  manufacturing_value_added: number | null;
  manufacturing_pct_gdp: number | null;
}

export interface ManufacturingData {
  sector: 'manufacturing';
  generated_at: string;
  data_freshness: Record<string, string>;
  summary: {
    total_employment: number;
    capacity_utilization: number;
    headline_stat: string;
  };
  sectors: ManufacturingSector[];
  defense_contracts: DefenseContract[];
  shipbuilding: ShipbuildingComparison[];
  munitions: MunitionsItem[];
  international: InternationalComparison[];
}

// --- Platform Stats ---

export interface PlatformStats {
  generated_at: string;
  metals_mining: {
    total_minerals: number;
    high_risk_count: number;
    single_source_count: number;
    avg_overall_risk: number;
  };
  manufacturing: {
    total_employment: number;
    capacity_utilization: number;
    defense_contract_total: number;
  };
  headline_stats: {
    label: string;
    value: string;
    subtext: string;
  }[];
}

// --- Cross-sector ---

export interface Dependency {
  from: { sector: string; entity: string; naics?: string };
  to: { sector: string; entity: string };
  relationship: string;
  criticality: 'critical' | 'high' | 'moderate' | 'low';
  applications?: string[];
  note?: string;
}

export interface CrossSectorData {
  summary?: {
    total_dependencies: number;
    critical_dependencies: number;
    minerals_mapped: number;
    sectors_affected: number;
  };
  dependencies: Dependency[];
}

// --- Facilities (MSHA Mine Data) ---

export interface Facility {
  id: string;
  name: string;
  operator: string;
  commodity: string;
  mineral_match: string[];  // which of our 60 minerals this maps to
  state: string;
  county: string;
  lat: number;
  lon: number;
  employment: number;
  status: string;  // Active, Intermittent, etc.
  mine_type: string;  // Surface, Underground, etc.
}

// --- Shipyards ---

export interface Shipyard {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
  country_iso: string;
  type: 'military' | 'commercial' | 'dual';
  owner: string;
  capabilities: string[];
  employees: number;
  source_url?: string;
}

// --- Investments ---

export interface Investment {
  id: string;
  program: string;  // DOE LPO, CHIPS Act, DPA Title III, IRA, Army Modernization, Navy
  type: string;      // Loan Guarantee, Grant, Tax Credit, Direct Investment
  company: string;
  project: string;
  amount: number;
  location: {
    state: string;
    lat: number;
    lon: number;
  };
  mineral: string | null;
  status: string;
  date: string;
  notes: string;
  source_url?: string;
}

// --- Defense Programs ---

export interface DefenseProgram {
  id: string;
  name: string;
  type: string;  // Aircraft, Naval, Ground Vehicle, Missile, Munitions
  prime_contractor: string;
  materials: string[];
  material_details: Record<string, string>;
  annual_production: string;
  unit_cost: string;
  notes: string;
  source_urls?: SourceLink[];
}

// --- Layer Visibility ---

export interface LayerVisibility {
  facilities: boolean;
  shipyards: boolean;
  investments: boolean;
  tradeFlows: boolean;
  usStates: boolean;
}

// --- Intelligence Alerts ---

export interface IntelAlert {
  headline: string;
  date: string;
  source_url?: string;
  minerals_affected: string[];
  sectors_affected: string[];
  severity: 'critical' | 'high' | 'moderate' | 'low';
  summary: string;
}

// --- Energy Sector ---

export interface EnergyFuel {
  fuel: string;
  capacity_gw: number;
  generation_twh: number;
  share_pct: number;
  trend: string;
  color: string;
}

export interface EnergyFacility {
  name: string;
  state: string;
  lat: number;
  lon: number;
  type: string;
  capacity_mw: number;
  operator: string;
  notes: string;
}

export interface EnergyData {
  sector: 'energy';
  summary: {
    total_capacity_gw: number;
    renewable_share_pct: number;
    nuclear_share_pct: number;
    natural_gas_share_pct: number;
    coal_share_pct: number;
    headline: string;
  };
  generation_by_fuel: EnergyFuel[];
  key_facilities: EnergyFacility[];
  battery_minerals: {
    note: string;
    dependencies: { mineral: string; use: string; us_import_reliance_pct: number; top_source: string }[];
  };
  grid_challenges: { issue: string; severity: string; description: string }[];
  source_urls: SourceLink[];
}

// --- Logistics Sector ---

export interface Chokepoint {
  name: string;
  lat: number;
  lon: number;
  daily_vessels: number;
  oil_flow_mbd: number;
  trade_value_pct: number;
  risk: 'critical' | 'high' | 'moderate' | 'low';
  notes: string;
}

export interface Port {
  name: string;
  country: string;
  country_iso: string;
  lat: number;
  lon: number;
  teu_millions: number;
  rank_global: number;
  type: 'container' | 'mixed' | 'military';
  notes?: string;
}

export interface MerchantFleet {
  country: string;
  country_iso: string;
  vessels: number;
  dwt_millions: number;
  global_share_pct: number;
  notes?: string;
}

export interface LogisticsData {
  sector: 'logistics';
  summary: {
    us_flagged_vessels: number;
    china_flagged_vessels: number;
    global_fleet_size: number;
    us_merchant_fleet_rank: number;
    headline: string;
  };
  chokepoints: Chokepoint[];
  major_ports: Port[];
  merchant_fleet_comparison: MerchantFleet[];
  strategic_sealift: {
    ready_reserve_force: number;
    military_sealift_command: number;
    days_to_activate: string;
    capacity_assessment: string;
    notes: string;
  };
  source_urls: SourceLink[];
}

// --- Telecom & Space ---

export interface SubmarineCable {
  name: string;
  from: string;
  to: string;
  length_km: number;
  capacity_tbps: number;
  owner: string;
  year: number;
  lat_from: number;
  lon_from: number;
  lat_to: number;
  lon_to: number;
}

export interface SatelliteConstellation {
  name: string;
  country: string;
  country_iso: string;
  operator: string;
  satellites_deployed: number;
  satellites_planned: number;
  orbit: string;
  purpose: string;
  status: string;
}

export interface TelecomData {
  sector: 'telecom';
  summary: {
    submarine_cables: number;
    total_cable_length_km: number;
    satellite_constellations: number;
    us_5g_coverage_pct: number;
    headline: string;
  };
  key_cables: SubmarineCable[];
  satellite_constellations: SatelliteConstellation[];
  vulnerabilities: { issue: string; severity: string; description: string }[];
  source_urls: SourceLink[];
}

// --- Technology & R&D ---

export interface TechCompetition {
  technology: string;
  us_position: string;
  china_position: string;
  trend: string;
  defense_relevance: string;
  risk: 'critical' | 'high' | 'moderate' | 'low';
}

export interface RdSpending {
  entity: string;
  amount_b: number;
  focus: string;
  source: string;
}

export interface TechnologyData {
  sector: 'technology';
  summary: {
    dod_rd_budget_b: number;
    sbir_awards_annual: number;
    us_defense_patents_annual: number;
    critical_tech_areas: number;
    headline: string;
  };
  tech_competition: TechCompetition[];
  rd_spending: RdSpending[];
  top_defense_rd_states: { state: string; amount_b: number; focus: string }[];
  source_urls: SourceLink[];
}

// --- Intelligence Reports ---

export interface IntelligenceReport {
  id: string;
  category: string;
  subject: string;
  generated_at: string;
  generated_by: string;
  executive_summary: string;
  key_findings: {
    headline: string;
    detail: string;
    severity: 'critical' | 'high' | 'moderate' | 'low';
    source_url?: string;
  }[];
  recent_developments: {
    date: string;
    headline: string;
    summary: string;
    source_url: string;
    impact: string;
  }[];
  risk_assessment: {
    current_risk: string;
    trend: 'worsening' | 'stable' | 'improving';
    key_drivers: string[];
    mitigation_actions: string[];
  };
  sources: {
    title: string;
    url: string;
    accessed: string;
    type: 'government' | 'industry' | 'academic' | 'news';
  }[];
}

// --- Supply Chain Notes (per-mineral intelligence) ---

export interface SupplyChainNote {
  us_producers: { company: string; location: string; notes: string }[];
  processing_status: string;
  recent_changes: string;
  government_support: string;
  key_vulnerability: string;
  source_report: string;
}

export type SupplyChainNotes = Record<string, SupplyChainNote>;

// --- Country Centroids ---

export type CountryCentroids = Record<string, [number, number]>;

// --- Knowledge Graph ---

export interface GraphEntity {
  id: string;
  type: string;
  name: string;
  slug: string;
}

export interface GraphRelationship {
  from: string;
  to: string;
  type: string;
  detail?: string;
  strength?: number;
}

export interface GraphEntitiesFile {
  total: number;
  by_type: Record<string, number>;
  entities: GraphEntity[];
}

export interface GraphRelationshipsFile {
  total: number;
  by_type: Record<string, number>;
  relationships: GraphRelationship[];
}

export interface KnowledgeGraph {
  entities: GraphEntitiesFile;
  relationships: GraphRelationshipsFile;
}
