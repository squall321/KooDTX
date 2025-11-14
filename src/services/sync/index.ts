/**
 * Sync Service Exports
 * Phase 108-115: Complete sync service
 */

export {
  SyncService,
  syncService,
  SyncServiceState,
  type SyncEvent,
  type SyncEventListener,
  type SyncConfig,
} from './SyncService';

export {
  BackgroundSyncManager,
  backgroundSyncManager,
} from './BackgroundSyncManager';

export default syncService;
