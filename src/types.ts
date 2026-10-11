export type TabType =
  | 'explore'
  | 'train_search'
  | 'train_details'
  | 'my_journey'
  | 'stations'
  | 'map'
  | 'ar_nav'
  | 'assistant'
  | 'facilities'
  | 'profile'
  | 'routes'
  | 'tickets'
  | 'nearby'
  | 'login'
  | 'admin'
  | 'user';

export type MappingMode = '2D' | '3D' | 'AR' | '3D_AR' | 'UNAVAILABLE';

export type RouteProfile = 'FASTEST' | 'SHORTEST' | 'ACCESSIBLE' | 'NO_STAIRS' | 'PREFER_LIFT' | 'LOW_CROWD';

export type RouteStrategy = 'fastest' | 'accessible' | 'low_crowd' | 'shortest';

export type LocationStatus =
  | 'IDLE'
  | 'REQUESTING_PERMISSION'
  | 'DETECTING'
  | 'DETECTED'
  | 'PERMISSION_DENIED'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'LOW_ACCURACY';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export type RealtimeStatus =
  | 'LIVE'
  | 'RUNNING'
  | 'ON_TIME'
  | 'DELAYED'
  | 'CANCELLED'
  | 'ARRIVING'
  | 'DEPARTED'
  | 'EXPECTED'
  | 'STALE'
  | 'UNKNOWN'
  | 'OFFLINE'
  | 'DEMO_DATA';

export type DataFreshnessState = 'LIVE' | 'RECENT' | 'STALE' | 'UNKNOWN' | 'OFFLINE' | 'DEMO_DATA';

export interface DataFreshness {
  state: DataFreshnessState;
  updatedAt: string;
  source: string;
  secondsAgo?: number;
}

export type CrowdLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN';

export type AppLanguage = 'English' | 'Tamil' | 'Hindi' | 'Malayalam' | 'Telugu' | 'Kannada';

export interface StationMetadata {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  mappingMode: MappingMode;
  mapVersion: string;
  modelUrl?: string;
  arSupported: boolean;
  navigationSupported: boolean;
  liveDataSupported: boolean;
  active: boolean;
  lastVerifiedAt: string;
  source: string;
  confidence: number | null;
  platforms: number;
  facilitiesCount: number;
  tag?: string;
  tagColor?: string;
  description: string;
}

export interface NearbyStationResult {
  id: string;
  name: string;
  code: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  distanceFormatted: string;
  mappingMode: MappingMode;
  has3D: boolean;
  hasAR: boolean;
  has2D: boolean;
  navigationAvailable: boolean;
  liveDataAvailable: boolean;
  platforms: number;
  facilitiesCount: number;
  tag?: string;
  tagColor?: string;
  isNearest?: boolean;
  mapVersion?: string;
  verifiedAt?: string;
}

export interface NearbyStationsResponse {
  city: string;
  locality?: string;
  userCoordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  stations: NearbyStationResult[];
}

export type NavigationState =
  | 'idle'
  | 'preview'
  | 'started'
  | 'approaching_turn'
  | 'turn_now'
  | 'floor_change'
  | 'destination_approaching'
  | 'arrived'
  | 'recalculating';

export interface StationPOI {
  id: string;
  name: string;
  category: 'platform' | 'restroom' | 'food' | 'exit' | 'service' | 'transit' | 'elevator' | 'accessibility';
  floor: 'L2' | 'G' | 'L1';
  x: number; // 0 to 100 percentage or 3D units
  y: number;
  z?: number;
  walkingTimeMin: number;
  description?: string;
  accessible: boolean;
  icon: string;
  crowdLevel?: CrowdLevel;
  platformStatus?: string;
  status?: string;
  verifiedAt?: string;
  source?: string;
}

export interface StationFloor {
  id: 'L2' | 'G' | 'L1';
  name: string;
  label: string;
  description: string;
}

