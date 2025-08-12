'use client';

interface SyncData {
  id: string;
  type: 'clock-in' | 'clock-out' | 'update-profile';
  data: any;
  timestamp: number;
}

export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private readonly SYNC_STORE_NAME = 'careclock-sync-store';

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  // Store data for background sync
  async storeSyncData(type: SyncData['type'], data: any): Promise<void> {
    const syncData: SyncData = {
      id: `${type}-${Date.now()}`,
      type,
      data,
      timestamp: Date.now(),
    };

    try {
      const stored = this.getSyncData();
      stored.push(syncData);
      localStorage.setItem(this.SYNC_STORE_NAME, JSON.stringify(stored));
      
      // Register background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('careclock-background-sync');
      }
    } catch (error) {
      console.error('Failed to store sync data:', error);
    }
  }

  // Get pending sync data
  getSyncData(): SyncData[] {
    try {
      const stored = localStorage.getItem(this.SYNC_STORE_NAME);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Remove sync data after successful sync
  removeSyncData(id: string): void {
    try {
      const stored = this.getSyncData();
      const filtered = stored.filter(item => item.id !== id);
      localStorage.setItem(this.SYNC_STORE_NAME, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove sync data:', error);
    }
  }

  // Clear all sync data
  clearSyncData(): void {
    try {
      localStorage.removeItem(this.SYNC_STORE_NAME);
    } catch (error) {
      console.error('Failed to clear sync data:', error);
    }
  }

  // Process pending sync data when online
  async processPendingSync(): Promise<void> {
    const pendingData = this.getSyncData();
    
    for (const item of pendingData) {
      try {
        await this.syncItem(item);
        this.removeSyncData(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
      }
    }
  }

  private async syncItem(item: SyncData): Promise<void> {
    switch (item.type) {
      case 'clock-in':
        await this.syncClockIn(item.data);
        break;
      case 'clock-out':
        await this.syncClockOut(item.data);
        break;
      case 'update-profile':
        await this.syncProfileUpdate(item.data);
        break;
    }
  }

  private async syncClockIn(data: any): Promise<void> {
    // Implement GraphQL mutation for clock in
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation ClockIn($input: ClockInInput!) {
            clockIn(input: $input) {
              success
              message
            }
          }
        `,
        variables: { input: data },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync clock in');
    }
  }

  private async syncClockOut(data: any): Promise<void> {
    // Implement GraphQL mutation for clock out
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation ClockOut($input: ClockOutInput!) {
            clockOut(input: $input) {
              success
              message
            }
          }
        `,
        variables: { input: data },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync clock out');
    }
  }

  private async syncProfileUpdate(data: any): Promise<void> {
    // Implement profile update sync
    console.log('Syncing profile update:', data);
  }
}
