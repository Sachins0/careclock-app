// Create src/app/profile/page.tsx
'use client';

import React from 'react';
import { Card, Typography, Space } from 'antd';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, dbUser } = useAuth();

  return (
    <ProtectedRoute>
      <ResponsiveLayout title="Profile">
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={2}>User Profile</Title>
            
            <div>
              <Text strong>Name:</Text> {user?.name}
            </div>
            <div>
              <Text strong>Email:</Text> {user?.email}
            </div>
            <div>
              <Text strong>Role:</Text> {dbUser?.role}
            </div>
            
            {/* Add more profile fields as needed */}
          </Space>
        </Card>
      </ResponsiveLayout>
    </ProtectedRoute>
  );
}
