import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database/client';
import { UserRole } from '@prisma/client';

const afterCallback = async (req: NextRequest, session: any) => {
  const { user } = session;
  
  try {
    // Check if user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { auth0Id: user.sub },
      include: { organization: true },
    });

    // If user doesn't exist, create them with default organization
    if (!dbUser) {
      // Get the first organization
      const defaultOrg = await prisma.organization.findFirst();
      
      if (!defaultOrg) {
        console.error('No organization found. Creating default organization.');
        // Create a default organization if none exists
        const newOrg = await prisma.organization.create({
          data: {
            name: 'Default Healthcare Organization',
          },
        });
        
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || user.email,
            auth0Id: user.sub,
            role: UserRole.CARE_WORKER,
            organizationId: newOrg.id,
          },
          include: { organization: true },
        });
      } else {
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || user.email,
            auth0Id: user.sub,
            role: UserRole.CARE_WORKER,
            organizationId: defaultOrg.id,
          },
          include: { organization: true },
        });
      }

      console.log('✅ Created new user:', dbUser.email);
    }

    // Add database user info to session
    session.user.dbUser = {
      id: dbUser.id,
      role: dbUser.role,
      organizationId: dbUser.organizationId,
      organization: dbUser.organization,
    };

    return session;
  } catch (error) {
    console.error('❌ Error in afterCallback:', error);
    throw error;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auth0: string[] }> }
) {
  const { auth0 } = await params; // Await params before use
  
  return handleAuth({
    login: handleLogin({
    authorizationParams: {
      prompt: 'login',
    },
  }),
  callback: handleCallback({ afterCallback }),
  })(request, { params: { auth0 } });
}

export const POST = GET;
