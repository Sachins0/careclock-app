'use client';

import { GraphQLClient } from 'graphql-request';

// GraphQL client for frontend
export const graphqlClient = new GraphQLClient('/api/graphql', {
  credentials: 'include', // Include cookies for authentication
});

// Common GraphQL queries
export const GET_ME = `
  query GetMe {
    me {
      id
      email
      name
      role
      organizationId
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
      activeShift {
        id
        clockInTime
        status
      }
    }
  }
`;

export const GET_MY_SHIFTS = `
  query GetMyShifts($limit: Int, $offset: Int) {
    getShiftsForUser(limit: $limit, offset: $offset) {
      id
      clockInTime
      clockOutTime
      clockInNote
      clockOutNote
      status
      duration
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

export const CLOCK_IN = `
  mutation ClockIn($input: ClockInInput!) {
    clockIn(input: $input) {
      success
      message
      withinPerimeter
      shift {
        id
        clockInTime
        status
      }
    }
  }
`;

export const CLOCK_OUT = `
  mutation ClockOut($input: ClockOutInput!) {
    clockOut(input: $input) {
      success
      message
      totalDuration
      shift {
        id
        clockOutTime
        status
        duration
      }
    }
  }
`;

export const GET_DASHBOARD_ANALYTICS = `
  query GetDashboardAnalytics($days: Int) {
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
  }
`;

export const GET_ACTIVE_STAFF = `
  query GetActiveStaff {
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
      }
    }
  }
`;
