'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, Space, Typography, Alert } from 'antd';
import { EnvironmentOutlined, SaveOutlined } from '@ant-design/icons';
import { useGraphQLMutation, useGraphQLQuery } from '@/hooks/useGraphQL';

const { Title, Text } = Typography;

const GET_ORGANIZATION_LOCATION = `
  query GetOrganizationLocation {
    getOrganizationLocation {
      id
      name
      address
      latitude
      longitude
      radiusInMeters
    }
  }
`;

const UPDATE_LOCATION_PERIMETER = `
  mutation UpdateLocationPerimeter($input: LocationPerimeterInput!) {
    updateLocationPerimeter(input: $input) {
      id
      name
      address
      latitude
      longitude
      radiusInMeters
    }
  }
`;

export function LocationForm() {
  const [form] = Form.useForm();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const { data, loading, refetch } = useGraphQLQuery(GET_ORGANIZATION_LOCATION);
  const { mutate: updateLocation, loading: updating } = useGraphQLMutation(UPDATE_LOCATION_PERIMETER);

  // Load existing location data
  useEffect(() => {
    if (data?.getOrganizationLocation) {
      const location = data.getOrganizationLocation;
      form.setFieldsValue({
        name: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        radiusInMeters: location.radiusInMeters,
      });
    }
  }, [data, form]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(location);
        form.setFieldsValue(location);
      },
      (error) => {
        alert('Unable to get your location: ' + error.message);
      }
    );
  };

  const onFinish = async (values: any) => {
    try {
      await updateLocation({ input: values });
      alert('Location updated successfully!');
      refetch();
    } catch (error) {
      alert('Failed to update location');
    }
  };

  if (loading) {
    return <Card loading />;
  }

  return (
    <Card title="Location Perimeter Settings">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Set the location and radius where staff can clock in"
          description="Staff will only be able to clock in when they are within the specified radius of this location."
          type="info"
          showIcon
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            radiusInMeters: 100,
          }}
        >
          <Form.Item
            label="Location Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a location name' }]}
          >
            <Input placeholder="e.g., Main Hospital Building" />
          </Form.Item>

          <Form.Item
            label="Address (Optional)"
            name="address"
          >
            <Input placeholder="Street address for reference" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <Form.Item
              label="Latitude"
              name="latitude"
              rules={[{ required: true, message: 'Required' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="40.7589"
                precision={6}
                step={0.000001}
              />
            </Form.Item>

            <Form.Item
              label="Longitude"
              name="longitude"
              rules={[{ required: true, message: 'Required' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="-73.9851"
                precision={6}
                step={0.000001}
              />
            </Form.Item>
          </div>

          <Button
            type="dashed"
            icon={<EnvironmentOutlined />}
            onClick={getCurrentLocation}
            style={{ marginBottom: 16, width: '100%' }}
          >
            Use My Current Location
          </Button>

          <Form.Item
            label="Radius (meters)"
            name="radiusInMeters"
            rules={[{ required: true, message: 'Please enter radius' }]}
            help="How far from the location center staff can clock in"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={10}
              max={1000}
              step={10}
              placeholder="100"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              icon={<SaveOutlined />}
              size="large"
              block
            >
              Save Location Settings
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
