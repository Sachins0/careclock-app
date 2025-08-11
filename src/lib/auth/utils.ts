import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/database/client';
import { UserRole } from '@prisma/client';

// Server-side authentication helpers
export async function getAuthenticatedUser(req?: any) {
  try {
    const session = await getSession(req);
    
    if (!session?.user) {
      return null;
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { organization: true },
    });

    return {
      auth0User: session.user,
      dbUser,
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export async function requireAuthentication(req?: any) {
  const user = await getAuthenticatedUser(req);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

export async function requireManagerRole(req?: any) {
  const user = await requireAuthentication(req);
  
  if (user.dbUser?.role !== UserRole.MANAGER) {
    throw new Error('Manager role required');
  }
  
  return user;
}

// Client-side role checking
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

export function isManager(userRole: UserRole): boolean {
  return userRole === UserRole.MANAGER;
}

export function isCareWorker(userRole: UserRole): boolean {
  return userRole === UserRole.CARE_WORKER;
}
