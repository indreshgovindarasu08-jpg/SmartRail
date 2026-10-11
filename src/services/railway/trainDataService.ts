import { Train, TrainStatus, TrainStop, RealtimeRailwayEvent, CrowdLevel } from '../../types';
import { MASTER_TRAINS_LIST, TRAIN_STOPS_MAP, generateTrainStatus } from '../../data/trainsMasterDB';

export interface TrainDataProvider {
  searchTrains(query: string): Promise<Train[]>;
  getTrainStatus(trainNumber: string, userStationCode?: string): Promise<TrainStatus | null>;
  getTrainSchedule(trainNumber: string): Promise<TrainStop[]>;
  getStationTrains(stationCode: string): Promise<Train[]>;
}

type EventListener<T> = (data: T) => void;

class TrainEventBus {
  private listeners: Map<string, Array<EventListener<any>>> = new Map();

  public on<T>(event: string, callback: EventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const list = this.listeners.get(event);
      if (list) {
        this.listeners.set(
          event,
          list.filter((cb) => cb !== callback)
        );
      }
    };
  }

  public emit<T>(event: string, data: T): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((cb) => cb(data));
    }
  }
}

export const trainEvents = new TrainEventBus();

export class ProductionTrainDataService implements TrainDataProvider {
  private static instance: ProductionTrainDataService;
  private recentSearchesKey = 'smartrail_recent_train_searches';
  private overriddenPlatforms: Map<string, string> = new Map(); // trainNumber -> platform

  public static getInstance(): ProductionTrainDataService {
    if (!ProductionTrainDataService.instance) {
      ProductionTrainDataService.instance = new ProductionTrainDataService();
    }
    return ProductionTrainDataService.instance;
  }

  // Section 4: Highly optimized train search (number, name, source, destination, route stops, aliases)
  async searchTrains(query: string): Promise<Train[]> {
    const raw = (query || '').trim().toLowerCase();
    if (!raw) {
      return MASTER_TRAINS_LIST.slice(0, 10);
    }

    // Normalize Tuticorin / Thoothukudi aliases
    const normalizeText = (str: string) => {
      return str
        .toLowerCase()
        .replace(/thoothukudi/g, 'tuticorin')
        .replace(/mgr chennai central|chennai central|chennai egmore/g, 'chennai')
        .replace(/coimbatore junction/g, 'coimbatore')
        .replace(/madurai junction/g, 'madurai')
        .replace(/tiruchirappalli junction|trichy/g, 'tiruchirappalli');
    };

    const cleanQuery = normalizeText(raw);

    // Check if query is structured like "Coimbatore to Tuticorin" or "CBE -> TN" or "Coimbatore Tuticorin"
    const splitTokens = cleanQuery.split(/\s+(?:to|->|-|—)\s+/);
    if (splitTokens.length === 2) {
      const originQuery = splitTokens[0].trim();
      const destQuery = splitTokens[1].trim();

      const pairMatched = MASTER_TRAINS_LIST.filter((t) => {
        const tOrigin = normalizeText(`${t.originCity} ${t.originName} ${t.originCode}`);
        const tDest = normalizeText(`${t.destinationCity} ${t.destinationName} ${t.destinationCode}`);
        const originMatches = tOrigin.includes(originQuery) || (originQuery === 'tn' && t.originCode.toLowerCase() === 'tn') || (originQuery === 'cbe' && t.originCode.toLowerCase() === 'cbe');
        const destMatches = tDest.includes(destQuery) || (destQuery === 'tn' && t.destinationCode.toLowerCase() === 'tn') || (destQuery === 'cbe' && t.destinationCode.toLowerCase() === 'cbe');
        
        // Also check if intermediate stops cover this pair
        const stops = TRAIN_STOPS_MAP[t.number] || [];
        const stopsStr = normalizeText(stops.map((s) => `${s.stationName} ${s.stationCode}`).join(' '));
        const stopPairMatches = stopsStr.includes(originQuery) && stopsStr.includes(destQuery);

        return (originMatches && destMatches) || stopPairMatches;
      });

      if (pairMatched.length > 0) {
        return pairMatched;
      }
    }

    // If query contains multiple words like "Coimbatore Tuticorin"
    const words = cleanQuery.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      const multiWordMatch = MASTER_TRAINS_LIST.filter((t) => {
        const fullTrainStr = normalizeText(
          `${t.number} ${t.name} ${t.originCity} ${t.originName} ${t.originCode} ${t.destinationCity} ${t.destinationName} ${t.destinationCode}`
        );
        const stops = TRAIN_STOPS_MAP[t.number] || [];
        const fullWithStops = fullTrainStr + ' ' + normalizeText(stops.map((s) => s.stationName).join(' '));
        return words.every((w) => fullWithStops.includes(w));
      });
      if (multiWordMatch.length > 0) {
        return multiWordMatch;
      }
    }

