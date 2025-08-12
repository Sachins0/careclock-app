'use client';

import React from 'react';
import { Result, Button, Card, Space, Typography } from 'antd';
import { WifiOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5',
      padding: 24,
    }}>
      <Card style={{ maxWidth: 500, textAlign: 'center' }}>
        <Result
          icon={<WifiOutlined style={{ fontSize: 72, color: '#faad14' }} />}
          title="You're Offline"
          subTitle="CareClock works offline! Some features may be limited until you reconnect."
          extra={
            <Space direction="vertical" size="middle">
              <Paragraph>
                • View cached shifts and data<br/>
                • Clock in/out (will sync when online)<br/>
                • Browse previous analytics
              </Paragraph>
              
              <Space>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />}
                  onClick={handleRetry}
                >
                  Try Again
                </Button>
                <Link href="/">
                  <Button icon={<HomeOutlined />}>
                    Go Home
                  </Button>
                </Link>
              </Space>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
