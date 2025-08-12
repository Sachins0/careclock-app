'use client';

interface PWAValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export class PWAValidator {
  static async validate(): Promise<PWAValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // Check HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      errors.push('PWA requires HTTPS');
    } else {
      score += 20;
    }

    // Check manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      errors.push('Web app manifest not found');
    } else {
      score += 20;
      
      try {
        const response = await fetch(manifestLink.getAttribute('href')!);
        const manifest = await response.json();
        
        if (!manifest.name || !manifest.short_name) {
          warnings.push('Manifest missing name or short_name');
        }
        
        if (!manifest.icons || manifest.icons.length === 0) {
          warnings.push('Manifest missing icons');
        }
        
        if (manifest.display !== 'standalone') {
          warnings.push('Consider setting display to "standalone"');
        }
      } catch {
        errors.push('Failed to load manifest');
      }
    }

    // Check service worker
    if (!('serviceWorker' in navigator)) {
      errors.push('Service Worker not supported');
    } else {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          score += 30;
        } else {
          warnings.push('Service Worker not registered');
        }
      } catch {
        warnings.push('Failed to check Service Worker');
      }
    }

    // Check installability
    if ('getInstalledRelatedApps' in navigator) {
      score += 10;
    }

    // Check offline support
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      if (cacheNames.length > 0) {
        score += 20;
      } else {
        warnings.push('No caches found - limited offline support');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.min(score, 100),
    };
  }

  static async runLighthousePWAChecks(): Promise<void> {
    console.log('Run Lighthouse PWA audit for comprehensive testing');
    console.log('Visit: https://developers.google.com/web/tools/lighthouse');
    
    // You can also integrate with Lighthouse programmatically
    if ('lighthouse' in window) {
      // Lighthouse integration if available
    }
  }
}

// Export test function for browser console
if (typeof window !== 'undefined') {
  (window as any).testPWA = PWAValidator.validate;
}
