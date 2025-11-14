/**
 * Background Sync Manager
 * Phase 115: Background synchronization
 */

import BackgroundFetch from 'react-native-background-fetch';
import {syncService} from './SyncService';

export class BackgroundSyncManager {
  private static instance: BackgroundSyncManager;
  private isConfigured: boolean = false;

  private constructor() {}

  public static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance;
  }

  /**
   * Phase 115: Configure background fetch
   */
  public async configure(): Promise<void> {
    if (this.isConfigured) {
      return;
    }

    try {
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: 15, // 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: true,
        },
        async (taskId) => {
          console.log('[BackgroundFetch] Task started:', taskId);
          
          try {
            // Phase 115: Run background sync
            await syncService.backgroundSync();
            BackgroundFetch.finish(taskId);
          } catch (error) {
            console.error('[BackgroundFetch] Sync failed:', error);
            BackgroundFetch.finish(taskId);
          }
        },
        (taskId) => {
          console.warn('[BackgroundFetch] Task timeout:', taskId);
          BackgroundFetch.finish(taskId);
        },
      );

      this.isConfigured = true;
      console.log('[BackgroundFetch] Configured with status:', status);
    } catch (error) {
      console.error('[BackgroundFetch] Configuration failed:', error);
    }
  }

  /**
   * Start background sync
   */
  public async start(): Promise<void> {
    await BackgroundFetch.start();
    console.log('[BackgroundFetch] Started');
  }

  /**
   * Stop background sync
   */
  public async stop(): Promise<void> {
    await BackgroundFetch.stop();
    console.log('[BackgroundFetch] Stopped');
  }

  /**
   * Get status
   */
  public async getStatus(): Promise<number> {
    return await BackgroundFetch.status();
  }
}

export const backgroundSyncManager = BackgroundSyncManager.getInstance();
export default backgroundSyncManager;
