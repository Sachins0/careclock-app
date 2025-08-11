import { GraphQLContext } from '../context';
import { calculateDistance } from '@/lib/database/queries';

export const fieldResolvers = {
  User: {
    activeShift: async (parent: any, _: any, context: GraphQLContext) => {
      return await context.prisma.shift.findFirst({
        where: {
          userId: parent.id,
          status: 'ACTIVE',
        },
      });
    },

    shifts: async (
      parent: any,
      { limit = 50, offset = 0 }: { limit: number; offset: number },
      context: GraphQLContext
    ) => {
      return await context.prisma.shift.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    },

    organization: async (parent: any, _: any, context: GraphQLContext) => {
      return await context.prisma.organization.findUnique({
        where: { id: parent.organizationId },
      });
    },
  },

  Organization: {
    location: async (parent: any, _: any, context: GraphQLContext) => {
      if (!parent.locationId) return null;
      
      return await context.prisma.location.findUnique({
        where: { id: parent.locationId },
      });
    },

    users: async (parent: any, _: any, context: GraphQLContext) => {
      return await context.prisma.user.findMany({
        where: { organizationId: parent.id },
      });
    },
  },

  Shift: {
    user: async (parent: any, _: any, context: GraphQLContext) => {
      return await context.prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },

    clockInLocation: (parent: any) => {
      if (!parent.clockInLat || !parent.clockInLon) return null;
      return {
        latitude: parent.clockInLat,
        longitude: parent.clockInLon,
      };
    },

    clockOutLocation: (parent: any) => {
      if (!parent.clockOutLat || !parent.clockOutLon) return null;
      return {
        latitude: parent.clockOutLat,
        longitude: parent.clockOutLon,
      };
    },

    duration: (parent: any) => {
      if (!parent.durationMinutes) return null;
      
      const hours = Math.floor(parent.durationMinutes / 60);
      const minutes = parent.durationMinutes % 60;
      return `${hours}h ${minutes}m`;
    },
  },
};
