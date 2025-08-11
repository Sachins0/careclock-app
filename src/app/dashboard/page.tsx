'use client';

import React from 'react';
import { Layout, Card, Typography, Button } from 'antd';
import { ClockCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function DashboardPage() {
  const { isManager } = useAuth();

  return (
    <ProtectedRoute>
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
              CareClock Dashboard
            </Title>
          </div>
          <Link href="/">
            <Button icon={<HomeOutlined />}>Home</Button>
          </Link>
        </Header>

        <Content style={{ padding: '24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <UserProfile />
            
            <Card style={{ marginTop: 24 }}>
              <Title level={2}>Dashboard</Title>
              <p>Welcome to your CareClock dashboard!</p>
              
              {isManager ? (
                <div>
                  <p>✅ Manager features will be available here:</p>
                  <ul>
                    <li>Live staff monitoring</li>
                    <li>Location management</li>
                    <li>Analytics and reports</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p>✅ Care Worker features will be available here:</p>
                  <ul>
                    <li>Clock in/out buttons</li>
                    <li>Shift history</li>
                    <li>Current shift status</li>
                  </ul>
                </div>
              )}
            </Card>
          </div>
        </Content>
      </Layout>
    </ProtectedRoute>
  );
}
