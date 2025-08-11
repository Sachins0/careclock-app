'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, Space, Button, Avatar, Tooltip, Modal } from 'antd';
import { 
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { format, formatDistanceToNow } from 'date-fns';
import { formatDistance, calculateDistance } from '@/lib/geolocation';

const { Text, Title } = Typography;

interface ActiveStaffMember {
  id: string;
  name: string;
  email: string;
  shifts: Array<{
    id: string;
    clockInTime: string;
    clockInLocation?: {
      latitude: number;
      longitude: number;
    };
    clockInNote?: string;
    status: string;
  }>;
}

interface LiveStaffTableProps {
  data: ActiveStaffMember[];
  loading?: boolean;
  onRefresh?: () => void;
  organizationLocation?: {
    latitude: number;
    longitude: number;
    name: string;
    radiusInMeters: number;
  };
}

export function LiveStaffTable({ 
  data, 
  loading = false, 
  onRefresh,
  organizationLocation,
}: LiveStaffTableProps) {
  const [selectedStaff, setSelectedStaff] = useState<ActiveStaffMember | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for duration calculations
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const calculateShiftDuration = (clockInTime: string): string => {
    const startTime = new Date(clockInTime);
    const duration = currentTime.getTime() - startTime.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getLocationDistance = (location?: { latitude: number; longitude: number }): string => {
    if (!location || !organizationLocation) return 'Unknown';
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      organizationLocation.latitude,
      organizationLocation.longitude
    );
    
    return formatDistance(distance);
  };

  const showStaffDetails = (staff: ActiveStaffMember) => {
    setSelectedStaff(staff);
    setDetailsVisible(true);
  };

  const columns: ColumnsType<ActiveStaffMember> = [
    {
      title: 'Staff Member',
      key: 'staff',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    
    {
      title: 'Clock In Time',
      key: 'clockInTime',
      width: 160,
      render: (_, record) => {
        const shift = record.shifts[0];
        if (!shift) return <Text type="secondary">No active shift</Text>;
        
        return (
          <Space direction="vertical" size={0}>
            <Text strong>
              {format(new Date(shift.clockInTime), 'HH:mm')}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {format(new Date(shift.clockInTime), 'MMM dd')}
            </Text>
          </Space>
        );
      },
    },
    
    {
      title: 'Duration',
      key: 'duration',
      width: 120,
      render: (_, record) => {
        const shift = record.shifts[0];
        if (!shift) return <Text type="secondary">--</Text>;
        
        return (
          <Space direction="vertical" size={0}>
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              Active
            </Tag>
            <Text style={{ fontSize: 12 }}>
              {calculateShiftDuration(shift.clockInTime)}
            </Text>
          </Space>
        );
      },
    },
    
    {
      title: 'Location',
      key: 'location',
      width: 140,
      render: (_, record) => {
        const shift = record.shifts[0];
        const location = shift?.clockInLocation;
        
        return (
          <Space direction="vertical" size={0}>
            <Tooltip title={
              location 
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : 'No location recorded'
            }>
              <Button 
                type="link" 
                size="small" 
                icon={<EnvironmentOutlined />}
                style={{ padding: 0, height: 'auto' }}
              >
                View Location
              </Button>
            </Tooltip>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {getLocationDistance(location)} away
            </Text>
          </Space>
        );
      },
    },
    
    {
      title: 'Time Since Check-in',
      key: 'timeSince',
      width: 140,
      render: (_, record) => {
        const shift = record.shifts[0];
        if (!shift) return <Text type="secondary">--</Text>;
        
        return (
          <Text style={{ fontSize: 12 }}>
            {formatDistanceToNow(new Date(shift.clockInTime), { addSuffix: true })}
          </Text>
        );
      },
    },
    
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showStaffDetails(record)}
          size="small"
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Currently Active Staff ({data.length})
          </Title>
          <Tag color="processing">Live</Tag>
        </Space>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={onRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        scroll={{ x: true }}
        pagination={false}
        size="middle"
        locale={{
          emptyText: 'No staff currently clocked in',
        }}
      />

      {/* Staff Details Modal */}
      <Modal
        title="Staff Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedStaff && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Staff Info */}
            <div>
              <Space>
                <Avatar size={48} icon={<UserOutlined />} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedStaff.name}
                  </Title>
                  <Text type="secondary">{selectedStaff.email}</Text>
                </div>
              </Space>
            </div>

            {/* Current Shift Details */}
            {selectedStaff.shifts[0] && (
              <div>
                <Title level={5}>Current Shift</Title>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Clock In Time:</Text><br />
                    <Text>{format(new Date(selectedStaff.shifts[0].clockInTime), 'PPpp')}</Text>
                  </div>
                  
                  <div>
                    <Text strong>Duration:</Text><br />
                    <Text>{calculateShiftDuration(selectedStaff.shifts[0].clockInTime)}</Text>
                  </div>

                  {selectedStaff.shifts[0].clockInLocation && (
                    <div>
                      <Text strong>Clock In Location:</Text><br />
                      <Text code style={{ fontSize: 12 }}>
                        {selectedStaff.shifts[0].clockInLocation.latitude.toFixed(6)}, {selectedStaff.shifts[0].clockInLocation.longitude.toFixed(6)}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {getLocationDistance(selectedStaff.shifts[0].clockInLocation)} from work area
                      </Text>
                    </div>
                  )}

                  {selectedStaff.shifts[0].clockInNote && (
                    <div>
                      <Text strong>Clock In Note:</Text><br />
                      <Text>{selectedStaff.shifts[0].clockInNote}</Text>
                    </div>
                  )}
                </Space>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </>
  );
}
