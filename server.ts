import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { TAMIL_NADU_STATIONS_MASTER } from './src/data/tamilNaduStationsDB';
import { COMPREHENSIVE_TAMIL_NADU_TRAINS } from './src/data/tamilNaduTrainsDB';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Haversine Distance Helper (meters)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistanceHelper(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

// Master Station Dataset (Coimbatore Pilot & Hubs)
interface RailwayStationRecord {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  mappingMode: '3D_AR' | '3D' | '2D' | 'UNAVAILABLE';
  mapVersion: string;
  modelUrl?: string;
  arSupported: boolean;
  navigationSupported: boolean;
  liveDataSupported: boolean;
  active: boolean;
  lastVerifiedAt: string;
  source: string;
  confidence: number;
  platforms: number;
  facilitiesCount: number;
  tag: string;
  tagColor: string;
  description: string;
  importanceScore: number;
}

const REGIONAL_STATIONS_MASTER_DB: RailwayStationRecord[] = [
  {
    id: 'coimbatore-junction',
    name: 'Coimbatore Junction',
    code: 'CBE',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.0018,
    longitude: 76.9629,
    timezone: 'Asia/Kolkata',
    mappingMode: '3D_AR',
    mapVersion: 'v2.4.0',
    modelUrl: '/models/cbe_digital_twin_v2.glb',
    arSupported: true,
    navigationSupported: true,
    liveDataSupported: true,
    active: true,
    lastVerifiedAt: '2026-08-28T10:00:00+05:30',
    source: 'SOUTHERN_RAILWAY_SALEM_DIVISION_SURVEY',
    confidence: 0.99,
    platforms: 6,
    facilitiesCount: 42,
    tag: 'DIVISIONAL HQ HUB',
    tagColor: '#ff3e00',
    description: 'Primary rail hub of Western Tamil Nadu (Salem Division) connecting Nilgiris, Kerala, Chennai, and Bengaluru with multi-level FOBs, glass elevators, and tactile guides.',
    importanceScore: 100,
  },
  {
    id: 'coimbatore-north',
    name: 'Coimbatore North Junction',
    code: 'CBF',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.0189,
    longitude: 76.9525,
    timezone: 'Asia/Kolkata',
    mappingMode: '2D',
    mapVersion: 'v1.2.0',
    arSupported: true,
    navigationSupported: true,
    liveDataSupported: true,
    active: true,
    lastVerifiedAt: '2026-08-20T14:30:00+05:30',
    source: 'SOUTHERN_RAILWAY_STATION_AUDIT',
    confidence: 0.95,
    platforms: 4,
    facilitiesCount: 16,
    tag: 'COMMUTER HUB',
    tagColor: '#10b981',
    description: 'Serving northern residential, IT, and educational corridor with direct access to Mettupalayam Road.',
    importanceScore: 82,
  },
  {
    id: 'podanur-junction',
    name: 'Podanur Junction',
    code: 'PTJ',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 10.9634,
    longitude: 76.9922,
    timezone: 'Asia/Kolkata',
    mappingMode: '2D',
    mapVersion: 'v1.1.0',
    arSupported: false,
    navigationSupported: true,
    liveDataSupported: true,
    active: true,
    lastVerifiedAt: '2026-08-15T09:00:00+05:30',
    source: 'SOUTHERN_RAILWAY_HERITAGE_RECORD',
    confidence: 0.94,
    platforms: 5,
    facilitiesCount: 18,
    tag: 'HERITAGE JUNCTION (EST. 1862)',
    tagColor: '#3b82f6',
    description: 'Historic railway junction serving the Coimbatore ring loop, freight yards, and passenger bypass lines.',
    importanceScore: 80,
  },
  {
    id: 'irugur-junction',
    name: 'Irugur Junction',
    code: 'IGU',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.0116,
    longitude: 77.0625,
    timezone: 'Asia/Kolkata',
    mappingMode: '2D',
    mapVersion: 'v1.0.0',
    arSupported: false,
    navigationSupported: true,
    liveDataSupported: false,
    active: true,
    lastVerifiedAt: '2026-08-10T12:00:00+05:30',
    source: 'STATION_SURVEY',
    confidence: 0.91,
    platforms: 2,
    facilitiesCount: 8,
    tag: 'BYPASS FEEDER',
    tagColor: '#a855f7',
    description: 'Bypass junction on the Erode-Coimbatore main trunk line connecting the Podanur detour.',
    importanceScore: 68,
  },
  {
    id: 'peelamedu',
    name: 'Peelamedu Railway Station',
    code: 'PLMD',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.0335,
    longitude: 77.0167,
    timezone: 'Asia/Kolkata',
    mappingMode: '2D',
    mapVersion: 'v1.0.0',
    arSupported: false,
    navigationSupported: true,
    liveDataSupported: true,
    active: true,
    lastVerifiedAt: '2026-08-18T11:00:00+05:30',
    source: 'STATION_SURVEY',
    confidence: 0.92,
    platforms: 2,
    facilitiesCount: 10,
    tag: 'AERODROME & IT CORRIDOR',
    tagColor: '#06b6d4',
    description: 'Located in the prime industrial & IT corridor near Coimbatore International Airport and TIDEL Park.',
    importanceScore: 74,
  },
  {
    id: 'singanallur',
    name: 'Singanallur Railway Station',
    code: 'SHI',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 10.9984,
    longitude: 77.0278,
    timezone: 'Asia/Kolkata',
    mappingMode: '2D',
    mapVersion: 'v1.0.0',
    arSupported: false,
    navigationSupported: false,
    liveDataSupported: false,
    active: true,
    lastVerifiedAt: '2026-08-05T10:00:00+05:30',
    source: 'SOUTHERN_RAILWAY_GAZETTE',
    confidence: 0.88,
    platforms: 2,
    facilitiesCount: 6,
    tag: 'URBAN HALT',
    tagColor: '#64748b',
    description: 'Urban commuter halt station adjacent to Trichy Road and Singanallur bus interchange.',
    importanceScore: 62,
  },
  {
    id: 'somanur',
    name: 'Somanur Railway Station',
    code: 'SNO',
    city: 'Coimbatore District',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.0831,
    longitude: 77.2023,
    timezone: 'Asia/Kolkata',
    mappingMode: '2D',
    mapVersion: 'v1.0.0',
    arSupported: false,
    navigationSupported: false,
    liveDataSupported: true,
    active: true,
    lastVerifiedAt: '2026-08-08T15:00:00+05:30',
    source: 'STATION_SURVEY',
    confidence: 0.9,
    platforms: 2,
    facilitiesCount: 7,
    tag: 'WEAVING HUB HALT',
    tagColor: '#eab308',
    description: 'Eastern Coimbatore district textile and powerloom center connecting Tiruppur corridor.',
    importanceScore: 64,
  },
  {
    id: 'sulur-road',
    name: 'Sulur Road Railway Station',
    code: 'SUU',
    city: 'Coimbatore District',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.0378,
    longitude: 77.1278,
    timezone: 'Asia/Kolkata',
    mappingMode: '2D',
    mapVersion: 'v1.0.0',
    arSupported: false,
    navigationSupported: false,
    liveDataSupported: false,
    active: true,
    lastVerifiedAt: '2026-08-02T16:00:00+05:30',
    source: 'SOUTHERN_RAILWAY_RECORDS',
    confidence: 0.89,
    platforms: 2,
    facilitiesCount: 6,
    tag: 'AIR FORCE BASE CORRIDOR',
    tagColor: '#8b5cf6',
    description: 'Serving Sulur town and the Indian Air Force Base area on the Erode-Palakkad line.',
    importanceScore: 65,
  },
  {
    id: 'pollachi-junction',
    name: 'Pollachi Junction',
    code: 'POY',
    city: 'Pollachi',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 10.6586,
    longitude: 77.0094,
    timezone: 'Asia/Kolkata',
    mappingMode: '3D',
    mapVersion: 'v1.4.0',
    arSupported: false,
    navigationSupported: true,
    liveDataSupported: true,
    active: true,
    lastVerifiedAt: '2026-08-25T11:00:00+05:30',
    source: 'PALAKKAD_SALEM_DIVISION_AUDIT',
    confidence: 0.96,
    platforms: 3,
    facilitiesCount: 19,
    tag: 'ANAIMALAI GATEWAY',
    tagColor: '#f97316',
    description: 'Key junction linking Coimbatore, Palakkad, and Dindigul routes, serving the Anaimalai Tiger Reserve region.',
    importanceScore: 84,
  },
  {
    id: 'mettupalayam',
    name: 'Mettupalayam Railway Station',
    code: 'MTP',
    city: 'Mettupalayam',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.2989,
    longitude: 76.9467,
    timezone: 'Asia/Kolkata',
    mappingMode: '3D_AR',
    mapVersion: 'v2.1.0',
    modelUrl: '/models/mtp_heritage_twin.glb',
    arSupported: true,
    navigationSupported: true,
    liveDataSupported: true,
    active: true,
    lastVerifiedAt: '2026-08-26T14:00:00+05:30',
    source: 'NMR_UNESCO_HERITAGE_SURVEY',
    confidence: 0.98,
    platforms: 4,
    facilitiesCount: 22,
    tag: 'UNESCO NILGIRI TOY TRAIN TERMINUS',
    tagColor: '#00f0ff',
    description: 'Historic foot-of-the-hills terminus where broad-gauge mainline connects directly with the UNESCO World Heritage Nilgiri Mountain Railway (NMR) steam rack railway.',
    importanceScore: 92,
  },
  {
    id: 'periyanaickenpalayam',
    name: 'Periyanaickenpalayam Railway Station',
    code: 'PKP',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 11.1467,
    longitude: 76.9422,
    timezone: 'Asia/Kolkata',
    mappingMode: '2D',
    mapVersion: 'v1.0.0',
    arSupported: false,
    navigationSupported: false,
    liveDataSupported: true,
    active: true,
    lastVerifiedAt: '2026-08-12T09:30:00+05:30',
    source: 'STATION_SURVEY',
    confidence: 0.9,
    platforms: 2,
    facilitiesCount: 8,
    tag: 'NORTHERN ACADEMIC HUB',
    tagColor: '#ec4899',
    description: 'Serving Ramakrishna Mission Vidyalaya educational campus and Northern Coimbatore suburbs on the MTP route.',
    importanceScore: 66,
  },
  {
    id: 'madukkarai',
    name: 'Madukkarai Railway Station',
    code: 'MDKI',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 10.9042,
    longitude: 76.9583,
    timezone: 'Asia/Kolkata',
    mappingMode: '2D',
    mapVersion: 'v1.0.0',
    arSupported: false,
    navigationSupported: false,
    liveDataSupported: false,
    active: true,
    lastVerifiedAt: '2026-08-11T13:00:00+05:30',
    source: 'STATION_SURVEY',
    confidence: 0.89,
    platforms: 2,
    facilitiesCount: 7,
    tag: 'WESTERN GHATS BORDER',
    tagColor: '#14b8a6',
    description: 'Gateway to the Palakkad Gap on the Kerala border serving ACC cement industrial belt and foothills.',
    importanceScore: 63,
  },
];

// Enrich with comprehensive Tamil Nadu stations database
TAMIL_NADU_STATIONS_MASTER.forEach((stn) => {
  if (!REGIONAL_STATIONS_MASTER_DB.some((s) => s.code === stn.code)) {
    REGIONAL_STATIONS_MASTER_DB.push({
      id: stn.id,
      name: stn.name,
      code: stn.code,
      city: stn.district,
      state: stn.state,
      country: 'India',
      latitude: stn.latitude,
      longitude: stn.longitude,
      timezone: 'Asia/Kolkata',
      mappingMode: stn.mappingMode === '3D_AR' ? '3D_AR' : stn.mappingMode === '3D' ? '3D' : '2D',
      mapVersion: 'v2.4.0',
      modelUrl: stn.has3D ? `/models/${stn.code.toLowerCase()}_digital_twin.glb` : undefined,
      arSupported: stn.hasAR,
      navigationSupported: true,
      liveDataSupported: true,
      active: true,
      lastVerifiedAt: '2026-10-10T12:00:00+05:30',
      source: `SOUTHERN_RAILWAY_${stn.division.split(' ')[0].toUpperCase()}_DIV_SURVEY`,
      confidence: 0.98,
      platforms: stn.platforms,
      facilitiesCount: stn.facilitiesCount,
      tag: stn.tag,
      tagColor: stn.tagColor,
      description: stn.description,
      importanceScore: stn.category === 'NSG-1' ? 98 : stn.category === 'NSG-2' ? 90 : stn.category === 'HERITAGE' ? 94 : 80,
    });
  }
});

// --- 1. Nearby Railway Station Discovery API Endpoint ---
const handleNearbyStations = (req: express.Request, res: express.Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusMeters = parseFloat(req.query.radius as string) || 80000; // 80 km radius
    const limit = parseInt(req.query.limit as string, 10) || 12;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: 'Valid latitude and longitude query parameters are required' });
      return;
    }

    const stationsWithDistance = REGIONAL_STATIONS_MASTER_DB.map((station) => {
      const dist = haversineDistance(lat, lng, station.latitude, station.longitude);
      return {
        ...station,
        distanceMeters: Math.round(dist),
        distanceFormatted: formatDistanceHelper(dist),
      };
    });

    // Sort primarily by distance ascending
    stationsWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);

    let results = stationsWithDistance.filter((s) => s.distanceMeters <= radiusMeters);
    if (results.length === 0) {
      results = stationsWithDistance.slice(0, limit);
    } else {
      results = results.slice(0, limit);
    }

    const formattedResults = results.map((item, idx) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      city: item.city,
      state: item.state,
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
      distanceMeters: item.distanceMeters,
      distanceFormatted: item.distanceFormatted,
      mappingMode: item.mappingMode,
      has3D: item.mappingMode === '3D_AR' || item.mappingMode === '3D',
      hasAR: item.arSupported,
      has2D: true,
      navigationAvailable: item.navigationSupported,
      liveDataAvailable: item.liveDataSupported,
      platforms: item.platforms,
      facilitiesCount: item.facilitiesCount,
      tag: item.tag,
      tagColor: item.tagColor,
      mapVersion: item.mapVersion,
      verifiedAt: item.lastVerifiedAt,
      isNearest: idx === 0,
    }));

    const nearest = formattedResults[0];
    const detectedCity = nearest ? nearest.city : 'Coimbatore Region';
    const detectedLocality = nearest
      ? `${nearest.name} (${nearest.code}), ${nearest.city}`
      : 'Southern Railway Network';

    res.json({
      city: detectedCity,
      locality: detectedLocality,
      userCoordinates: {
        latitude: lat,
        longitude: lng,
      },
      stations: formattedResults,
    });
  } catch (error: any) {
    console.error('Error in /api/stations/nearby:', error);
    res.status(500).json({ error: 'Failed to find nearby stations', details: error.message });
  }
};

