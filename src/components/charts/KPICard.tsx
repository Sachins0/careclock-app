'use client';

import React from 'react';
import { Card, Statistic, Typography, Space, Tag } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  MinusOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface KPICardProps {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  color?: string;
  loading?: boolean;
  description?: string;
  target?: {
    value: number;
    label: string;
  };
}

export function KPICard({ 
  title, 
  value, 
  suffix, 
  prefix, 
  icon, 
  trend, 
  color = '#1890ff',
  loading = false,
  description,
  target,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) {
      return <ArrowUpOutlined style={{ color: trend.isPositive ? '#52c41a' : '#ff4d4f' }} />;
    } else if (trend.value < 0) {
      return <ArrowDownOutlined style={{ color: trend.isPositive ? '#ff4d4f' : '#52c41a' }} />;
    } else {
      return <MinusOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '#8c8c8c';
    
    if (trend.value === 0) return '#8c8c8c';
    
    if (trend.value > 0) {
      return trend.isPositive ? '#52c41a' : '#ff4d4f';
    } else {
      return trend.isPositive ? '#ff4d4f' : '#52c41a';
    }
  };

  const getTargetStatus = () => {
    if (!target || typeof value !== 'number') return null;
    
    const percentage = (value / target.value) * 100;
    let status: 'success' | 'warning' | 'error' = 'success';
    
    if (percentage < 70) status = 'error';
    else if (percentage < 90) status = 'warning';
    
    return { percentage: Math.round(percentage), status };
  };

  const targetStatus = getTargetStatus();

  return (
    <Card loading={loading}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Header */}
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
        
        {/* Main Value */}
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
        
        {/* Trend and Target */}
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {/* Trend */}
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {getTrendIcon()}
              <Text 
                style={{ 
                  fontSize: 12, 
                  color: getTrendColor(),
                  fontWeight: 500,
                }}
              >
                {Math.abs(trend.value)}% vs {trend.period}
              </Text>
            </div>
          )}
          
          {/* Target */}
          {targetStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                Target: {target!.value}{suffix}
              </Text>
              <Tag 
                size="small"
                color={
                  targetStatus.status === 'success' ? 'success' :
                  targetStatus.status === 'warning' ? 'warning' : 'error'
                }
              >
                {targetStatus.percentage}%
              </Tag>
            </div>
          )}
        </Space>
        
        {/* Description */}
        {description && (
          <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
            {description}
          </Text>
        )}
      </Space>
    </Card>
  );
}

// Grid layout for KPI cards
export function KPIGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 16,
      marginBottom: 24,
    }}>
      {children}
    </div>
  );
}
