'use client';

import React, { ReactNode } from 'react';
import { Spin, Result, Button } from 'antd';
import { LoadingOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@prisma/client';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: UserRole;
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireRole,
  fallback 
}: ProtectedRouteProps) {
  const { user, dbUser, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin 
          size="large" 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} />}
        />
      </div>
    );
  }

  // User not authenticated
  if (!user || !dbUser) {
    return fallback || (
      <Result
        status="403"
        title="Authentication Required"
        subTitle="You need to be logged in to access this page."
        extra={
          <Button type="primary" href="/api/auth/login">
            Login
          </Button>
        }
      />
    );
  }

  // Check role requirements
  if (requireRole && dbUser.role !== requireRole) {
    const requiredRoleText = requireRole === UserRole.MANAGER ? 'Manager' : 'Care Worker';
    
    return (
      <Result
        status="403"
        title="Insufficient Permissions"
        subTitle={`This page requires ${requiredRoleText} role access.`}
        icon={<LockOutlined />}
        extra={
          <Button type="primary" href="/">
            Go Home
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}

// Convenience components
export function ManagerOnlyRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireRole={UserRole.MANAGER}>
      {children}
    </ProtectedRoute>
  );
}

export function CareWorkerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireRole={UserRole.CARE_WORKER}>
      {children}
    </ProtectedRoute>
  );
}
