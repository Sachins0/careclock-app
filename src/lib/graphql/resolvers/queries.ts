import { GraphQLContext } from '../context';
import { requireAuth, requireManager, requireOwnership } from '../auth';
import { calculateDistance, isWithinPerimeter } from '@/lib/database/queries';
import { UserRole } from '@prisma/client';
import { startOfDay, subDays, format } from 'date-fns';

export const queries = {
  // Get current user
  me: async (_: any, __: any, context: GraphQLContext) => {
    const user = requireAuth(context);
    
    return await context.prisma.user.findUniqueOrThrow({
      where: { id: user.dbUser!.id },
      include: { organization: true },
    });
  },

  // Get shifts for a user
  getShiftsForUser: async (
    _: any,
    { userId, limit = 50, offset = 0 }: { userId?: string; limit: number; offset: number },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);
    const targetUserId = userId || user.dbUser!.id;
    
    // Check permissions
    requireOwnership(context, targetUserId);

    return await context.prisma.shift.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { user: true },
    });
  },

  // Get all active shifts (Manager only)
  getActiveShifts: async (_: any, __: any, context: GraphQLContext) => {
    requireManager(context);
    const user = requireAuth(context);

    return await context.prisma.shift.findMany({
      where: {
        status: 'ACTIVE',
        user: {
          organizationId: user.dbUser!.organizationId,
        },
      },
      include: { user: true },
      orderBy: { clockInTime: 'desc' },
    });
  },

  // Get active staff (Manager only)
  getActiveStaff: async (_: any, __: any, context: GraphQLContext) => {
    requireManager(context);
    const user = requireAuth(context);

    return await context.prisma.user.findMany({
      where: {
        organizationId: user.dbUser!.organizationId,
        shifts: {
          some: {
            status: 'ACTIVE',
          },
        },
      },
      include: { 
        shifts: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });
  },

  // Get dashboard analytics (Manager only)
  getDashboardAnalytics: async (
    _: any,
    { days = 7 }: { days: number },
    context: GraphQLContext
  ) => {
    requireManager(context);
    const user = requireAuth(context);
    const organizationId = user.dbUser!.organizationId;

    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Daily clock-ins
    const dailyClockIns = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = await context.prisma.shift.count({
        where: {
          user: { organizationId },
          clockInTime: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      dailyClockIns.unshift({
        date: format(date, 'yyyy-MM-dd'),
        count,
      });
    }

    // Weekly hours by staff
    const weeklyHoursByStaff = await context.prisma.user.findMany({
      where: { organizationId },
      include: {
        shifts: {
          where: {
            status: 'COMPLETED',
            clockInTime: { gte: startDate },
            durationMinutes: { not: null },
          },
        },
      },
    });

    const staffHours = weeklyHoursByStaff.map(user => ({
      userId: user.id,
      staffName: user.name,
      totalHours: user.shifts.reduce((total, shift) => {
        return total + (shift.durationMinutes || 0) / 60;
      }, 0),
    }));

    // Average hours per shift today
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayShifts = await context.prisma.shift.findMany({
      where: {
        user: { organizationId },
        status: 'COMPLETED',
        clockInTime: { gte: today, lt: tomorrow },
        durationMinutes: { not: null },
      },
    });

    const averageHoursPerShiftToday = todayShifts.length > 0 
      ? todayShifts.reduce((sum, shift) => sum + (shift.durationMinutes || 0), 0) / todayShifts.length / 60
      : 0;

    // Total active staff
    const totalActiveStaff = await context.prisma.user.count({
      where: {
        organizationId,
        shifts: { some: { status: 'ACTIVE' } },
      },
    });

    // Total completed shifts today
    const totalCompletedShiftsToday = todayShifts.length;

    return {
      dailyClockIns,
      weeklyHoursByStaff: staffHours,
      averageHoursPerShiftToday,
      totalActiveStaff,
      totalCompletedShiftsToday,
      organizationId,
    };
  },

  // Get all shifts with pagination (Manager only)
  getAllShifts: async (
    _: any,
    { startDate, endDate, limit = 100, offset = 0 }: {
      startDate?: Date;
      endDate?: Date;
      limit: number;
      offset: number;
    },
    context: GraphQLContext
  ) => {
    requireManager(context);
    const user = requireAuth(context);

    const where: any = {
      user: { organizationId: user.dbUser!.organizationId },
    };

    if (startDate || endDate) {
      where.clockInTime = {};
      if (startDate) where.clockInTime.gte = startDate;
      if (endDate) where.clockInTime.lte = endDate;
    }

    const [shifts, totalCount] = await Promise.all([
      context.prisma.shift.findMany({
        where,
        orderBy: { clockInTime: 'desc' },
        take: limit,
        skip: offset,
        include: { user: true },
      }),
      context.prisma.shift.count({ where }),
    ]);

    return {
      edges: shifts.map(shift => ({
        node: shift,
        cursor: shift.id,
      })),
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: shifts[0]?.id || null,
        endCursor: shifts[shifts.length - 1]?.id || null,
      },
      totalCount,
    };
  },

  // Get organization location (Manager only)
  getOrganizationLocation: async (_: any, __: any, context: GraphQLContext) => {
    requireManager(context);
    const user = requireAuth(context);

    const organization = await context.prisma.organization.findUnique({
      where: { id: user.dbUser!.organizationId },
      include: { location: true },
    });

    return organization?.location || null;
  },
};