    // Standard matching
    const matched = MASTER_TRAINS_LIST.filter((t) => {
      const trainStr = normalizeText(
        `${t.number} ${t.name} ${t.originCity} ${t.originName} ${t.originCode} ${t.destinationCity} ${t.destinationName} ${t.destinationCode}`
      );
      if (trainStr.includes(cleanQuery)) return true;
      if (cleanQuery === 'tn' && (t.originCode === 'TN' || t.destinationCode === 'TN')) return true;
      if (cleanQuery === 'cbe' && (t.originCode === 'CBE' || t.destinationCode === 'CBE')) return true;

      // Check route stops
      const stops = TRAIN_STOPS_MAP[t.number] || [];
      return stops.some((s) => normalizeText(`${s.stationName} ${s.stationCode}`).includes(cleanQuery));
    });

    return matched;
  }

  // Section 5: Train Status Engine
  async getTrainStatus(trainNumber: string, userStationCode: string = 'CBE'): Promise<TrainStatus | null> {
    try {
      // Try backend proxy first
      const res = await fetch(`/api/v1/trains/${encodeURIComponent(trainNumber)}/status?station=${userStationCode}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.trainNumber) {
          // If platform was locally simulated, apply override
          if (this.overriddenPlatforms.has(trainNumber)) {
            data.assignedPlatform = this.overriddenPlatforms.get(trainNumber)!;
          }
          return data;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    // Direct local provider
    const status = generateTrainStatus(trainNumber, userStationCode);
    if (status && this.overriddenPlatforms.has(trainNumber)) {
      status.assignedPlatform = this.overriddenPlatforms.get(trainNumber)!;
    }
    return status;
  }

  async getTrainSchedule(trainNumber: string): Promise<TrainStop[]> {
    try {
      const res = await fetch(`/api/v1/trains/${encodeURIComponent(trainNumber)}/schedule`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      // fallback
    }

    return TRAIN_STOPS_MAP[trainNumber] || [];
  }

  async getStationTrains(stationCode: string): Promise<Train[]> {
    const code = stationCode.toUpperCase();
    return MASTER_TRAINS_LIST.filter(
      (t) => t.originCode === code || t.destinationCode === code || code === 'CBE'
    );
  }

  // Recent searches cache
  getRecentSearches(): string[] {
    try {
      const raw = localStorage.getItem(this.recentSearchesKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}
    return ['12681', '20644', '12676', '12678', '16381'];
  }

  addRecentSearch(trainNumber: string): void {
    try {
      let recents = this.getRecentSearches();
      recents = [trainNumber, ...recents.filter((n) => n !== trainNumber)].slice(0, 6);
      localStorage.setItem(this.recentSearchesKey, JSON.stringify(recents));
    } catch (e) {}
  }

  // Section 11: Realtime Platform Change Simulator & Dispatcher
  simulatePlatformChange(trainNumber: string, newPlatform: string): void {
    const original = this.overriddenPlatforms.get(trainNumber) || (trainNumber === '12681' ? 'Platform 5' : 'Platform 2');
    this.overriddenPlatforms.set(trainNumber, newPlatform);

    const event: RealtimeRailwayEvent = {
      id: `ev-plat-${Date.now()}`,
      type: 'PLATFORM_CHANGED',
      trainNumber,
      trainName: MASTER_TRAINS_LIST.find((t) => t.number === trainNumber)?.name || `Train ${trainNumber}`,
      originalPlatform: original,
      newPlatform,
      message: `Train ${trainNumber} is now departing from ${newPlatform} (changed from ${original}). Navigation route automatically recalculated.`,
      timestamp: new Date().toISOString(),
      severity: 'WARNING',
    };

    trainEvents.emit('PLATFORM_CHANGED', event);
    trainEvents.emit('EVENT', event);
  }

  simulateDelay(trainNumber: string, delayMinutes: number): void {
    const event: RealtimeRailwayEvent = {
      id: `ev-delay-${Date.now()}`,
      type: 'TRAIN_DELAYED',
      trainNumber,
      delayMinutes,
      message: `Train ${trainNumber} is running delayed by +${delayMinutes} minutes.`,
      timestamp: new Date().toISOString(),
      severity: 'INFO',
    };

    trainEvents.emit('TRAIN_DELAYED', event);
    trainEvents.emit('EVENT', event);
  }
}

export const trainDataService = ProductionTrainDataService.getInstance();