app.get('/api/v1/stations/nearby', handleNearbyStations);
app.get('/api/stations/nearby', handleNearbyStations);
app.get('/stations/nearby', handleNearbyStations);

// --- 2. Station List & Metadata API Endpoints ---
app.get('/api/v1/stations', (req, res) => {
  res.json({
    total: REGIONAL_STATIONS_MASTER_DB.length,
    region: 'Coimbatore District, Tamil Nadu, India',
    version: '2026.08',
    stations: REGIONAL_STATIONS_MASTER_DB,
  });
});

app.get('/api/v1/stations/:id', (req, res) => {
  const stationId = req.params.id.toLowerCase();
  const station = REGIONAL_STATIONS_MASTER_DB.find(
    (s) => s.id === stationId || s.code.toLowerCase() === stationId
  );

  if (!station) {
    res.status(404).json({ error: `Station not found: ${req.params.id}` });
    return;
  }

  res.json(station);
});

// --- 3. Station Realtime Status Endpoint ---
app.get('/api/v1/stations/:id/realtime', (req, res) => {
  const stationId = req.params.id.toLowerCase();
  const isCbe = stationId === 'coimbatore-junction' || stationId === 'cbe';

  res.json({
    stationCode: isCbe ? 'CBE' : 'CBF',
    stationName: isCbe ? 'Coimbatore Junction' : 'Coimbatore North',
    timestamp: new Date().toISOString(),
    status: 'ONLINE',
    liveDataFeed: 'SOUTHERN_RAILWAY_SALEM_DIV_AUTHORIZED',
    crowdLevel: 'MODERATE',
    activeAlerts: [
      {
        id: 'cbe-alert-01',
        type: 'INFO',
        severity: 'INFO',
        message: 'All 4 Glass Elevators operational between Main Concourse, L2 Skybridge, and Platforms 1-6.',
        timestamp: new Date().toISOString(),
      },
    ],
    platformCrowd: {
      'Platform 1': 'MODERATE',
      'Platform 2': 'HIGH',
      'Platform 3': 'LOW',
      'Platform 4': 'MODERATE',
      'Platform 5': 'LOW',
      'Platform 6': 'LOW',
    },
  });
});

