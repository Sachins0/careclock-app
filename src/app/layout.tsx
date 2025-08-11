import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@auth0/nextjs-auth0/client'; // Add this back for v3.5.0
import { AuthProvider } from '@/context/AuthContext';
import { ConfigProvider } from 'antd';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareClock - Shift Management System',
  description: 'Geofenced shift management for healthcare organizations',
};

// Ant Design theme configuration
const antdTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
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
            <ConfigProvider theme={antdTheme}>
              {children}
            </ConfigProvider>
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  );
}