// Train Stop inside a Journey Timeline
export interface TrainStop {
  stopSequence: number;
  stationCode: string;
  stationName: string;
  city: string;
  scheduledArrival: string;
  actualOrEstimatedArrival?: string;
  scheduledDeparture: string;
  actualOrEstimatedDeparture?: string;
  delayMinutes: number;
  platform: string;
  platformConfirmed: boolean;
  distanceFromOriginKm: number;
  status: 'PASSED' | 'CURRENT' | 'UPCOMING' | 'TERMINUS';
  isUserStation?: boolean;
}

// Full Train Details
export interface Train {
  id: string;
  number: string;
  name: string;
  type: string; // Express, Superfast, Vande Bharat, Intercity, Shatabdi, Passenger
  operator: string; // Southern Railway, South Western Railway, etc.
  originCode: string;
  originName: string;
  originCity: string;
  destinationCode: string;
  destinationName: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  totalDurationFormatted: string;
  totalDistanceKm: number;
  runsOnDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  classes: string[]; // ['1A', '2A', '3A', 'SL', 'CC', 'EC', '2S']
  pantryAvailable: boolean;
}

export interface TrainStatus {
  trainNumber: string;
  trainName: string;
  state: 'RUNNING' | 'ON_TIME' | 'DELAYED' | 'ARRIVING' | 'DEPARTED' | 'CANCELLED' | 'TERMINATED';
  delayMinutes: number;
  currentStationCode?: string;
  currentStationName?: string;
  nextStationCode?: string;
  nextStationName?: string;
  lastUpdatedTime: string;
  etaAtDestination: string;
  targetStationCode: string;
  targetStationName: string;
  assignedPlatform: string;
  platformStatus: 'CONFIRMED' | 'EXPECTED' | 'UNASSIGNED';
  freshness: DataFreshness;
  speedKmh?: number;
  stops: TrainStop[];
  userStationCountdownSeconds?: number;
  isArrivingSoon?: boolean;
}

export interface DepartureTrain {
  id: string;
  trainNumber: string;
  trainName?: string;
  origin?: string;
  destination: string;
  operator: string;
  time: string;
  status: RealtimeStatus | 'On Time' | 'Delayed' | 'Boarding' | 'Departed';
  platform: string;
  delayMin?: number;
  trackColor?: string;
  source?: string;
  updatedAt?: string;
  confidence?: number;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  platforms: number;
  platformCount?: number;
  facilitiesCount: number;
  has3D: boolean;
  hasAR: boolean;
  has2D: boolean;
  mappingMode?: MappingMode;
  mapVersion?: string;
  tag?: string;
  tagColor?: string;
  lineName?: string;
  bookmarked?: boolean;
  description: string;
  floors: StationFloor[];
  pois: StationPOI[];
  departures: DepartureTrain[];
  lastVerifiedAt?: string;
  source?: string;
}

export interface StationNode {
  id: string;
  name: string;
  type: 'entrance' | 'hall' | 'corridor' | 'platform' | 'fob' | 'subway' | 'elevator' | 'stairs' | 'poi' | 'exit';
  floor: 'L2' | 'G' | 'L1';
  x: number;
  y: number;
  z: number;
  accessible: boolean;
  poiId?: string;
  qrCode?: string;
}

export interface StationEdge {
  from: string;
  to: string;
  distance: number;
  stairs: boolean;
  lift: boolean;
  accessible: boolean;
  crowdFactor?: number; // 1.0 is normal, 2.0 is heavy crowd
  description?: string;
}

export interface StationNavigationGraph {
  stationId: string;
  version: string;
  nodes: StationNode[];
  edges: StationEdge[];
}

export interface NavigationStep {
  id: string;
  instruction: string;
  distanceMeters: number;
  icon: string;
  floor: 'L2' | 'G' | 'L1';
  isElevator?: boolean;
  isStair?: boolean;
  arHint?: string;
  actionType?: 'straight' | 'turn_left' | 'turn_right' | 'elevator' | 'stairs' | 'arrive';
}

