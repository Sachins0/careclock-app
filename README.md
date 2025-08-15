# CareClock - Healthcare Shift Management System

📑 [documentation for the codebase](https://docs.google.com/document/d/12whQjLDGKnD1EeLyyfU6a6gBsh0vkbEFZhMbKpG6Adg/edit?usp=sharing)

🔗 [Live Link](https://careclock-app.vercel.app/)

This document provides a comprehensive overview of the CareClock application, its architecture, codebase structure, and implementation status.

## Table of Contents

1.  Project Overview.
2.  Features Implementation Status
3.  Architecture & Technology Stack
4.  Codebase Structure
5.  Database Schema
6.  API Documentation
7.  Authentication & Authorization
8.  Frontend Components
9.  Known Issues & Limitations
10. Setup & Installation
11. Deployment
12. Testing
13. Future Improvements

## Project Overview

CareClock is a specialized, geofenced shift management system built for the unique demands of the healthcare sector. The application addresses the challenge of accurately tracking care worker hours by ensuring they can only clock in and out when physically present at a designated work location. This provides managers with auditable, real-time data, enhances operational oversight, and streamlines payroll processes.

### Core Concept

  * **Geofenced Time Tracking**: Care workers can only clock in/out within a designated geographical perimeter (geofence) set by managers.
  * **Real-time Monitoring**: Managers have access to a live dashboard to monitor staff locations, shift status, and total hours worked.
  * **Comprehensive Analytics**: The system provides a powerful analytics dashboard with key performance indicators, shift trends, staff performance metrics, and reporting capabilities.
  * **Multi-tenant Architecture**: The application is designed to support multiple, distinct healthcare organizations, ensuring data privacy and segregation **_(Implementation going on)_.**
  * **Mobile-first Design**: A responsive interface ensures a seamless experience for care workers and managers on both mobile devices and desktops.

### Screenshots
*Desktop screenshots images showing PWA and dashboard*
![alt text](https://i.ibb.co/mVYfmxcY/Screenshot-2025-08-13-233551.png)![alt text](https://i.ibb.co/chdTF1w2/Screenshot-2025-08-12-111922.png)
![alt text](https://i.ibb.co/MknzBThZ/Screenshot-2025-08-13-233652.png)![alt text](https://i.ibb.co/LzYCw0jx/Screenshot-2025-08-13-233725.png)


*Mobile screenshots images showing PWA and dashboard*

<img src="https://i.ibb.co/9BthYLb/Whats-App-Image-2025-08-13-at-23-41-30-1d2892b6.jpg" alt="drawing" width="200"/> <img src="https://i.ibb.co/yc1NRvxB/Whats-App-Image-2025-08-13-at-23-41-30-c98a1d5f.jpg" alt="drawing" width="200"/>
<img src="https://i.ibb.co/spkGZZBd/Whats-App-Image-2025-08-13-at-23-41-30-d793611d.jpg" alt="drawing" width="200"/>

## Features Implementation Status

This section details the implementation status based on the original project requirements.

### ✅ IMPLEMENTED FEATURES

#### 1\. Manager Features
  * ✅ **Location Perimeter Setting**: Managers can create and manage their organization's primary work location, defining a center point (latitude/longitude) and a custom radius in meters to form the geofence.
  * ✅ **Live Staff Monitoring**: A real-time dashboard displays all currently clocked-in staff, showing their name, clock-in time, and shift duration. The dashboard automatically refreshes every 30 seconds.
  * ✅ **Comprehensive Shift History**: A detailed, filterable, and paginated view of all historical shifts for the organization. This includes clock-in/out times, locations (GPS coordinates), and any notes provided by the worker.
  * ✅ **Analytics Dashboard**: An interactive dashboard featuring key metrics:
      * Average hours per day with trend analysis.
      * Daily clock-in counts via an interactive chart.
      * Weekly hours per staff member presented in a bar chart.
      * CSV export functionality for all shift data.

#### 2\. Care Worker Features
  * ✅ **Geofenced Clock-In**: The system uses the device's GPS to validate the worker's location against the organization's geofence before allowing them to clock in. Clear error messages are shown if the worker is outside the perimeter.
  * ✅ **Clock-Out Functionality**: Workers with an active shift can clock out, automatically calculating the total shift duration. Their location is recorded again for the audit trail.
  * ✅ **Shift Notes**: Workers can add optional notes (up to 500 characters) during both clock-in and clock-out events.

#### 3\. Authentication System 
  * ✅ **Auth0 Integration**: Secure user authentication is handled by Auth0, supporting email/password registration and Google OAuth social login.
  * ✅ **Role-Based Access Control**: Users are assigned either a `MANAGER` or `CARE_WORKER` role, which dictates their permissions and access to features throughout the application.
  * ✅ **Profile & Session Management**: Secure, cookie-based session management and a dedicated page for users to manage their profile information.

#### 4\. UI/UX Design 
  * ✅ **Responsive Design**: Built with Ant Design, the UI is fully responsive and optimized for a mobile-first experience, ensuring usability on phones, tablets, and desktops.
  * ✅ **Modern Interface**: A clean, professional UI with a healthcare-themed color palette (`#1890ff`).
  * ✅ **User Experience**: Comprehensive loading states, clear error handling, and accessibility considerations are implemented across the application.

### ⚠️ PARTIALLY IMPLEMENTED FEATURES

#### 5\. Progressive Web App (PWA)
  * ⚠️ **PWA Implementation Issues**: We attempted to implement PWA features for offline access and app-like installation. A service worker and web app manifest have been created, but they are not functioning correctly. The app is currently installable, but there are issues with offline capabilities.

  #### 6\. Automatic Notifications

  * ⏳ **Push Notifications**: A system for sending push notifications (e.g., for shift reminders or alerts) has not been implemented. This would require a significant addition to the backend and service worker infrastructure.
  * ⏳ **Automatic Geofence Alerts**: Notifications for managers when a worker enters or leaves the geofence were planned but not implemented due to time constraints and the incomplete PWA foundation.


## Architecture & Technology Stack

### Frontend Stack

  * **Framework**: Next.js 14 (App Router)
  * **Language**: TypeScript
  * **UI Library**: Ant Design 5.x
  * **State Management**: React Context + Hooks
  * **Charts**: Chart.js v4 with `react-chartjs-2`
  * **PWA (Attempted)**: `@ducanh2912/next-pwa`

### Backend Stack

  * **API**: GraphQL (via Apollo Server)
  * **ORM**: Prisma
  * **Database**: PostgreSQL (Production) / SQLite (Development)
  * **Authentication**: Auth0

### Deployment

  * **Hosting**: Vercel

### Key Libraries

```json
{
  "dependencies": {
    "@apollo/server": "^4.10.x",
    "@auth0/nextjs-auth0": "^3.5.x",
    "@prisma/client": "^5.12.x",
    "antd": "^5.16.x",
    "next": "14.2.x",
    "react": "18.x",
    "typescript": "^5.x",
    "chart.js": "^4.4.x",
    "date-fns": "^3.x",
    "graphql": "^16.8.x"
  }
}
```

## Codebase Structure

The codebase is organized following Next.js App Router conventions, with a clear separation of concerns for API logic, components, contexts, hooks, and utilities.

```text
careclock/
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Sample data seeding script
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/[...auth0]/   # Auth0 authentication routes
│   │   │   └── graphql/           # GraphQL API endpoint
│   │   ├── dashboard/             # Care Worker dashboard page
│   │   ├── manager/               # Manager-only pages and components
│   │   │   ├── page.tsx           # Manager: Live dashboard
│   │   │   └── reports/           # Manager: Reports and history page
│   │   ├── settings/              # Organization/Location settings page
│   │   ├── layout.tsx             # Root layout with providers
│   │   └── page.tsx               # Landing/Login page
│   │
│   ├── components/                # Reusable React components
│   │   ├── auth/                  # Authentication-related components
│   │   ├── charts/                # Chart components (Line, Bar, KPI)
│   │   ├── forms/                 # Form components (Clock In/Out, Location)
│   │   ├── layout/                # Layout components (Header, Sidebar, etc.)
│   │   └── ui/                    # Common UI elements (Loading, Errors)
│   │
│   ├── context/                   # React Contexts for global state
│   │   └── AuthContext.tsx        # Authentication and user state
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts             # Hook for accessing auth context
│   │   └── useGeolocation.ts      # Hook for geolocation services
│   │
│   └── lib/                       # Core libraries and utilities
│       ├── auth/                  # Auth0 utility functions
│       ├── database/              # Prisma client instance and queries
│       ├── geolocation/           # Geolocation calculation and helpers
│       └── graphql/               # GraphQL schema, resolvers, and context
│
├── public/                        # Static assets
│   ├── icons/                     # PWA icons (created but not functional)
│   └── manifest.json              # PWA manifest (not functional)
│
├── docs/                          # Documentation and screenshots
├── next.config.mjs                # Next.js configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Database Schema

The schema is defined using Prisma and supports the core entities of the application.

### Core Entities

```text
model Organization {
  id          String   @id @default(cuid())
  name        String   @unique
  // Relationships
  location    Location?
  users       User[]
}

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String
  auth0Id        String   @unique
  role           UserRole // MANAGER or CARE_WORKER
  organizationId String
  // Relationships
  organization   Organization @relation(fields: [organizationId], references: [id])
  shifts         Shift[]
}

model Location {
  id               String  @id @default(cuid())
  name             String
  latitude         Float
  longitude        Float
  radiusInMeters   Int
  organizationId   String  @unique
  // Relationships
  organization     Organization @relation(fields: [organizationId], references: [id])
}

model Shift {
  id              String      @id @default(cuid())
  userId          String
  clockInTime     DateTime
  clockOutTime    DateTime?
  clockInLat      Float
  clockInLon      Float
  clockOutLat     Float?
  clockOutLon     Float?
  clockInNote     String?
  clockOutNote    String?
  status          ShiftStatus @default(ACTIVE)
  durationMinutes Int?
  // Relationships
  user            User @relation(fields: [userId], references: [id])
}

enum UserRole {
  MANAGER
  CARE_WORKER
}

enum ShiftStatus {
  ACTIVE
  COMPLETED
}
```

### Key Relationships

  * **Organization to Users**: A one-to-many relationship enables multi-tenancy.
  * **Organization to Location**: A one-to-one relationship links each organization to a single geofenced location.
  * **User to Shifts**: A one-to-many relationship tracks all shifts for a given user.

## API Documentation

A single, robust GraphQL endpoint serves all data-fetching needs for the frontend, protected by role-based authorization.

### GraphQL Schema (Excerpt)

```graphql
type Query {
  # Requires AUTHENTICATED role
  me: User
  myShifts(limit: Int, offset: Int): [Shift!]!
  myOrganizationLocation: Location

  # Requires MANAGER role
  allShiftsForMyOrg(limit: Int, offset: Int): [Shift!]!
  activeStaffForMyOrg: [User!]!
  dashboardAnalytics: DashboardAnalytics
}

type Mutation {
  # Requires CARE_WORKER role
  clockIn(input: ClockInInput!): Shift!
  clockOut(input: ClockOutInput!): Shift!

  # Requires MANAGER role
  createOrUpdateLocation(input: LocationInput!): Location!
}

# ... other types (User, Shift, Location, etc.)
```

### Key API Endpoints

  * **Authentication**: Handled by Auth0 routes under `/api/auth/[...auth0]`.
      * `/api/auth/login`
      * `/api/auth/logout`
      * `/api/auth/callback`
      * `/api/auth/me`
  * **GraphQL**: All data operations are handled via a single endpoint:
      * `POST /api/graphql`

### Geolocation Services

Client-side geolocation logic is encapsulated in a reusable service and hook.

```typescript
// Core geolocation logic in lib/geolocation/index.ts
export function isWithinPerimeter(
  userLat: number,
  userLon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): boolean {
  // Haversine formula for distance calculation
  const distance = calculateDistance(userLat, userLon, centerLat, centerLon);
  return distance <= radiusMeters;
}

// Usage in a component via a custom hook
const { position, error } = useGeolocation();
if (position) {
    const isInside = isWithinPerimeter(...);
}
```

## Authentication & Authorization

Security is paramount. We use Auth0 for authentication and a multi-layered approach for authorization.

  * **Auth0 Configuration**: The system is configured as a Single Page Application in Auth0, using secure, HTTP-only cookies for session management. Roles (`MANAGER`, `CARE_WORKER`) are assigned in the Auth0 dashboard and synced to our database.

  * **Role-Based Access Control (RBAC)**: Authorization is enforced at three levels:

    1.  **Route Protection**: Next.js Middleware protects entire routes/pages, redirecting users without the appropriate role.
    2.  **API Authorization**: GraphQL resolvers check the user's role from the request context before executing sensitive queries or mutations.
    3.  **UI Rendering**: Components check the user's role to conditionally render UI elements (e.g., show "Manager Dashboard" link only to managers).

  * **Data Isolation**: All database queries are automatically filtered by the authenticated user's `organizationId`. This ensures a manager can only see data for their own organization and a care worker can only see their own shifts.

## Frontend Components

The frontend is built with a component-based architecture for reusability and maintainability.

### Core Component Architecture

  * **Layout System**: A main `AppLayout` component handles the overall page structure (header, sidebar, content). It responsively switches between a desktop view with a sidebar and a mobile view with a bottom navigation/drawer.
  * **Page Components**: Each primary route (e.g., `/dashboard`, `/manager`) has a main page component that composes smaller, feature-specific components.
  * **Form Components**: Controlled forms like `ClockForm` and `LocationForm` encapsulate all logic related to user input, validation, and submission state (loading, errors).
  * **State Management**: Global user state is managed via `AuthContext`, making user details and roles available throughout the app. Local/server state is managed with React hooks (`useState`, `useEffect`) and Apollo Client's caching for GraphQL data.

## Known Issues & Limitations

We believe in transparency. The following are known issues and limitations in the current build.

### 🚨 Critical Issues

1.  **PWA Functionality is Not Working**:
      * **Service Worker**: The service worker is configured with `@ducanh2912/next-pwa` but fails to register correctly in the browser.
      * **Offline Capability**: Offline fallback strategies were attempted but are not functional due to the service worker issue.


## Setup & Installation

### Prerequisites

  * Node.js v18.x or later
  * npm, yarn, or pnpm
  * PostgreSQL database instance
  * An Auth0 account

### Environment Variables

Create a `.env.local` file in the root of the project and populate it with the following:

```bash
# Database URL from your PostgreSQL provider
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Auth0 Configuration
AUTH0_SECRET="<generate-a-strong-secret-for-session-encryption>"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://<your-auth0-domain>"
AUTH0_CLIENT_ID="<your-auth0-client-id>"
AUTH0_CLIENT_SECRET="<your-auth0-client-secret>"
```

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd careclock

# 2. Install dependencies
npm install

# 3. Apply database migrations
npx prisma migrate dev

# 4. (Optional) Seed the database with sample data
npx prisma db seed

# 5. Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Deployment

The application is configured for and deployed on **Vercel**.

1.  **Connect Git Repository**: Connect your repository to a new Vercel project.
2.  **Configure Environment Variables**: Add all the variables from `.env.local` to the Vercel project settings. Ensure `AUTH0_BASE_URL` is updated to your production Vercel URL.
3.  **Deploy**: Vercel will automatically build and deploy the application upon pushes to the main branch.

### Production Database Migration

Before the first deployment, or when schema changes are made, run the production migration command against your production database:

```bash
npx prisma migrate deploy
```

## Testing

### Manual Testing Checklist

A full manual test was conducted, covering the following scenarios:

  * **Authentication**: Successful email/password login, Google OAuth login, logout, and role-based redirects.
  * **Care Worker Flow**:
      * Clocking in successfully while inside the geofence.
      * Attempting to clock in while outside the geofence (fails as expected).
      * Clocking out and verifying correct duration calculation.
      * Adding and viewing notes on shifts.
  * **Manager Flow**:
      * Viewing the live staff monitoring table and verifying real-time updates.
      * Accessing the analytics dashboard and checking chart data.
      * Filtering and viewing the complete shift history.
      * Successfully exporting shift data to CSV.
      * Updating the organization's location and geofence radius.
  * **Responsive Design**: Verified on Chrome (Desktop/Mobile), Safari (Desktop/Mobile), and Firefox (Desktop). Layouts, navigation, and forms function correctly across screen sizes.

### Test Data

The `prisma/seed.ts` script creates a default organization, a manager, and a care worker for easy testing.

```sql
-- Sample accounts for testing
-- Passwords managed via Auth0
('manager@careclock.test', 'Test Manager', 'auth0|...', 'MANAGER', 'org_....')
('worker@careclock.test', 'Test Worker', 'auth0|...', 'CARE_WORKER', 'org_....')
```

## Future Improvements

### High Priority

  * **Fix PWA Functionality**: Properly configure the service worker to enable offline capabilities and app installation. This is the most significant missing piece.
  * **Implement Push Notifications**: Build a notification system for key events like shift reminders.
  * **Resolve Code Quality Issues**: Refactor code to remove all TypeScript `any` types and fix all ESLint warnings.
  * **Add Error Monitoring**: Integrate a service like Sentry or LogRocket for production error tracking.

### Medium Priority

  * **Performance Optimization**: Analyze the webpack bundle and implement lazy loading for heavy components like charts and maps to improve initial load time.
  * **Automated Testing**: Introduce a testing framework (e.g., Jest, Playwright) to build a suite of unit, integration, and end-to-end tests.

### Nice to Have

  * **Advanced Reporting**: Add more filters and chart types to the manager's analytics dashboard.
  * **Shift Scheduling**: Implement a feature for managers to schedule shifts for care workers in advance.