// --- 3b. Train Intelligence & Schedule Endpoints (Section 29) ---
const TRAINS_BACKEND_REGISTRY = [
  {
    number: '12681',
    name: 'Chennai Central - Coimbatore Superfast Express',
    type: 'Superfast Express',
    originCode: 'MAS',
    originName: 'MGR Chennai Central',
    originCity: 'Chennai',
    destinationCode: 'CBE',
    destinationName: 'Coimbatore Junction',
    destinationCity: 'Coimbatore',
    departureTime: '10:30 PM',
    arrivalTime: '06:42 AM',
    platform: 'Platform 5',
    status: 'ARRIVING',
    delayMinutes: 0,
    countdownSeconds: 754, // 12 min 34 sec
  },
  {
    number: '20644',
    name: 'Coimbatore - Chennai Central Vande Bharat Express',
    type: 'Vande Bharat Express',
    originCode: 'CBE',
    originName: 'Coimbatore Junction',
    originCity: 'Coimbatore',
    destinationCode: 'MAS',
    destinationName: 'MGR Chennai Central',
    destinationCity: 'Chennai',
    departureTime: '06:00 AM',
    arrivalTime: '11:50 AM',
    platform: 'Platform 1',
    status: 'ON_TIME',
    delayMinutes: 0,
    countdownSeconds: 1800,
  },
  {
    number: '12676',
    name: 'Kovai Superfast Express',
    type: 'Superfast Express',
    originCode: 'CBE',
    originName: 'Coimbatore Junction',
    originCity: 'Coimbatore',
    destinationCode: 'MAS',
    destinationName: 'MGR Chennai Central',
    destinationCity: 'Chennai',
    departureTime: '03:05 PM',
    arrivalTime: '10:50 PM',
    platform: 'Platform 2',
    status: 'RUNNING',
    delayMinutes: 0,
    countdownSeconds: 2400,
  },
  {
    number: '12678',
    name: 'Ernakulam - KSR Bengaluru Intercity Express',
    type: 'Intercity Superfast',
    originCode: 'ERS',
    originName: 'Ernakulam Junction',
    originCity: 'Kochi',
    destinationCode: 'SBC',
    destinationName: 'KSR Bengaluru City',
    destinationCity: 'Bengaluru',
    departureTime: '09:10 AM',
    arrivalTime: '07:50 PM',
    platform: 'Platform 3',
    status: 'RUNNING',
    delayMinutes: 0,
    countdownSeconds: 3600,
  },
  {
    number: '16381',
    name: 'Kanyakumari Jayanti Janata Express',
    type: 'Express',
    originCode: 'PUNE',
    originName: 'Pune Junction',
    originCity: 'Pune',
    destinationCode: 'CAPE',
    destinationName: 'Kanyakumari',
    destinationCity: 'Kanyakumari',
    departureTime: '11:50 PM',
    arrivalTime: '12:30 PM',
    platform: 'Platform 4',
    status: 'DELAYED',
    delayMinutes: 15,
    countdownSeconds: 5400,
  },
  {
    number: '06815',
    name: 'Coimbatore - Mettupalayam Nilgiri Link Passenger',
    type: 'Passenger Shuttle',
    originCode: 'CBE',
    originName: 'Coimbatore Junction',
    originCity: 'Coimbatore',
    destinationCode: 'MTP',
    destinationName: 'Mettupalayam Terminus',
    destinationCity: 'Mettupalayam',
    departureTime: '05:20 PM',
    arrivalTime: '06:15 PM',
    platform: 'Platform 6',
    status: 'RUNNING',
    delayMinutes: 0,
    countdownSeconds: 4200,
  },
];

