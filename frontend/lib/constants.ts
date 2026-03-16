import { Lens, LensId } from './types';

export const LENSES: Lens[] = [
  {
    id: 'metals-mining',
    label: 'Metals & Mining',
    description: 'Critical mineral supply chain concentration risk',
    color: '#B45309',
  },
  {
    id: 'manufacturing',
    label: 'Industrials',
    description: 'Manufacturing capacity, defense industrial base',
    color: '#1E3A5F',
  },
  {
    id: 'energy',
    label: 'Energy',
    description: 'Power generation, grid, battery supply chain',
    color: '#7C3AED',
  },
  {
    id: 'logistics',
    label: 'Logistics',
    description: 'Shipping lanes, ports, maritime capacity',
    color: '#0891B2',
  },
  {
    id: 'telecom',
    label: 'Telecom',
    description: 'Submarine cables, satellites, spectrum, 5G',
    color: '#8B5CF6',
  },
  {
    id: 'technology',
    label: 'Tech & R&D',
    description: 'Defense R&D, patents, technology competition',
    color: '#EC4899',
  },
];

export const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
export const MAP_STYLE_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
export const MAP_STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const INITIAL_VIEW = {
  center: [-40, 30] as [number, number],
  zoom: 1.8,
  pitch: 0,
};

// Country ISO numeric → alpha-2 mapping (for TopoJSON which uses numeric IDs)
export const ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '4': 'AF', '8': 'AL', '12': 'DZ', '24': 'AO', '32': 'AR', '36': 'AU',
  '40': 'AT', '50': 'BD', '56': 'BE', '68': 'BO', '76': 'BR', '100': 'BG',
  '104': 'MM', '116': 'KH', '120': 'CM', '124': 'CA', '144': 'LK',
  '152': 'CL', '156': 'CN', '170': 'CO', '178': 'CG', '180': 'CD',
  '188': 'CR', '191': 'HR', '192': 'CU', '196': 'CY', '203': 'CZ',
  '208': 'DK', '214': 'DO', '218': 'EC', '818': 'EG', '222': 'SV',
  '231': 'ET', '233': 'EE', '246': 'FI', '250': 'FR', '266': 'GA',
  '268': 'GE', '276': 'DE', '288': 'GH', '300': 'GR', '320': 'GT',
  '324': 'GN', '328': 'GY', '332': 'HT', '340': 'HN', '348': 'HU',
  '352': 'IS', '356': 'IN', '360': 'ID', '364': 'IR', '368': 'IQ',
  '372': 'IE', '376': 'IL', '380': 'IT', '384': 'CI', '388': 'JM',
  '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE', '408': 'KP',
  '410': 'KR', '414': 'KW', '418': 'LA', '422': 'LB', '426': 'LS',
  '430': 'LR', '434': 'LY', '440': 'LT', '442': 'LU', '450': 'MG',
  '454': 'MW', '458': 'MY', '466': 'ML', '478': 'MR', '484': 'MX',
  '496': 'MN', '504': 'MA', '508': 'MZ', '516': 'NA', '524': 'NP',
  '528': 'NL', '540': 'NC', '554': 'NZ', '558': 'NI', '562': 'NE',
  '566': 'NG', '578': 'NO', '586': 'PK', '591': 'PA', '598': 'PG',
  '600': 'PY', '604': 'PE', '608': 'PH', '616': 'PL', '620': 'PT',
  '630': 'PR', '634': 'QA', '642': 'RO', '643': 'RU', '646': 'RW',
  '682': 'SA', '686': 'SN', '694': 'SL', '702': 'SG', '703': 'SK',
  '704': 'VN', '705': 'SI', '706': 'SO', '710': 'ZA', '716': 'ZW',
  '724': 'ES', '728': 'SS', '729': 'SD', '740': 'SR', '748': 'SZ',
  '752': 'SE', '756': 'CH', '760': 'SY', '762': 'TJ', '764': 'TH',
  '768': 'TG', '780': 'TT', '784': 'AE', '788': 'TN', '792': 'TR',
  '795': 'TM', '800': 'UG', '804': 'UA', '807': 'MK', '826': 'GB',
  '834': 'TZ', '840': 'US', '854': 'BF', '858': 'UY', '860': 'UZ',
  '862': 'VE', '887': 'YE', '894': 'ZM', '10': 'AQ',
  '-99': 'XX',  // Disputed territories
};
