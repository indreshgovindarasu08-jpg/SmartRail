import { Coordinates } from '../../types';

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 5000,
};

/**
 * Checks if geolocation is supported in the current environment
 */
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && 'navigator' in window && 'geolocation' in navigator;
}

/**
 * Queries the browser Permission API for geolocation state if supported
 */
export async function getPermissionStatus(): Promise<PermissionState | 'unknown'> {
  if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return 'unknown';
  }
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return result.state; // 'granted' | 'prompt' | 'denied'
  } catch {
    return 'unknown';
  }
}

/**
 * Retrieves the current coordinates via one-shot getCurrentPosition
 */
export function getPosition(options: GeolocationOptions = DEFAULT_OPTIONS): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
}

/**
 * Starts continuous position monitoring using watchPosition
 */
export function watchPosition(
  onUpdate: (coords: Coordinates) => void,
  onError?: (error: GeolocationPositionError) => void,
  options: GeolocationOptions = DEFAULT_OPTIONS
): number | null {
  if (!isGeolocationSupported()) {
    if (onError) {
      onError({
        code: 2,
        message: 'Geolocation unsupported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);
    }
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      });
    },
    (err) => {
      if (onError) {
        onError(err);
      }
    },
    options
  );

  return watchId;
}

/**
 * Clears an active position watch listener
 */
export function clearWatch(watchId: number): void {
  if (isGeolocationSupported() && watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
}
