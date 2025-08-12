'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Workbox } from 'workbox-window';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  hasUpdate: boolean;
  installPWA: () => Promise<void>;
  refreshUpdate: () => void;
  canInstall: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [workbox, setWorkbox] = useState<Workbox | null>(null);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      const wb = new Workbox('/sw.js');
      setWorkbox(wb);

      wb.addEventListener('controlling', () => {
        window.location.reload();
      });

      wb.addEventListener('waiting', () => {
        setHasUpdate(true);
      });

      wb.register();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  const refreshUpdate = () => {
    if (workbox) {
      workbox.messageSkipWaiting();
    }
  };

  const value: PWAContextType = {
    isOnline,
    isInstallable,
    isInstalled,
    hasUpdate,
    installPWA,
    refreshUpdate,
    canInstall: isInstallable && !isInstalled,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}
