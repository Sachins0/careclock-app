// Geolocation service for CareClock
export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
}

export class GeolocationService {
  private static instance: GeolocationService;
  private watchId: number | null = null;
  private lastKnownPosition: GeolocationPosition | null = null;
  private observers: ((position: GeolocationPosition | null) => void)[] = [];

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator && 'getCurrentPosition' in navigator.geolocation;
  }

  /**
   * Get current position with enhanced error handling
   */
  async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser',
          type: 'UNKNOWN' as const,
        });
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
        ...options,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoPosition: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          this.lastKnownPosition = geoPosition;
          this.notifyObservers(geoPosition);
          resolve(geoPosition);
        },
        (error) => {
          const geoError = this.mapGeolocationError(error);
          reject(geoError);
        },
        defaultOptions
      );
    });
  }

  /**
   * Start watching position changes
   */
  startWatching(callback: (position: GeolocationPosition) => void, options?: PositionOptions): number | null {
    if (!this.isSupported()) {
      return null;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute for watching
      ...options,
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const geoPosition: GeolocationPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        this.lastKnownPosition = geoPosition;
        this.notifyObservers(geoPosition);
        callback(geoPosition);
      },
      (error) => {
        console.error('Geolocation watching error:', error);
      },
      defaultOptions
    );

    return this.watchId;
  }

  /**
   * Stop watching position changes
   */
  stopWatching(): void {
    if (this.watchId !== null && this.isSupported()) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get last known position (cached)
   */
  getLastKnownPosition(): GeolocationPosition | null {
    return this.lastKnownPosition;
  }

  /**
   * Subscribe to position updates
   */
  subscribe(callback: (position: GeolocationPosition | null) => void): () => void {
    this.observers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  /**
   * Check permissions status
   */
  async checkPermissions(): Promise<PermissionState> {
    if (!('permissions' in navigator)) {
      return 'granted'; // Assume granted on older browsers
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      console.warn('Could not check geolocation permissions:', error);
      return 'granted';
    }
  }

  /**
   * Request permissions with user-friendly flow
   */
  async requestPermissions(): Promise<GeolocationPosition> {
    const permissionState = await this.checkPermissions();
    
    if (permissionState === 'denied') {
      throw {
        code: 1,
        message: 'Location access has been denied. Please enable location permissions in your browser settings.',
        type: 'PERMISSION_DENIED' as const,
      };
    }

    // Try to get position - this will trigger permission request if needed
    return this.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0, // Force fresh position for permission request
    });
  }

  private mapGeolocationError(error: GeolocationPositionError): GeolocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          code: error.code,
          message: 'Location access denied. Please enable location permissions and try again.',
          type: 'PERMISSION_DENIED',
        };
      case error.POSITION_UNAVAILABLE:
        return {
          code: error.code,
          message: 'Location information is unavailable. Please check your device settings.',
          type: 'POSITION_UNAVAILABLE',
        };
      case error.TIMEOUT:
        return {
          code: error.code,
          message: 'Location request timed out. Please try again.',
          type: 'TIMEOUT',
        };
      default:
        return {
          code: error.code,
          message: 'An unknown error occurred while getting your location.',
          type: 'UNKNOWN',
        };
    }
  }

  private notifyObservers(position: GeolocationPosition | null): void {
    this.observers.forEach(callback => callback(position));
  }
}

// Utility functions for geofencing
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function isWithinPerimeter(
  userLat: number,
  userLon: number,
  centerLat: number,
  centerLon: number,
  radiusInMeters: number
): boolean {
  const distance = calculateDistance(userLat, userLon, centerLat, centerLon);
  return distance <= radiusInMeters;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function getLocationAccuracyLevel(accuracy: number): 'high' | 'medium' | 'low' {
  if (accuracy <= 10) return 'high';
  if (accuracy <= 100) return 'medium';
  return 'low';
}
