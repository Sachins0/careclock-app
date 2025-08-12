'use client';

import React from 'react';
import { Card, Typography, Space, Button, Row, Col } from 'antd';
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { AuthButton } from '@/components/auth/AuthButton';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: <EnvironmentOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      title: 'Geofenced Clock-In',
      description: 'Clock in and out only when you\'re within designated work locations',
    },
    {
      icon: <UserOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: 'Role-Based Access',
      description: 'Different interfaces for Care Workers and Managers with appropriate permissions',
    },
    {
      icon: <DashboardOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      title: 'Real-Time Monitoring',
      description: 'Live staff monitoring and comprehensive shift tracking',
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: 'Analytics & Reports',
      description: 'Detailed analytics and reporting for workforce management',
    },
  ];

  return (
    <ResponsiveLayout showSider={false}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Hero Section */}
        <Card style={{ textAlign: 'center', marginBottom: 32 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <ClockCircleOutlined style={{ fontSize: 80, color: '#1890ff' }} />
            <div>
              <Title level={1} style={{ margin: 0, color: '#1890ff' }}>
                CareClock
              </Title>
              <Title level={3} type="secondary" style={{ fontWeight: 400 }}>
                Geofenced Shift Management for Healthcare
              </Title>
            </div>
            <Paragraph style={{ fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
              Streamline your healthcare workforce management with location-based 
              clock-in/out, real-time monitoring, and comprehensive analytics.
            </Paragraph>
            
            {!user ? (
              <AuthButton />
            ) : (
              <Button type="primary" size="large">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </Space>
        </Card>

        {/* Features Grid */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                hoverable
                style={{ height: '100%', textAlign: 'center' }}
                styles={{ body: { padding: 0 } }}
              >
                <Space direction="vertical" size="middle">
                  {feature.icon}
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph type="secondary">
                    {feature.description}
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* User Profile Section */}
        {user && (
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Card title="Quick Actions">
                <Space wrap>
                  <Button type="primary" size="large">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button size="large">
                    <Link href="/shifts">My Shifts</Link>
                  </Button>
                  {user && (
                    <Button size="large">
                      <Link href="/profile">Profile</Link>
                    </Button>
                  )}
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <UserProfile />
            </Col>
          </Row>
        )}
      </div>
    </ResponsiveLayout>
  );
}
