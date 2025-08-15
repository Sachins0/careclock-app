import { useState, useEffect, useCallback } from 'react';
import { geofencingService } from '@/lib/notifications/GeofencingService';

interface UseGeofencingReturn {
  isMonitoring: boolean;
  hasPermissions: boolean;
  currentLocation: GeolocationPosition | null;
  insidePerimeter: boolean | null;
  distanceFromCenter: number | null;
  permissionStatus: {
    notification: NotificationPermission;
    geolocation: boolean;
  };
  startMonitoring: () => Promise<boolean>;
  stopMonitoring: () => void;
  requestPermissions: () => Promise<void>;
  setPerimeter: (lat: number, lon: number, radius: number, name: string) => void;
}

export function useGeofencing(): UseGeofencingReturn {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [insidePerimeter, setInsidePerimeter] = useState<boolean | null>(null);
  const [distanceFromCenter, setDistanceFromCenter] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState({
    notification: 'default' as NotificationPermission,
    geolocation: false,
  });

  // Update status from service
  const updateStatus = useCallback(() => {
    const status = geofencingService.getStatus();
    setIsMonitoring(status.isActive);
    setCurrentLocation(status.currentPosition);
    setInsidePerimeter(status.insidePerimeter);
    setDistanceFromCenter(geofencingService.getDistanceFromPerimeter());
  }, []);

  // Check permissions
  const checkPermissions = useCallback(async () => {
    const permissions = await geofencingService.requestPermissions();
    setPermissionStatus(permissions);
    setHasPermissions(
      permissions.notification === 'granted' && permissions.geolocation
    );
    return permissions;
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    await checkPermissions();
  }, [checkPermissions]);

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    const success = await geofencingService.startMonitoring();
    if (success) {
      setIsMonitoring(true);
    }
    return success;
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    geofencingService.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  // Set perimeter
  const setPerimeter = useCallback((lat: number, lon: number, radius: number, name: string) => {
    geofencingService.setPerimeter({
      latitude: lat,
      longitude: lon,
      radiusMeters: radius,
      name: name,
    });
  }, []);

  // Update status periodically
  useEffect(() => {
    updateStatus();
    checkPermissions();

    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [updateStatus, checkPermissions]);

  return {
    isMonitoring,
    hasPermissions,
    currentLocation,
    insidePerimeter,
    distanceFromCenter,
    permissionStatus,
    startMonitoring,
    stopMonitoring,
    requestPermissions,
    setPerimeter,
  };
}
