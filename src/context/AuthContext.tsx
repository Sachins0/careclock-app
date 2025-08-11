'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { UserRole } from '@prisma/client';
import { Auth0User } from '@/types/auth';

interface DatabaseUser {
  id: string;
  role: UserRole;
  organizationId: string;
  organization: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  user: Auth0User | null | undefined; // Properly typed instead of any
  dbUser: DatabaseUser | null;
  isLoading: boolean;
  error?: Error;
  isManager: boolean;
  isCareWorker: boolean;
  organizationId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, error, isLoading } = useUser();
  
  // Handle error type conversion
  const authError: Error | undefined = error ? new Error(error.message) : undefined;
  
  const dbUser: DatabaseUser | null = user?.dbUser || null;
  const isManager = dbUser?.role === UserRole.MANAGER;
  const isCareWorker = dbUser?.role === UserRole.CARE_WORKER;
  const organizationId = dbUser?.organizationId || null;

  const value: AuthContextType = {
    user: user as Auth0User | null | undefined,
    dbUser,
    isLoading,
    error: authError,
    isManager,
    isCareWorker,
    organizationId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Rest of your hooks remain the same...
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return { isLoading: true };
  if (!user) throw new Error('Authentication required');
  
  return { user, isLoading: false };
}

export function useRequireManager() {
  const { isManager, isLoading } = useAuth();
  
  if (isLoading) return { isLoading: true };
  if (!isManager) throw new Error('Manager role required');
  
  return { isLoading: false };
}
