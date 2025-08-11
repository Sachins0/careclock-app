'use client';

import React, { Component, ReactNode } from 'react';
import { Result, Button, Typography, Card } from 'antd';
import { ExceptionOutlined, ReloadOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: 24 }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="An unexpected error occurred. Please try refreshing the page."
            icon={<ExceptionOutlined />}
            extra={[
              <Button 
                type="primary" 
                key="refresh"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>,
              <Button 
                key="home"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Card 
                title="Error Details (Development Only)" 
                style={{ marginTop: 16, textAlign: 'left' }}
                size="small"
              >
                <Paragraph>
                  <Text code>{this.state.error.message}</Text>
                </Paragraph>
                <Paragraph>
                  <Text code style={{ fontSize: 12 }}>
                    {this.state.error.stack}
                  </Text>
                </Paragraph>
              </Card>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple error component for API errors
export function ErrorMessage({ 
  title = 'Error', 
  message, 
  onRetry,
  showRetry = true 
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  return (
    <Result
      status="error"
      title={title}
      subTitle={message}
      extra={showRetry && onRetry && (
        <Button type="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    />
  );
}
