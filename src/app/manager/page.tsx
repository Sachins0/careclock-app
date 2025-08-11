'use client';

import React from 'react';
import { Card, Typography } from 'antd';
import { ManagerOnlyRoute } from '@/components/auth/ProtectedRoute';

const { Title } = Typography;

export default function ManagerPage() {
  return (
    <ManagerOnlyRoute>
      <Card>
        <Title level={2}>Manager Dashboard</Title>
        <p>🎉 Congratulations! You have manager access.</p>
        <p>This page is only visible to users with MANAGER role.</p>
      </Card>
    </ManagerOnlyRoute>
  );
}
