'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Button, DatePicker, Select, Alert, Modal, message } from 'antd';
import { 
  TeamOutlined,
  BarChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ManagerOnlyRoute } from '@/components/auth/ProtectedRoute';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { KPICard, KPIGrid } from '@/components/charts/KPICard';
import { LiveStaffTable } from '@/components/manager/LiveStaffTable';
import { Loading } from '@/components/ui/Loading';
import { ErrorMessage } from '@/components/ui/ErrorBoundary';
import { useGraphQLQuery } from '@/hooks/useGraphQL';
import { 
  processDailyClockIns,
  processWeeklyHoursByStaff,
  processShiftDurations,
  processHourlyDistribution,
  calculateKPIMetrics,
  formatLineChartData,
  formatBarChartData,
} from '@/lib/charts/utils';
import { chartTheme } from '@/lib/charts/config';
import { format, subDays } from 'date-fns';
import { set } from 'lodash';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// GraphQL query for manager dashboard data
const GET_MANAGER_DASHBOARD_DATA = `
  query GetManagerDashboardData($days: Int) {
    me {
      id
      name
      organization {
        id
        name
        location {
          id
          name
          latitude
          longitude
          radiusInMeters
        }
      }
    }
    
    getDashboardAnalytics(days: $days) {
      dailyClockIns {
        date
        count
      }
      weeklyHoursByStaff {
        userId
        staffName
        totalHours
      }
      averageHoursPerShiftToday
      totalActiveStaff
      totalCompletedShiftsToday
    }
    
    getActiveStaff {
      id
      name
      email
      shifts {
        id
        clockInTime
        clockInLocation {
          latitude
          longitude
        }
        clockInNote
        status
      }
    }
    
    getAllShifts(limit: 100) {
      edges {
        node {
          id
          clockInTime
          clockOutTime
          status
          durationMinutes
          user {
            id
            name
            email
          }
          clockInLocation {
            latitude
            longitude
          }
        }
      }
      totalCount
    }
  }
`;

