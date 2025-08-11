'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Alert, Steps } from 'antd';
import { 
  EnvironmentOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { GeolocationService } from '@/lib/geolocation';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface LocationPermissionProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

export function LocationPermission({ onPermissionGranted, onPermissionDenied }: LocationPermissionProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const geolocationService = GeolocationService.getInstance();

  useEffect(() => {
    checkInitialPermission();
  }, []);

  const checkInitialPermission = async () => {
    const state = await geolocationService.checkPermissions();
    setPermissionState(state);
    
    if (state === 'granted') {
      setCurrentStep(2);
      onPermissionGranted();
    } else if (state === 'denied') {
      setCurrentStep(1);
      onPermissionDenied();
    }
  };

  const requestPermission = async () => {
    setIsRequesting(true);
    setCurrentStep(1);

    try {
      await geolocationService.requestPermissions();
      setPermissionState('granted');
      setCurrentStep(2);
      onPermissionGranted();
    } catch (error) {
      setPermissionState('denied');
      onPermissionDenied();
    } finally {
      setIsRequesting(false);
    }
  };

  const renderContent = () => {
    switch (permissionState) {
      case 'prompt':
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Location Access Required"
              description="CareClock needs access to your location to verify you're within the designated work area for clocking in and out."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />

            <div>
              <Title level={4}>Why do we need your location?</Title>
              <ul>
                <li>Verify you're at the correct work location when clocking in</li>
                <li>Track accurate shift start and end locations</li>
                <li>Ensure compliance with workplace policies</li>
                <li>Provide managers with location-based attendance reports</li>
              </ul>
            </div>

            <Alert
              message="Your Privacy is Protected"
              description="Your location is only used for work-related clock-in/out verification. We don't track your location when you're not using the app."
              type="success"
              showIcon
            />

            <Button
              type="primary"
              size="large"
              icon={<EnvironmentOutlined />}
              onClick={requestPermission}
              loading={isRequesting}
              block
            >
              {isRequesting ? 'Requesting Permission...' : 'Grant Location Access'}
            </Button>
          </Space>
        );

      case 'denied':
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Location Access Denied"
              description="Location access is required for CareClock to function properly. Please enable location permissions to continue."
              type="error"
              showIcon
              icon={<ExclamationCircleOutlined />}
            />

            <div>
              <Title level={4}>How to enable location access:</Title>
              <Steps direction="vertical" current={-1} size="small">
                <Step 
                  title="Click the location icon" 
                  description="Look for the location icon in your browser's address bar"
                />
                <Step 
                  title="Select 'Allow'" 
                  description="Choose to allow location access for this site"
                />
                <Step 
                  title="Refresh the page" 
                  description="Reload CareClock to apply the new permissions"
                />
              </Steps>
            </div>

            <Space>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button type="primary" onClick={requestPermission}>
                Try Again
              </Button>
            </Space>
          </Space>
        );

      case 'granted':
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            <Title level={4}>Location Access Granted!</Title>
            <Text>CareClock can now verify your location for clock-in/out.</Text>
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <EnvironmentOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>Location Permission</Title>
        </div>

        <Steps current={currentStep} size="small">
          <Step title="Request" description="Request location access" />
          <Step title="Grant" description="User grants permission" />
          <Step title="Ready" description="Ready to use location" />
        </Steps>

        {renderContent()}
      </Space>
    </Card>
  );
}
