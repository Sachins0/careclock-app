'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Space, Typography, Alert, Modal } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useGraphQLMutation } from '@/hooks/useGraphQL';
import { CLOCK_IN, CLOCK_OUT } from '@/lib/graphql/client';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ClockFormProps {
  type: 'in' | 'out';
  onSuccess?: () => void;
  activeShift?: any;
}

export function ClockForm({ type, onSuccess, activeShift }: ClockFormProps) {
  const [note, setNote] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { mutate: clockIn, loading: clockingIn } = useGraphQLMutation(CLOCK_IN);
  const { mutate: clockOut, loading: clockingOut } = useGraphQLMutation(CLOCK_OUT);

  const isLoading = clockingIn || clockingOut || gettingLocation;

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleSubmit = async () => {
    if (!location) {
      setLocationError('Please get your location first');
      return;
    }

    try {
      const input = {
        latitude: location.latitude,
        longitude: location.longitude,
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
          content: data.message,
          onOk: () => {
            setNote('');
            setLocation(null);
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

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
            <Text type="secondary">
              Started at {new Date(activeShift.clockInTime).toLocaleTimeString()}
            </Text>
          )}
        </div>

        {/* Location Section */}
        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Location Verification Required</Text>
            
            {locationError && (
              <Alert 
                message={locationError} 
                type="error" 
                showIcon 
                style={{ marginBottom: 8 }}
              />
            )}

            {location ? (
              <Alert
                message="Location captured successfully"
                description={`Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`}
                type="success"
                showIcon
                action={
                  <Button size="small" onClick={getCurrentLocation}>
                    Update
                  </Button>
                }
              />
            ) : (
              <Button
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={getCurrentLocation}
                loading={gettingLocation}
                block
              >
                {gettingLocation ? 'Getting Location...' : 'Get My Location'}
              </Button>
            )}
          </Space>
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
          disabled={!location}
          style={{
            height: 48,
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          {isLoading 
            ? `Clocking ${type === 'in' ? 'In' : 'Out'}...` 
            : `Clock ${type === 'in' ? 'In' : 'Out'}`
          }
        </Button>
      </Space>
    </Card>
  );
}
