'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, Space, Typography, Alert, Modal, Progress, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useGraphQLMutation, useGraphQLQuery } from '@/hooks/useGraphQL';
import { CLOCK_IN, CLOCK_OUT, GET_ME } from '@/lib/graphql/client';
import { 
  GeolocationService, 
  GeolocationPosition, 
  GeolocationError,
  isWithinPerimeter,
  calculateDistance,
  formatDistance,
  getLocationAccuracyLevel,
} from '@/lib/geolocation';
import { LocationStorageService } from '@/lib/geolocation/storage';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ClockFormProps {
  type: 'in' | 'out';
  onSuccess?: () => void;
  activeShift?: any;
}

interface LocationState {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  loading: boolean;
  withinPerimeter: boolean;
  distance: number;
  accuracyLevel: 'high' | 'medium' | 'low';
}

export function ClockForm({ type, onSuccess, activeShift }: ClockFormProps) {
  const [note, setNote] = useState('');
  const [locationState, setLocationState] = useState<LocationState>({
    position: null,
    error: null,
    loading: false,
    withinPerimeter: false,
    distance: 0,
    accuracyLevel: 'low',
  });

  const { data: userData } = useGraphQLQuery(GET_ME);
  const { mutate: clockIn, loading: clockingIn } = useGraphQLMutation(CLOCK_IN);
  const { mutate: clockOut, loading: clockingOut } = useGraphQLMutation(CLOCK_OUT);

  const geolocationService = GeolocationService.getInstance();
  const isLoading = clockingIn || clockingOut || locationState.loading;
  
  const organizationLocation = userData?.me?.organization?.location;

  // Real-time location validation
  const validateLocation = useCallback((position: GeolocationPosition) => {
    if (!organizationLocation) {
      return {
        withinPerimeter: false,
        distance: 0,
        accuracyLevel: getLocationAccuracyLevel(position.accuracy),
      };
    }

    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      organizationLocation.latitude,
      organizationLocation.longitude
    );

    const withinPerimeter = isWithinPerimeter(
      position.latitude,
      position.longitude,
      organizationLocation.latitude,
      organizationLocation.longitude,
      organizationLocation.radiusInMeters
    );

    return {
      withinPerimeter,
      distance,
      accuracyLevel: getLocationAccuracyLevel(position.accuracy),
    };
  }, [organizationLocation]);

  // Get current location with enhanced error handling
  const getCurrentLocation = useCallback(async () => {
    setLocationState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if geolocation is supported
      if (!geolocationService.isSupported()) {
        throw {
          code: 0,
          message: 'Geolocation is not supported by your browser',
          type: 'UNKNOWN' as const,
        };
      }

      // Try to get cached location first for faster response
      const cachedLocation = LocationStorageService.getLastCachedLocation();
      if (cachedLocation && Date.now() - cachedLocation.timestamp < 60000) { // 1 minute cache
        const validation = validateLocation({
          ...cachedLocation.position,
          timestamp: cachedLocation.timestamp,
        });
        
        setLocationState({
          position: { ...cachedLocation.position, timestamp: cachedLocation.timestamp },
          error: null,
          loading: true, // Continue loading to get fresh position
          ...validation,
        });
      }

      // Get fresh location
      const position = await geolocationService.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000, // 30 seconds
      });

      const validation = validateLocation(position);
      
      setLocationState({
        position,
        error: null,
        loading: false,
        ...validation,
      });

      // Cache the location
      LocationStorageService.cacheLocation(
        position.latitude,
        position.longitude,
        position.accuracy
      );

    } catch (error) {
      const geoError = error as GeolocationError;
      setLocationState(prev => ({
        ...prev,
        error: geoError,
        loading: false,
      }));
    }
  }, [geolocationService, validateLocation]);

  // Auto-get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Handle clock in/out submission
  const handleSubmit = async () => {
    if (!locationState.position) {
      Modal.error({
        title: 'Location Required',
        content: 'Please get your location first before clocking in/out.',
      });
      return;
    }

    if (type === 'in' && !locationState.withinPerimeter) {
      Modal.confirm({
        title: 'Outside Perimeter',
        content: `You are ${formatDistance(locationState.distance)} away from the designated area. You cannot clock in from this location.`,
        okText: 'Get Fresh Location',
        cancelText: 'Cancel',
        onOk: getCurrentLocation,
      });
      return;
    }

    try {
      const input = {
        latitude: locationState.position.latitude,
        longitude: locationState.position.longitude,
        note: note.trim() || undefined,
      };

      let result;
      if (type === 'in') {
        result = await clockIn({ input });
      } else {
        result = await clockOut({ input });
      }

      const data = type === 'in' ? result.clockIn : result.clockOut;

      if (data.success) {
        Modal.success({
          title: `Clock ${type === 'in' ? 'In' : 'Out'} Successful`,
          content: (
            <div>
              <p>{data.message}</p>
              {type === 'out' && data.totalDuration && (
                <p><strong>Total shift duration:</strong> {data.totalDuration}</p>
              )}
            </div>
          ),
          onOk: () => {
            setNote('');
            onSuccess?.();
          },
        });
      } else {
        Modal.error({
          title: `Clock ${type === 'in' ? 'In' : 'Out'} Failed`,
          content: data.message,
        });
      }
    } catch (error) {
      Modal.error({
        title: 'Error',
        content: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  // Render location status
  const renderLocationStatus = () => {
    if (locationState.loading) {
      return (
        <Alert
          message="Getting your location..."
          description={
            <div>
              <Progress percent={50} showInfo={false} size="small" status="active" />
              <Text type="secondary">This may take a few moments</Text>
            </div>
          }
          type="info"
          showIcon
        />
      );
    }

    if (locationState.error) {
      return (
        <Alert
          message="Location Error"
          description={
            <div>
              <p>{locationState.error.message}</p>
              {locationState.error.type === 'PERMISSION_DENIED' && (
                <p>
                  <strong>To enable location access:</strong><br/>
                  1. Click the location icon in your browser's address bar<br/>
                  2. Select "Allow" for location access<br/>
                  3. Refresh the page
                </p>
              )}
            </div>
          }
          type="error"
          showIcon
          action={
            <Button size="small" onClick={getCurrentLocation}>
              Try Again
            </Button>
          }
        />
      );
    }

    if (locationState.position) {
      const { position, withinPerimeter, distance, accuracyLevel } = locationState;
      
      return (
        <Alert
          message={withinPerimeter ? "Within Work Area" : "Outside Work Area"}
          description={
            <div>
              <p>
                <strong>Location:</strong> {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
              </p>
              <p>
                <strong>Accuracy:</strong> ±{Math.round(position.accuracy)}m ({accuracyLevel})
              </p>
              {organizationLocation && (
                <p>
                  <strong>Distance from work area:</strong> {formatDistance(distance)}
                </p>
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Updated {new Date(position.timestamp).toLocaleTimeString()}
              </Text>
            </div>
          }
          type={withinPerimeter ? "success" : "warning"}
          showIcon
          icon={withinPerimeter ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          action={
            <Tooltip title="Get fresh location">
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={getCurrentLocation}
              >
                Refresh
              </Button>
            </Tooltip>
          }
        />
      );
    }

    return null;
  };

  if (!organizationLocation) {
    return (
      <Card>
        <Alert
          message="Location Setup Required"
          description="No work location has been configured for your organization. Please contact your manager to set up the location perimeter."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <ClockCircleOutlined 
            style={{ 
              fontSize: 48, 
              color: type === 'in' ? '#52c41a' : '#faad14',
              marginBottom: 16,
            }} 
          />
          <Title level={3}>
            Clock {type === 'in' ? 'In' : 'Out'}
          </Title>
          {type === 'out' && activeShift && (
            <div>
              <Text type="secondary">
                Started at {new Date(activeShift.clockInTime).toLocaleTimeString()}
              </Text>
              <br />
              <Text strong>
                Duration: {Math.floor((Date.now() - new Date(activeShift.clockInTime).getTime()) / (1000 * 60))} minutes
              </Text>
            </div>
          )}
        </div>

        {/* Location Status */}
        <div>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>
            Location Verification
          </Text>
          {renderLocationStatus()}
        </div>

        {/* Note Section */}
        <div>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>
            Add a note (optional)
          </Text>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Add a note about your ${type === 'in' ? 'start of shift' : 'end of shift'}...`}
            rows={3}
            maxLength={500}
            showCount
          />
        </div>

        {/* Submit Button */}
        <Button
          type="primary"
          size="large"
          block
          onClick={handleSubmit}
          loading={isLoading}
          disabled={!locationState.position || (type === 'in' && !locationState.withinPerimeter)}
          style={{
            height: 48,
            fontSize: 18,
            fontWeight: 600,
            backgroundColor: type === 'in' ? '#52c41a' : '#faad14',
            borderColor: type === 'in' ? '#52c41a' : '#faad14',
          }}
        >
          {isLoading 
            ? `Clocking ${type === 'in' ? 'In' : 'Out'}...` 
            : `Clock ${type === 'in' ? 'In' : 'Out'}`
          }
        </Button>

        {/* Additional Info for Clock In */}
        {type === 'in' && !locationState.withinPerimeter && locationState.position && (
          <Alert
            message="Cannot Clock In"
            description={`You need to be within ${organizationLocation.radiusInMeters}m of ${organizationLocation.name} to clock in.`}
            type="error"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
}
