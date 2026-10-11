import { Station } from '../types';

export interface StationMapBlueprint {
  stationCode: string;
  stationName: string;
  stationType: 'TERMINAL' | 'JUNCTION' | 'THROUGH' | 'HERITAGE_HILL';
  platformCount: number;
  platforms: Array<{
    id: string;
    number: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    orientation: 'vertical' | 'horizontal';
    trackLine?: number;
  }>;
  tracks: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>;
  bridges: Array<{
    name: string;
    floor: 'L2' | 'L1' | 'G';
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }>;
  entrances: Array<{
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    side: 'WEST' | 'EAST' | 'NORTH' | 'SOUTH';
  }>;
  concourse: {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    name: string;
  };
  features: Array<{
    name: string;
    icon: string;
    x: number;
    y: number;
  }>;
  accentColor: string;
}

export const STATION_BLUEPRINTS: Record<string, StationMapBlueprint> = {
  // 1. COIMBATORE JUNCTION (CBE) - 6 THROUGH PLATFORMS
  CBE: {
    stationCode: 'CBE',
    stationName: 'Coimbatore Junction',
    stationType: 'THROUGH',
    platformCount: 6,
    accentColor: '#ff3e00',
    concourse: {
      cx: 24,
      cy: 50,
      rx: 14,
      ry: 20,
      name: 'Main Atrium Concourse',
    },
    platforms: [
      { id: 'cbe-p1', number: '1', label: 'PF 1 (Vande Bharat Bay)', x: 32, y: 16, width: 5, height: 68, orientation: 'vertical' },
      { id: 'cbe-p23', number: '2/3', label: 'PF 2 & 3 Island', x: 48, y: 16, width: 7, height: 68, orientation: 'vertical' },
      { id: 'cbe-p45', number: '4/5', label: 'PF 4 & 5 Island', x: 66, y: 16, width: 7, height: 68, orientation: 'vertical' },
      { id: 'cbe-p6', number: '6', label: 'PF 6 (Nilgiri Link Bay)', x: 84, y: 16, width: 5, height: 68, orientation: 'vertical' },
    ],
    tracks: [
      { x1: 41, y1: 10, x2: 41, y2: 90 },
      { x1: 59, y1: 10, x2: 59, y2: 90 },
      { x1: 77, y1: 10, x2: 77, y2: 90 },
    ],
    bridges: [
      { name: 'FOB 1 SKYWALK SPAN (L2)', floor: 'L2', x: 30, y: 32, width: 60, height: 6, color: '#ff3e00' },
      { name: 'FOB 2 ESCALATOR SPAN (L2)', floor: 'L2', x: 30, y: 46, width: 60, height: 5, color: '#f59e0b' },
      { name: 'SUBWAY UNDERPASS (L1)', floor: 'L1', x: 30, y: 64, width: 60, height: 6, color: '#00f0ff' },
    ],
    entrances: [
      { name: 'MAIN GATE (State Bank Rd)', x: 6, y: 38, width: 12, height: 24, side: 'WEST' },
      { name: 'SOUTH GATE (Goods Shed Rd)', x: 91, y: 38, width: 7, height: 24, side: 'EAST' },
    ],
    features: [
      { name: 'Glass Elevators A/B/C/D', icon: 'elevator', x: 26, y: 32 },
      { name: 'PRS/UTS Ticketing', icon: 'confirmation_number', x: 20, y: 60 },
      { name: 'IRCTC Food Plaza', icon: 'restaurant', x: 20, y: 42 },
    ],
  },

  // 2. MGR CHENNAI CENTRAL (MAS) - 12+ PLATFORM GRAND TERMINAL HEADHOUSE
  MAS: {
    stationCode: 'MAS',
    stationName: 'MGR Chennai Central Terminus',
    stationType: 'TERMINAL',
    platformCount: 12,
    accentColor: '#ef4444',
    concourse: {
      cx: 50,
      cy: 78,
      rx: 40,
      ry: 12,
      name: 'Grand Concourse Headhouse (Poonamallee Rd)',
    },
    platforms: [
      { id: 'mas-p12', number: '1/2', label: 'PF 1 & 2 (Vande Bharat)', x: 14, y: 12, width: 5, height: 56, orientation: 'vertical' },
      { id: 'mas-p34', number: '3/4', label: 'PF 3 & 4 (Shatabdi)', x: 26, y: 12, width: 5, height: 56, orientation: 'vertical' },
      { id: 'mas-p56', number: '5/6', label: 'PF 5 & 6 (Express Bay)', x: 38, y: 12, width: 5, height: 56, orientation: 'vertical' },
      { id: 'mas-p78', number: '7/8', label: 'PF 7 & 8 (West Coast)', x: 50, y: 12, width: 5, height: 56, orientation: 'vertical' },
      { id: 'mas-p910', number: '9/10', label: 'PF 9 & 10 (Northbound)', x: 62, y: 12, width: 5, height: 56, orientation: 'vertical' },
      { id: 'mas-p1112', number: '11/12', label: 'PF 11 & 12 (Mail / SF)', x: 74, y: 12, width: 5, height: 56, orientation: 'vertical' },
    ],
    tracks: [
      { x1: 21, y1: 10, x2: 21, y2: 68 },
      { x1: 33, y1: 10, x2: 33, y2: 68 },
      { x1: 45, y1: 10, x2: 45, y2: 68 },
      { x1: 57, y1: 10, x2: 57, y2: 68 },
      { x1: 69, y1: 10, x2: 69, y2: 68 },
      { x1: 81, y1: 10, x2: 81, y2: 68 },
    ],
    bridges: [
      { name: 'CENTRAL FOOT OVERBRIDGE (L2)', floor: 'L2', x: 12, y: 35, width: 76, height: 6, color: '#ff3e00' },
      { name: 'TERMINAL BUFFER STOP WALKWAY (G)', floor: 'G', x: 12, y: 69, width: 76, height: 5, color: '#10b981' },
      { name: 'METRO SUBWAY INTERCHANGE (L1)', floor: 'L1', x: 12, y: 88, width: 76, height: 6, color: '#00f0ff' },
    ],
    entrances: [
      { name: 'MAIN PORCH / CLOCK TOWER GATE', x: 35, y: 92, width: 30, height: 6, side: 'SOUTH' },
      { name: 'WALL TAX ROAD GATE', x: 92, y: 30, width: 6, height: 35, side: 'EAST' },
      { name: 'MOORE MARKET SUBURBAN COMPLEX', x: 2, y: 30, width: 7, height: 35, side: 'WEST' },
    ],
    features: [
      { name: 'Heritage Clock Tower', icon: 'schedule', x: 50, y: 85 },
      { name: 'IRCTC Jan Aahaar', icon: 'restaurant', x: 28, y: 76 },
      { name: 'VIP & AC Lounge', icon: 'weekend', x: 72, y: 76 },
    ],
  },

  // 3. CHENNAI EGMORE (MS) - INDO-SARACENIC 11 PLATFORMS
  MS: {
    stationCode: 'MS',
    stationName: 'Chennai Egmore Terminus',
    stationType: 'TERMINAL',
    platformCount: 11,
    accentColor: '#3b82f6',
    concourse: {
      cx: 30,
      cy: 74,
      rx: 22,
      ry: 14,
      name: 'Gandhi-Irwin Hall & Heritage Rotunda',
    },
    platforms: [
      { id: 'ms-p12', number: '1/2', label: 'PF 1 & 2 (Mainline South)', x: 18, y: 14, width: 5, height: 52, orientation: 'vertical' },
      { id: 'ms-p34', number: '3/4', label: 'PF 3 & 4 (Vaigai / Pandian)', x: 30, y: 14, width: 5, height: 52, orientation: 'vertical' },
      { id: 'ms-p56', number: '5/6', label: 'PF 5 & 6 (Pearl City / Nellai)', x: 42, y: 14, width: 5, height: 52, orientation: 'vertical' },
      { id: 'ms-p78', number: '7/8', label: 'PF 7 & 8 (Kanyakumari Exp)', x: 54, y: 14, width: 5, height: 52, orientation: 'vertical' },
      { id: 'ms-p911', number: '9-11', label: 'PF 9-11 (Suburban EMU)', x: 68, y: 14, width: 8, height: 52, orientation: 'vertical' },
    ],
    tracks: [
      { x1: 25, y1: 10, x2: 25, y2: 66 },
      { x1: 37, y1: 10, x2: 37, y2: 66 },
      { x1: 49, y1: 10, x2: 49, y2: 66 },
      { x1: 62, y1: 10, x2: 62, y2: 66 },
    ],
    bridges: [
      { name: 'MAIN CONCOURSE FOB (L2)', floor: 'L2', x: 16, y: 32, width: 64, height: 6, color: '#3b82f6' },
      { name: 'SUBURBAN EMU OVERBRIDGE (L2)', floor: 'L2', x: 16, y: 50, width: 64, height: 5, color: '#f59e0b' },
    ],
    entrances: [
      { name: 'GANDHI-IRWIN ROAD (East Entry)', x: 6, y: 40, width: 8, height: 28, side: 'WEST' },
      { name: 'EVR PERIYAR SALAI (West Entry)', x: 88, y: 40, width: 8, height: 28, side: 'EAST' },
    ],
    features: [
      { name: 'Indo-Saracenic Dome', icon: 'account_balance', x: 28, y: 78 },
      { name: 'PRS Retiring Rooms', icon: 'hotel', x: 45, y: 78 },
    ],
  },

  // 4. TUTICORIN / THOOTHUKUDI (TN) - 2 TERMINAL PLATFORMS & HARBOR LINE
  TN: {
    stationCode: 'TN',
    stationName: 'Tuticorin (Thoothukudi) Station',
    stationType: 'TERMINAL',
    platformCount: 2,
    accentColor: '#14b8a6',
    concourse: {
      cx: 35,
      cy: 70,
      rx: 24,
      ry: 14,
      name: 'Port Town Passenger Concourse',
    },
    platforms: [
      { id: 'tn-p1', number: '1', label: 'PF 1 (Pearl City & Link Express)', x: 30, y: 16, width: 8, height: 48, orientation: 'vertical' },
      { id: 'tn-p2', number: '2', label: 'PF 2 (Mysuru / Passenger Bay)', x: 55, y: 16, width: 8, height: 48, orientation: 'vertical' },
    ],
    tracks: [
      { x1: 42, y1: 10, x2: 42, y2: 64 },
      { x1: 67, y1: 10, x2: 67, y2: 64 },
      { x1: 82, y1: 10, x2: 82, y2: 75 }, // Harbor Cargo Line
    ],
    bridges: [
      { name: 'PASSENGER CROSSOVER RAMP (G)', floor: 'G', x: 26, y: 64, width: 44, height: 6, color: '#14b8a6' },
      { name: 'TERMINAL BUFFER STOP (G)', floor: 'G', x: 26, y: 68, width: 44, height: 4, color: '#ffffff' },
    ],
    entrances: [
      { name: 'STATION ROAD (Main Gate)', x: 22, y: 86, width: 28, height: 8, side: 'SOUTH' },
      { name: 'PORT CARGO SIDING GATE', x: 86, y: 35, width: 8, height: 25, side: 'EAST' },
    ],
    features: [
      { name: 'UTS / PRS Booking Counters', icon: 'confirmation_number', x: 30, y: 75 },
      { name: 'Station Master / Telemetry Hub', icon: 'settings_input_antenna', x: 50, y: 75 },
      { name: 'Sea Port Cargo Line Siding', icon: 'directions_boat', x: 84, y: 22 },
    ],
  },

  // 5. MADURAI JUNCTION (MDU) - 8 PLATFORMS & TEMPLE ROTUNDA
  MDU: {
    stationCode: 'MDU',
    stationName: 'Madurai Junction',
    stationType: 'JUNCTION',
    platformCount: 8,
    accentColor: '#f97316',
    concourse: {
      cx: 24,
      cy: 50,
      rx: 16,
      ry: 22,
      name: 'Meenakshi East Concourse (West Veli St)',
    },
    platforms: [
      { id: 'mdu-p1', number: '1', label: 'PF 1 (Vande Bharat & Vaigai)', x: 32, y: 15, width: 5, height: 70, orientation: 'vertical' },
      { id: 'mdu-p23', number: '2/3', label: 'PF 2 & 3 Island', x: 46, y: 15, width: 6, height: 70, orientation: 'vertical' },
      { id: 'mdu-p45', number: '4/5', label: 'PF 4 & 5 Island', x: 60, y: 15, width: 6, height: 70, orientation: 'vertical' },
      { id: 'mdu-p67', number: '6/7', label: 'PF 6 & 7 Island', x: 74, y: 15, width: 6, height: 70, orientation: 'vertical' },
      { id: 'mdu-p8', number: '8', label: 'PF 8 (Bodi Line Bay)', x: 88, y: 25, width: 4, height: 50, orientation: 'vertical' },
    ],
    tracks: [
      { x1: 39, y1: 10, x2: 39, y2: 90 },
      { x1: 54, y1: 10, x2: 54, y2: 90 },
      { x1: 68, y1: 10, x2: 68, y2: 90 },
      { x1: 82, y1: 10, x2: 82, y2: 90 },
    ],
    bridges: [
      { name: 'EAST-WEST ESCALATOR FOB (L2)', floor: 'L2', x: 30, y: 35, width: 64, height: 6, color: '#f97316' },
      { name: 'CENTRAL PASSENGER SKYWALK (L2)', floor: 'L2', x: 30, y: 55, width: 64, height: 5, color: '#00f0ff' },
    ],
    entrances: [
      { name: 'EAST ENTRY (Meenakshi Temple Side)', x: 6, y: 38, width: 10, height: 26, side: 'WEST' },
      { name: 'WEST ENTRY (Railway Colony)', x: 92, y: 38, width: 6, height: 26, side: 'EAST' },
    ],
    features: [
      { name: 'Steam Heritage Plaza', icon: 'locomotive', x: 18, y: 25 },
      { name: 'Executive AC Lounge', icon: 'weekend', x: 20, y: 64 },
    ],
  },

  // 6. TIRUCHIRAPPALLI JUNCTION (TPJ) - 8 PLATFORMS & 5-WAY JUNCTION DIAMOND
  TPJ: {
    stationCode: 'TPJ',
    stationName: 'Tiruchirappalli Junction',
    stationType: 'JUNCTION',
    platformCount: 8,
    accentColor: '#8b5cf6',
    concourse: {
      cx: 25,
      cy: 50,
      rx: 15,
      ry: 20,
      name: 'Rockfort Main Atrium Concourse',
    },
    platforms: [
      { id: 'tpj-p1', number: '1', label: 'PF 1 (Chord Line SF)', x: 32, y: 15, width: 5, height: 70, orientation: 'vertical' },
      { id: 'tpj-p23', number: '2/3', label: 'PF 2 & 3 Island', x: 46, y: 15, width: 6, height: 70, orientation: 'vertical' },
      { id: 'tpj-p45', number: '4/5', label: 'PF 4 & 5 Island', x: 60, y: 15, width: 6, height: 70, orientation: 'vertical' },
      { id: 'tpj-p67', number: '6/7', label: 'PF 6 & 7 Island', x: 74, y: 15, width: 6, height: 70, orientation: 'vertical' },
      { id: 'tpj-p8', number: '8', label: 'PF 8 (Delta Line)', x: 88, y: 15, width: 5, height: 70, orientation: 'vertical' },
    ],
    tracks: [
      { x1: 39, y1: 10, x2: 39, y2: 90 },
      { x1: 54, y1: 10, x2: 54, y2: 90 },
      { x1: 68, y1: 10, x2: 68, y2: 90 },
      { x1: 82, y1: 10, x2: 82, y2: 90 },
    ],
    bridges: [
      { name: 'GRAND SKYWALK OVERBRIDGE (L2)', floor: 'L2', x: 30, y: 35, width: 64, height: 6, color: '#8b5cf6' },
      { name: 'JUNCTION SUBWAY RAMP (L1)', floor: 'L1', x: 30, y: 60, width: 64, height: 6, color: '#00f0ff' },
    ],
    entrances: [
      { name: 'MAIN GATE (Bharathidasan Salai)', x: 6, y: 38, width: 10, height: 25, side: 'WEST' },
      { name: 'KALLUKUZHI REAR GATE', x: 92, y: 38, width: 6, height: 25, side: 'EAST' },
    ],
    features: [
      { name: 'Golden Rock Diesel Loco Connection', icon: 'precision_manufacturing', x: 80, y: 8 },
      { name: 'Divyangjan Braille Hub', icon: 'visibility', x: 22, y: 62 },
    ],
  },

  // 7. SALEM JUNCTION (SA) - 6 PLATFORMS
  SA: {
    stationCode: 'SA',
    stationName: 'Salem Junction',
    stationType: 'JUNCTION',
    platformCount: 6,
    accentColor: '#10b981',
    concourse: {
      cx: 24,
      cy: 50,
      rx: 14,
      ry: 18,
      name: 'Suramangalam Division HQ Concourse',
    },
    platforms: [
      { id: 'sa-p1', number: '1', label: 'PF 1 (Vande Bharat & Express)', x: 34, y: 16, width: 5, height: 68, orientation: 'vertical' },
      { id: 'sa-p23', number: '2/3', label: 'PF 2 & 3 Island', x: 50, y: 16, width: 6, height: 68, orientation: 'vertical' },
      { id: 'sa-p45', number: '4/5', label: 'PF 4 & 5 Island', x: 68, y: 16, width: 6, height: 68, orientation: 'vertical' },
      { id: 'sa-p6', number: '6', label: 'PF 6 (Karur Line Bay)', x: 84, y: 22, width: 5, height: 58, orientation: 'vertical' },
    ],
    tracks: [
      { x1: 42, y1: 10, x2: 42, y2: 90 },
      { x1: 60, y1: 10, x2: 60, y2: 90 },
      { x1: 76, y1: 10, x2: 76, y2: 90 },
    ],
    bridges: [
      { name: 'SALEM DIVISION SKYWALK (L2)', floor: 'L2', x: 32, y: 38, width: 58, height: 6, color: '#10b981' },
      { name: 'CENTRAL RAMP OVERPASS (L2)', floor: 'L2', x: 32, y: 58, width: 58, height: 5, color: '#00f0ff' },
    ],
    entrances: [
      { name: 'SURAMANGALAM MAIN ENTRY', x: 6, y: 38, width: 10, height: 24, side: 'WEST' },
      { name: 'REAR SUBWAY ENTRY', x: 90, y: 38, width: 6, height: 24, side: 'EAST' },
    ],
    features: [
      { name: 'Salem Division DRM Operations', icon: 'apartment', x: 18, y: 28 },
      { name: 'Passenger Lounge & Restrooms', icon: 'wc', x: 20, y: 64 },
    ],
  },
};

