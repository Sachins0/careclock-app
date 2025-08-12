'use client';

import React, { useState } from 'react';
import { Table, Tag, Typography, Space, Button, Tooltip, Modal, Card, Row, Col } from 'antd';
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  EyeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { format } from 'date-fns';
import { formatDistance, calculateDistance } from '@/lib/geolocation';

const { Text, Title } = Typography;

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
  showUser?: boolean;
  organizationLocation?: {
    latitude: number;
    longitude: number;
    radiusInMeters: number;
    name: string;
  };
  onViewDetails?: (shift: ShiftRecord) => void;
}

export function ShiftTable({ 
  data, 
  loading, 
  showUser = false, 
  organizationLocation,
  onViewDetails 
}: ShiftTableProps) {
  const [selectedShift, setSelectedShift] = useState<ShiftRecord | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const showShiftDetails = (shift: ShiftRecord) => {
    setSelectedShift(shift);
    setDetailsVisible(true);
    onViewDetails?.(shift);
  };

  const renderLocationInfo = (location: { latitude: number; longitude: number } | undefined, type: 'in' | 'out') => {
    if (!location) {
      return <Text type="secondary">No location</Text>;
    }

    const handleLocationClick = () => {
    // Option 1: Open in Google Maps
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
    
    // Option 2: Show in modal (implement showLocationModal)
    // showLocationModal(location);
  };

    let distanceFromOrg = 0;
    let withinPerimeter = false;

    if (organizationLocation) {
      distanceFromOrg = calculateDistance(
        location.latitude,
        location.longitude,
        organizationLocation.latitude,
        organizationLocation.longitude
      );
      withinPerimeter = distanceFromOrg <= organizationLocation.radiusInMeters;
    }

    return (
      <Space direction="vertical" size={0}>
        <Tooltip title={`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}>
          <Button 
            type="link" 
            size="small" 
            icon={<EnvironmentOutlined />}
            onClick={handleLocationClick}
            style={{ padding: 0, height: 'auto' }}
          >
            View Location
          </Button>
        </Tooltip>
        
        {organizationLocation && (
          <Space size={4}>
            <Text style={{ fontSize: 12 }}>
              {formatDistance(distanceFromOrg)} away
            </Text>
            {type === 'in' && (
              <Tag 
                size="small" 
                color={withinPerimeter ? 'success' : 'error'}
              >
                {withinPerimeter ? 'Valid' : 'Outside'}
              </Tag>
            )}
          </Space>
        )}
      </Space>
    );
  };

  const columns: ColumnsType<ShiftRecord> = [
    ...(showUser ? [{
      title: 'Staff Member',
      dataIndex: ['user', 'name'],
      key: 'user',
      width: 160,
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
      width: 180,
      render: (time: string, record: ShiftRecord) => (
        <Space direction="vertical" size={2}>
          <Text strong>
            {format(new Date(time), 'MMM dd, yyyy')}
          </Text>
          <Text>
            {format(new Date(time), 'hh:mm a')}
          </Text>
          {renderLocationInfo(record.clockInLocation, 'in')}
        </Space>
      ),
    },
    
    {
      title: 'Clock Out',
      dataIndex: 'clockOutTime',
      key: 'clockOutTime',
      width: 180,
      render: (time: string | undefined, record: ShiftRecord) => {
        if (!time) {
          return (
            <Tag color="processing" icon={<ClockCircleOutlined />}>
              Active
            </Tag>
          );
        }
        
        return (
          <Space direction="vertical" size={2}>
            <Text strong>
              {format(new Date(time), 'MMM dd, yyyy')}
            </Text>
            <Text>
              {format(new Date(time), 'hh:mm a')}
            </Text>
            {renderLocationInfo(record.clockOutLocation, 'out')}
          </Space>
        );
      },
    },
    
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration: string | undefined, record: ShiftRecord) => {
        if (record.status === 'ACTIVE') {
          const startTime = new Date(record.clockInTime).getTime();
          const currentTime = Date.now();
          const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
          const hours = Math.floor(elapsedMinutes / 60);
          const minutes = elapsedMinutes % 60;
          
          return (
            <div>
              <Tag color="processing" icon={<ClockCircleOutlined />}>
                Active
              </Tag>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {hours}h {minutes}m
              </Text>
            </div>
          );
        }
        return duration ? <Text strong>{duration}</Text> : <Text type="secondary">--</Text>;
      },
    },
    
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
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
      width: 100,
      render: (_, record: ShiftRecord) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showShiftDetails(record)}
          size="small"
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <>
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
        size="middle"
      />

      {/* Shift Details Modal */}
      <Modal
        title="Shift Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedShift && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Basic Info */}
            <Card size="small" title="Shift Information">
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Clock In:</Text><br />
                  <Text>{format(new Date(selectedShift.clockInTime), 'MMM dd, yyyy hh:mm a')}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Clock Out:</Text><br />
                  <Text>
                    {selectedShift.clockOutTime 
                      ? format(new Date(selectedShift.clockOutTime), 'MMM dd, yyyy hh:mm a')
                      : 'Still active'
                    }
                  </Text>
                </Col>
              </Row>
              
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Text strong>Duration:</Text><br />
                  <Text>{selectedShift.duration || 'In progress'}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Status:</Text><br />
                  <Tag color={
                    selectedShift.status === 'ACTIVE' ? 'processing' :
                    selectedShift.status === 'COMPLETED' ? 'success' : 'error'
                  }>
                    {selectedShift.status}
                  </Tag>
                </Col>
              </Row>
            </Card>

            {/* Location Info */}
            <Card size="small" title="Location Information">
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Clock In Location:</Text><br />
                  {selectedShift.clockInLocation ? (
                    <Space direction="vertical" size={4}>
                      <Text code style={{ fontSize: 12 }}>
                        {selectedShift.clockInLocation.latitude.toFixed(6)}, {selectedShift.clockInLocation.longitude.toFixed(6)}
                      </Text>
                      {organizationLocation && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDistance(calculateDistance(
                            selectedShift.clockInLocation.latitude,
                            selectedShift.clockInLocation.longitude,
                            organizationLocation.latitude,
                            organizationLocation.longitude
                          ))} from work area
                        </Text>
                      )}
                    </Space>
                  ) : (
                    <Text type="secondary">No location recorded</Text>
                  )}
                </Col>
                <Col span={12}>
                  <Text strong>Clock Out Location:</Text><br />
                  {selectedShift.clockOutLocation ? (
                    <Space direction="vertical" size={4}>
                      <Text code style={{ fontSize: 12 }}>
                        {selectedShift.clockOutLocation.latitude.toFixed(6)}, {selectedShift.clockOutLocation.longitude.toFixed(6)}
                      </Text>
                      {organizationLocation && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDistance(calculateDistance(
                            selectedShift.clockOutLocation.latitude,
                            selectedShift.clockOutLocation.longitude,
                            organizationLocation.latitude,
                            organizationLocation.longitude
                          ))} from work area
                        </Text>
                      )}
                    </Space>
                  ) : (
                    <Text type="secondary">No location recorded</Text>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Notes */}
            {(selectedShift.clockInNote || selectedShift.clockOutNote) && (
              <Card size="small" title="Notes">
                {selectedShift.clockInNote && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Clock In Note:</Text><br />
                    <Text>{selectedShift.clockInNote}</Text>
                  </div>
                )}
                {selectedShift.clockOutNote && (
                  <div>
                    <Text strong>Clock Out Note:</Text><br />
                    <Text>{selectedShift.clockOutNote}</Text>
                  </div>
                )}
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </>
  );
}
