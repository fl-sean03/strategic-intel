'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, ArcLayer, GeoJsonLayer } from '@deck.gl/layers';
import { MAP_STYLE_LIGHT, MAP_STYLE_DARK, INITIAL_VIEW, ISO_NUMERIC_TO_ALPHA2 } from '@/lib/constants';
import type {
  LensId, MetalsMiningData, ManufacturingData, EnergyData, LogisticsData,
  TelecomData, TechnologyData,
  Facility, Shipyard, Investment, LayerVisibility, CountryCentroids, Mineral,
  EnergyFacility, Chokepoint, Port, SubmarineCable,
} from '@/lib/types';
import { commodityColor, NAVY_RGBA, GREEN_INVESTMENT, hexToRGBA } from '@/lib/colorUtils';
import { buildTradeFlowArcs, arcWidth, arcColor, type TradeArc } from '@/lib/buildTradeFlowArcs';
import * as topojson from 'topojson-client';

interface MapViewProps {
  activeLens: LensId;
  metalsMiningData: MetalsMiningData | null;
  manufacturingData: ManufacturingData | null;
  energyData?: EnergyData | null;
  logisticsData?: LogisticsData | null;
  telecomData?: TelecomData | null;
  technologyData?: TechnologyData | null;
  selectedMineral?: Mineral | null;
  facilities?: Facility[];
  shipyards?: Shipyard[];
  investments?: Investment[];
  countryCentroids?: CountryCentroids;
  layerVisibility?: LayerVisibility;
  usStatesGeo?: any;
  dark?: boolean;
  onCountryClick?: (countryIso: string, countryName: string) => void;
  onFacilityClick?: (facility: Facility) => void;
}

interface HoverInfo {
  x: number;
  y: number;
  object: any;
  layer: string;
}