// Fallback dynamic generator for any station across Tamil Nadu
export function getStationBlueprint(station: Station): StationMapBlueprint {
  if (STATION_BLUEPRINTS[station.code]) {
    return STATION_BLUEPRINTS[station.code];
  }

  // Derive dynamic layout based on platform count and code
  const pCount = station.platformCount || station.platforms || 4;
  const numInt = parseInt(station.code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0).toString(), 10);
  const colorPalette = ['#ff3e00', '#00f0ff', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
  const accentColor = colorPalette[numInt % colorPalette.length];

  const platforms: StationMapBlueprint['platforms'] = [];
  const tracks: StationMapBlueprint['tracks'] = [];

  const startX = 32;
  const spacing = Math.min(16, Math.floor(56 / Math.max(2, pCount)));

  for (let i = 1; i <= pCount; i++) {
    const x = startX + (i - 1) * spacing;
    platforms.push({
      id: `${station.id}-p${i}`,
      number: `${i}`,
      label: `PF ${i} (${station.name})`,
      x,
      y: 18,
      width: Math.max(4, spacing - 4),
      height: 64,
      orientation: 'vertical',
    });

    if (i < pCount) {
      tracks.push({
        x1: x + spacing - 2,
        y1: 12,
        x2: x + spacing - 2,
        y2: 88,
      });
    }
  }

  return {
    stationCode: station.code,
    stationName: station.name,
    stationType: pCount >= 8 ? 'JUNCTION' : pCount <= 2 ? 'TERMINAL' : 'THROUGH',
    platformCount: pCount,
    accentColor,
    concourse: {
      cx: 20,
      cy: 50,
      rx: 12,
      ry: 18,
      name: `${station.name} Concourse Hall`,
    },
    platforms,
    tracks,
    bridges: [
      {
        name: `FOB 1 SKYWALK (${station.code})`,
        floor: 'L2',
        x: 28,
        y: 40,
        width: Math.min(68, pCount * spacing + 12),
        height: 6,
        color: accentColor,
      },
    ],
    entrances: [
      { name: `MAIN GATE (${station.name})`, x: 6, y: 40, width: 10, height: 22, side: 'WEST' },
      { name: `EAST EXIT`, x: 90, y: 40, width: 6, height: 22, side: 'EAST' },
    ],
    features: [
      { name: 'Ticketing & Information Kiosk', icon: 'confirmation_number', x: 18, y: 42 },
      { name: 'Accessible Restrooms', icon: 'wc', x: 18, y: 58 },
    ],
  };
}
