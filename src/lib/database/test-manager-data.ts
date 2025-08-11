import { prisma } from './client';
import { UserRole, ShiftStatus } from '@prisma/client';
import { subDays, subHours, addHours } from 'date-fns';

export async function createManagerTestData() {
  console.log('🧪 Creating test data for manager dashboard...');

  try {
    // Get the first organization
    const org = await prisma.organization.findFirst({
      include: { location: true },
    });

    if (!org) {
      console.log('❌ No organization found');
      return;
    }

    // Create additional test users
    const testUsers = [];
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.upsert({
        where: { email: `testworker${i}@example.com` },
        update: {},
        create: {
          email: `testworker${i}@example.com`,
          name: `Test Worker ${i}`,
          auth0Id: `test-worker-${i}`,
          role: UserRole.CARE_WORKER,
          organizationId: org.id,
        },
      });
      testUsers.push(user);
    }

    // Create test shifts for the past week
    const shifts = [];
    for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
      const date = subDays(new Date(), dayOffset);
      
      // Create 2-4 shifts per day
      const shiftsToday = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < shiftsToday; i++) {
        const user = testUsers[Math.floor(Math.random() * testUsers.length)];
        const clockInTime = subHours(date, Math.floor(Math.random() * 8) + 8); // 8-16 hours ago
        const shiftDuration = Math.floor(Math.random() * 480) + 240; // 4-12 hours
        const clockOutTime = addHours(clockInTime, shiftDuration / 60);
        
        const shift = await prisma.shift.create({
          data: {
            userId: user.id,
            clockInTime,
            clockOutTime: dayOffset === 0 && i === 0 ? null : clockOutTime, // Keep one active
            clockInLat: org.location?.latitude || 40.7589,
            clockInLon: org.location?.longitude || -73.9851,
            clockOutLat: dayOffset === 0 && i === 0 ? null : (org.location?.latitude || 40.7589),
            clockOutLon: dayOffset === 0 && i === 0 ? null : (org.location?.longitude || -73.9851),
            clockInNote: `Starting shift ${i + 1}`,
            clockOutNote: dayOffset === 0 && i === 0 ? null : `Completed shift ${i + 1}`,
            status: dayOffset === 0 && i === 0 ? ShiftStatus.ACTIVE : ShiftStatus.COMPLETED,
            durationMinutes: dayOffset === 0 && i === 0 ? null : shiftDuration,
          },
        });
        
        shifts.push(shift);
      }
    }

    console.log(`✅ Created ${testUsers.length} test users`);
    console.log(`✅ Created ${shifts.length} test shifts`);
    console.log('🎉 Manager test data created successfully!');

  } catch (error) {
    console.error('❌ Failed to create test data:', error);
  }
}

// Add to window for browser testing
if (typeof window !== 'undefined') {
  (window as any).createManagerTestData = createManagerTestData;
}
