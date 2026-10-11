import { Coordinates, LocationStatus, NearbyStationsResponse, NearbyStationResult, Station } from '../../types';
import { getPosition, watchPosition as geoWatchPosition, clearWatch, getPermissionStatus, isGeolocationSupported } from './geolocation';

class LocationService {
  private currentStatus: LocationStatus = 'IDLE';
  private cachedCoordinates: Coordinates | null = null;
  private watchId: number | null = null;
  private statusListeners: Array<(status: LocationStatus) => void> = [];

  public getStatus(): LocationStatus {
    return this.currentStatus;
  }

  public getCachedCoordinates(): Coordinates | null {
    return this.cachedCoordinates;
  }

  public onStatusChange(listener: (status: LocationStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private setStatus(status: LocationStatus): void {
    this.currentStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  /**
   * Checks the browser permission status without triggering a prompt
   */
  public async getLocationPermission(): Promise<PermissionState | 'unknown'> {
    return getPermissionStatus();
  }

  /**
   * Requests permission and gets the current device position.
   * Updates state to REQUESTING_PERMISSION -> DETECTING -> DETECTED (or LOW_ACCURACY / PERMISSION_DENIED / UNAVAILABLE / TIMEOUT)
   */
  public async getCurrentLocation(): Promise<Coordinates> {
    if (!isGeolocationSupported()) {
      this.setStatus('UNAVAILABLE');
      throw new Error('Geolocation is not supported by this browser.');
    }

    this.setStatus('REQUESTING_PERMISSION');

    try {
      this.setStatus('DETECTING');
      const coords = await getPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 3000,
      });

      this.cachedCoordinates = coords;

      // Check if GPS accuracy is low (greater than 350 meters)
      if (coords.accuracy && coords.accuracy > 350) {
        this.setStatus('LOW_ACCURACY');
      } else {
        this.setStatus('DETECTED');
      }

      return coords;
    } catch (err: any) {
      if (err.code === 1) {
        // PERMISSION_DENIED
        this.setStatus('PERMISSION_DENIED');
      } else if (err.code === 3) {
        // TIMEOUT
        this.setStatus('TIMEOUT');
      } else {
        this.setStatus('UNAVAILABLE');
      }
      throw err;
    }
  }

  /**
   * Continuous location watching for live outdoor or navigation tracking
   */
  public watchLocation(
    onUpdate: (coords: Coordinates) => void,
    onError?: (error: any) => void
  ): void {
    this.stopWatchingLocation();

    this.watchId = geoWatchPosition(
      (coords) => {
        this.cachedCoordinates = coords;
        if (this.currentStatus !== 'DETECTED' && this.currentStatus !== 'LOW_ACCURACY') {
          if (coords.accuracy && coords.accuracy > 350) {
            this.setStatus('LOW_ACCURACY');
          } else {
            this.setStatus('DETECTED');
          }
        }
        onUpdate(coords);
      },
      (error) => {
        if (error.code === 1) {
          this.setStatus('PERMISSION_DENIED');
        }
        if (onError) onError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 2000,
      }
    );
  }

  /**
   * Stops continuous watching
   */
  public stopWatchingLocation(): void {
    if (this.watchId !== null) {
      clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Queries the backend API endpoint to find nearby railway stations ranked by proximity and relevance
   */
  public async fetchNearbyStations(
    latitude: number,
    longitude: number,
    radius: number = 50000,
    limit: number = 6
  ): Promise<NearbyStationsResponse> {
    const url = `/api/stations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}&limit=${limit}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch nearby stations: ${response.statusText}`);
      }
      const data: NearbyStationsResponse = await response.json();
      return data;
    } catch (networkError) {
      console.warn('Backend /api/stations/nearby fetch failed, computing client-side fallback:', networkError);
      return this.computeClientNearbyFallback(latitude, longitude, limit);
    }
  }

