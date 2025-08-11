'use client';

import React from 'react';
import { Card, Avatar, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';

const { Title, Text } = Typography;

export function UserProfile() {
  const { user, dbUser, isLoading } = useAuth();

  if (isLoading) {
    return <Card loading />;
  }

  if (!user || !dbUser) {
    return null;
  }

  const getRoleColor = (role: string) => {
    return role === 'MANAGER' ? 'gold' : 'blue';
  };

  const getRoleText = (role: string) => {
    return role === 'MANAGER' ? 'Manager' : 'Care Worker';
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Avatar 
          size={64}
          src={user.picture}
          icon={<UserOutlined />}
        />
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {user.name}
          </Title>
          <Text type="secondary">{user.email}</Text>
          <br />
          <Tag color={getRoleColor(dbUser.role)} style={{ marginTop: 8 }}>
            {getRoleText(dbUser.role)}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dbUser.organization.name}
          </Text>
        </div>
      </div>
    </Card>
  );
}
