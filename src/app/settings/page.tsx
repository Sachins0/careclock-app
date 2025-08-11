'use client';

import React from 'react';
import { Card, Space, Typography, Row, Col } from 'antd';
import { EnvironmentOutlined, SettingOutlined } from '@ant-design/icons';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ManagerOnlyRoute } from '@/components/auth/ProtectedRoute';
import { LocationForm } from '@/components/forms/LocationForm';
import { useGraphQLQuery } from '@/hooks/useGraphQL';

const { Title, Text } = Typography;

const GET_SETTINGS_DATA = `
  query GetSettingsData {
    me {
      id
      name
      organization {
        id
        name
        location {
          id
          name
          address
          latitude
          longitude
          radiusInMeters
        }
      }
    }
    getActiveStaff {
      id
      name
      email
    }
  }
`;

export default function SettingsPage() {
  const { data, loading } = useGraphQLQuery(GET_SETTINGS_DATA);

  const organization = data?.me?.organization;
  const activeStaff = data?.getActiveStaff || [];

  return (
    <ManagerOnlyRoute>
      <ResponsiveLayout title="Settings">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Page Header */}
          <Card>
            <Space>
              <SettingOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Organization Settings
                </Title>
                <Text type="secondary">
                  Configure location perimeters and manage workplace settings
                </Text>
              </div>
            </Space>
          </Card>

          <Row gutter={24}>
            {/* Location Configuration */}
            <Col xs={24} lg={16}>
              <LocationForm />
            </Col>

            {/* Organization Info */}
            <Col xs={24} lg={8}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Organization Details */}
                <Card title="Organization Information" loading={loading}>
                  {organization && (
                    <Space direction="vertical" size="small">
                      <div>
                        <Text strong>Organization Name:</Text>
                        <br />
                        <Text>{organization.name}</Text>
                      </div>
                      
                      {organization.location && (
                        <>
                          <div>
                            <Text strong>Location Name:</Text>
                            <br />
                            <Text>{organization.location.name}</Text>
                          </div>
                          
                          {organization.location.address && (
                            <div>
                              <Text strong>Address:</Text>
                              <br />
                              <Text>{organization.location.address}</Text>
                            </div>
                          )}
                          
                          <div>
                            <Text strong>Coordinates:</Text>
                            <br />
                            <Text code style={{ fontSize: 12 }}>
                              {organization.location.latitude.toFixed(6)}, {organization.location.longitude.toFixed(6)}
                            </Text>
                          </div>
                          
                          <div>
                            <Text strong>Clock-in Radius:</Text>
                            <br />
                            <Text>{organization.location.radiusInMeters}m</Text>
                          </div>
                        </>
                      )}
                    </Space>
                  )}
                </Card>

                {/* Active Staff Summary */}
                <Card 
                  title="Currently Active Staff"
                  loading={loading}
                >
                  {activeStaff.length > 0 ? (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text strong>{activeStaff.length} staff members currently clocked in</Text>
                      {activeStaff.slice(0, 5).map((staff: any) => (
                        <div key={staff.id}>
                          <Text>{staff.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {staff.email}
                          </Text>
                        </div>
                      ))}
                      {activeStaff.length > 5 && (
                        <Text type="secondary">
                          ...and {activeStaff.length - 5} more
                        </Text>
                      )}
                    </Space>
                  ) : (
                    <Text type="secondary">No staff currently clocked in</Text>
                  )}
                </Card>

                {/* Quick Tips */}
                <Card title="Location Setup Tips" size="small">
                  <Space direction="vertical" size="small">
                    <Text style={{ fontSize: 12 }}>
                      • Set a reasonable radius (50-200m) for your work area
                    </Text>
                    <Text style={{ fontSize: 12 }}>
                      • Use "Get My Current Location" when you're at the work site
                    </Text>
                    <Text style={{ fontSize: 12 }}>
                      • Test the location with staff before full deployment
                    </Text>
                    <Text style={{ fontSize: 12 }}>
                      • Consider GPS accuracy when setting the radius
                    </Text>
                  </Space>
                </Card>
              </Space>
            </Col>
          </Row>
        </Space>
      </ResponsiveLayout>
    </ManagerOnlyRoute>
  );
}