  /**
   * Client-side fallback if backend request fails (e.g. offline)
   */
  private computeClientNearbyFallback(
    lat: number,
    lng: number,
    limit: number
  ): NearbyStationsResponse {
    // Known railway station hubs
    const fallbackHubs: Array<{
      id: string;
      name: string;
      city: string;
      state: string;
      country: string;
      lat: number;
      lng: number;
      platforms: number;
      facilitiesCount: number;
      has3D: boolean;
      hasAR: boolean;
      has2D: boolean;
      mappingMode: '3D_AR' | '3D' | '2D';
      tag: string;
      tagColor: string;
    }> = [
      {
        id: 'coimbatore-junction',
        name: 'Coimbatore Junction',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 11.0018,
        lng: 76.9629,
        platforms: 6,
        facilitiesCount: 42,
        has3D: true,
        hasAR: true,
        has2D: true,
        mappingMode: '3D_AR',
        tag: 'SOUTHERN RAILWAY',
        tagColor: '#ff3e00',
      },
      {
        id: 'podanur-junction',
        name: 'Podanur Junction',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 10.9634,
        lng: 76.9922,
        platforms: 5,
        facilitiesCount: 18,
        has3D: false,
        hasAR: false,
        has2D: true,
        mappingMode: '2D',
        tag: 'HERITAGE JUNCTION',
        tagColor: '#3b82f6',
      },
      {
        id: 'coimbatore-north',
        name: 'Coimbatore North Junction',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 11.0189,
        lng: 76.9525,
        platforms: 4,
        facilitiesCount: 15,
        has3D: false,
        hasAR: true,
        has2D: true,
        mappingMode: '2D',
        tag: 'COMMUTER HUB',
        tagColor: '#10b981',
      },
      {
        id: 'irugur-junction',
        name: 'Irugur Junction',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 11.0116,
        lng: 77.0625,
        platforms: 2,
        facilitiesCount: 8,
        has3D: false,
        hasAR: false,
        has2D: true,
        mappingMode: '2D',
        tag: 'BYPASS FEEDER',
        tagColor: '#a855f7',
      },
      {
        id: 'grand-central',
        name: 'Grand Central Terminal',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        lat: 40.7527,
        lng: -73.9772,
        platforms: 44,
        facilitiesCount: 68,
        has3D: true,
        hasAR: true,
        has2D: true,
        mappingMode: '3D_AR',
        tag: 'METRO NORTH',
        tagColor: '#00f0ff',
      },
      {
        id: 'paddington',
        name: 'Paddington Station',
        city: 'London',
        state: 'Greater London',
        country: 'United Kingdom',
        lat: 51.5154,
        lng: -0.1755,
        platforms: 14,
        facilitiesCount: 42,
        has3D: true,
        hasAR: true,
        has2D: true,
        mappingMode: '3D_AR',
        tag: 'LHR EXPRESS',
        tagColor: '#ff3e00',
      },
      {
        id: 'shinjuku',
        name: 'Shinjuku Station',
        city: 'Tokyo',
        state: 'Tokyo',
        country: 'Japan',
        lat: 35.6896,
        lng: 139.7006,
        platforms: 36,
        facilitiesCount: 120,
        has3D: true,
        hasAR: false,
        has2D: true,
        mappingMode: '3D',
        tag: 'JR EAST',
        tagColor: '#a855f7',
      },
    ];

    const ranked: NearbyStationResult[] = fallbackHubs.map((hub) => {
      const distanceMeters = this.calculateDistanceMeters(lat, lng, hub.lat, hub.lng);
      return {
        id: hub.id,
        name: hub.name,
        code: (hub as any).code || 'CBE',
        city: hub.city,
        state: hub.state,
        country: hub.country,
        latitude: hub.lat,
        longitude: hub.lng,
        distanceMeters: Math.round(distanceMeters),
        distanceFormatted: this.formatDistance(distanceMeters),
        mappingMode: hub.mappingMode,
        has3D: hub.has3D,
        hasAR: hub.hasAR,
        has2D: hub.has2D,
        navigationAvailable: true,
        liveDataAvailable: true,
        platforms: hub.platforms,
        facilitiesCount: hub.facilitiesCount,
        tag: hub.tag,
        tagColor: hub.tagColor,
      };
    });

    ranked.sort((a, b) => a.distanceMeters - b.distanceMeters);
    if (ranked.length > 0) {
      ranked[0].isNearest = true;
    }

    const nearestCity = ranked[0] ? ranked[0].city : 'Nearby Area';

    return {
      city: nearestCity,
      locality: ranked[0] ? `${ranked[0].city} Transit Zone` : 'Railway Corridor',
      userCoordinates: {
        latitude: lat,
        longitude: lng,
      },
      stations: ranked.slice(0, limit),
    };
  }

  /**
   * Computes the great circle distance in meters between two coordinates using the Haversine formula
   */
  public calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Formats distance in meters into human-readable string:
   * Under 1 km: "850 m"
   * Over 1 km: "1.2 km" (with single decimal precision, never excessive decimals)
   */
  public formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    const km = meters / 1000;
    if (km < 10) {
      return `${km.toFixed(1)} km`;
    }
    return `${Math.round(km)} km`;
  }

  /**
   * Helper to check if user has deviated off-route during outdoor/station walk
   */
  public isOffRoute(
    currentLat: number,
    currentLng: number,
    targetLat: number,
    targetLng: number,
    deviationThresholdMeters: number = 45
  ): boolean {
    const distance = this.calculateDistanceMeters(currentLat, currentLng, targetLat, targetLng);
    return distance > deviationThresholdMeters;
  }
}

export const locationService = new LocationService();
