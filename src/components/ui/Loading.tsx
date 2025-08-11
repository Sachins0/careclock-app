'use client';

import React from 'react';
import { Spin, Space, Typography, Card } from 'antd';
import { LoadingOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingProps {
  size?: 'small' | 'default' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ size = 'default', message, fullScreen = false }: LoadingProps) {
  const loadingIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

  const content = (
    <Space direction="vertical" align="center" size="middle">
      <Spin indicator={loadingIcon} />
      {message && (
        <Text type="secondary" style={{ fontSize: size === 'large' ? 16 : 14 }}>
          {message}
        </Text>
      )}
    </Space>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
      }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
    }}>
      {content}
    </div>
  );
}

// Skeleton loading for cards
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card loading style={{ marginBottom: 16 }}>
      <div style={{ height: rows * 20 }} />
    </Card>
  );
}

// Page loading with CareClock branding
export function PageLoading({ message = 'Loading CareClock...' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 24,
    }}>
      <ClockCircleOutlined style={{ fontSize: 64, color: '#1890ff' }} />
      <Spin size="large" />
      <Text type="secondary" style={{ fontSize: 16 }}>
        {message}
      </Text>
    </div>
  );
}
