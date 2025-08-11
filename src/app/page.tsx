'use client';

import React from 'react';
import { Layout, Card, Typography, Space, Divider } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { AuthButton } from '@/components/auth/AuthButton';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/context/AuthContext';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function HomePage() {
  const { user } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            CareClock
          </Title>
        </div>
        <AuthButton />
      </Header>

      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Card>
            <Title level={1}>Welcome to CareClock</Title>
            <Paragraph>
              A geofenced shift management system for healthcare organizations.
              Clock in and out of your shifts within designated locations.
            </Paragraph>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={3}>
                  <EnvironmentOutlined /> Features
                </Title>
                <ul>
                  <li>📍 Geofenced clock-in/out system</li>
                  <li>👥 Role-based access (Care Workers & Managers)</li>
                  <li>📊 Real-time staff monitoring</li>
                  <li>📈 Analytics and reporting</li>
                  <li>📱 Mobile-first design</li>
                </ul>
              </div>

              {user && (
                <>
                  <Divider />
                  <div>
                    <Title level={3}>
                      <UserOutlined /> Your Profile
                    </Title>
                    <UserProfile />
                  </div>
                </>
              )}
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
