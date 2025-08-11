'use client';

import React, { useState } from 'react';
import { Card, Space, Typography, Button, DatePicker, Select, Row, Col, Statistic } from 'antd';
import { 
  ClockCircleOutlined, 
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ShiftTable } from '@/components/tables/ShiftTable';
import { StatsCard, StatsGrid } from '@/components/ui/StatsCard';
import { Loading } from '@/components/ui/Loading';
import { ErrorMessage } from '@/components/ui/ErrorBoundary';
import { useGraphQLQuery } from '@/hooks/useGraphQL';
import { GET_ME, GET_MY_SHIFTS } from '@/lib/graphql/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const GET_MY_SHIFTS_WITH_STATS = `
  query GetMyShifts($limit: Int, $offset: Int) {
    me {
      id
      name
      organization {
        location {
          latitude
          longitude
          radiusInMeters
          name
        }
      }
      activeShift {
        id
        clockInTime
        status
      }
    }
    getShiftsForUser(limit: $limit, offset: $offset) {
      id
      clockInTime
      clockOutTime
      clockInNote
      clockOutNote
      status
      duration
      durationMinutes
      clockInLocation {
        latitude
        longitude
      }
      clockOutLocation {
        latitude
        longitude
      }
    }
  }
`;

export default function ShiftsPage() {
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [limit, setLimit] = useState(50);

  const { data, loading, error, refetch } = useGraphQLQuery(GET_MY_SHIFTS_WITH_STATS, {
    limit,
    offset: 0,
  });

  if (loading && !data) {
    return (
      <ProtectedRoute>
        <ResponsiveLayout title="My Shifts">
          <Loading message="Loading your shifts..." />
        </ResponsiveLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <ResponsiveLayout title="My Shifts">
          <ErrorMessage 
            message="Failed to load shifts" 
            onRetry={refetch}
          />
        </ResponsiveLayout>
      </ProtectedRoute>
    );
  }

  const shifts = data?.getShiftsForUser || [];
  const user = data?.me;
  const organizationLocation = user?.organization?.location;

  // Calculate statistics
  const completedShifts = shifts.filter((s: any) => s.status === 'COMPLETED');
  const totalHours = completedShifts.reduce((total: number, shift: any) => {
    return total + (shift.durationMinutes || 0);
  }, 0) / 60;

  const thisWeekShifts = shifts.filter((s: any) => {
    const shiftDate = new Date(s.clockInTime);
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return shiftDate >= weekStart && shiftDate <= weekEnd;
  });

  const thisWeekHours = thisWeekShifts.reduce((total: number, shift: any) => {
    return total + (shift.durationMinutes || 0);
  }, 0) / 60;

  const averageShiftLength = completedShifts.length > 0 
    ? (totalHours / completedShifts.length)
    : 0;

  // Filter shifts based on criteria
  const filteredShifts = shifts.filter((shift: any) => {
    if (statusFilter !== 'all' && shift.status !== statusFilter) {
      return false;
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const shiftDate = new Date(shift.clockInTime);
      return shiftDate >= dateRange[0].toDate() && shiftDate <= dateRange[1].toDate();
    }

    return true;
  });

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  const quickDateFilters = [
    { label: 'This Week', value: () => [startOfWeek(new Date()), endOfWeek(new Date())] },
    { label: 'Last Week', value: () => [startOfWeek(subDays(new Date(), 7)), endOfWeek(subDays(new Date(), 7))] },
    { label: 'This Month', value: () => [startOfMonth(new Date()), endOfMonth(new Date())] },
    { label: 'Last 30 Days', value: () => [subDays(new Date(), 30), new Date()] },
  ];

  return (
    <ProtectedRoute>
      <ResponsiveLayout title="My Shifts">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Current Status */}
          {user?.activeShift && (
            <Card>
              <Space>
                <ClockCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <div>
                  <Text strong style={{ fontSize: 16 }}>Currently On Shift</Text>
                  <br />
                  <Text type="secondary">
                    Started at {new Date(user.activeShift.clockInTime).toLocaleString()}
                  </Text>
                </div>
              </Space>
            </Card>
          )}

          {/* Statistics */}
          <StatsGrid>
            <StatsCard
              title="Total Shifts"
              value={shifts.length}
              icon={<ClockCircleOutlined />}
              color="#1890ff"
              loading={loading}
            />
            <StatsCard
              title="Total Hours"
              value={totalHours.toFixed(1)}
              suffix="hrs"
              icon={<CalendarOutlined />}
              color="#52c41a"
              loading={loading}
            />
            <StatsCard
              title="This Week"
              value={thisWeekHours.toFixed(1)}
              suffix="hrs"
              color="#722ed1"
              loading={loading}
            />
            <StatsCard
              title="Avg Shift"
              value={averageShiftLength.toFixed(1)}
              suffix="hrs"
              color="#faad14"
              loading={loading}
            />
          </StatsGrid>

          {/* Filters */}
          <Card title="Filters" size="small">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>Date Range</Text>
                  <RangePicker
                    style={{ width: '100%' }}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                  />
                </Space>
              </Col>
              
              <Col xs={24} sm={12} md={4}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>Status</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  >
                    <Option value="all">All Status</Option>
                    <Option value="COMPLETED">Completed</Option>
                    <Option value="ACTIVE">Active</Option>
                    <Option value="CANCELLED">Cancelled</Option>
                  </Select>
                </Space>
              </Col>

              <Col xs={24} sm={24} md={12}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text strong>Quick Filters</Text>
                  <Space wrap>
                    {quickDateFilters.map((filter, index) => (
                      <Button
                        key={index}
                        size="small"
                        onClick={() => {
                          const range = filter.value();
                          setDateRange([
                            { toDate: () => range[0] },
                            { toDate: () => range[1] }
                          ] as any);
                        }}
                      >
                        {filter.label}
                      </Button>
                    ))}
                    <Button
                      size="small"
                      onClick={() => setDateRange(null)}
                    >
                      Clear
                    </Button>
                  </Space>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Shifts Table */}
          <Card 
            title={`Shift History (${filteredShifts.length} shifts)`}
            extra={
              <Button 
                icon={<ReloadOutlined />} 
                onClick={refetch}
                loading={loading}
              >
                Refresh
              </Button>
            }
          >
            <ShiftTable
              data={filteredShifts}
              loading={loading}
              organizationLocation={organizationLocation}
            />
          </Card>
        </Space>
      </ResponsiveLayout>
    </ProtectedRoute>
  );
}
