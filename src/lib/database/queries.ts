import { prisma } from './client';
import { UserRole, ShiftStatus } from '@prisma/client';

// User-related queries
export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      organization: {
        include: {
          location: true,
        },
      },
    },
  });
};

export const getUserByAuth0Id = async (auth0Id: string) => {
  return prisma.user.findUnique({
    where: { auth0Id },
    include: {
      organization: {
        include: {
          location: true,
        },
      },
    },
  });
};

// Shift-related queries
export const getActiveShiftForUser = async (userId: string) => {
  return prisma.shift.findFirst({
    where: {
      userId,
      status: ShiftStatus.ACTIVE,
    },
  });
};

export const getShiftsForUser = async (userId: string, limit = 50) => {
  return prisma.shift.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

// Manager-only queries
export const getActiveStaffForOrganization = async (organizationId: string) => {
  return prisma.user.findMany({
    where: {
      organizationId,
      shifts: {
        some: {
          status: ShiftStatus.ACTIVE,
        },
      },
    },
    include: {
      shifts: {
        where: {
          status: ShiftStatus.ACTIVE,
        },
        take: 1,
      },
    },
  });
};

// Location-related queries
export const getLocationForOrganization = async (organizationId: string) => {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { location: true },
  });
  return org?.location;
};

// Utility functions
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const isWithinPerimeter = (
  userLat: number,
  userLon: number,
  locationLat: number,
  locationLon: number,
  radiusInMeters: number
): boolean => {
  const distance = calculateDistance(userLat, userLon, locationLat, locationLon);
  return distance <= radiusInMeters;
};
