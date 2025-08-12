'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Button, 
  DatePicker, 
  Select,
  Table,
  Tag,
  Modal,
  Form,
  Input,
} from 'antd';
import { 
  FileTextOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ManagerOnlyRoute } from '@/components/auth/ProtectedRoute';
import { ShiftTable } from '@/components/tables/ShiftTable';
import { Loading } from '@/components/ui/Loading';
import { useGraphQLQuery } from '@/hooks/useGraphQL';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const GET_DETAILED_SHIFTS = `
  query GetDetailedShifts($startDate: DateTime, $endDate: DateTime, $limit: Int, $offset: Int) {
    me {
      organization {
        id
        name
        location {
          latitude
          longitude
          radiusInMeters
          name
        }
      }
    }
    
    getAllShifts(
      startDate: $startDate
      endDate: $endDate
      limit: $limit
      offset: $offset
    ) {
      edges {
        node {
          id
          clockInTime
          clockOutTime
          status
          duration
          durationMinutes
          clockInNote
          clockOutNote
          clockInLocation {
            latitude
            longitude
          }
          clockOutLocation {
            latitude
            longitude
          }
          user {
            id
            name
            email
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export interface ReportFilters {
  dateRange: [any, any] | null;
  status: string;
  user: string;
  minDuration: number | null;
  maxDuration: number | null;
}

export default function ShiftReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: null,
    status: 'all',
    user: 'all',
    minDuration: null,
    maxDuration: null,
  });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
  });

  const [exportModalVisible, setExportModalVisible] = useState(false);

  // Calculate query variables
  const variables = {
    startDate: filters.dateRange?.[0]?.toISOString(),
    endDate: filters.dateRange?.[1]?.toISOString(),
    limit: pagination.pageSize,
    offset: (pagination.current - 1) * pagination.pageSize,
  };

  const { data, loading, error } = useGraphQLQuery(GET_DETAILED_SHIFTS, variables);

  const organization = data?.me?.organization;
  const shiftsData = data?.getAllShifts;
  const shifts = shiftsData?.edges?.map((edge: any) => edge.node) || [];
  const totalCount = shiftsData?.totalCount || 0;

  // Filter shifts based on client-side filters
  const filteredShifts = shifts.filter((shift: any) => {
    if (filters.status !== 'all' && shift.status !== filters.status) {
      return false;
    }

    if (filters.user !== 'all' && shift.user.id !== filters.user) {
      return false;
    }

    if (filters.minDuration && shift.durationMinutes < filters.minDuration * 60) {
      return false;
    }

    if (filters.maxDuration && shift.durationMinutes > filters.maxDuration * 60) {
      return false;
    }

    return true;
  });

  // Get unique users for filter dropdown
  const users = Array.from(new Set(shifts.map((shift: any) => shift.user.id)))
    .map(userId => shifts.find((shift: any) => shift.user.id === userId)?.user)
    .filter(Boolean);

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
  };

  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    handleFilterChange('dateRange', dates);
  };

  const handleExport = () => {
    setExportModalVisible(true);
  };


  const generateCSV = () => {
    const headers = [
      'Staff Name',
      'Email',
      'Clock In Time',
      'Clock Out Time',
      'Duration',
      'Status',
      'Clock In Note',
      'Clock Out Note',
      'Clock In Location',
      'Clock Out Location',
    ];

    const csvData = filteredShifts.map((shift: any) => [
      shift.user.name,
      shift.user.email,
      shift.clockInTime ? format(new Date(shift.clockInTime), 'yyyy-MM-dd HH:mm:ss') : '',
      shift.clockOutTime ? format(new Date(shift.clockOutTime), 'yyyy-MM-dd HH:mm:ss') : '',
      shift.duration || '',
      shift.status,
      shift.clockInNote || '',
      shift.clockOutNote || '',
      shift.clockInLocation 
        ? `${shift.clockInLocation.latitude.toFixed(6)}, ${shift.clockInLocation.longitude.toFixed(6)}`
        : '',
      shift.clockOutLocation 
        ? `${shift.clockOutLocation.latitude.toFixed(6)}, ${shift.clockOutLocation.longitude.toFixed(6)}`
        : '',
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shift-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const quickDateFilters = [
    {
      label: 'Today',
      range: [dayjs().startOf('day'), dayjs().endOf('day')] as [dayjs.Dayjs, dayjs.Dayjs],
    },
    {
      label: 'Yesterday', 
      range: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] as [dayjs.Dayjs, dayjs.Dayjs],
    },
    {
      label: 'This Week',
      range: [dayjs().startOf('week'), dayjs().endOf('week')] as [dayjs.Dayjs, dayjs.Dayjs],
    },
    {
      label: 'This Month',
      range: [dayjs().startOf('month'), dayjs().endOf('month')] as [dayjs.Dayjs, dayjs.Dayjs],
    },
  ];

  if (loading && !data) {
    return (
      <ManagerOnlyRoute>
        <ResponsiveLayout title="Shift Reports">
          <Loading message="Loading shift reports..." />
        </ResponsiveLayout>
      </ManagerOnlyRoute>
    );
  }

  return (
    <ManagerOnlyRoute>
      <ResponsiveLayout title="Shift Reports">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Page Header */}
          <Card>
            <Row align="middle">
              <Col flex="auto">
                <Space>
                  <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  <div>
                    <Title level={2} style={{ margin: 0 }}>
                      Shift Reports & Analytics
                    </Title>
                    <Text type="secondary">
                      Comprehensive shift data analysis and reporting
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                >
                  Export Report
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Filters */}
          <Card title="Report Filters" size="small">
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>Date Range</Text>
                  <RangePicker
                    style={{ width: '100%' }}
                    value={filters.dateRange}
                    onChange={(range) => handleFilterChange('dateRange', range)}
                  />
                  <Space wrap>
                    {quickDateFilters.map((filter, index) => (
                      <Button
                        key={index}
                        size="small"
                        onClick={() => handleFilterChange('dateRange', filter.range)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </Space>
                </Space>
              </Col>

              <Col xs={24} sm={6} md={4}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>Status</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={filters.status}
                    onChange={(value) => handleFilterChange('status', value)}
                  >
                    <Option value="all">All Status</Option>
                    <Option value="COMPLETED">Completed</Option>
                    <Option value="ACTIVE">Active</Option>
                    <Option value="CANCELLED">Cancelled</Option>
                  </Select>
                </Space>
              </Col>

              <Col xs={24} sm={6} md={4}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>Staff Member</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={filters.user}
                    onChange={(value) => handleFilterChange('user', value)}
                    showSearch
                    placeholder="Select staff"
                  >
                    <Option value="all">All Staff</Option>
                    {users.map((user: any) => (
                      <Option key={user.id} value={user.id}>
                        {user.name}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>Duration Filter (hours)</Text>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.minDuration || ''}
                        onChange={(e) => handleFilterChange('minDuration', e.target.value ? Number(e.target.value) : null)}
                      />
                    </Col>
                    <Col span={12}>
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.maxDuration || ''}
                        onChange={(e) => handleFilterChange('maxDuration', e.target.value ? Number(e.target.value) : null)}
                      />
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Summary Stats */}
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Card>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Total Shifts</Text>
                  <Text strong style={{ fontSize: 24 }}>
                    {filteredShifts.length}
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Total Hours</Text>
                  <Text strong style={{ fontSize: 24 }}>
                    {Math.round(filteredShifts.reduce((sum, shift) => 
                      sum + (shift.durationMinutes || 0), 0) / 60 * 10) / 10}h
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Active Shifts</Text>
                  <Text strong style={{ fontSize: 24, color: '#52c41a' }}>
                    {filteredShifts.filter(s => s.status === 'ACTIVE').length}
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Avg Duration</Text>
                  <Text strong style={{ fontSize: 24 }}>
                    {filteredShifts.length > 0 
                      ? Math.round(filteredShifts.reduce((sum, shift) => 
                          sum + (shift.durationMinutes || 0), 0) / filteredShifts.length / 60 * 10) / 10 + 'h'
                      : '0h'
                    }
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Shifts Table */}
          <Card title={`Shift Details (${filteredShifts.length} shifts)`}>
            <ShiftTable
              data={filteredShifts}
              loading={loading}
              showUser={true}
              organizationLocation={organization?.location}
            />
          </Card>

          {/* Export Modal */}
          <Modal
            title="Export Shift Report"
            open={exportModalVisible}
            onCancel={() => setExportModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setExportModalVisible(false)}>
                Cancel
              </Button>,
              <Button
                key="export"
                type="primary"
                onClick={() => {
                  generateCSV();
                  setExportModalVisible(false);
                }}
              >
                Download CSV
              </Button>,
            ]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>
                Export <Text strong>{filteredShifts.length} shifts</Text> to CSV format.
              </Text>
              
              <Text type="secondary">
                The export will include all visible data with applied filters:
              </Text>
              
              <ul>
                <li>Staff information (name, email)</li>
                <li>Clock in/out times and locations</li>
                <li>Shift duration and status</li>
                <li>Notes and additional details</li>
              </ul>
            </Space>
          </Modal>
        </Space>
      </ResponsiveLayout>
    </ManagerOnlyRoute>
  );
}
