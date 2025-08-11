// Export main client
export { prisma } from './client';

// Export query functions
export * from './queries';

// Export types
export * from '../../types/database';

// Export test function (remove in production)
export { testDatabaseConnection } from './test-connection';