export interface ActiveRoute {
  destination: StationPOI;
  strategy: RouteStrategy | RouteProfile;
  distanceMeters: number;
  durationMinutes: number;
  avoidStairs: boolean;
  crowdLabel: CrowdLevel | 'Low' | 'Moderate' | 'High';
  steps: NavigationStep[];
  pathPoints: Array<{ x: number; y: number; z?: number; floor: 'L2' | 'G' | 'L1' }>;
  stairsCount?: number;
  liftsCount?: number;
  routeScore?: number;
  calculatedAt?: string;
  targetTrainNumber?: string;
  targetPlatformNumber?: string;
}

export interface QRCheckpoint {
  id: string;
  code: string;
  name: string;
  floor: 'L2' | 'G' | 'L1';
  nodeId: string;
  x: number;
  y: number;
  z: number;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  routeAction?: {
    destinationId: string;
    destinationName: string;
    accessible: boolean;
    stationCode?: string;
    trainNumber?: string;
    platform?: string;
  };
  trainCard?: TrainStatus;
  facilityCard?: {
    name: string;
    location: string;
    distanceMeters: number;
    icon: string;
    poiId?: string;
  };
  toolResult?: {
    toolName: string;
    data: any;
  };
}

export interface UserPreferences {
  name: string;
  email: string;
  phoneNumber?: string;
  isLoggedIn?: boolean;
  role?: 'admin' | 'user';
  avatar: string;
  preferredRoute: 'Fastest' | 'Shortest' | 'Least Transfers';
  accessibility: 'Wheelchair' | 'Standard' | 'Visual Assist' | 'Hearing Assist';
  avoidStairs: boolean;
  appLanguage: AppLanguage;
  voiceGuidance: boolean;
  hapticFeedback: boolean;
  highContrastMap: boolean;
}

export interface RealtimeRailwayEvent {
  id: string;
  type:
    | 'TRAIN_DELAYED'
    | 'TRAIN_UPDATED'
    | 'TRAIN_ARRIVING'
    | 'TRAIN_DEPARTED'
    | 'PLATFORM_CHANGED'
    | 'TRAIN_CANCELLED'
    | 'STATION_ALERT'
    | 'CROWD_UPDATED';
  trainNumber?: string;
  trainName?: string;
  originalPlatform?: string;
  newPlatform?: string;
  delayMinutes?: number;
  message: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface ActiveJourneyState {
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  userStationCode: string;
  userStationName: string;
  eta: string;
  platform: string;
  platformConfirmed: boolean;
  status: 'FOUND' | 'RUNNING' | 'PLATFORM_ASSIGNED' | 'ROUTE_READY' | 'BOARDING' | 'DEPARTED';
  countdownSeconds: number;
  lastUpdated: string;
}

export interface CityResolutionResult {
  city: string;
  matchedQuery: string;
  confidence: number;
  stations: Array<{
    code: string;
    name: string;
    city: string;
    state: string;
    relevance: 'PRIMARY' | 'SECONDARY' | 'SUBURBAN' | 'JUNCTION';
    platforms: number;
    has3D: boolean;
    hasAR: boolean;
    distanceKmFromCenter?: number;
    tag?: string;
  }>;
  recommendedStationCode: string;
}

export interface JourneySearchResult {
  originCity: string;
  destinationCity: string;
  originStation: {
    code: string;
    name: string;
    city: string;
  };
  destinationStation: {
    code: string;
    name: string;
    city: string;
  };
  travelDate: string;
  passengers: number;
  trains: Array<{
    train: Train;
    status: TrainStatus;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    runningStatus: 'ON_TIME' | 'DELAYED' | 'RUNNING' | 'ARRIVING' | 'CANCELLED' | 'RESCHEDULED';
    delayMinutes: number;
    departurePlatform: string;
    platformConfirmed: boolean;
    platformUpdatedTime?: string;
  }>;
}

export interface FacilityNearestResult {
  facility: StationPOI;
  distanceMeters: number;
  walkingTimeMin: number;
  stepFreeAccessible: boolean;
  fromNodeId: string;
  toNodeId: string;
}

