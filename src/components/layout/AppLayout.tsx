'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Badge, Typography, Drawer } from 'antd';
import { 
  ClockCircleOutlined,
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  BellOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSider?: boolean;
}

export function AppLayout({ children, title, showSider = true }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, dbUser, isManager } = useAuth();
  const router = useRouter();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

 // ✅ Navigation menu items - ADD REPORTS BACK
const navigationItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    onClick: () => {
      router.push('/dashboard');
      setMobileDrawerVisible(false);
    }
  },
  {
    key: '/shifts',
    icon: <ClockCircleOutlined />,
    label: 'My Shifts',
    onClick: () => {
      router.push('/shifts');
      setMobileDrawerVisible(false);
    }
  },
  // Manager-only items
  ...(isManager ? [
    {
      type: 'divider' as const,
    },
    {
      key: 'manager-section',
      type: 'group' as const,
      label: 'Management',
    },
    {
      key: '/manager',
      icon: <TeamOutlined />,
      label: 'Live Dashboard',
      onClick: () => {
        router.push('/manager');
        setMobileDrawerVisible(false);
      }
    },
    // ✅ ADD REPORTS BACK
    {
      key: '/manager/reports',
      icon: <BarChartOutlined />, // Add this import if missing
      label: 'Reports',
      onClick: () => {
        router.push('/manager/reports');
        setMobileDrawerVisible(false);
      }
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        router.push('/settings');
        setMobileDrawerVisible(false);
      }
    },
  ] : []),
];

// ✅ Desktop menu items - ADD REPORTS BACK
const desktopMenuItems = [
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
  ...(isManager ? [
    {
      key: 'manager-section',
      type: 'group' as const,
      label: 'Management',
    },
    {
      key: '/manager',
      icon: <TeamOutlined />,
      label: <Link href="/manager">Live Dashboard</Link>,
    },
    // ✅ ADD REPORTS BACK
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


  // ✅ User dropdown menu items (separate from navigation)
  const userMenuItems = [
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
  ];

  // ✅ Fixed Mobile Navigation Menu
  const MobileNavigationMenu = () => (
    <div style={{ padding: '16px 0' }}>
      {/* User Info Section in Mobile Drawer */}
      {user && (
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid #f0f0f0',
          marginBottom: '16px' 
        }}>
          <Space>
            <Avatar 
              src={user.picture} 
              icon={<UserOutlined />}
              size="large"
            />
            <div>
              <Text strong style={{ display: 'block' }}>{user.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dbUser?.role === 'MANAGER' ? 'Manager' : 'Care Worker'}
              </Text>
            </div>
          </Space>
        </div>
      )}
      
      {/* Navigation Items */}
      <Menu
        mode="inline"
        selectedKeys={[window.location.pathname]}
        items={navigationItems}
        style={{ border: 'none' }}
      />
      
      {/* User Actions at Bottom */}
      {user && (
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #f0f0f0',
          marginTop: '16px' 
        }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="text" 
              icon={<UserOutlined />}
              onClick={() => {
                router.push('/profile');
                setMobileDrawerVisible(false);
              }}
              style={{ 
                width: '100%', 
                textAlign: 'left',
                justifyContent: 'flex-start' 
              }}
            >
              Profile
            </Button>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={() => window.location.href = '/api/auth/logout'}
              style={{ 
                width: '100%', 
                textAlign: 'left',
                justifyContent: 'flex-start' 
              }}
            >
              Logout
            </Button>
          </Space>
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && showSider && (
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

          {/* Desktop Navigation Menu */}
          <Menu
            mode="inline"
            selectedKeys={[window.location.pathname]}
            items={desktopMenuItems}
            style={{ 
              border: 'none',
              marginTop: 16,
            }}
          />
        </Sider>
      )}

      {/* ✅ Mobile Drawer with Correct Navigation Content */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <span style={{ color: '#1890ff', fontWeight: 600 }}>CareClock</span>
          </div>
        }
        placement="left"
        closable={true}
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={300}
        bodyStyle={{ padding: 0 }}
      >
        <MobileNavigationMenu />
      </Drawer>

      <Layout>
        {/* Header */}
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Left Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* ✅ Mobile menu button */}
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileDrawerVisible(true)}
                style={{ fontSize: 18 }}
              />
            ) : (
              /* Desktop collapse button */
              showSider && (
                <Button
                  type="text"
                  icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ fontSize: 16 }}
                />
              )
            )}
            
            {/* Page Title */}
            {title && !isMobile && (
              <Title level={3} style={{ margin: 0 }}>
                {title}
              </Title>
            )}
            
            {/* Mobile: Show app name instead of page title */}
            {title && isMobile && (
              <Text strong style={{ fontSize: 16 }}>CareClock</Text>
            )}
          </div>

          {/* Right Side - User Menu (Desktop Only) */}
          {!isMobile && user && (
            <Space size="middle">
              {/* Notifications */}
              <Badge count={0} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined style={{ fontSize: 18 }} />}
                  style={{ display: 'flex', alignItems: 'center' }}
                />
              </Badge>

              {/* User Dropdown */}
              <Dropdown 
                menu={{ items: userMenuItems }} 
                placement="bottomRight" 
                arrow
                trigger={['click']}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s',
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
            </Space>
          )}

          {/* Mobile: Just notifications */}
          {isMobile && (
            <Badge count={0} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                style={{ display: 'flex', alignItems: 'center' }}
              />
            </Badge>
          )}
        </Header>

        {/* Main Content */}
        <Content style={{ 
          margin: isMobile ? 16 : 24,
          minHeight: 'calc(100vh - 112px)',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
