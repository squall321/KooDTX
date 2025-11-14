/**
 * Sync Store
 * Phase 113: Synchronization state management
 */

import {create} from 'zustand';
import {syncService, SyncServiceState} from '../services/sync/SyncService';

interface SyncProgress {
  current: number;
  total: number;
  percentage: number;
}

interface SyncStore {
  // State
  state: SyncServiceState;
  progress: SyncProgress | null;
  queueSize: number;
  lastSyncTime: number;
  error: Error | null;
  isConnected: boolean;

  // Actions
  startSync: () => Promise<void>;
  configure: (config: any) => void;
  addToQueue: (item: any) => void;
  clearError: () => void;

  // Internal
  _setState: (state: SyncServiceState) => void;
  _setProgress: (progress: SyncProgress | null) => void;
  _setError: (error: Error | null) => void;
  _setConnected: (isConnected: boolean) => void;
  _updateQueueSize: () => void;
  _updateLastSyncTime: () => void;
}

/**
 * Sync Store
 * Phase 113: Zustand store for sync state
 */
export const useSyncStore = create<SyncStore>((set, get) => {
  // Setup sync service listener
  syncService.addEventListener(event => {
    switch (event.type) {
      case 'state_change':
        if (event.state) {
          get()._setState(event.state);
        }
        break;
      case 'progress':
        if (event.progress) {
          get()._setProgress(event.progress);
        }
        break;
      case 'complete':
        get()._setProgress(null);
        get()._updateLastSyncTime();
        get()._updateQueueSize();
        break;
      case 'error':
        if (event.error) {
          get()._setError(event.error);
        }
        break;
      case 'network_change':
        if (event.isConnected !== undefined) {
          get()._setConnected(event.isConnected);
        }
        break;
    }
  });

  return {
    // Initial state
    state: SyncServiceState.IDLE,
    progress: null,
    queueSize: 0,
    lastSyncTime: 0,
    error: null,
    isConnected: true,

    // Actions
    startSync: async () => {
      try {
        await syncService.startSync();
      } catch (error) {
        console.error('Sync failed:', error);
      }
    },

    configure: (config) => {
      syncService.configure(config);
    },

    addToQueue: (item) => {
      syncService.addToQueue(item);
      get()._updateQueueSize();
    },

    clearError: () => {
      set({error: null});
    },

    // Internal setters
    _setState: (state) => {
      set({state});
    },

    _setProgress: (progress) => {
      set({progress});
    },

    _setError: (error) => {
      set({error});
    },

    _setConnected: (isConnected) => {
      set({isConnected});
    },

    _updateQueueSize: () => {
      set({queueSize: syncService.getQueueSize()});
    },

    _updateLastSyncTime: () => {
      set({lastSyncTime: syncService.getLastSyncTime()});
    },
  };
});

export default useSyncStore;