export default function MapView({
  activeLens,
  metalsMiningData,
  manufacturingData,
  energyData,
  logisticsData,
  telecomData,
  technologyData,
  selectedMineral,
  facilities,
  shipyards,
  investments,
  countryCentroids,
  layerVisibility,
  usStatesGeo,
  dark,
  onCountryClick,
  onFacilityClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [isGlobe, setIsGlobe] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [styleVersion, setStyleVersion] = useState(0);
  const [zoom, setZoom] = useState(INITIAL_VIEW.zoom);
  const layersAdded = useRef(false);

  // Unified tooltip state — ONE source of truth for all hover tooltips
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  // Ref tracks whether a deck.gl feature is currently hovered (wins over country)
  const deckHovering = useRef(false);

  // Stable callbacks for deck.gl hover — sets deckHovering ref + hoverInfo state
  const onDeckHover = useCallback((layer: string) => (info: any) => {
    if (info.object) {
      deckHovering.current = true;
      const obj = info.object.properties ?? info.object;
      setHoverInfo({ x: info.x, y: info.y, object: obj, layer });
    } else {
      deckHovering.current = false;
      setHoverInfo((prev) => prev?.layer === layer ? null : prev);
    }
  }, []);

  // Stable ref for country hover data builder (avoids stale closures)
  const lensDataRef = useRef({ activeLens, metalsMiningData, manufacturingData });
  lensDataRef.current = { activeLens, metalsMiningData, manufacturingData };

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: dark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT,
        center: INITIAL_VIEW.center,
        zoom: INITIAL_VIEW.zoom,
        pitch: INITIAL_VIEW.pitch,
        attributionControl: false,
        failIfMajorPerformanceCaveat: false,
      } as any);
    } catch (e) {
      console.error('Failed to create map:', e);
      setWebglError(true);
      return;
    }

    map.on('style.load', () => {
      try {
        (map as any).setProjection({ type: 'globe' });
      } catch {}
    });

    const canvas = map.getCanvas();
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
    });
    canvas.addEventListener('webglcontextrestored', () => {});

    map.on('error', (e) => {
      if (e.error?.message?.includes('WebGL') || e.error?.message?.includes('context')) {
        setWebglError(true);
      }
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    const overlay = new MapboxOverlay({ interleaved: false, layers: [] });
    map.addControl(overlay as any);
    overlayRef.current = overlay;

    map.on('load', () => setMapLoaded(true));

    // Track zoom level for dynamic marker scaling
    map.on('zoom', () => setZoom(map.getZoom()));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
      layersAdded.current = false;
      setMapLoaded(false);
    };
  }, []);

  // Dark mode style switching
  const darkRef = useRef(dark);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    // Skip on first render (map already initialized with correct style)
    if (darkRef.current === dark) return;
    darkRef.current = dark;
    const newStyle = dark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;
    // Reset so choropleth layers get re-added after style loads
    layersAdded.current = false;
    map.setStyle(newStyle);
    map.once('style.load', () => {
      try {
        (map as any).setProjection({ type: isGlobe ? 'globe' : 'mercator' });
      } catch {}
      // Trigger choropleth re-add by bumping styleVersion
      setStyleVersion((v) => v + 1);
    });
  }, [dark, mapLoaded, isGlobe]);

  // Toggle globe/flat
  const toggleProjection = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = isGlobe ? 'mercator' : 'globe';
    try {
      (map as any).setProjection({ type: next });
      setIsGlobe(!isGlobe);
    } catch {}
  }, [isGlobe]);

  // Build country dominance lookup
  const getCountryRiskMap = useCallback(() => {
    if (!metalsMiningData?.minerals) return new Map<string, number>();
    const countryScores = new Map<string, number[]>();
    for (const mineral of metalsMiningData.minerals) {
      for (const p of mineral.supply_chain?.mining?.top_producers || []) {
        if (!p.country_iso || p.country_iso === 'WORLD') continue;
        if (!countryScores.has(p.country_iso)) countryScores.set(p.country_iso, []);
        countryScores.get(p.country_iso)!.push(p.share * 100);
      }
    }
    const result = new Map<string, number>();
    countryScores.forEach((scores, iso) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      result.set(iso, Math.min(avg * Math.log2(scores.length + 1), 100));
    });
    return result;
  }, [metalsMiningData]);

  // Load country boundaries, render choropleth, wire country hover into unified tooltip
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || layersAdded.current) return;

    fetch('/data/countries-50m.json')
      .then((r) => r.json())
      .then((topo) => {
        const geojson = topojson.feature(topo, topo.objects.countries) as any;
        const countryRisks = getCountryRiskMap();

        // Two-source strategy to fix polar rendering artifacts:
        // 1. "countries-visual" — trimmed geometry (polar rings dropped) for fill/line rendering
        // 2. "countries-interact" — full geometry (invisible) for hover/click interaction
        // This prevents concentric ring artifacts while keeping hover on Russia/Canada/etc.

        // Add properties to all features first (shared between both sources)
        geojson.features = geojson.features.filter(
          (f: any) => String(f.id) !== '10' // remove Antarctica
        );
        for (const feature of geojson.features) {
          const numericId = String(feature.id);
          const alpha2 = ISO_NUMERIC_TO_ALPHA2[numericId] || '';
          feature.properties = feature.properties || {};
          feature.properties.iso_a2 = alpha2;
          feature.properties.dominance = countryRisks.get(alpha2) || 0;
        }

        // Deep-clone for the visual source, then trim polar rings from the clone
        const visualGeojson = JSON.parse(JSON.stringify(geojson));
        const POLAR_CUTOFF = 68;
        function dropPolarRings(rings: number[][][]): number[][][] {
          return rings.filter((ring) => {
            let maxLat = -90;
            for (const c of ring) { if (c[1] > maxLat) maxLat = c[1]; }
            return maxLat < POLAR_CUTOFF;
          });
        }
        for (const feature of visualGeojson.features) {
          const geom = feature.geometry;
          if (geom.type === 'Polygon') {
            geom.coordinates = dropPolarRings(geom.coordinates);
            if (geom.coordinates.length === 0) {
              geom.coordinates = [[[0, 0], [0, 0.001], [0.001, 0], [0, 0]]];
            }
          } else if (geom.type === 'MultiPolygon') {
            geom.coordinates = geom.coordinates
              .map((poly: number[][][]) => dropPolarRings(poly))
              .filter((poly: number[][][]) => poly.length > 0);
            if (geom.coordinates.length === 0) {
              geom.type = 'Polygon';
              geom.coordinates = [[[0, 0], [0, 0.001], [0.001, 0], [0, 0]]];
            }
          }
        }

        // Clean up any existing layers/sources
        for (const lid of ['countries-fill', 'countries-line', 'countries-interact']) {
          try { if (map.getLayer(lid)) map.removeLayer(lid); } catch {}
        }
        for (const sid of ['countries-visual', 'countries-interact', 'countries']) {
          try { if (map.getSource(sid)) map.removeSource(sid); } catch {}
        }

        // Add both sources
        map.addSource('countries-visual', { type: 'geojson', data: visualGeojson });
        map.addSource('countries-interact', { type: 'geojson', data: geojson });

        const labelLayer = map.getStyle().layers?.find(
          (l: any) => l.type === 'symbol' && l['source-layer'] === 'place'
        );
        const beforeId = labelLayer?.id;

        // Visual fill layer — trimmed geometry, no polar artifacts
        map.addLayer({
          id: 'countries-fill',
          type: 'fill',
          source: 'countries-visual',
          paint: {
            'fill-color': [
              'interpolate', ['linear'], ['get', 'dominance'],
              0, 'rgba(0,0,0,0)',
              10, '#dbeafe',
              25, '#93c5fd',
              40, '#3b82f6',
              55, '#f59e0b',
              70, '#ef4444',
              85, '#991b1b',
            ],
            'fill-opacity': 0.45,
          },
        }, beforeId);

        // Visual line layer — trimmed geometry
        map.addLayer({
          id: 'countries-line',
          type: 'line',
          source: 'countries-visual',
          paint: {
            'line-color': '#94a3b8',
            'line-width': 0.5,
            'line-opacity': 0.3,
          },
        }, beforeId);

        // Invisible interaction layer — full geometry, handles hover/click
        map.addLayer({
          id: 'countries-interact',
          type: 'fill',
          source: 'countries-interact',
          paint: {
            'fill-color': 'rgba(0,0,0,0)',
            'fill-opacity': 0,
          },
        }, beforeId);

        layersAdded.current = true;

        // Click handler — on invisible interaction layer
        map.on('click', 'countries-interact', (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const iso = feature.properties?.iso_a2;
          const name = feature.properties?.name || iso;
          if (iso && onCountryClick) onCountryClick(iso, name);
        });

        map.on('mouseenter', 'countries-interact', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'countries-interact', () => {
          map.getCanvas().style.cursor = '';
          setHoverInfo((prev) => prev?.layer === 'country' ? null : prev);
        });

        // Country hover — on invisible interaction layer
        map.on('mousemove', 'countries-interact', (e) => {
          // deck.gl feature is hovered — don't show country tooltip
          if (deckHovering.current) return;

          const feature = e.features?.[0];
          if (!feature) return;
          const iso = feature.properties?.iso_a2;
          const dominance = feature.properties?.dominance;
          if (!iso || !dominance || dominance === 0) {
            setHoverInfo((prev) => prev?.layer === 'country' ? null : prev);
            return;
          }

          const { activeLens: lens, metalsMiningData: mmData, manufacturingData: mfgData } =
            lensDataRef.current;

          const countryName = feature.properties?.name || iso;
          const countryData: Record<string, any> = { name: countryName, iso, dominance };

          if (lens === 'metals-mining' && mmData?.minerals) {
            let mineralCount = 0;
            for (const m of mmData.minerals) {
              if ((m.supply_chain?.mining?.top_producers || []).some((p) => p.country_iso === iso))
                mineralCount++;
            }
            countryData.mineralCount = mineralCount;
          } else if (lens === 'manufacturing') {
            const intl = mfgData?.international?.find((c) => c.country_iso === iso);
            if (intl?.manufacturing_value_added) countryData.mfgValueAdded = intl.manufacturing_value_added;
            if (intl?.manufacturing_pct_gdp) countryData.mfgPctGdp = intl.manufacturing_pct_gdp;
          }

          // Convert map point to screen pixel for tooltip positioning
          const point = map.project(e.lngLat);
          setHoverInfo({ x: point.x, y: point.y, object: countryData, layer: 'country' });
        });
      })
      .catch((err) => console.error('Failed to load country data:', err));
  }, [mapLoaded, getCountryRiskMap, onCountryClick, styleVersion]);

  // Update MapLibre layer opacity based on lens
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !layersAdded.current) return;
    const showMinerals = activeLens === 'metals-mining';
    try {
      if (map.getLayer('countries-fill')) {
        map.setPaintProperty('countries-fill', 'fill-opacity', showMinerals ? 0.55 : 0.08);
      }
    } catch {}
  }, [activeLens, mapLoaded]);

  // Build U.S. states GeoJSON for defense contract choropleth
  const usStatesGeojson = useMemo(() => {
    if (!usStatesGeo || !manufacturingData) return null;
    try {
      const geo = topojson.feature(usStatesGeo, usStatesGeo.objects.states) as any;
      const contractsByState: Record<string, number> = {};
      let maxContract = 0;
      for (const c of manufacturingData.defense_contracts || []) {
        contractsByState[c.state_abbrev] = c.total_amount;
        if (c.total_amount > maxContract) maxContract = c.total_amount;
      }

      const FIPS_ABBREV: Record<string, string> = {
        '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO',
        '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI',
        '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY',
        '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
        '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
        '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
        '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
        '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
        '54': 'WV', '55': 'WI', '56': 'WY',
      };

      for (const feature of geo.features) {
        const fips = String(feature.id).padStart(2, '0');
        const abbrev = FIPS_ABBREV[fips] || '';
        feature.properties = feature.properties || {};
        feature.properties.abbrev = abbrev;
        feature.properties.contracts = contractsByState[abbrev] || 0;
        feature.properties.normalized = maxContract > 0
          ? (contractsByState[abbrev] || 0) / maxContract
          : 0;
      }
      return geo;
    } catch {
      return null;
    }
  }, [usStatesGeo, manufacturingData]);

  // Build U.S. states GeoJSON for technology R&D choropleth
  const usStatesRdGeojson = useMemo(() => {
    if (!usStatesGeo || !technologyData) return null;
    try {
      const geo = topojson.feature(usStatesGeo, usStatesGeo.objects.states) as any;
      const rdByState: Record<string, number> = {};
      let maxRd = 0;
      for (const s of technologyData.top_defense_rd_states || []) {
        rdByState[s.state] = s.amount_b;
        if (s.amount_b > maxRd) maxRd = s.amount_b;
      }

      const FIPS_ABBREV: Record<string, string> = {
        '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO',
        '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI',
        '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY',
        '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
        '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
        '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
        '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
        '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
        '54': 'WV', '55': 'WI', '56': 'WY',
      };

      for (const feature of geo.features) {
        const fips = String(feature.id).padStart(2, '0');
        const abbrev = FIPS_ABBREV[fips] || '';
        feature.properties = feature.properties || {};
        feature.properties.abbrev = abbrev;
        feature.properties.rd_amount = rdByState[abbrev] || 0;
        feature.properties.normalized = maxRd > 0
          ? (rdByState[abbrev] || 0) / maxRd
          : 0;
      }
      return geo;
    } catch {
      return null;
    }
  }, [usStatesGeo, technologyData]);

  // Build trade flow arcs
  const tradeArcs = useMemo<TradeArc[]>(() => {
    if (!selectedMineral || !countryCentroids) return [];
    return buildTradeFlowArcs(selectedMineral, countryCentroids);
  }, [selectedMineral, countryCentroids]);

  // Compute dynamic radius based on zoom
  const facRadiusMin = zoom < 4 ? 2 : zoom < 6 ? 3 : 4;
  const facRadiusMax = zoom < 4 ? 4 : zoom < 6 ? 8 : 15;

  // Update deck.gl layers
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !mapLoaded) return;

    const layers: any[] = [];
    const vis = layerVisibility || {
      facilities: true, shipyards: true, investments: true, tradeFlows: true, usStates: true,
    };

    // U.S. States defense contract choropleth
    if (activeLens === 'manufacturing' && vis.usStates && usStatesGeojson) {
      layers.push(
        new GeoJsonLayer({
          id: 'us-states-contracts',
          data: usStatesGeojson,
          filled: true,
          stroked: true,
          getFillColor: (f: any) => {
            const norm = f.properties?.normalized || 0;
            return [30, 58, 95, Math.round(norm * 180)];
          },
          getLineColor: [148, 163, 184, 100],
          getLineWidth: 1,
          lineWidthMinPixels: 0.5,
          pickable: true,
          onHover: onDeckHover('us-states'),
        })
      );
    }

    // Facility markers
    if (activeLens === 'metals-mining' && vis.facilities && facilities && facilities.length > 0) {
      const filtered = selectedMineral
        ? facilities.filter((f) =>
            f.mineral_match.some((m: string) => m.toLowerCase() === selectedMineral.name.toLowerCase())
          )
        : facilities;

      layers.push(
        new ScatterplotLayer({
          id: 'facility-markers',
          data: filtered,
          getPosition: (d: Facility) => [d.lon, d.lat],
          getRadius: (d: Facility) => Math.max(3000, Math.sqrt(d.employment || 1) * 1500),
          getFillColor: (d: Facility) => commodityColor(d.mineral_match[0] || 'Unknown'),
          getLineColor: [255, 255, 255, 200],
          lineWidthMinPixels: 1,
          stroked: true,
          filled: true,
          radiusMinPixels: facRadiusMin,
          radiusMaxPixels: facRadiusMax,
          pickable: true,
          onHover: onDeckHover('facility'),
          onClick: (info: any) => {
            if (info.object && onFacilityClick) onFacilityClick(info.object);
          },
        })
      );
    }

    // Shipyard markers
    if (activeLens === 'manufacturing' && vis.shipyards && shipyards && shipyards.length > 0) {
      layers.push(
        new ScatterplotLayer({
          id: 'shipyard-markers',
          data: shipyards,
          getPosition: (d: Shipyard) => [d.lon, d.lat],
          getRadius: (d: Shipyard) => Math.max(5000, Math.sqrt(d.employees) * 500),
          getFillColor: (d: Shipyard) =>
            d.country_iso === 'US' ? NAVY_RGBA : [148, 163, 184, 180] as [number, number, number, number],
          getLineColor: [255, 255, 255, 200],
          lineWidthMinPixels: 1,
          stroked: true,
          filled: true,
          radiusMinPixels: 5,
          radiusMaxPixels: 20,
          pickable: true,
          onHover: onDeckHover('shipyard'),
        })
      );
    }

    // Investment markers (metals-mining lens only)
    if (activeLens === 'metals-mining' && vis.investments && investments && investments.length > 0) {
      const filtered = selectedMineral
        ? investments.filter((inv) => inv.mineral?.toLowerCase() === selectedMineral.name.toLowerCase())
        : investments;

      if (filtered.length > 0) {
        layers.push(
          new ScatterplotLayer({
            id: 'investment-markers',
            data: filtered,
            getPosition: (d: Investment) => [d.location.lon, d.location.lat],
            getRadius: (d: Investment) => Math.max(5000, Math.sqrt(d.amount / 1e6) * 2000),
            getFillColor: GREEN_INVESTMENT,
            getLineColor: [255, 255, 255, 220],
            lineWidthMinPixels: 1.5,
            stroked: true,
            filled: true,
            radiusMinPixels: 5,
            radiusMaxPixels: 25,
            pickable: true,
            onHover: onDeckHover('investment'),
          })
        );
      }
    }

    // Trade flow arcs
    if (activeLens === 'metals-mining' && vis.tradeFlows && tradeArcs.length > 0) {
      layers.push(
        new ArcLayer({
          id: 'trade-flow-arcs',
          data: tradeArcs,
          getSourcePosition: (d: TradeArc) => d.sourcePosition,
          getTargetPosition: (d: TradeArc) => d.targetPosition,
          getSourceColor: (d: TradeArc) => arcColor(d.riskScore),
          getTargetColor: [30, 58, 95, 160] as [number, number, number, number],
          getWidth: (d: TradeArc) => arcWidth(d.share),
          widthMinPixels: 1,
          widthMaxPixels: 8,
          greatCircle: true,
          pickable: true,
          onHover: onDeckHover('arc'),
        })
      );
    }

    // Energy facility markers
    if (activeLens === 'energy' && vis.facilities && energyData?.key_facilities && energyData.key_facilities.length > 0) {
      // Build a color map from fuel types
      const fuelColorMap: Record<string, [number, number, number, number]> = {};
      for (const fuel of energyData.generation_by_fuel) {
        fuelColorMap[fuel.fuel] = hexToRGBA(fuel.color, 200);
      }

      layers.push(
        new ScatterplotLayer({
          id: 'energy-facility-markers',
          data: energyData.key_facilities,
          getPosition: (d: EnergyFacility) => [d.lon, d.lat],
          getRadius: (d: EnergyFacility) => Math.max(5000, Math.sqrt(d.capacity_mw) * 500),
          getFillColor: (d: EnergyFacility) => fuelColorMap[d.type] || [107, 114, 128, 200],
          getLineColor: [255, 255, 255, 200],
          lineWidthMinPixels: 1,
          stroked: true,
          filled: true,
          radiusMinPixels: 5,
          radiusMaxPixels: 20,
          pickable: true,
          onHover: onDeckHover('energy-facility'),
        })
      );
    }

    // Logistics: Port markers
    if (activeLens === 'logistics' && vis.shipyards && logisticsData?.major_ports && logisticsData.major_ports.length > 0) {
      layers.push(
        new ScatterplotLayer({
          id: 'port-markers',
          data: logisticsData.major_ports,
          getPosition: (d: Port) => [d.lon, d.lat],
          getRadius: (d: Port) => Math.max(5000, Math.sqrt(d.teu_millions) * 5000),
          getFillColor: (d: Port) =>
            d.type === 'military' ? [234, 88, 12, 200] as [number, number, number, number]
            : d.country_iso === 'US' ? NAVY_RGBA
            : [148, 163, 184, 180] as [number, number, number, number],
          getLineColor: [255, 255, 255, 200],
          lineWidthMinPixels: 1,
          stroked: true,
          filled: true,
          radiusMinPixels: 4,
          radiusMaxPixels: 18,
          pickable: true,
          onHover: onDeckHover('port'),
        })
      );
    }

    // Logistics: Chokepoint markers
    if (activeLens === 'logistics' && vis.usStates && logisticsData?.chokepoints && logisticsData.chokepoints.length > 0) {
      layers.push(
        new ScatterplotLayer({
          id: 'chokepoint-markers',
          data: logisticsData.chokepoints,
          getPosition: (d: Chokepoint) => [d.lon, d.lat],
          getRadius: 30000,
          getFillColor: (d: Chokepoint) =>
            d.risk === 'critical' ? [220, 38, 38, 200] as [number, number, number, number]
            : d.risk === 'high' ? [217, 119, 6, 200] as [number, number, number, number]
            : [37, 99, 235, 200] as [number, number, number, number],
          getLineColor: [255, 255, 255, 220],
          lineWidthMinPixels: 2,
          stroked: true,
          filled: true,
          radiusMinPixels: 8,
          radiusMaxPixels: 25,
          pickable: true,
          onHover: onDeckHover('chokepoint'),
        })
      );
    }

    // Telecom: Submarine cable arcs
    if (activeLens === 'telecom' && vis.tradeFlows && telecomData?.key_cables && telecomData.key_cables.length > 0) {
      layers.push(
        new ArcLayer({
          id: 'submarine-cable-arcs',
          data: telecomData.key_cables,
          getSourcePosition: (d: SubmarineCable) => [d.lon_from, d.lat_from],
          getTargetPosition: (d: SubmarineCable) => [d.lon_to, d.lat_to],
          getSourceColor: (d: SubmarineCable) =>
            d.owner.toLowerCase().includes('china') || d.owner.toLowerCase().includes('hengtong')
              ? [220, 38, 38, 180] as [number, number, number, number]
              : [139, 92, 246, 180] as [number, number, number, number],
          getTargetColor: (d: SubmarineCable) =>
            d.owner.toLowerCase().includes('china') || d.owner.toLowerCase().includes('hengtong')
              ? [220, 38, 38, 120] as [number, number, number, number]
              : [139, 92, 246, 120] as [number, number, number, number],
          getWidth: (d: SubmarineCable) => Math.max(1, Math.sqrt(d.capacity_tbps / 50)),
          widthMinPixels: 1,
          widthMaxPixels: 6,
          greatCircle: true,
          pickable: true,
          onHover: onDeckHover('cable'),
        })
      );
    }

    // Technology: U.S. states R&D choropleth
    if (activeLens === 'technology' && vis.usStates && usStatesRdGeojson) {
      layers.push(
        new GeoJsonLayer({
          id: 'us-states-rd',
          data: usStatesRdGeojson,
          filled: true,
          stroked: true,
          getFillColor: (f: any) => {
            const norm = f.properties?.normalized || 0;
            return [236, 72, 153, Math.round(norm * 180)]; // pink
          },
          getLineColor: [148, 163, 184, 100],
          getLineWidth: 1,
          lineWidthMinPixels: 0.5,
          pickable: true,
          onHover: onDeckHover('us-states-rd'),
        })
      );
    }

    overlay.setProps({ layers });
  }, [
    mapLoaded, activeLens, layerVisibility,
    facilities, shipyards, investments, tradeArcs,
    selectedMineral, usStatesGeojson, usStatesRdGeojson, onFacilityClick, onDeckHover,
    facRadiusMin, facRadiusMax,
    energyData, logisticsData, telecomData, technologyData,
  ]);

  // WebGL fallback
  if (webglError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-lg px-6">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Globe Loading Failed</h2>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            WebGL context couldn&apos;t be created. This usually happens when too many browser
            tabs are using GPU resources.
          </p>
          <div className="mt-4 text-left text-xs text-gray-500 bg-white rounded-lg border border-gray-200 p-3 space-y-1">
            <div>1. Close other tabs (especially maps, 3D content, video)</div>
            <div>2. Try a different browser (Chrome, Firefox, Edge)</div>
            <div>3. Check that hardware acceleration is enabled in browser settings</div>
            <div>4. On Linux: verify GPU drivers with <code className="bg-gray-100 px-1 rounded">nvidia-smi</code></div>
          </div>
          <div className="mt-4 flex gap-3 justify-center">
            <button
              onClick={() => { setWebglError(false); mapRef.current = null; layersAdded.current = false; }}
              className="px-4 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-light transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-gray-700 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Hard Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Unified hover tooltip — one tooltip for everything */}
      {hoverInfo && (
        <div
          className="absolute z-20 pointer-events-none panel rounded-lg px-2 py-1.5 text-xs shadow-lg max-w-xs"
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y - 12 }}
        >
          {hoverInfo.layer === 'country' && (
            <>
              <div className="font-semibold text-gray-900">{hoverInfo.object.name}</div>
              {hoverInfo.object.mineralCount > 0 && (
                <div className="text-gray-500">
                  {hoverInfo.object.mineralCount} critical mineral{hoverInfo.object.mineralCount !== 1 ? 's' : ''} produced
                </div>
              )}
              {hoverInfo.object.mfgValueAdded && (
                <div className="text-gray-500">
                  Mfg value added: ${(hoverInfo.object.mfgValueAdded / 1e9).toFixed(0)}B
                </div>
              )}
              {hoverInfo.object.mfgPctGdp && (
                <div className="text-gray-500">{hoverInfo.object.mfgPctGdp.toFixed(1)}% of GDP</div>
              )}
              {!hoverInfo.object.mineralCount && !hoverInfo.object.mfgValueAdded && (
                <div className="text-gray-500">Dominance: {Math.round(hoverInfo.object.dominance)}/100</div>
              )}
            </>
          )}
          {hoverInfo.layer === 'facility' && (
            <>
              <div className="font-semibold text-gray-900">{hoverInfo.object.name}</div>
              <div className="text-gray-500">{hoverInfo.object.operator}</div>
              <div className="text-gray-500">{hoverInfo.object.commodity} · {hoverInfo.object.state}</div>
              {hoverInfo.object.employment > 0 && (
                <div className="text-gray-500">{hoverInfo.object.employment} employees</div>
              )}
            </>
          )}
          {hoverInfo.layer === 'shipyard' && (
            <>
              <div className="font-semibold text-gray-900">{hoverInfo.object.name}</div>
              <div className="text-gray-500">{hoverInfo.object.owner}</div>
              <div className="text-gray-500">
                {hoverInfo.object.type === 'military' ? 'Military' : hoverInfo.object.type === 'dual' ? 'Military + Commercial' : 'Commercial'}
                {' · '}{hoverInfo.object.country}
              </div>
              <div className="text-gray-500">{hoverInfo.object.employees?.toLocaleString()} employees</div>
            </>
          )}
          {hoverInfo.layer === 'investment' && (
            <>
              <div className="font-semibold text-gray-900">{hoverInfo.object.project}</div>
              <div className="text-gray-500">{hoverInfo.object.company}</div>
              <div className="text-gray-500">
                ${(hoverInfo.object.amount / 1e9).toFixed(1)}B · {hoverInfo.object.program}
              </div>
              <div className="text-gray-500">{hoverInfo.object.status}</div>
            </>
          )}
          {hoverInfo.layer === 'arc' && (
            <>
              <div className="font-semibold text-gray-900">{hoverInfo.object.sourceCountry} → U.S.</div>
              <div className="text-gray-500">
                {hoverInfo.object.mineral} · {(hoverInfo.object.share * 100).toFixed(0)}% of production
              </div>
            </>
          )}
          {hoverInfo.layer === 'us-states' && (
            <>
              <div className="font-semibold text-gray-900">
                {hoverInfo.object.name || hoverInfo.object.abbrev}
              </div>
              {hoverInfo.object.contracts > 0 && (
                <div className="text-gray-500">
                  DoD contracts: ${(hoverInfo.object.contracts / 1e9).toFixed(1)}B
                </div>
              )}
            </>
          )}
          {hoverInfo.layer === 'energy-facility' && (
            <>
              <div className="font-semibold text-gray-900">{hoverInfo.object.name}</div>
              <div className="text-gray-500">{hoverInfo.object.operator}</div>
              <div className="text-gray-500">
                {hoverInfo.object.type} · {hoverInfo.object.capacity_mw?.toLocaleString()} MW · {hoverInfo.object.state}
              </div>
              {hoverInfo.object.notes && (
                <div className="text-gray-400">{hoverInfo.object.notes}</div>
              )}
            </>
          )}
          {hoverInfo.layer === 'port' && (
            <>
              <div className="font-semibold text-gray-900">{hoverInfo.object.name}</div>
              <div className="text-gray-500">
                {hoverInfo.object.type === 'military' ? 'Naval Base' : `${hoverInfo.object.teu_millions}M TEU`}
                {' · '}{hoverInfo.object.country}
                {hoverInfo.object.rank_global < 999 && ` · #${hoverInfo.object.rank_global} global`}
              </div>
              {hoverInfo.object.notes && (
                <div className="text-gray-400">{hoverInfo.object.notes}</div>
              )}
            </>
          )}
          {hoverInfo.layer === 'chokepoint' && (
            <>
              <div className="font-semibold text-gray-900">{hoverInfo.object.name}</div>
              <div className="text-gray-500">
                {hoverInfo.object.daily_vessels} ships/day
                {hoverInfo.object.oil_flow_mbd > 0 && ` · ${hoverInfo.object.oil_flow_mbd}M bbl/day`}
              </div>
              <div className="text-gray-500">{hoverInfo.object.trade_value_pct}% of global trade</div>
              <div className={`font-medium ${
                hoverInfo.object.risk === 'critical' ? 'text-red-600' :
                hoverInfo.object.risk === 'high' ? 'text-amber-600' : 'text-blue-600'
              }`}>
                Risk: {hoverInfo.object.risk}
              </div>
            </>
          )}
          {hoverInfo.layer === 'cable' && (
            <>
              <div className="font-semibold text-gray-900">{hoverInfo.object.name}</div>
              <div className="text-gray-500">{hoverInfo.object.owner}</div>
              <div className="text-gray-500">
                {hoverInfo.object.capacity_tbps} Tbps · {hoverInfo.object.length_km?.toLocaleString()} km
              </div>
              <div className="text-gray-500">{hoverInfo.object.from} &rarr; {hoverInfo.object.to}</div>
            </>
          )}
          {hoverInfo.layer === 'us-states-rd' && (
            <>
              <div className="font-semibold text-gray-900">
                {hoverInfo.object.name || hoverInfo.object.abbrev}
              </div>
              {hoverInfo.object.rd_amount > 0 && (
                <div className="text-gray-500">
                  Defense R&D: ${hoverInfo.object.rd_amount}B
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Globe/Flat toggle */}
      <button
        onClick={toggleProjection}
        className="absolute bottom-24 right-2 z-10 w-8 h-8 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
        title={isGlobe ? 'Switch to flat map' : 'Switch to globe'}
      >
        {isGlobe ? (
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        )}
      </button>

      {/* Dynamic Legend */}
      {mapLoaded && (
        <div className="absolute bottom-2 left-2 z-10 panel rounded-lg p-2 text-[11px] animate-fade-in">
          {activeLens === 'metals-mining' && (
            <>
              <div className="font-medium text-gray-700 mb-1">Mineral Production Dominance</div>
              <div className="flex gap-1">
                {[
                  { color: '#dbeafe', label: 'Low' },
                  { color: '#3b82f6', label: 'Mod' },
                  { color: '#f59e0b', label: 'High' },
                  { color: '#ef4444', label: 'V.High' },
                  { color: '#991b1b', label: 'Critical' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                    <span className="text-gray-500">{l.label}</span>
                  </div>
                ))}
              </div>
              {layerVisibility?.facilities && (
                <div className="mt-1 flex items-center gap-1 text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Mine locations</span>
                </div>
              )}
              {layerVisibility?.investments && (
                <div className="flex items-center gap-1 text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Investments</span>
                </div>
              )}
            </>
          )}
          {activeLens === 'manufacturing' && (
            <>
              <div className="font-medium text-gray-700 mb-1">Defense & Manufacturing</div>
              {layerVisibility?.usStates && (
                <div className="flex gap-1 mb-1">
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(30,58,95,0.1)' }} />
                    <span className="text-gray-500">Low</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(30,58,95,0.5)' }} />
                    <span className="text-gray-500">Med</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(30,58,95,0.9)' }} />
                    <span className="text-gray-500">High</span>
                  </div>
                  <span className="text-gray-400 ml-1">DoD $</span>
                </div>
              )}
              {layerVisibility?.shipyards && (
                <div className="flex items-center gap-1 text-gray-500">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1E3A5F' }} />
                  <span>Shipyards</span>
                </div>
              )}
            </>
          )}
          {activeLens === 'energy' && (
            <>
              <div className="font-medium text-gray-700 mb-1">Energy Infrastructure</div>
              {energyData?.generation_by_fuel.slice(0, 5).map((fuel) => (
                <div key={fuel.fuel} className="flex items-center gap-1 text-gray-500">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fuel.color }} />
                  <span>{fuel.fuel}</span>
                </div>
              ))}
            </>
          )}
          {activeLens === 'logistics' && (
            <>
              <div className="font-medium text-gray-700 mb-1">Maritime & Logistics</div>
              {layerVisibility?.usStates && (
                <div className="flex gap-1 mb-1">
                  {[
                    { color: '#DC2626', label: 'Critical' },
                    { color: '#D97706', label: 'High' },
                    { color: '#2563EB', label: 'Moderate' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-0.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-gray-500">{l.label}</span>
                    </div>
                  ))}
                  <span className="text-gray-400 ml-1">Chokepoints</span>
                </div>
              )}
              {layerVisibility?.shipyards && (
                <>
                  <div className="flex items-center gap-1 text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1E3A5F' }} />
                    <span>U.S. Ports</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#94a3b8' }} />
                    <span>Intl Ports</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EA580C' }} />
                    <span>Naval Bases</span>
                  </div>
                </>
              )}
            </>
          )}
          {activeLens === 'telecom' && (
            <>
              <div className="font-medium text-gray-700 mb-1">Telecom & Space</div>
              {layerVisibility?.tradeFlows && (
                <>
                  <div className="flex items-center gap-1 text-gray-500">
                    <div className="w-4 h-0.5 rounded" style={{ backgroundColor: '#8B5CF6' }} />
                    <span>Cables (Western)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <div className="w-4 h-0.5 rounded" style={{ backgroundColor: '#DC2626' }} />
                    <span>Cables (China)</span>
                  </div>
                </>
              )}
            </>
          )}
          {activeLens === 'technology' && (
            <>
              <div className="font-medium text-gray-700 mb-1">Technology & R&D</div>
              {layerVisibility?.usStates && (
                <div className="flex gap-1 mb-1">
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(236,72,153,0.1)' }} />
                    <span className="text-gray-500">Low</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(236,72,153,0.5)' }} />
                    <span className="text-gray-500">Med</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(236,72,153,0.9)' }} />
                    <span className="text-gray-500">High</span>
                  </div>
                  <span className="text-gray-400 ml-1">R&D $</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
