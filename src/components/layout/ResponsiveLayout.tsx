'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { Grid } from 'antd';
import { AppLayout } from './AppLayout';
import { MobileLayout } from './MobileLayout';

const { useBreakpoint } = Grid;

interface ResponsiveLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backUrl?: string;
  showSider?: boolean;
}

export function ResponsiveLayout({ 
  children, 
  title, 
  showBack, 
  backUrl, 
  showSider = true 
}: ResponsiveLayoutProps) {
  const screens = useBreakpoint();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(!screens.md);
  }, [screens]);

  if (isMobile) {
    return (
      <MobileLayout 
        title={title} 
        showBack={showBack} 
        backUrl={backUrl}
      >
        {children}
      </MobileLayout>
    );
  }

  return (
    <AppLayout title={title} showSider={showSider}>
      {children}
    </AppLayout>
  );
}
