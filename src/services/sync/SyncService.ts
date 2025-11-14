/**
 * Sync Service
 * Phase 108-115: Complete data synchronization service
 */

import {syncApi, SyncItem, SyncStatus, SyncPushRequest, SyncPullRequest} from '../../api/sync';
import {uploadApi, UploadProgress} from '../../api/upload';
import NetInfo from '@react-native-community/netinfo';

export enum SyncServiceState {
  IDLE = 'idle',
  SYNCING = 'syncing',
  ERROR = 'error',
}

export interface SyncEvent {
  type: 'state_change' | 'progress' | 'complete' | 'error' | 'network_change';
  state?: SyncServiceState;
  progress?: {current: number; total: number; percentage: number};
  error?: Error;
  isConnected?: boolean;
  timestamp: number;
}

export type SyncEventListener = (event: SyncEvent) => void;

export interface SyncConfig {
  autoSync: boolean;
  wifiOnly: boolean;
  chargingOnly: boolean;
  maxConcurrent: number;
}

/**
 * Sync Service
 * Phase 111-115: Complete synchronization
 */
export class SyncService {
  private static instance: SyncService;
  private state: SyncServiceState = SyncServiceState.IDLE;
  private listeners: Set<SyncEventListener> = new Set();
  private queue: SyncItem[] = [];
  private config: SyncConfig = {
    autoSync: true,
    wifiOnly: true,
    chargingOnly: false,
    maxConcurrent: 3,
  };
  private lastSyncTime: number = 0;
  private isConnected: boolean = true;
  private unsubscribeNetInfo?: () => void;

  private constructor() {
    this.setupNetworkListener();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Phase 114: Network state detection
   */
  private setupNetworkListener(): void {
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected ?? false;

      this.emitEvent({
        type: 'network_change',
        isConnected: this.isConnected,
        timestamp: Date.now(),
      });

      // Phase 114: Auto-sync on network recovery
      if (!wasConnected && this.isConnected && this.config.autoSync) {
        if (this.shouldAutoSync(state)) {
          this.startSync().catch(err => console.error('Auto-sync failed:', err));
        }
      }
    });
  }

  /**
   * Phase 114: Check if should auto-sync based on settings
   */
  private shouldAutoSync(state: any): boolean {
    // Check WiFi only setting
    if (this.config.wifiOnly && state.type !== 'wifi') {
      return false;
    }

    // Check charging only setting (would need battery info)
    if (this.config.chargingOnly) {
      // TODO: Check battery charging status
    }

    return true;
  }

  /**
   * Start synchronization
   * Phase 111-112: Push and Pull sync
   */
  public async startSync(): Promise<void> {
    if (this.state === SyncServiceState.SYNCING) {
      return;
    }

    if (!this.isConnected) {
      throw new Error('No network connection');
    }

    this.setState(SyncServiceState.SYNCING);

    try {
      // Phase 111: Push sync (upload files)
      await this.pushSync();
      
      // Phase 112: Pull sync (download updates)
      await this.pullSync();

      this.lastSyncTime = Date.now();
      this.setState(SyncServiceState.IDLE);
      this.emitEvent({type: 'complete', timestamp: Date.now()});
    } catch (error) {
      this.setState(SyncServiceState.ERROR);
      this.emitEvent({
        type: 'error',
        error: error as Error,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Phase 111: Push synchronization (upload files)
   */
  private async pushSync(): Promise<void> {
    const pending = this.queue.filter(item => item.status === SyncStatus.PENDING);
    const sorted = pending.sort((a, b) => b.priority - a.priority);

    for (let i = 0; i < sorted.length; i += this.config.maxConcurrent) {
      const batch = sorted.slice(i, i + this.config.maxConcurrent);
      await Promise.all(batch.map(item => this.syncItemWithUpload(item)));
      
      const percentage = Math.round(((i + batch.length) / sorted.length) * 100);
      this.emitEvent({
        type: 'progress',
        progress: {
          current: i + batch.length,
          total: sorted.length,
          percentage,
        },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Phase 111: Sync item with file upload
   */
  private async syncItemWithUpload(item: SyncItem): Promise<void> {
    try {
      item.status = SyncStatus.IN_PROGRESS;
      
      if (item.type === 'sensor_data' && item.data?.file) {
        // Upload sensor data file
        await uploadApi.uploadSensorData(
          item.localId,
          item.data.file,
          {
            onProgress: (progress: UploadProgress) => {
              // Track upload progress
              console.log(`Upload progress: ${progress.percentage}%`);
            },
          },
        );
      } else if (item.type === 'audio' && item.data?.file) {
        // Upload audio file
        await uploadApi.uploadAudio(item.localId, item.data.file);
      } else if (item.type === 'session' || item.type === 'metadata') {
        // Push metadata
        await syncApi.syncPush({items: [item]});
      }

      item.status = SyncStatus.COMPLETED;
      this.removeFromQueue(item.id);
    } catch (error) {
      item.status = SyncStatus.FAILED;
      item.error = (error as Error).message;
    }
  }

  /**
   * Phase 112: Pull synchronization (download from server)
   */
  private async pullSync(): Promise<void> {
    const request: SyncPullRequest = {
      lastSyncTimestamp: this.lastSyncTime,
      types: ['session', 'metadata'],
    };

    const response = await syncApi.syncPull(request);

    if (response.success && response.data) {
      // Update local data with server changes
      for (const item of response.data.items) {
        // TODO: Update local database
        console.log(`Pulled item: ${item.type} ${item.id}`);
      }

      // Update last sync time
      if (response.data.nextTimestamp) {
        this.lastSyncTime = response.data.nextTimestamp;
      }
    }
  }

  /**
   * Phase 115: Background sync (called by background task)
   */
  public async backgroundSync(): Promise<void> {
    console.log('Background sync started');
    
    try {
      await this.startSync();
      console.log('Background sync completed');
    } catch (error) {
      console.error('Background sync failed:', error);
      throw error;
    }
  }

  /**
   * Add item to sync queue
   */
  public addToQueue(item: SyncItem): void {
    this.queue.push(item);
  }

  /**
   * Remove item from queue
   */
  private removeFromQueue(itemId: string): void {
    this.queue = this.queue.filter(item => item.id !== itemId);
  }

  /**
   * Configure sync service
   */
  public configure(config: Partial<SyncConfig>): void {
    this.config = {...this.config, ...config};
  }

  /**
   * Get configuration
   */
  public getConfig(): SyncConfig {
    return {...this.config};
  }

  /**
   * Event listener management
   */
  public addEventListener(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Set state
   */
  private setState(state: SyncServiceState): void {
    this.state = state;
    this.emitEvent({type: 'state_change', state, timestamp: Date.now()});
  }

  /**
   * Emit event
   */
  private emitEvent(event: SyncEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * Getters
   */
  public getState(): SyncServiceState {
    return this.state;
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  public isNetworkConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    this.unsubscribeNetInfo?.();
    this.listeners.clear();
  }
}

export const syncService = SyncService.getInstance();
export default syncService;
