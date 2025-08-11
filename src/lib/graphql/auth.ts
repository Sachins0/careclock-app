import { GraphQLError } from 'graphql';
import { GraphQLContext } from './context';
import { UserRole } from '@prisma/client';

export class AuthenticationError extends GraphQLError {
  constructor(message = 'You must be logged in to perform this action') {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }
}

// Require authentication
export function requireAuth(context: GraphQLContext) {
  if (!context.user || !context.user.dbUser) {
    throw new AuthenticationError();
  }
  return context.user;
}

// Require specific role
export function requireRole(context: GraphQLContext, role: UserRole) {
  const user = requireAuth(context);
  
  if (user.dbUser!.role !== role) {
    throw new ForbiddenError(`This action requires ${role} role`);
  }
  
  return user;
}

// Require manager role
export function requireManager(context: GraphQLContext) {
  return requireRole(context, UserRole.MANAGER);
}

// Check if user owns resource
export function requireOwnership(context: GraphQLContext, resourceUserId: string) {
  const user = requireAuth(context);
  
  // Managers can access any resource in their organization
  if (user.dbUser!.role === UserRole.MANAGER) {
    return user;
  }
  
  // Care workers can only access their own resources
  if (user.dbUser!.id !== resourceUserId) {
    throw new ForbiddenError('You can only access your own resources');
  }
  
  return user;
}