export default function ManagerDashboardPage() {
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [days, setDays] = useState(7);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const { data, loading, error, refetch } = useGraphQLQuery(
    GET_MANAGER_DASHBOARD_DATA, 
    { days }
  );

  // Auto-refresh every 30 seconds
 useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 30000);

  // Store interval ID directly without state
  return () => clearInterval(interval);
}, []); // Empty dependency array prevents infinite loop

  if (loading && !data) {
    return (
      <ManagerOnlyRoute>
        <ResponsiveLayout title="Manager Dashboard">
          <Loading message="Loading dashboard data..." />
        </ResponsiveLayout>
      </ManagerOnlyRoute>
    );
  }

  if (error) {
    return (
      <ManagerOnlyRoute>
        <ResponsiveLayout title="Manager Dashboard">
          <ErrorMessage 
            message="Failed to load dashboard data" 
            onRetry={refetch}
          />
        </ResponsiveLayout>
      </ManagerOnlyRoute>
    );
  }

  const organization = data?.me?.organization;
  const analytics = data?.getDashboardAnalytics;
  const activeStaff = data?.getActiveStaff || [];
  const allShifts = data?.getAllShifts?.edges?.map((edge: any) => edge.node) || [];

  // Process chart data
  const dailyClockInsData = formatLineChartData(
    analytics?.dailyClockIns?.map((item: any) => ({
      x: item.date,
      y: item.count,
      label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })) || [],
    'Daily Clock-Ins',
    chartTheme.colors.primary
  );


  const weeklyHoursData = formatBarChartData(
    analytics?.weeklyHoursByStaff?.map((item: any) => ({
      x: item.staffName,
      y: item.totalHours,
      label: item.staffName,
    })) || [],
    'Hours This Week',
    [chartTheme.colors.success]
  );

  const shiftDurationsData = formatBarChartData(
    processShiftDurations(allShifts),
    'Shift Duration Distribution',
    [chartTheme.colors.warning]
  );

  const hourlyDistributionData = formatBarChartData(
    processHourlyDistribution(allShifts),
    'Clock-In Times',
    [chartTheme.colors.info]
  );

  // Calculate KPIs
  const kpiMetrics = calculateKPIMetrics(allShifts, activeStaff);



  const handleRefresh = async () => {
  try {
    await refetch();
  } catch (error) {
    console.error('Refresh failed:', error);
    // Show user-friendly error
    Modal.error({
      title: 'Refresh Failed',
      content: 'Unable to refresh dashboard data. Please check your connection and try again.',
    });
  }
};

  return (
    <ManagerOnlyRoute>
      <ResponsiveLayout title="Manager Dashboard">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Welcome Section */}
          <Card>
            <Row align="middle">
              <Col flex="auto">
                <Title level={2} style={{ margin: 0 }}>
                  {organization?.name} Dashboard
                </Title>
                <Text type="secondary">
                  Real-time workforce monitoring and analytics
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleRefresh}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Filters */}
          <Card size="small">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8} md={6}>
                <Space direction="vertical" size={4}>
                  <Text strong>Time Period</Text>
                  <Select
                    style={{ width: '100%' }}
                    value={days}
                    onChange={setDays}
                  >
                    <Option value={7}>Last 7 days</Option>
                    <Option value={14}>Last 14 days</Option>
                    <Option value={30}>Last 30 days</Option>
                  </Select>
                </Space>
              </Col>

              <Col xs={24} sm={16} md={10}>
                <Space direction="vertical" size={4}>
                  <Text strong>Custom Date Range</Text>
                  <RangePicker
                    style={{ width: '100%' }}
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </Space>
              </Col>

              <Col xs={24} md={8}>
                <Alert
                  message="Live Data"
                  description="Dashboard refreshes every 30 seconds"
                  type="info"
                  showIcon
                  style={{ marginTop: dateRange ? 0 : 24 }}
                />
              </Col>
            </Row>
          </Card>

          {/* KPI Cards */}
          <KPIGrid>
            <KPICard
              title="Active Staff"
              value={kpiMetrics.totalActiveStaff}
              icon={<TeamOutlined />}
              color={chartTheme.colors.primary}
              trend={{
                value: 5,
                isPositive: true,
                period: 'yesterday',
              }}
              target={{
                value: 20,
                label: 'target',
              }}
              loading={loading}
            />

            <KPICard
              title="Avg Hours Today"
              value={kpiMetrics.avgShiftDurationToday}
              suffix="h"
              icon={<BarChartOutlined />}
              color={chartTheme.colors.success}
              trend={{
                value: 2.5,
                isPositive: true,
                period: 'yesterday',
              }}
              loading={loading}
            />

            <KPICard
              title="Total Shifts Today"
              value={kpiMetrics.totalShiftsToday}
              color={chartTheme.colors.warning}
              trend={{
                value: -1.2,
                isPositive: false,
                period: 'yesterday',
              }}
              loading={loading}
            />

            <KPICard
              title="Utilization Rate"
              value={kpiMetrics.utilizationRate}
              suffix="%"
              color={chartTheme.colors.purple}
              trend={{
                value: 3.8,
                isPositive: true,
                period: 'last week',
              }}
              target={{
                value: 85,
                label: 'target',
              }}
              loading={loading}
            />
          </KPIGrid>

          {/* Live Staff Monitoring */}
          <Card>
            <LiveStaffTable
              data={activeStaff}
              loading={loading}
              onRefresh={handleRefresh}
              organizationLocation={organization?.location}
            />
          </Card>

          {/* Charts Section */}
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <LineChart
                title="Daily Clock-Ins"
                data={dailyClockInsData}
                loading={loading}
                description="Number of staff clocking in each day"
                showInfo
              />
            </Col>
            
            <Col xs={24} lg={12}>
              <BarChart
                title="Weekly Hours by Staff"
                data={weeklyHoursData}
                loading={loading}
                description="Total hours worked by each staff member this week"
                horizontal
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <BarChart
                title="Shift Duration Distribution"
                data={shiftDurationsData}
                loading={loading}
                description="Distribution of completed shift lengths"
              />
            </Col>
            
            <Col xs={24} lg={12}>
              <BarChart
                title="Clock-In Time Distribution"
                data={hourlyDistributionData}
                loading={loading}
                description="What time of day staff typically clock in"
              />
            </Col>
          </Row>
        </Space>
      </ResponsiveLayout>
    </ManagerOnlyRoute>
  );
}
