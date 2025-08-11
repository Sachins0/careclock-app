import { User, Organization, Location, Shift, UserRole, ShiftStatus } from '@prisma/client';

// Extended types with relations
export type UserWithOrganization = User & {
  organization: Organization & {
    location: Location | null;
  };
};

export type ShiftWithUser = Shift & {
  user: {
    name: string;
    email: string;
  };
};

export type ActiveStaffMember = User & {
  shifts: Shift[];
};

// Input types for forms
export interface ClockInInput {
  note?: string;
  latitude: number;
  longitude: number;
}

export interface ClockOutInput {
  note?: string;
  latitude: number;
  longitude: number;
}

export interface LocationPerimeterInput {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusInMeters: number;
}

// Analytics types
export interface DashboardAnalytics {
  dailyClockIns: { date: string; count: number }[];
  weeklyHoursByStaff: { staffName: string; totalHours: number }[];
  averageHoursPerShiftToday: number;
  totalActiveStaff: number;
  totalCompletedShiftsToday: number;
}

// Re-export Prisma types for convenience
export { User, Organization, Location, Shift, UserRole, ShiftStatus };
