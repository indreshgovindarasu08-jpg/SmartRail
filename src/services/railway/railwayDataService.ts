import { DepartureTrain, RealtimeStatus, CrowdLevel } from '../../types';
import { COIMBATORE_JUNCTION_PRIMARY_STATION } from '../../data/coimbatoreStationDB';

export interface StationRealtimeStatus {
  stationCode: string;
  stationName: string;
  timestamp: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  activeAlerts: Array<{
    id: string;
    type: 'PLATFORM_CHANGE' | 'WEATHER' | 'MAINTENANCE' | 'SPECIAL_SERVICE';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    trainNumber?: string;
    newPlatform?: string;
    originalPlatform?: string;
    timestamp: string;
  }>;
  crowdLevel: CrowdLevel;
  platformCrowd: Record<string, CrowdLevel>;
}

export interface RailwayDataProvider {
  getStationStatus(stationCode: string): Promise<StationRealtimeStatus>;
  getArrivals(stationCode: string): Promise<DepartureTrain[]>;
  getDepartures(stationCode: string): Promise<DepartureTrain[]>;
  getTrainStatus(trainNumber: string): Promise<DepartureTrain | null>;
  simulatePlatformChange(trainNumber: string, newPlatform: string): void;
}

type EventListener<T> = (data: T) => void;

class RailwayEventBus {
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

export const railwayEvents = new RailwayEventBus();

export class ProductionRailwayService implements RailwayDataProvider {
  private static instance: ProductionRailwayService;
  private departures: DepartureTrain[] = [...COIMBATORE_JUNCTION_PRIMARY_STATION.departures];
  private platformCrowds: Record<string, CrowdLevel> = {
    'Platform 1': 'MODERATE',
    'Platform 2': 'HIGH',
    'Platform 3': 'LOW',
    'Platform 4': 'MODERATE',
    'Platform 5': 'LOW',
    'Platform 6': 'LOW',
  };

  public static getInstance(): ProductionRailwayService {
    if (!ProductionRailwayService.instance) {
      ProductionRailwayService.instance = new ProductionRailwayService();
    }
    return ProductionRailwayService.instance;
  }

  async getStationStatus(stationCode: string): Promise<StationRealtimeStatus> {
    return {
      stationCode: stationCode.toUpperCase(),
      stationName:
        stationCode.toUpperCase() === 'CBE'
          ? 'Coimbatore Junction'
          : stationCode.toUpperCase() === 'CBF'
          ? 'Coimbatore North'
          : stationCode.toUpperCase() === 'MTP'
          ? 'Mettupalayam'
          : stationCode.toUpperCase() === 'POY'
          ? 'Pollachi Junction'
          : 'Railway Station',
      timestamp: new Date().toISOString(),
      status: 'ONLINE',
      activeAlerts: [
        {
          id: 'alert-01',
          type: 'SPECIAL_SERVICE',
          severity: 'INFO',
          message: 'All 4 Glass Elevators operational between Main Concourse, L2 Skybridge, and Platforms 1-6.',
          timestamp: new Date().toISOString(),
        },
      ],
      crowdLevel: 'MODERATE',
      platformCrowd: this.platformCrowds,
    };
  }

  async getArrivals(stationCode: string): Promise<DepartureTrain[]> {
    return this.departures.filter((d) => d.status === 'ARRIVING');
  }

  async getDepartures(stationCode: string): Promise<DepartureTrain[]> {
    return [...this.departures];
  }

  async getTrainStatus(trainNumber: string): Promise<DepartureTrain | null> {
    const found = this.departures.find((d) => d.trainNumber === trainNumber);
    return found || null;
  }

  public simulatePlatformChange(trainNumber: string, newPlatform: string): void {
    const idx = this.departures.findIndex((d) => d.trainNumber === trainNumber);
    if (idx !== -1) {
      const train = this.departures[idx];
      const originalPlatform = train.platform;
      train.platform = newPlatform;
      train.updatedAt = new Date().toISOString();

      railwayEvents.emit('PLATFORM_CHANGED', {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        originalPlatform,
        newPlatform,
        timestamp: new Date().toISOString(),
      });
    }
  }

  public simulateCrowdSpike(platform: string, level: CrowdLevel): void {
    this.platformCrowds[platform] = level;
    railwayEvents.emit('CROWD_UPDATED', {
      platform,
      crowdLevel: level,
      timestamp: new Date().toISOString(),
    });
  }
}

export const railwayService = ProductionRailwayService.getInstance();