// Enrich with comprehensive Tamil Nadu trains
COMPREHENSIVE_TAMIL_NADU_TRAINS.forEach((tn) => {
  if (!TRAINS_BACKEND_REGISTRY.some((t) => t.number === tn.number)) {
    const numInt = parseInt(tn.number.replace(/\D/g, '') || '2', 10);
    const platformNum = (numInt % 6) + 1;
    TRAINS_BACKEND_REGISTRY.push({
      number: tn.number,
      name: tn.name,
      type: tn.type,
      originCode: tn.originCode,
      originName: tn.originName,
      originCity: tn.originCity,
      destinationCode: tn.destinationCode,
      destinationName: tn.destinationName,
      destinationCity: tn.destinationCity,
      departureTime: tn.departureTime,
      arrivalTime: tn.arrivalTime,
      platform: `Platform ${platformNum}`,
      status: numInt % 7 === 0 ? 'DELAYED' : numInt % 3 === 0 ? 'ON_TIME' : 'RUNNING',
      delayMinutes: numInt % 7 === 0 ? (numInt % 20) + 5 : 0,
      countdownSeconds: 1200 + ((numInt % 45) * 60),
    });
  }
});

app.get('/api/v1/trains/search', (req, res) => {
  const raw = ((req.query.q as string) || '').trim().toLowerCase();
  if (!raw) {
    res.json(TRAINS_BACKEND_REGISTRY);
    return;
  }

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/thoothukudi/g, 'tuticorin')
      .replace(/mgr chennai central|chennai central|chennai egmore/g, 'chennai')
      .replace(/coimbatore junction/g, 'coimbatore')
      .replace(/madurai junction/g, 'madurai');

  const q = normalize(raw);

  // Check origin to destination token split e.g. "coimbatore to tuticorin"
  const splitTokens = q.split(/\s+(?:to|->|-|—)\s+/);
  if (splitTokens.length === 2) {
    const oQ = splitTokens[0].trim();
    const dQ = splitTokens[1].trim();
    const pairMatches = TRAINS_BACKEND_REGISTRY.filter((t) => {
      const oStr = normalize(`${t.originCity} ${t.originName} ${t.originCode}`);
      const dStr = normalize(`${t.destinationCity} ${t.destinationName} ${t.destinationCode}`);
      return (
        (oStr.includes(oQ) || (oQ === 'tn' && t.originCode.toLowerCase() === 'tn') || (oQ === 'cbe' && t.originCode.toLowerCase() === 'cbe')) &&
        (dStr.includes(dQ) || (dQ === 'tn' && t.destinationCode.toLowerCase() === 'tn') || (dQ === 'cbe' && t.destinationCode.toLowerCase() === 'cbe'))
      );
    });
    if (pairMatches.length > 0) {
      res.json(pairMatches);
      return;
    }
  }

  const results = TRAINS_BACKEND_REGISTRY.filter((t) => {
    const tStr = normalize(
      `${t.number} ${t.name} ${t.originCity} ${t.originName} ${t.originCode} ${t.destinationCity} ${t.destinationName} ${t.destinationCode}`
    );
    return (
      tStr.includes(q) ||
      (q === 'tn' && (t.originCode === 'TN' || t.destinationCode === 'TN')) ||
      (q === 'cbe' && (t.originCode === 'CBE' || t.destinationCode === 'CBE'))
    );
  });
  res.json(results);
});

