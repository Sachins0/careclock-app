import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/client';
import { UserRole } from '@prisma/client';

export interface GraphQLContext {
  prisma: typeof prisma;
  user: {
    auth0Id: string;
    email: string;
    name: string;
    dbUser: {
      id: string;
      role: UserRole;
      organizationId: string;
    } | null;
  } | null;
  req: NextRequest;
}

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  let user = null;

  try {
    // Get Auth0 session
    const session = await getSession(req);
    
    if (session?.user) {
      // Get database user
      const dbUser = await prisma.user.findUnique({
        where: { auth0Id: session.user.sub },
        include: { organization: true },
      });

      user = {
        auth0Id: session.user.sub,
        email: session.user.email,
        name: session.user.name,
        dbUser: dbUser ? {
          id: dbUser.id,
          role: dbUser.role,
          organizationId: dbUser.organizationId,
        } : null,
      };
    }
  } catch (error) {
    console.error('Error creating GraphQL context:', error);
  }

  return {
    prisma,
    user,
    req,
  };
}
