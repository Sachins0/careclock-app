'use client';

import React, { useState, ReactNode } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Badge, Typography } from 'antd';
import { InstallButton } from '@/components/pwa/InstallButton';
import { UpdateAvailable } from '@/components/pwa/UpdateAvailable';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { usePWA } from '@/context/PWAContext';
import { 
  ClockCircleOutlined,
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showSider?: boolean;
}

export function AppLayout({ children, title, showSider = true }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, dbUser, isManager } = useAuth();
  const { canInstall } = usePWA();
  const router = useRouter();

  // Navigation menu items
  // Add to the menuItems array in AppLayout.tsx
    const menuItems = [
    {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
        key: '/shifts',
        icon: <ClockCircleOutlined />,
        label: <Link href="/shifts">My Shifts</Link>,
    },
    // Manager-only items
    ...(isManager ? [
        {
        key: 'manager-section',
        type: 'group',
        label: 'Management',
        },
        {
        key: '/manager',
        icon: <TeamOutlined />,
        label: <Link href="/manager">Live Dashboard</Link>,
        },
        {
        key: '/manager/reports',
        icon: <BarChartOutlined />,
        label: <Link href="/manager/reports">Reports</Link>,
        },
        {
        key: '/settings',
        icon: <SettingOutlined />,
        label: <Link href="/settings">Settings</Link>,
        },
    ] : []),
    ];


  // User dropdown menu
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
        onClick: () => router.push('/profile'),
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: () => window.location.href = '/api/auth/logout',
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      {showSider && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
          }}
          breakpoint="lg"
          collapsedWidth={80}
        >
          {/* Logo */}
          <div style={{ 
            padding: '16px', 
            textAlign: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <ClockCircleOutlined 
              style={{ 
                fontSize: collapsed ? 24 : 32, 
                color: '#1890ff',
                transition: 'font-size 0.2s',
              }} 
            />
            {!collapsed && (
              <Title level={4} style={{ margin: '8px 0 0 0', color: '#1890ff' }}>
                CareClock
              </Title>
            )}
          </div>

          {/* Navigation Menu */}
          <Menu
            mode="inline"
            selectedKeys={[window.location.pathname]}
            items={menuItems}
            style={{ 
              border: 'none',
              marginTop: 16,
            }}
          />
        </Sider>
      )}

      <Layout>
        <OfflineIndicator />
        <UpdateAvailable />
        {/* Header */}
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {showSider && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: 16 }}
              />
            )}
            
            {title && (
              <Title level={3} style={{ margin: 0 }}>
                {title}
              </Title>
            )}
          </div>

          {/* Header Actions */}
          <Space size="middle">
            {canInstall && <InstallButton />}
            {/* Notifications */}
            <Badge count={0} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                style={{ display: 'flex', alignItems: 'center' }}
              />
            </Badge>

            {/* User Menu */}
            {user && (
              <Dropdown menu={userMenu} placement="bottomRight" arrow>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  cursor: 'pointer',
                }}>
                  <Avatar 
                    src={user.picture} 
                    icon={<UserOutlined />}
                    size="default"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text strong style={{ fontSize: 14 }}>
                      {user.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dbUser?.role === 'MANAGER' ? 'Manager' : 'Care Worker'}
                    </Text>
                  </div>
                </div>
              </Dropdown>
            )}
          </Space>
        </Header>

        {/* Main Content */}
        <Content style={{ 
          margin: 24,
          minHeight: 'calc(100vh - 112px)', // Account for header height + margins
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
