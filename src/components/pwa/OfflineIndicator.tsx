'use client';

import React from 'react';
import { Alert, Typography } from 'antd';
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { usePWA } from '@/context/PWAContext';

const { Text } = Typography;

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <Alert
      message={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DisconnectOutlined />
          <Text strong>You're offline</Text>
        </div>
      }
      description="Some features may be limited. Data will sync when you're back online."
      type="warning"
      showIcon={false}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: 0,
        textAlign: 'center',
      }}
    />
  );
}
