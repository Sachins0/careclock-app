'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Typography, Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { defaultChartOptions, chartTheme } from '@/lib/charts/config';

const { Title, Text } = Typography;

interface LineChartProps {
  title: string;
  data: any;
  height?: number;
  loading?: boolean;
  description?: string;
  showInfo?: boolean;
}

export function LineChart({ 
  title, 
  data, 
  height = 300, 
  loading = false,
  description,
  showInfo = false,
}: LineChartProps) {
  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: false,
      },
    },
    scales: {
      ...defaultChartOptions.scales,
      x: {
        ...defaultChartOptions.scales.x,
        type: 'category' as const,
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
          <Line data={data} options={options} />
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
