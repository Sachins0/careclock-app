'use client';

import React, { useState } from 'react';
import { Card, Typography, Space, Button, Divider, Tag, Alert } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CopyOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const demoAccounts: DemoAccount[] = [
  {
    role: 'Manager',
    email: 'manager@careclock.demo',
    password: 'Manager123!',
    description: 'Full access to analytics, staff monitoring, and location settings',
    icon: <TeamOutlined />,
    color: '#1890ff',
  },
  {
    role: 'Care Worker',
    email: 'worker@careclock.demo', 
    password: 'Worker123!',
    description: 'Clock in/out functionality with geofenced validation',
    icon: <UserOutlined />,
    color: '#52c41a',
  },
];

export function DemoCredentials() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <Card 
      style={{ 
        marginBottom: 24,
        background: 'linear-gradient(135deg, #f6f9fc, #e3f2fd)',
        border: '1px solid #e1f5fe',
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <InfoCircleOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Demo Accounts - Try CareClock
          </Title>
          <Text type="secondary">
            Use these demo credentials to explore the application features
          </Text>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Demo Accounts */}
        <div style={{ display: 'grid', gap: 16 }}>
          {demoAccounts.map((account, index) => (
            <div 
              key={index}
              style={{
                padding: 16,
                background: 'white',
                borderRadius: 8,
                border: `2px solid ${account.color}20`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ color: account.color, fontSize: 20, marginRight: 8 }}>
                  {account.icon}
                </div>
                <Title level={5} style={{ margin: 0, color: account.color }}>
                  {account.role} Account
                </Title>
                <Tag color={account.color} style={{ marginLeft: 8 }}>
                  Demo
                </Tag>
              </div>

              <Paragraph style={{ fontSize: 12, color: '#666', margin: '0 0 12px 0' }}>
                {account.description}
              </Paragraph>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {/* Email */}
                <div>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Email:
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text 
                      code 
                      style={{ 
                        fontSize: 15, 
                        background: '#f5f5f5',
                        padding: '2px 6px',
                        borderRadius: 4,
                        flex: 1,
                        wordBreak: 'break-all',
                      }}
                    >
                      {account.email}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(account.email, `${account.role}-email`)}
                      style={{ 
                        fontSize: 15, 
                        padding: '2px 4px',
                        background: copiedField === `${account.role}-email` ? '#52c41a' : undefined,
                        color: copiedField === `${account.role}-email` ? 'white' : undefined,
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Password:
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text 
                      code 
                      style={{ 
                        fontSize: 15,
                        background: '#f5f5f5',
                        padding: '2px 6px',
                        borderRadius: 4,
                        flex: 1,
                      }}
                    >
                      {account.password}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(account.password, `${account.role}-password`)}
                      style={{ 
                        fontSize: 15, 
                        padding: '2px 4px',
                        background: copiedField === `${account.role}-password` ? '#52c41a' : undefined,
                        color: copiedField === `${account.role}-password` ? 'white' : undefined,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <Alert
          message="Quick Start Instructions"
          description={
            <div>
              <Paragraph style={{ margin: '8px 0' }}>
                <strong>Manager Account:</strong> Access analytics dashboard, monitor live staff, 
                manage location settings, and export reports.
              </Paragraph>
              <Paragraph style={{ margin: '8px 0' }}>
                <strong>Care Worker Account:</strong> Clock in/out with location validation, 
                add notes, and view shift history.
              </Paragraph>
              <Text type="secondary" style={{ fontSize: 12 }}>
                💡 <strong>Tip:</strong> Click the copy buttons to quickly copy credentials to your clipboard.
              </Text>
            </div>
          }
          type="info"
          showIcon
          style={{ fontSize: 12 }}
        />
      </Space>
    </Card>
  );
}
