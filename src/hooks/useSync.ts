/**
 * useSync Hook
 * Phase 120: Synchronization React hook
 */

import {useEffect, useCallback} from 'react';
import {useSyncStore} from '../store/useSyncStore';
import {SyncFilter} from '../services/sync/SelectiveSync';

export interface UseSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  filter?: SyncFilter;
}

/**
 * Phase 120: useSync hook for sync management
 */
export function useSync(options: UseSyncOptions = {}) {
  const {
    state,
    progress,
    queueSize,
    lastSyncTime,
    error,
    isConnected,
    startSync,
    configure,
    addToQueue,
    clearError,
  } = useSyncStore();

  // Phase 116: Manual sync trigger
  const sync = useCallback(async () => {
    try {
      await startSync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [startSync]);

  // Auto-sync setup
  useEffect(() => {
    if (options.autoSync && options.syncInterval) {
      const interval = setInterval(() => {
        if (isConnected) {
          sync();
        }
      }, options.syncInterval);

      return () => clearInterval(interval);
    }
  }, [options.autoSync, options.syncInterval, isConnected, sync]);

  return {
    // State
    state,
    progress,
    queueSize,
    lastSyncTime,
    error,
    isConnected,
    isSyncing: state === 'syncing',

    // Actions
    sync,
    configure,
    addToQueue,
    clearError,
  };
}

export default useSync;
