import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Scalars
  scalar DateTime
  scalar EmailAddress

  # Enums
  enum UserRole {
    CARE_WORKER
    MANAGER
  }

  enum ShiftStatus {
    ACTIVE
    COMPLETED
    CANCELLED
  }

  # Core Types
  type User {
    id: ID!
    email: EmailAddress!
    name: String!
    role: UserRole!
    organizationId: ID!
    organization: Organization!
    shifts(limit: Int = 50, offset: Int = 0): [Shift!]!
    activeShift: Shift
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Organization {
    id: ID!
    name: String!
    location: Location
    users: [User!]!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Location {
    id: ID!
    name: String!
    address: String
    latitude: Float!
    longitude: Float!
    radiusInMeters: Int!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Shift {
    id: ID!
    user: User!
    clockInTime: DateTime
    clockOutTime: DateTime
    clockInLocation: GeoPoint
    clockOutLocation: GeoPoint
    clockInNote: String
    clockOutNote: String
    status: ShiftStatus!
    durationMinutes: Int
    duration: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type GeoPoint {
    latitude: Float!
    longitude: Float!
  }

  # Analytics Types
  type DashboardAnalytics {
    dailyClockIns: [DailyMetric!]!
    weeklyHoursByStaff: [StaffHours!]!
    averageHoursPerShiftToday: Float!
    totalActiveStaff: Int!
    totalCompletedShiftsToday: Int!
    organizationId: ID!
  }

  type DailyMetric {
    date: String!
    count: Int!
  }

  type StaffHours {
    userId: ID!
    staffName: String!
    totalHours: Float!
  }

  # Payload Types
  type ClockInPayload {
    shift: Shift
    success: Boolean!
    message: String!
    withinPerimeter: Boolean!
  }

  type ClockOutPayload {
    shift: Shift
    success: Boolean!
    message: String!
    totalDuration: String
  }

  # Input Types
  input ClockInInput {
    note: String
    latitude: Float!
    longitude: Float!
  }

  input ClockOutInput {
    note: String
    latitude: Float!
    longitude: Float!
  }

  input LocationPerimeterInput {
    name: String!
    address: String
    latitude: Float!
    longitude: Float!
    radiusInMeters: Int!
  }

  input UpdateProfileInput {
    name: String
  }

  # Pagination
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type ShiftConnection {
    edges: [ShiftEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ShiftEdge {
    node: Shift!
    cursor: String!
  }

  # Root Types
  type Query {
    # User queries
    me: User!
    
    # Shift queries
    getShiftsForUser(userId: ID, limit: Int = 50, offset: Int = 0): [Shift!]!
    getActiveShifts: [Shift!]! @auth(requires: MANAGER)
    
    # Manager-only queries
    getActiveStaff: [User!]! @auth(requires: MANAGER)
    getDashboardAnalytics(days: Int = 7): DashboardAnalytics! @auth(requires: MANAGER)
    getAllShifts(
      startDate: DateTime
      endDate: DateTime
      limit: Int = 100
      offset: Int = 0
    ): ShiftConnection! @auth(requires: MANAGER)
    
    # Organization queries
    getOrganizationLocation: Location @auth(requires: MANAGER)
  }

  type Mutation {
    # Clock operations
    clockIn(input: ClockInInput!): ClockInPayload!
    clockOut(input: ClockOutInput!): ClockOutPayload!
    
    # Manager operations
    updateLocationPerimeter(input: LocationPerimeterInput!): Location! @auth(requires: MANAGER)
    
    # Profile operations
    updateProfile(input: UpdateProfileInput!): User!
  }

  # Directives
  directive @auth(requires: UserRole) on FIELD_DEFINITION
`;
