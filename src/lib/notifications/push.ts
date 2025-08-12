'use client';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    return await Notification.requestPermission();
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }

    return await this.registration.pushManager.getSubscription();
  }

  async subscribe(): Promise<PushSubscriptionData | null> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error('Permission not granted for notifications');
    }

    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }

    // You'll need to generate VAPID keys for production
    const subscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
      },
    };
  }

  async unsubscribe(): Promise<boolean> {
    const subscription = await this.getSubscription();
    
    if (subscription) {
      return await subscription.unsubscribe();
    }
    
    return false;
  }

  // Show local notification
  showNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        ...options,
      });
    }
  }
}

// Notification helpers for CareClock
export const notifications = {
  shiftReminder: (shiftTime: string) => {
    PushNotificationService.getInstance().showNotification(
      'Shift Reminder',
      {
        body: `Your shift starts at ${shiftTime}. Don't forget to clock in!`,
        tag: 'shift-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'clock-in',
            title: 'Clock In Now',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
          },
        ],
      }
    );
  },

  clockInSuccess: () => {
    PushNotificationService.getInstance().showNotification(
      'Clocked In Successfully',
      {
        body: 'You have successfully clocked in for your shift.',
        tag: 'clock-in-success',
        silent: true,
      }
    );
  },

  locationAlert: () => {
    PushNotificationService.getInstance().showNotification(
      'Location Required',
      {
        body: 'Please enable location access to clock in/out.',
        tag: 'location-alert',
        requireInteraction: true,
      }
    );
  },
};
