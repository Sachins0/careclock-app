'use client';

import React, { ReactNode } from 'react';
import { Layout, Typography, Space, Avatar, Button } from 'antd';
import { 
  ClockCircleOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backUrl?: string;
}

export function MobileLayout({ 
  children, 
  title, 
  showBack = false, 
  backUrl = '/' 
}: MobileLayoutProps) {
  const { user, dbUser } = useAuth();
  const router = useRouter();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Mobile Header */}
      <Header style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(backUrl)}
              style={{ marginRight: 8 }}
            />
          )}
          
          <ClockCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          
          <Title level={5} style={{ margin: 0 }}>
            {title || 'CareClock'}
          </Title>
        </div>

        {user && (
          <Avatar 
            src={user.picture} 
            icon={<UserOutlined />}
            size="small"
          />
        )}
      </Header>

      {/* Mobile Content */}
      <Content style={{ 
        padding: 16,
        minHeight: 'calc(100vh - 56px)',
      }}>
        {children}
      </Content>
    </Layout>
  );
}
