// Export main client
export { prisma } from './client';

// Export query functions
export * from './queries';

// Use 'export type' for type-only exports
export type {
  User,
  Organization, 
  Location,
  Shift,
  UserRole,
  ShiftStatus,
  UserWithOrganization,
  ShiftWithUser,
  ActiveStaffMember,
  ClockInInput,
  ClockOutInput,
  LocationPerimeterInput,
  DashboardAnalytics,
} from '../../types/database';

// Export test function (remove in production)
export { testDatabaseConnection } from './test-connection';
