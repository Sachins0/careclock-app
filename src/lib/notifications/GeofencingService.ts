interface PerimeterConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  name: string;
}

interface NotificationPermissions {
  notification: NotificationPermission;
  geolocation: boolean;
}

class GeofencingNotificationService {
  private watchId: number | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private currentPosition: GeolocationPosition | null = null;
  private wasInsidePerimeter: boolean | null = null;
  private perimeter: PerimeterConfig | null = null;
  private isActive = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Register service worker if available
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.getRegistration();
        if (!this.swRegistration) {
          this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        }
        console.log('✅ Service Worker ready for notifications');
      } catch (error) {
        console.warn('⚠️ Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Request all necessary permissions
   */
  async requestPermissions(): Promise<NotificationPermissions> {
    const permissions: NotificationPermissions = {
      notification: 'default',
      geolocation: false
    };

    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        permissions.notification = await Notification.requestPermission();
      } else {
        permissions.notification = Notification.permission;
      }
    }

    // Test geolocation permission
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 300000, // 5 minutes
        });
      });
      permissions.geolocation = true;
    } catch (error) {
      console.warn('Geolocation permission denied or unavailable');
      permissions.geolocation = false;
    }

    return permissions;
  }

  /**
   * Set the perimeter configuration
   */
  setPerimeter(config: PerimeterConfig) {
    this.perimeter = config;
    console.log(`🎯 Perimeter set: ${config.name} (${config.radiusMeters}m radius)`);
  }

  /**
   * Start monitoring location for geofence notifications
   */
  async startMonitoring(): Promise<boolean> {
    if (!this.perimeter) {
      console.error('❌ No perimeter configured');
      return false;
    }

    const permissions = await this.requestPermissions();
    
    if (permissions.notification !== 'granted') {
      console.error('❌ Notification permission not granted');
      return false;
    }

    if (!permissions.geolocation) {
      console.error('❌ Geolocation permission not granted');
      return false;
    }

    if (!('geolocation' in navigator)) {
      console.error('❌ Geolocation not supported');
      return false;
    }

    // Clear any existing watch
    this.stopMonitoring();

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handlePositionError(error),
      {
        enableHighAccuracy: true,
        maximumAge: 30000, // 30 seconds
        timeout: 60000, // 1 minute
      }
    );

    this.isActive = true;
    console.log('🎯 Geofencing monitoring started');
    
    // Show initial status notification
    this.showNotification(
      'Location Monitoring Active',
      {
        body: `Monitoring ${this.perimeter.name} perimeter`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'geofence-status',
        silent: true,
      }
    );

    return true;
  }

  /**
   * Stop monitoring location
   */
  stopMonitoring() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isActive = false;
    this.wasInsidePerimeter = null;
    console.log('🛑 Geofencing monitoring stopped');
  }

  /**
   * Handle position updates
   */
  private handlePositionUpdate(position: GeolocationPosition) {
    this.currentPosition = position;
    
    if (!this.perimeter) return;

    const isInside = this.isWithinPerimeter(
      position.coords.latitude,
      position.coords.longitude,
      this.perimeter.latitude,
      this.perimeter.longitude,
      this.perimeter.radiusMeters
    );

    // Check for boundary crossing
    if (this.wasInsidePerimeter !== null && this.wasInsidePerimeter !== isInside) {
      this.handleBoundaryCrossing(isInside, position);
    }

    this.wasInsidePerimeter = isInside;
  }

  /**
   * Handle geofence boundary crossing
   */
  private handleBoundaryCrossing(enteredPerimeter: boolean, position: GeolocationPosition) {
    const accuracy = position.coords.accuracy;
    const timestamp = new Date(position.timestamp);

    if (enteredPerimeter) {
      // Entered work area
      this.showNotification(
        '📍 You entered the work area',
        {
          body: `Welcome to ${this.perimeter?.name}! You can now clock in.`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'geofence-entry',
          requireInteraction: true,
          actions: [
            {
              action: 'clock-in',
              title: '⏰ Clock In Now',
              icon: '/icons/icon-72x72.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ],
          data: {
            type: 'geofence-entry',
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: accuracy,
              timestamp: timestamp.toISOString(),
            }
          }
        }
      );

      // Vibrate on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      console.log('🎯 ENTERED perimeter:', {
        accuracy: `${accuracy.toFixed(1)}m`,
        time: timestamp.toLocaleTimeString()
      });

    } else {
      // Left work area
      this.showNotification(
        '🚪 You left the work area',
        {
          body: `You've left ${this.perimeter?.name}. Don't forget to clock out!`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'geofence-exit',
          requireInteraction: true,
          actions: [
            {
              action: 'clock-out',
              title: '⏰ Clock Out Now',
              icon: '/icons/icon-72x72.png'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ],
          data: {
            type: 'geofence-exit',
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: accuracy,
              timestamp: timestamp.toISOString(),
            }
          }
        }
      );

      // Vibrate on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }

      console.log('🎯 EXITED perimeter:', {
        accuracy: `${accuracy.toFixed(1)}m`,
        time: timestamp.toLocaleTimeString()
      });
    }
  }

  /**
   * Show notification using service worker or fallback
   */
  private async showNotification(title: string, options: NotificationOptions = {}) {
    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Notification permission not granted');
      return;
    }

    try {
      if (this.swRegistration) {
        // Use service worker notification (better for PWA)
        await this.swRegistration.showNotification(title, {
          ...options,
          timestamp: Date.now(),
        });
      } else {
        // Fallback to regular notification
        new Notification(title, options);
      }
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
      // Final fallback - just log to console
      console.log(`🔔 NOTIFICATION: ${title} - ${options.body}`);
    }
  }

  /**
   * Handle geolocation errors
   */
  private handlePositionError(error: GeolocationPositionError) {
    let message = 'Location monitoring error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out';
        break;
    }

    console.error('🌍 Geolocation error:', message);
    
    // Show error notification
    this.showNotification(
      'Location Monitoring Issue',
      {
        body: message,
        icon: '/icons/icon-192x192.png',
        tag: 'geofence-error',
      }
    );
  }

  /**
   * Check if coordinates are within perimeter
   */
  private isWithinPerimeter(
    lat: number, 
    lon: number, 
    centerLat: number, 
    centerLon: number, 
    radiusMeters: number
  ): boolean {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters

    const dLat = toRad(centerLat - lat);
    const dLon = toRad(centerLon - lon);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(centerLat)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radiusMeters;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      hasPerimeter: this.perimeter !== null,
      currentPosition: this.currentPosition,
      insidePerimeter: this.wasInsidePerimeter,
      perimeter: this.perimeter,
    };
  }

  /**
   * Get distance from perimeter center
   */
  getDistanceFromPerimeter(): number | null {
    if (!this.currentPosition || !this.perimeter) return null;

    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters

    const lat1 = this.currentPosition.coords.latitude;
    const lon1 = this.currentPosition.coords.longitude;
    const lat2 = this.perimeter.latitude;
    const lon2 = this.perimeter.longitude;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Singleton instance
export const geofencingService = new GeofencingNotificationService();
export default GeofencingNotificationService;
