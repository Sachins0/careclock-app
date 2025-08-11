'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, Typography, Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { defaultChartOptions, chartTheme } from '@/lib/charts/config';

const { Title, Text } = Typography;

interface BarChartProps {
  title: string;
  data: any;
  height?: number;
  loading?: boolean;
  description?: string;
  showInfo?: boolean;
  horizontal?: boolean;
}

export function BarChart({ 
  title, 
  data, 
  height = 300, 
  loading = false,
  description,
  showInfo = false,
  horizontal = false,
}: BarChartProps) {
  const options = {
    ...defaultChartOptions,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: false,
      },
    },
  };

  return (
    <Card loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          {showInfo && description && (
            <Tooltip title={description}>
              <InfoCircleOutlined style={{ color: chartTheme.colors.grey }} />
            </Tooltip>
          )}
        </div>
        
        <div style={{ height }}>
          <Bar data={data} options={options} />
        </div>
        
        {description && !showInfo && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {description}
          </Text>
        )}
      </Space>
    </Card>
  );
}
