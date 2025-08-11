'use client';

import React from 'react';
import { Button } from 'antd';
import { LoginOutlined, LogoutOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';

export function AuthButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Button icon={<LoadingOutlined />} loading>
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <Button 
        type="primary" 
        danger
        icon={<LogoutOutlined />}
        href="/api/auth/logout"
      >
        Logout
      </Button>
    );
  }

  return (
    <Button 
      type="primary"
      icon={<LoginOutlined />}
      href="/api/auth/login"
    >
      Login
    </Button>
  );
}
