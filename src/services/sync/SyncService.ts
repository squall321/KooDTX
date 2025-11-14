/**
 * Sync Service
 * Phase 108-110: Data synchronization service
 */

import {syncApi, SyncItem, SyncStatus, SyncPushRequest} from '@/api/sync';
import {uploadApi} from '@/api/upload';

export enum SyncServiceState {
  IDLE = 'idle',
  SYNCING = 'syncing',
  ERROR = 'error',
}

export interface SyncEvent {
  type: 'state_change' | 'progress' | 'complete' | 'error';
  state?: SyncServiceState;
  progress?: {current: number; total: number};
  error?: Error;
  timestamp: number;
}

export type SyncEventListener = (event: SyncEvent) => void;

export class SyncService {
  private static instance: SyncService;
  private state: SyncServiceState = SyncServiceState.IDLE;
  private listeners: Set<SyncEventListener> = new Set();
  private queue: SyncItem[] = [];
  private maxConcurrent: number = 3;

  private constructor() {}

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  public async startSync(): Promise<void> {
    if (this.state === SyncServiceState.SYNCING) {
      return;
    }

    this.setState(SyncServiceState.SYNCING);

    try {
      // Phase 109: Process queue
      await this.processQueue();
      
      // Phase 110: Sync metadata
      await this.syncMetadata();

      this.setState(SyncServiceState.IDLE);
      this.emitEvent({type: 'complete', timestamp: Date.now()});
    } catch (error) {
      this.setState(SyncServiceState.ERROR);
      this.emitEvent({
        type: 'error',
        error: error as Error,
        timestamp: Date.now(),
      });
    }
  }

  private async processQueue(): Promise<void> {
    const pending = this.queue.filter(item => item.status === SyncStatus.PENDING);
    const sorted = pending.sort((a, b) => b.priority - a.priority);

    for (let i = 0; i < sorted.length; i += this.maxConcurrent) {
      const batch = sorted.slice(i, i + this.maxConcurrent);
      await Promise.all(batch.map(item => this.syncItem(item)));
      
      this.emitEvent({
        type: 'progress',
        progress: {current: i + batch.length, total: sorted.length},
        timestamp: Date.now(),
      });
    }
  }

  private async syncItem(item: SyncItem): Promise<void> {
    try {
      item.status = SyncStatus.IN_PROGRESS;
      
      // Sync based on type
      if (item.type === 'session') {
        // Upload session data
      } else if (item.type === 'sensor_data' || item.type === 'audio') {
        // Upload file
      }

      item.status = SyncStatus.COMPLETED;
    } catch (error) {
      item.status = SyncStatus.FAILED;
      item.error = (error as Error).message;
    }
  }

  private async syncMetadata(): Promise<void> {
    // Phase 110: Push metadata
    const metadataItems = this.queue.filter(item => item.type === 'metadata');
    if (metadataItems.length > 0) {
      const request: SyncPushRequest = {items: metadataItems};
      await syncApi.syncPush(request);
    }
  }

  public addToQueue(item: SyncItem): void {
    this.queue.push(item);
  }

  public addEventListener(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(state: SyncServiceState): void {
    this.state = state;
    this.emitEvent({type: 'state_change', state, timestamp: Date.now()});
  }

  private emitEvent(event: SyncEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  public getState(): SyncServiceState {
    return this.state;
  }

  public getQueueSize(): number {
    return this.queue.length;
  }
}

export const syncService = SyncService.getInstance();
export default syncService;
