'use client';

import React, { ReactNode } from 'react';
import { Card, Statistic, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StatsCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  prefix?: ReactNode;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  loading?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  suffix, 
  prefix, 
  icon, 
  trend, 
  color = '#1890ff',
  loading 
}: StatsCardProps) {
  return (
    <Card loading={loading}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {title}
          </Text>
          {icon && (
            <div style={{ color, fontSize: 24 }}>
              {icon}
            </div>
          )}
        </div>
        
        <Statistic
          value={value}
          suffix={suffix}
          prefix={prefix}
          valueStyle={{ 
            color, 
            fontSize: 32, 
            fontWeight: 600,
            lineHeight: 1,
          }}
        />
        
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {trend.isPositive ? (
              <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />
            ) : (
              <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
            )}
            <Text 
              style={{ 
                fontSize: 12, 
                color: trend.isPositive ? '#52c41a' : '#ff4d4f' 
              }}
            >
              {Math.abs(trend.value)}% from last week
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
}

// Grid layout for stats cards
export function StatsGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 16,
      marginBottom: 24,
    }}>
      {children}
    </div>
  );
}
