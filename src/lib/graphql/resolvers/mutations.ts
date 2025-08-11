import { GraphQLContext } from '../context';
import { requireAuth, requireManager } from '../auth';
import { calculateDistance, isWithinPerimeter } from '@/lib/database/queries';
import { UserRole, ShiftStatus } from '@prisma/client';

export const mutations = {
  // Clock in
  clockIn: async (
    _: any,
    { input }: { input: { note?: string; latitude: number; longitude: number } },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);
    const { note, latitude, longitude } = input;

    // Check if user already has an active shift
    const existingShift = await context.prisma.shift.findFirst({
      where: {
        userId: user.dbUser!.id,
        status: ShiftStatus.ACTIVE,
      },
    });

    if (existingShift) {
      return {
        shift: existingShift,
        success: false,
        message: 'You already have an active shift. Please clock out first.',
        withinPerimeter: false,
      };
    }

    // Get organization location
    const organization = await context.prisma.organization.findUnique({
      where: { id: user.dbUser!.organizationId },
      include: { location: true },
    });

    if (!organization?.location) {
      return {
        shift: null,
        success: false,
        message: 'No location perimeter is set for your organization. Please contact your manager.',
        withinPerimeter: false,
      };
    }

    // Check if within perimeter
    const withinPerimeter = isWithinPerimeter(
      latitude,
      longitude,
      organization.location.latitude,
      organization.location.longitude,
      organization.location.radiusInMeters
    );

    if (!withinPerimeter) {
      return {
        shift: null,
        success: false,
        message: 'You are outside the designated perimeter and cannot clock in.',
        withinPerimeter: false,
      };
    }

    // Create new shift
    const shift = await context.prisma.shift.create({
      data: {
        userId: user.dbUser!.id,
        clockInTime: new Date(),
        clockInLat: latitude,
        clockInLon: longitude,
        clockInNote: note,
        status: ShiftStatus.ACTIVE,
      },
      include: { user: true },
    });

    return {
      shift,
      success: true,
      message: 'Successfully clocked in!',
      withinPerimeter: true,
    };
  },

  // Clock out
  clockOut: async (
    _: any,
    { input }: { input: { note?: string; latitude: number; longitude: number } },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);
    const { note, latitude, longitude } = input;

    // Find active shift
    const activeShift = await context.prisma.shift.findFirst({
      where: {
        userId: user.dbUser!.id,
        status: ShiftStatus.ACTIVE,
      },
    });

    if (!activeShift) {
      return {
        shift: null,
        success: false,
        message: 'No active shift found. Please clock in first.',
        totalDuration: null,
      };
    }

    // Calculate duration
    const clockOutTime = new Date();
    const clockInTime = activeShift.clockInTime!;
    const durationMinutes = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60));

    // Update shift
    const updatedShift = await context.prisma.shift.update({
      where: { id: activeShift.id },
      data: {
        clockOutTime,
        clockOutLat: latitude,
        clockOutLon: longitude,
        clockOutNote: note,
        status: ShiftStatus.COMPLETED,
        durationMinutes,
      },
      include: { user: true },
    });

    // Format duration
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const totalDuration = `${hours}h ${minutes}m`;

    return {
      shift: updatedShift,
      success: true,
      message: `Successfully clocked out! Total time: ${totalDuration}`,
      totalDuration,
    };
  },

  // Update location perimeter (Manager only)
  updateLocationPerimeter: async (
    _: any,
    { input }: { 
      input: { 
        name: string; 
        address?: string; 
        latitude: number; 
        longitude: number; 
        radiusInMeters: number;
      } 
    },
    context: GraphQLContext
  ) => {
    requireManager(context);
    const user = requireAuth(context);

    const organization = await context.prisma.organization.findUnique({
      where: { id: user.dbUser!.organizationId },
      include: { location: true },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    let location;
    
    if (organization.location) {
      // Update existing location
      location = await context.prisma.location.update({
        where: { id: organization.location.id },
        data: {
          name: input.name,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          radiusInMeters: input.radiusInMeters,
        },
      });
    } else {
      // Create new location
      location = await context.prisma.location.create({
        data: {
          name: input.name,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          radiusInMeters: input.radiusInMeters,
        },
      });

      // Link to organization
      await context.prisma.organization.update({
        where: { id: organization.id },
        data: { locationId: location.id },
      });
    }

    return location;
  },

  // Update user profile
  updateProfile: async (
    _: any,
    { input }: { input: { name?: string } },
    context: GraphQLContext
  ) => {
    const user = requireAuth(context);

    return await context.prisma.user.update({
      where: { id: user.dbUser!.id },
      data: {
        name: input.name,
      },
      include: { organization: true },
    });
  },
};
