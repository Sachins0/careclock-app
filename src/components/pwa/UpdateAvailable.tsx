'use client';

import React from 'react';
import { Button, notification } from 'antd';
import { ReloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { usePWA } from '@/context/PWAContext';

export function UpdateAvailable() {
  const { hasUpdate, refreshUpdate } = usePWA();

  React.useEffect(() => {
    if (hasUpdate) {
      const key = 'update-available';
      
      notification.info({
        key,
        message: 'Update Available',
        description: 'A new version of CareClock is available. Update now for the latest features.',
        icon: <CloudUploadOutlined style={{ color: '#1890ff' }} />,
        duration: 0, // Don't auto-close
        btn: (
          <Button
            type="primary"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => {
              refreshUpdate();
              notification.close(key);
            }}
          >
            Update Now
          </Button>
        ),
      });
    }
  }, [hasUpdate, refreshUpdate]);

  return null;
}
