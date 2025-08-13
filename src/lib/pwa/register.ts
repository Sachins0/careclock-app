export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        
        console.log('✅ Service Worker registered successfully:', registration.scope);
        
        if (registration.installing) {
          console.log('Service worker installing');
        } else if (registration.waiting) {
          console.log('Service worker installed');
        } else if (registration.active) {
          console.log('Service worker active');
        }
        
        return registration;
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        throw error;
      }
    });
  } else {
    console.warn('Service Workers not supported');
  }
}
