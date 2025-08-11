import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { AuthProvider } from '@/context/AuthContext';
import { ConfigProvider } from 'antd';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareClock - Shift Management System',
  description: 'Geofenced shift management for healthcare organizations',
};

// CareClock Design System Theme
const careClockTheme = {
  token: {
    // Primary colors - Healthcare blue palette
    colorPrimary: '#1890ff',
    colorPrimaryHover: '#40a9ff', 
    colorPrimaryActive: '#096dd9',
    colorPrimaryBorder: '#91d5ff',
    colorPrimaryBg: '#e6f7ff',
    
    // Success colors - For successful clock-ins
    colorSuccess: '#52c41a',
    colorSuccessHover: '#73d13d',
    colorSuccessActive: '#389e0d',
    
    // Warning colors - For geofence warnings
    colorWarning: '#faad14',
    colorWarningHover: '#ffc53d',
    colorWarningActive: '#d48806',
    
    // Error colors - For failed operations
    colorError: '#ff4d4f',
    colorErrorHover: '#ff7875',
    colorErrorActive: '#d9363e',
    
    // Neutral colors
    colorTextBase: '#262626',
    colorTextSecondary: '#8c8c8c',
    colorTextTertiary: '#bfbfbf',
    colorTextQuaternary: '#f0f0f0',
    
    // Background colors
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBgSpotlight: '#fafafa',
    
    // Border and divider
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    
    // Typography
    fontFamily: inter.style.fontFamily,
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Layout
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,
    
    // Shadows for depth
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 1px 2px rgba(0, 0, 0, 0.03)',
    
    // Animation
    motionDurationSlow: '0.3s',
    motionDurationMid: '0.2s',
    motionDurationFast: '0.1s',
  },
  components: {
    // Button customization
    Button: {
      borderRadiusLG: 8,
      fontWeight: 500,
      primaryShadow: '0 2px 0 rgba(24, 144, 255, 0.1)',
    },
    
    // Card customization
    Card: {
      borderRadiusLG: 12,
      paddingLG: 24,
    },
    
    // Input customization
    Input: {
      borderRadius: 8,
      paddingInlineLG: 16,
    },
    
    // Table customization
    Table: {
      borderRadiusLG: 8,
      headerBg: '#fafafa',
    },
    
    // Layout customization
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      siderBg: '#ffffff',
    },
    
    // Menu customization
    Menu: {
      itemBorderRadius: 8,
      itemMarginInline: 4,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <AuthProvider>
            <ConfigProvider theme={careClockTheme}>
              {children}
            </ConfigProvider>
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  );
}
