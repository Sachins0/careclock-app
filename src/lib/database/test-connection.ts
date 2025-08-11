import { prisma } from './client';

export async function testDatabaseConnection() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);

    const orgCount = await prisma.organization.count();
    console.log(`✅ Found ${orgCount} organizations in database`);

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
