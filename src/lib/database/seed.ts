import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Sunrise Healthcare Center',
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Create test location for the organization
  const location = await prisma.location.create({
    data: {
      name: 'Main Building',
      address: '123 Healthcare Ave, Medical City, MC 12345',
      latitude: 40.7589, // Example: Times Square, NYC
      longitude: -73.9851,
      radiusInMeters: 100,
    },
  });

  // Link location to organization
  await prisma.organization.update({
    where: { id: organization.id },
    data: { locationId: location.id },
  });

  console.log('✅ Created location:', location.name);

  // Create test users
  const manager = await prisma.user.create({
    data: {
      email: 'manager@sunrisehealthcare.com',
      name: 'Sarah Johnson',
      role: UserRole.MANAGER,
      auth0Id: 'auth0|manager123', // This will be replaced with real Auth0 IDs later
      organizationId: organization.id,
    },
  });

  const careWorker1 = await prisma.user.create({
    data: {
      email: 'worker1@sunrisehealthcare.com',
      name: 'Mike Thompson',
      role: UserRole.CARE_WORKER,
      auth0Id: 'auth0|worker123',
      organizationId: organization.id,
    },
  });

  const careWorker2 = await prisma.user.create({
    data: {
      email: 'worker2@sunrisehealthcare.com', 
      name: 'Emma Davis',
      role: UserRole.CARE_WORKER,
      auth0Id: 'auth0|worker456',
      organizationId: organization.id,
    },
  });

  // Add to your existing seed file
const demoManager = await prisma.user.upsert({
  where: { email: 'manager@careclock.demo' },
  update: {},
  create: {
    email: 'manager@careclock.demo',
    name: 'Demo Manager',
    auth0Id: 'demo-manager-id',
    role: 'MANAGER',
    organizationId: organization.id,
  },
});

const demoCareWorker = await prisma.user.upsert({
  where: { email: 'worker@careclock.demo' },
  update: {},
  create: {
    email: 'worker@careclock.demo',
    name: 'Demo Care Worker',
    auth0Id: 'demo-worker-id',
    role: 'CARE_WORKER',
    organizationId: organization.id,
  },
});


  console.log('✅ Created users:');
  console.log('  - Manager:', manager.name);
  console.log('  - Care Worker:', careWorker1.name);
  console.log('  - Care Worker:', careWorker2.name);

  // Create some sample completed shifts
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(9, 0, 0, 0); // 9 AM yesterday

  const shift1 = await prisma.shift.create({
    data: {
      userId: careWorker1.id,
      clockInTime: yesterday,
      clockOutTime: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000), // 8 hours later
      clockInLat: location.latitude,
      clockInLon: location.longitude,
      clockOutLat: location.latitude,
      clockOutLon: location.longitude,
      clockInNote: 'Starting morning shift',
      clockOutNote: 'Completed patient rounds',
      status: 'COMPLETED',
      durationMinutes: 480, // 8 hours = 480 minutes
    },
  });

  console.log('✅ Created sample shift for', careWorker1.name);
  console.log('🌱 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
