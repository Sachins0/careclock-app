'use client';

import React from 'react';
import { Table, Tag, Typography, Space, Button, Tooltip } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { format } from 'date-fns';

const { Text } = Typography;

interface ShiftRecord {
  id: string;
  clockInTime: string;
  clockOutTime?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  duration?: string;
  clockInNote?: string;
  clockOutNote?: string;
  clockInLocation?: { latitude: number; longitude: number };
  clockOutLocation?: { latitude: number; longitude: number };
  user?: {
    name: string;
    email: string;
  };
}

interface ShiftTableProps {
  data: ShiftRecord[];
  loading?: boolean;
  showUser?: boolean; // For manager view
  onViewDetails?: (shift: ShiftRecord) => void;
}

export function ShiftTable({ data, loading, showUser = false, onViewDetails }: ShiftTableProps) {
  const columns: ColumnsType<ShiftRecord> = [
    ...(showUser ? [{
      title: 'Staff Member',
      dataIndex: ['user', 'name'],
      key: 'user',
      render: (name: string, record: ShiftRecord) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.user?.email}
          </Text>
        </div>
      ),
    }] : []),
    
    {
      title: 'Clock In',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      render: (time: string, record: ShiftRecord) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            {format(new Date(time), 'MMM dd, yyyy')}
          </Text>
          <Text>
            {format(new Date(time), 'hh:mm a')}
          </Text>
          {record.clockInLocation && (
            <Tooltip title={`Lat: ${record.clockInLocation.latitude.toFixed(4)}, Lng: ${record.clockInLocation.longitude.toFixed(4)}`}>
              <Button 
                type="link" 
                size="small" 
                icon={<EnvironmentOutlined />}
                style={{ padding: 0, height: 'auto' }}
              >
                Location
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
    
    {
      title: 'Clock Out',
      dataIndex: 'clockOutTime',
      key: 'clockOutTime',
      render: (time: string | undefined, record: ShiftRecord) => {
        if (!time) {
          return <Text type="secondary">Active</Text>;
        }
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>
              {format(new Date(time), 'MMM dd, yyyy')}
            </Text>
            <Text>
              {format(new Date(time), 'hh:mm a')}
            </Text>
            {record.clockOutLocation && (
              <Tooltip title={`Lat: ${record.clockOutLocation.latitude.toFixed(4)}, Lng: ${record.clockOutLocation.longitude.toFixed(4)}`}>
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EnvironmentOutlined />}
                  style={{ padding: 0, height: 'auto' }}
                >
                  Location
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: string | undefined, record: ShiftRecord) => {
        if (record.status === 'ACTIVE') {
          return (
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              In Progress
            </Tag>
          );
        }
        return duration ? <Text strong>{duration}</Text> : <Text type="secondary">--</Text>;
      },
    },
    
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          ACTIVE: { color: 'processing', text: 'Active' },
          COMPLETED: { color: 'success', text: 'Completed' },
          CANCELLED: { color: 'error', text: 'Cancelled' },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: ShiftRecord) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails?.(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      scroll={{ x: true }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} shifts`,
      }}
    />
  );
}
