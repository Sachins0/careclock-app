'use client';

import React, { useEffect } from 'react';
import { Card, Button, Alert, Space, Typography, Badge, Statistic, Row, Col } from 'antd';
import { 
  EnvironmentOutlined, 
  BellOutlined, 
  PlayCircleOutlined,
  PauseCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useGeofencing } from '@/hooks/useGeofencing';
import { useAuth } from '@/context/AuthContext';

const { Title, Text } = Typography;

interface GeofencingSetupProps {
  organizationLocation?: {
    latitude: number;
    longitude: number;
    radiusInMeters: number;
    name: string;
  } | null;
}

export function GeofencingSetup({ organizationLocation }: GeofencingSetupProps) {
  const { isCareWorker } = useAuth();
  const {
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
  } = useGeofencing();

  // Set perimeter when organization location is available
  useEffect(() => {
    if (organizationLocation) {
      setPerimeter(
        organizationLocation.latitude,
        organizationLocation.longitude,
        organizationLocation.radiusInMeters,
        organizationLocation.name
      );
    }
  }, [organizationLocation, setPerimeter]);

  // Only show for care workers
  if (!isCareWorker) {
    return null;
  }

  // No location configured
  if (!organizationLocation) {
    return (
      <Card>
        <Alert
          message="No Work Location Configured"
          description="Contact your manager to set up the work location for automatic notifications."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const handleStartMonitoring = async () => {
    if (!hasPermissions) {
      await requestPermissions();
    }
    await startMonitoring();
  };

  const formatDistance = (distance: number | null): string => {
    if (distance === null) return 'Unknown';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <Card title={
      <Space>
        <EnvironmentOutlined />
        <span>Automatic Location Notifications</span>
        <Badge 
          status={isMonitoring ? 'processing' : 'default'} 
          text={isMonitoring ? 'Active' : 'Inactive'} 
        />
      </Space>
    }>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* Permission Status */}
        <div>
          <Title level={5}>Permission Status</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small">
                <Statistic
                  title="Notifications"
                  value={permissionStatus.notification}
                  prefix={
                    permissionStatus.notification === 'granted' 
                      ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      : <WarningOutlined style={{ color: '#faad14' }} />
                  }
                  valueStyle={{ 
                    color: permissionStatus.notification === 'granted' ? '#52c41a' : '#faad14',
                    fontSize: 14,
                  }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Statistic
                  title="Location"
                  value={permissionStatus.geolocation ? 'Granted' : 'Denied'}
                  prefix={
                    permissionStatus.geolocation 
                      ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      : <WarningOutlined style={{ color: '#faad14' }} />
                  }
                  valueStyle={{ 
                    color: permissionStatus.geolocation ? '#52c41a' : '#faad14',
                    fontSize: 14,
                  }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Current Status */}
        {isMonitoring && (
          <div>
            <Title level={5}>Current Status</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Position"
                    value={insidePerimeter === null ? 'Detecting...' : insidePerimeter ? 'Inside' : 'Outside'}
                    prefix={<EnvironmentOutlined />}
                    valueStyle={{ 
                      color: insidePerimeter === null ? '#faad14' : insidePerimeter ? '#52c41a' : '#ff4d4f',
                      fontSize: 14,
                    }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Distance"
                    value={formatDistance(distanceFromCenter)}
                    prefix={<EnvironmentOutlined />}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Accuracy"
                    value={currentLocation ? `${Math.round(currentLocation.coords.accuracy)}m` : 'N/A'}
                    prefix={<EnvironmentOutlined />}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* Information */}
        <Alert
          message="How it works"
          description={
            <div>
              <p><strong>When enabled:</strong></p>
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>📱 You'll get a notification when you enter the work area</li>
                <li>🚪 You'll get a notification when you leave the work area</li>
                <li>⏰ Notifications include quick clock-in/out buttons</li>
                <li>🔋 Uses efficient background location monitoring</li>
              </ul>
              <p><strong>Work Area:</strong> {organizationLocation.name} ({organizationLocation.radiusInMeters}m radius)</p>
            </div>
          }
          type="info"
          showIcon
        />

        {/* Permissions Required Alert */}
        {!hasPermissions && (
          <Alert
            message="Permissions Required"
            description="To enable automatic notifications, please grant location and notification permissions when prompted."
            type="warning"
            showIcon
          />
        )}

        {/* Control Buttons */}
        <div style={{ textAlign: 'center' }}>
          {!isMonitoring ? (
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={handleStartMonitoring}
              loading={false}
            >
              Enable Location Notifications
            </Button>
          ) : (
            <Button
              type="default"
              size="large"
              icon={<PauseCircleOutlined />}
              onClick={stopMonitoring}
              danger
            >
              Disable Notifications
            </Button>
          )}
        </div>

        {/* Notification Test Button */}
        {hasPermissions && (
          <div style={{ textAlign: 'center' }}>
            <Button
              type="dashed"
              icon={<BellOutlined />}
              onClick={() => {
                new Notification('CareClock Test', {
                  body: 'Push notifications are working correctly!',
                  icon: '/icons/icon-192x192.png',
                });
              }}
            >
              Test Notification
            </Button>
          </div>
        )}
      </Space>
    </Card>
  );
}
