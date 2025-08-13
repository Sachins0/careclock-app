'use client';

import React, { useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Button, Alert, Divider } from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  TeamOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StatsCard, StatsGrid } from '@/components/ui/StatsCard';
import { ClockForm } from '@/components/forms/ClockForm';
import { LocationPermission } from '@/components/geolocation/LocationPermission';
import { useAuth } from '@/context/AuthContext';
import { useGraphQLQuery } from '@/hooks/useGraphQL';
import { GET_ME } from '@/lib/graphql/client';
import { GeolocationService } from '@/lib/geolocation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { isManager } = useAuth();
  const { data: userData, loading, refetch } = useGraphQLQuery(GET_ME);
  const [locationPermission, setLocationPermission] = React.useState<PermissionState>('prompt');
  const [isLocationSupported, setIsLocationSupported] = React.useState(true);

  const user = userData?.me;
  const activeShift = user?.activeShift;
  const organizationLocation = user?.organization?.location;

  const geolocationService = GeolocationService.getInstance();

  // Check location support and permissions on mount
  useEffect(() => {
    const checkLocationCapabilities = async () => {
      setIsLocationSupported(geolocationService.isSupported());
      
      if (geolocationService.isSupported()) {
        const permission = await geolocationService.checkPermissions();
        setLocationPermission(permission);
      }
    };

    checkLocationCapabilities();
  }, [geolocationService]);

  // Handle location permission events
  const handlePermissionGranted = () => {
    setLocationPermission('granted');
  };

  const handlePermissionDenied = () => {
    setLocationPermission('denied');
  };

  // Show location permission screen if needed
  if (!isLocationSupported) {
    return (
      <ProtectedRoute>
        <ResponsiveLayout title="Dashboard">
          <Alert
            message="Location Services Not Supported"
            description="Your browser doesn't support location services. CareClock requires location access to function properly. Please use a modern browser like Chrome, Firefox, Safari, or Edge."
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        </ResponsiveLayout>
      </ProtectedRoute>
    );
  }

  if (locationPermission !== 'granted') {
    return (
      <ProtectedRoute>
        <ResponsiveLayout title="Dashboard">
          <LocationPermission
            onPermissionGranted={handlePermissionGranted}
            onPermissionDenied={handlePermissionDenied}
          />
        </ResponsiveLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ResponsiveLayout title="Dashboard">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Welcome Section */}
          <Card>
            <Row align="middle">
              <Col flex="auto">
                <Title level={2} style={{ margin: 0 }}>
                  Welcome back, {user?.name}!
                </Title>
                <Text type="secondary">
                  {isManager 
                    ? 'Manage your team and monitor operations from your dashboard. For location related setup heads to Settings.'
                    : 'Track your shifts and manage your work schedule.'
                  }
                </Text>
              </Col>
              <Col>
                <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </Col>
            </Row>
          </Card>

          {/* Location Status */}
          {organizationLocation ? (
            <Card size="small">
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text>
                  <Text strong>Work Location:</Text> {organizationLocation.name}
                </Text>
                <Text type="secondary">
                  ({organizationLocation.radiusInMeters}m radius)
                </Text>
                <Text type="secondary">
                  (Change it in Settings)
                </Text>
              </Space>
            </Card>
          ) : (
            <Alert
              message="Location Setup Required"
              description={
                isManager 
                  ? "No work location has been configured. Please set up your organization's location in Settings."
                  : "No work location has been configured. Please contact your manager to set up the location perimeter."
              }
              type="warning"
              showIcon
              action={
                isManager && (
                  <Button type="primary" size="small">
                    <Link href="/settings">Configure Location</Link>
                  </Button>
                )
              }
            />
          )}

          {/* Quick Stats */}
          <StatsGrid>
            <StatsCard
              title="Current Status"
              value={activeShift ? 'On Shift' : 'Off Duty'}
              icon={<ClockCircleOutlined />}
              color={activeShift ? '#52c41a' : '#8c8c8c'}
              loading={loading}
            />
            
            {isManager && (
              <>
                <StatsCard
                  title="Active Staff"
                  value={0}
                  icon={<TeamOutlined />}
                  color="#1890ff"
                />
                <StatsCard
                  title="Today's Shifts"
                  value={0}
                  icon={<BarChartOutlined />}
                  color="#722ed1"
                />
              </>
            )}

            <StatsCard
              title="Location Services"
              value="Active"
              icon={<EnvironmentOutlined />}
              color="#52c41a"
            />
          </StatsGrid>

          {/* Active Shift Info */}
          {activeShift && (
            <Alert
              message="You're Currently On Shift"
              description={
                <Space direction="vertical" size="small">
                  <Text>
                    Started at {new Date(activeShift.clockInTime).toLocaleString()}
                  </Text>
                  <Text strong>
                    Duration: {Math.floor((Date.now() - new Date(activeShift.clockInTime).getTime()) / (1000 * 60))} minutes
                  </Text>
                </Space>
              }
              type="success"
              showIcon
              icon={<ClockCircleOutlined />}
            />
          )}

          <Row gutter={24}>
            {/* Clock In/Out Section */}
            <Col xs={24} lg={isManager ? 12 : 16}>
              {organizationLocation ? (
                <ClockForm
                  type={activeShift ? 'out' : 'in'}
                  activeShift={activeShift}
                  onSuccess={refetch}
                />
              ) : (
                <Card>
                  <Space direction="vertical" align="center" style={{ width: '100%', textAlign: 'center' }}>
                    <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
                    <Title level={4}>Location Setup Required</Title>
                    <Text type="secondary">
                      A work location must be configured before you can clock in or out.
                    </Text>
                    {isManager && (
                      <Button type="primary">
                        <Link href="/settings">Set Up Location</Link>
                      </Button>
                    )}
                  </Space>
                </Card>
              )}
            </Col>

            {/* Quick Actions */}
            <Col xs={24} lg={isManager ? 12 : 8}>
              <Card title="Quick Actions">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block>
                    <Link href="/shifts">View My Shifts</Link>
                  </Button>
                  <Button block>
                    <Link href="/profile">Update Profile</Link>
                  </Button>
                  
                  {isManager && (
                    <>
                      <Divider style={{ margin: '12px 0' }} />
                      <Button block type="primary">
                        <Link href="/manager">Staff Management</Link>
                      </Button>
                      <Button block>
                        <Link href="/settings">Location Settings</Link>
                      </Button>
                    </>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Location Tips */}
          <Card title="Location Tips" size="small">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>Enable high accuracy GPS for best results</Text>
                </Space>
              </Col>
              <Col xs={24} sm={8}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>Allow location access when prompted</Text>
                </Space>
              </Col>
              <Col xs={24} sm={8}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>Clock in from within the designated area</Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Space>
      </ResponsiveLayout>
    </ProtectedRoute>
  );
}