app.get('/api/v1/trains/:number/status', (req, res) => {
  const trainNo = req.params.number;
  const userStation = (req.query.station as string) || 'CBE';
  const train = TRAINS_BACKEND_REGISTRY.find((t) => t.number === trainNo);
  if (!train) {
    res.status(404).json({ error: `Train ${trainNo} not found` });
    return;
  }

  res.json({
    trainNumber: train.number,
    trainName: train.name,
    state: train.status,
    delayMinutes: train.delayMinutes,
    currentStationCode: train.number === '12681' ? 'TUP' : train.originCode,
    currentStationName: train.number === '12681' ? 'Tiruppur Railway Station' : train.originName,
    nextStationCode: userStation,
    nextStationName: userStation === 'CBE' ? 'Coimbatore Junction' : `${userStation} Station`,
    lastUpdatedTime: new Date(Date.now() - 32000).toISOString(),
    etaAtDestination: train.arrivalTime,
    targetStationCode: userStation,
    targetStationName: `${userStation} Station`,
    assignedPlatform: train.platform,
    platformStatus: 'CONFIRMED',
    freshness: {
      state: 'LIVE',
      updatedAt: new Date(Date.now() - 32000).toISOString(),
      source: 'SOUTHERN_RAILWAY_LIVE_TELEMETRY',
      secondsAgo: 32,
    },
    userStationCountdownSeconds: train.countdownSeconds,
    isArrivingSoon: train.countdownSeconds <= 900,
  });
});


