// Local storage service for offline location caching
interface CachedLocation {
  position: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
  address?: string;
}

export class LocationStorageService {
  private static readonly STORAGE_KEY = 'careclock_locations';
  private static readonly MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MAX_CACHED_LOCATIONS = 10;

  /**
   * Cache current location
   */
  static cacheLocation(
    latitude: number,
    longitude: number,
    accuracy: number,
    address?: string
  ): void {
    try {
      const cached = this.getCachedLocations();
      const newLocation: CachedLocation = {
        position: { latitude, longitude, accuracy },
        timestamp: Date.now(),
        address,
      };

      // Add new location to the beginning
      cached.unshift(newLocation);

      // Keep only the most recent locations
      const trimmed = cached.slice(0, this.MAX_CACHED_LOCATIONS);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Failed to cache location:', error);
    }
  }

  /**
   * Get cached locations (fresh only)
   */
  static getCachedLocations(): CachedLocation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const locations: CachedLocation[] = JSON.parse(stored);
      const now = Date.now();

      // Filter out stale locations
      return locations.filter(
        location => now - location.timestamp < this.MAX_CACHE_AGE
      );
    } catch (error) {
      console.warn('Failed to get cached locations:', error);
      return [];
    }
  }

  /**
   * Get the most recent cached location
   */
  static getLastCachedLocation(): CachedLocation | null {
    const locations = this.getCachedLocations();
    return locations.length > 0 ? locations[0] : null;
  }

  /**
   * Find cached location near given coordinates
   */
  static findNearbyLocation(
    latitude: number,
    longitude: number,
    radiusInMeters: number = 100
  ): CachedLocation | null {
    const locations = this.getCachedLocations();
    
    return locations.find(location => {
      const distance = calculateDistance(
        latitude,
        longitude,
        location.position.latitude,
        location.position.longitude
      );
      return distance <= radiusInMeters;
    }) || null;
  }

  /**
   * Clear all cached locations
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear location cache:', error);
    }
  }
}
