/**
 * Sync Service Exports
 * Phase 108-120: Complete sync service
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

export {
  SyncLogger,
  syncLogger,
  type SyncLog,
  type SyncStatistics,
} from './SyncLogger';

export {
  ConflictResolver,
  conflictResolver,
  ConflictStrategy,
  type ConflictItem,
} from './ConflictResolver';

export {
  SelectiveSync,
  selectiveSync,
  type SyncFilter,
} from './SelectiveSync';

export default syncService;
