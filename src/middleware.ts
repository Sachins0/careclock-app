import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which paths require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/shifts',
  '/manager',
  '/api/graphql',
];

// Define manager-only paths
const managerPaths = [
  '/manager',
];

export default withMiddlewareAuthRequired(
  async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if this is a protected path
    const isProtectedPath = protectedPaths.some(path => 
      pathname.startsWith(path)
    );
    
    if (!isProtectedPath) {
      return NextResponse.next();
    }

    // For now, let the application handle role-based authorization
    // Later we can add role checking here if needed
    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/shifts/:path*', 
    '/manager/:path*',
    '/api/graphql/:path*',
  ],
};
