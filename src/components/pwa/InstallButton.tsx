'use client';

import React from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import { DownloadOutlined, MobileOutlined, DesktopOutlined } from '@ant-design/icons';
import { usePWA } from '@/context/PWAContext';

const { Title, Text, Paragraph } = Typography;

export function InstallButton() {
  const { canInstall, installPWA, isInstalled } = usePWA();
  const [showInstructions, setShowInstructions] = React.useState(false);

  if (isInstalled || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await installPWA();
    } catch (error) {
      console.error('Installation failed:', error);
      setShowInstructions(true);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={handleInstall}
        size="large"
        style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
        }}
      >
        Install CareClock
      </Button>

      <Modal
        title="Install CareClock"
        open={showInstructions}
        onCancel={() => setShowInstructions(false)}
        footer={[
          <Button key="close" onClick={() => setShowInstructions(false)}>
            Close
          </Button>
        ]}
        width={500}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <MobileOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>Install CareClock for Better Experience</Title>
            <Paragraph>
              Get faster access, offline capabilities, and a native app experience.
            </Paragraph>
          </div>

          <div>
            <Title level={5}>
              <MobileOutlined /> Mobile Installation:
            </Title>
            <ul>
              <li>Tap the menu button (⋮) in your browser</li>
              <li>Select "Add to Home Screen" or "Install App"</li>
              <li>Confirm the installation</li>
            </ul>
          </div>

          <div>
            <Title level={5}>
              <DesktopOutlined /> Desktop Installation:
            </Title>
            <ul>
              <li>Look for the install icon (⊕) in the address bar</li>
              <li>Click "Install CareClock"</li>
              <li>Confirm the installation</li>
            </ul>
          </div>
        </Space>
      </Modal>
    </>
  );
}
