'use client';

import React from 'react';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StatsCard, StatsGrid } from '@/components/ui/StatsCard';
import { ClockForm } from '@/components/forms/ClockForm';
import { useAuth } from '@/context/AuthContext';
import { useGraphQLQuery } from '@/hooks/useGraphQL';
import { GET_ME } from '@/lib/graphql/client';
import Link from 'next/link';

const { Title } = Typography;

export default function DashboardPage() {
  const { isManager } = useAuth();
  const { data: userData, loading, refetch } = useGraphQLQuery(GET_ME);

  const user = userData?.me;
  const activeShift = user?.activeShift;

  return (
    <ProtectedRoute>
      <ResponsiveLayout title="Dashboard">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Welcome Section */}
          <Card>
            <Title level={2}>
              Welcome back, {user?.name}!
            </Title>
            <p>
              {isManager 
                ? 'Manage your team and monitor operations from your dashboard.'
                : 'Track your shifts and manage your work schedule.'
              }
            </p>
          </Card>

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
          </StatsGrid>

          <Row gutter={24}>
            {/* Clock In/Out Section */}
            <Col xs={24} lg={isManager ? 12 : 16}>
              <ClockForm
                type={activeShift ? 'out' : 'in'}
                activeShift={activeShift}
                onSuccess={refetch}
              />
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
        </Space>
      </ResponsiveLayout>
    </ProtectedRoute>
  );
}