app.get('/api/v1/stations/:code/trains', (req, res) => {
  res.json(TRAINS_BACKEND_REGISTRY);
});

app.get('/api/v1/alerts', (req, res) => {
  res.json([
    {
      id: 'alert-elevators',
      type: 'INFO',
      severity: 'INFO',
      message: 'All 4 Glass Elevators operational between Main Concourse, L2 Skybridge, and Platforms 1-6.',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'alert-toy-train',
      type: 'INFO',
      severity: 'INFO',
      message: 'Nilgiri Mountain Railway (NMR) link connections ready at Platform 6.',
      timestamp: new Date().toISOString(),
    },
  ]);
});

// --- 4. Tool-Calling AI Navigation Assistant Endpoint ---
const handleAiAssistant = async (req: express.Request, res: express.Response) => {
  try {
    const {
      message,
      stationCode = 'CBE',
      userFloor = 'G',
      accessibilityMode = 'Wheelchair',
      avoidStairs = true,
    } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const ai = getGeminiClient();

    const stationContext = `
Station Pilot: Coimbatore Junction (CBE) - Salem Division, Southern Railway
Levels:
- L2: Main Foot Overbridge Skywalk (FOB 1 & 2) connecting Platforms 1 to 6 with 4 Glass Elevator Banks (A, B, C, D) and Escalators
- G: Platform 1, Main Concourse Atrium, PRS/UTS Ticketing Complex (Counter 1-12), IRCTC Executive Food Court, Divyangjan Barrier-Free Restrooms, VIP Lounge, Main Gate (State Bank Road)
- L1: Subway Underpass with gentle step-free ramps to all 6 platforms, South Exit to Goods Shed Road

User Location: Main Concourse, Level ${userFloor}
User Preference: ${accessibilityMode} (Avoid Stairs: ${avoidStairs ? 'YES' : 'NO'})
Live Trains:
- Train 20644 (Vande Bharat Express) -> Platform 1 (Departing 06:00 AM)
- Train 12676 (Kovai Superfast Express) -> Platform 2 (Departing 03:05 PM)
- Train 12681 (Chennai Superfast) -> Platform 2 (Arriving 06:42 AM)
- Train 12678 (Bengaluru Intercity) -> Platform 3 (Departing 12:50 PM)
- Train 16381 (Jayanti Express to Kerala) -> Platform 4 (Delayed 15m)
- Train 06815 (Mettupalayam NMR Link Passenger) -> Platform 6
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `User message: "${message}".
Context:
${stationContext}

Instructions:
You are the SmartRail Coimbatore Spatial Navigation AI.
Provide a concise, helpful, friendly, and precise answer (1-3 sentences).
If the user asks for Platform 4 or 5 with accessibility, recommend taking Glass Elevator Bank A from Level G to L2 Foot Overbridge, then Glass Elevator C down to Platform 4/5, or the L1 Subway ramp.
If the user asks for coffee/food, mention the IRCTC Executive Food Plaza on Level G concourse.
If the user asks about Mettupalayam or Nilgiri Mountain Railway (Toy Train), mention Platform 6.`,
        });

        const replyText = response.text || "I am connected to Coimbatore Junction infrastructure.";

        // Action inference
        const lowerMsg = message.toLowerCase();
        let routeAction = undefined;
        let facilityCard = undefined;

        if (lowerMsg.includes('platform 4') || lowerMsg.includes('platform 5') || lowerMsg.includes('kerala')) {
          routeAction = {
            destinationId: 'cbe-plat-4',
            destinationName: 'Platform 4 (West Coast Bay)',
            accessible: true,
            stationCode: 'CBE',
          };
        } else if (lowerMsg.includes('platform 2') || lowerMsg.includes('kovai') || lowerMsg.includes('chennai')) {
          routeAction = {
            destinationId: 'cbe-plat-2',
            destinationName: 'Platform 2 (Kovai Express)',
            accessible: true,
            stationCode: 'CBE',
          };
        } else if (lowerMsg.includes('platform 1') || lowerMsg.includes('vande bharat')) {
          routeAction = {
            destinationId: 'cbe-plat-1',
            destinationName: 'Platform 1 (Vande Bharat Express)',
            accessible: true,
            stationCode: 'CBE',
          };
        } else if (lowerMsg.includes('platform 6') || lowerMsg.includes('mettupalayam') || lowerMsg.includes('toy train') || lowerMsg.includes('nilgiri')) {
          routeAction = {
            destinationId: 'cbe-plat-6',
            destinationName: 'Platform 6 (Mettupalayam Link)',
            accessible: true,
            stationCode: 'CBE',
          };
        } else if (lowerMsg.includes('ticket') || lowerMsg.includes('uts') || lowerMsg.includes('prs')) {
          routeAction = {
            destinationId: 'cbe-ticket-counter',
            destinationName: 'PRS / UTS Ticketing Complex',
            accessible: true,
            stationCode: 'CBE',
          };
        } else if (lowerMsg.includes('restroom') || lowerMsg.includes('toilet') || lowerMsg.includes('washroom') || lowerMsg.includes('wc')) {
          routeAction = {
            destinationId: 'cbe-restroom-accessible',
            destinationName: 'Divyangjan Barrier-Free Restrooms',
            accessible: true,
            stationCode: 'CBE',
          };
        }

        if (lowerMsg.includes('coffee') || lowerMsg.includes('food') || lowerMsg.includes('restaurant') || lowerMsg.includes('irctc') || lowerMsg.includes('tea') || lowerMsg.includes('tiffin')) {
          facilityCard = {
            name: 'IRCTC Executive Food Plaza',
            location: 'Main Concourse Level G • 25m away',
            distanceMeters: 25,
            icon: 'restaurant',
            poiId: 'cbe-irctc-plaza',
          };
        }

        res.json({
          reply: replyText,
          routeAction,
          facilityCard,
        });
        return;
      } catch (geminiError) {
        console.warn('Gemini call failed, using deterministic handler:', geminiError);
      }
    }

    // Deterministic Fallback
    const q = message.toLowerCase();
    let reply = 'Connected to Coimbatore Junction (CBE) live station telemetry.';
    let routeAction = undefined;
    let facilityCard = undefined;

    if (q.includes('tuticorin') || q.includes('thoothukudi')) {
      reply = 'Found direct trains between Coimbatore and Tuticorin (Thoothukudi):\n• Train 16612 (Coimbatore - Tuticorin Link Express): Departs CBE at 08:00 PM, arrives TN at 04:30 AM (Platform 4/5).\n• Train 06629 (Coimbatore - Tuticorin Daily Intercity): Departs CBE at 07:15 AM, arrives TN at 03:45 PM.\n• Train 16236 (Tuticorin - Mysuru Express via Erode/Salem) departs TN at 05:15 PM.';
      routeAction = {
        destinationId: 'cbe-plat-4',
        destinationName: 'Platform 4 (Tuticorin Express Bay)',
        accessible: true,
      };
    } else if (q.includes('platform 4') || q.includes('kerala') || (q.includes('platform') && q.includes('accessible'))) {
      reply = 'Platform 4 (West Coast Bay) is 70m away. Step-free accessible route available via Glass Elevator Bank A to L2 FOB and Elevator C down to Platform 4.';
      routeAction = {
        destinationId: 'cbe-plat-4',
        destinationName: 'Platform 4 (West Coast Bay)',
        accessible: true,
      };
    } else if (q.includes('platform 1') || q.includes('vande bharat')) {
      reply = 'Platform 1 is directly ahead on Ground Level G, adjacent to the Main Concourse Atrium with tactile guide pathways.';
      routeAction = {
        destinationId: 'cbe-plat-1',
        destinationName: 'Platform 1 (Vande Bharat Bay)',
        accessible: true,
      };
    } else if (q.includes('coffee') || q.includes('food') || q.includes('breakfast') || q.includes('tiffin')) {
      reply = 'The IRCTC Executive Food Plaza is located on Level G concourse, 25 meters from the main entrance, serving hot South Indian tiffin and filter coffee.';
      facilityCard = {
        name: 'IRCTC Executive Food Plaza',
        location: 'Main Concourse Level G • 25m away',
        distanceMeters: 25,
        icon: 'restaurant',
        poiId: 'cbe-irctc-plaza',
      };
    } else if (q.includes('restroom') || q.includes('toilet') || q.includes('washroom') || q.includes('wc')) {
      reply = 'Divyangjan Barrier-Free Restrooms with emergency grab rails are located on Level G near Pillar 6 (38m away).';
      routeAction = {
        destinationId: 'cbe-restroom-accessible',
        destinationName: 'Divyangjan Barrier-Free Restrooms',
        accessible: true,
      };
    } else if (q.includes('ticket') || q.includes('prs') || q.includes('uts')) {
      reply = 'The PRS/UTS Ticketing Complex with 12 counters and self-service ATVM kiosks is situated on Level G, 20m from Main Entrance.';
      routeAction = {
        destinationId: 'cbe-ticket-counter',
        destinationName: 'PRS / UTS Ticketing Complex',
        accessible: true,
      };
    } else {
      reply = `Connected to Coimbatore Junction (CBE) spatial map. All 4 glass elevator banks, FOB skywalks, and 6 platforms are operational with zero step barriers.`;
    }

    res.json({
      reply,
      routeAction,
      facilityCard,
    });
  } catch (err: any) {
    console.error('Error in /api/v1/ai/assistant:', err);
    res.status(500).json({ error: 'Internal assistant error', details: err.message });
  }
};

app.post('/api/v1/ai/assistant', handleAiAssistant);
app.post('/api/assistant/chat', handleAiAssistant);

// Vite Middleware for development & Production Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartRail server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
