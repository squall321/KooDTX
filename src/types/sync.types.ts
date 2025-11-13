/**
 * Sync Types
 * Type definitions for data synchronization
 */

import type {SensorType} from './sensor.types';
import type {QueueStatus} from '../database/models/SyncQueue';

/**
 * Sync item type (what is being synced)
 */
export enum SyncItemType {
  SESSION = 'session',
  SENSOR_DATA = 'sensor_data',
  AUDIO = 'audio',
  STEP_EVENT = 'step_event',
  STEP_COUNT = 'step_count',
  FILE = 'file',
}

/**
 * Sync direction
 */
export enum SyncDirection {
  PUSH = 'push', // Upload to server
  PULL = 'pull', // Download from server
  BIDIRECTIONAL = 'bidirectional', // Both ways
}

/**
 * Sync priority
 */
export enum SyncPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

/**
 * Sync queue item interface
 */
export interface SyncQueueItem {
  id: string;
  sessionId: string;
  itemType: SyncItemType;
  itemId: string;
  status: QueueStatus;
  priority: SyncPriority;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Sync result for a single item
 */
export interface SyncResult {
  success: boolean;
  itemId: string;
  itemType: SyncItemType;
  bytesTransferred?: number;
  duration?: number;
  error?: string;
  retryable?: boolean;
}

/**
 * Batch sync result
 */
export interface BatchSyncResult {
  success: boolean;
  totalItems: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  results: SyncResult[];
  totalBytesTransferred: number;
  totalDuration: number;
  errors: string[];
}

/**
 * Sync progress information
 */
export interface SyncProgress {
  itemType: SyncItemType;
  itemId: string;
  status: 'preparing' | 'uploading' | 'downloading' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  bytesTransferred: number;
  totalBytes: number;
  estimatedTimeRemaining?: number; // in milliseconds
  currentSpeed?: number; // bytes per second
}

/**
 * Sync statistics
 */
export interface SyncStats {
  /**
   * Total items in sync queue
   */
  totalQueued: number;

  /**
   * Items by status
   */
  byStatus: {
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  };

  /**
   * Items by type
   */
  byType: Partial<Record<SyncItemType, number>>;

  /**
   * Total bytes pending sync
   */
  totalBytesPending: number;

  /**
   * Last sync timestamp
   */
  lastSyncAt?: number;

  /**
   * Next scheduled sync
   */
  nextSyncAt?: number;

  /**
   * Total items synced (all time)
   */
  totalSynced: number;

  /**
   * Total bytes synced (all time)
   */
  totalBytesSynced: number;

  /**
   * Failed items that need attention
   */
  failedItems: number;

  /**
   * Items waiting for retry
   */
  retryableItems: number;
}

/**
 * Sync configuration
 */
export interface SyncConfig {
  /**
   * Enable automatic sync
   */
  autoSync: boolean;

  /**
   * Sync interval in milliseconds
   */
  syncInterval: number;

  /**
   * Only sync on WiFi
   */
  wifiOnly: boolean;

  /**
   * Only sync when charging
   */
  chargingOnly: boolean;

  /**
   * Max retry attempts
   */
  maxRetries: number;

  /**
   * Retry delay in milliseconds (exponential backoff base)
   */
  retryDelay: number;

  /**
   * Batch size for bulk sync
   */
  batchSize: number;

  /**
   * Timeout for sync operations (milliseconds)
   */
  timeout: number;

  /**
   * Compress data before upload
   */
  compressData: boolean;

  /**
   * Priority order for sync
   */
  priorityOrder: SyncItemType[];

  /**
   * Delete local data after successful sync
   */
  deleteAfterSync: boolean;

  /**
   * Keep local data for X days even if synced
   */
  keepLocalForDays?: number;
}

/**
 * Sync conflict resolution strategy
 */
export enum ConflictResolution {
  SERVER_WINS = 'server_wins',
  CLIENT_WINS = 'client_wins',
  MERGE = 'merge',
  MANUAL = 'manual',
}

/**
 * Sync conflict
 */
export interface SyncConflict {
  itemId: string;
  itemType: SyncItemType;
  localVersion: any;
  serverVersion: any;
  localUpdatedAt: number;
  serverUpdatedAt: number;
  resolution?: ConflictResolution;
  resolved: boolean;
  resolvedAt?: number;
}

/**
 * Sync session (represents one sync operation)
 */
export interface SyncSession {
  id: string;
  startedAt: number;
  completedAt?: number;
  direction: SyncDirection;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  bytesTransferred: number;
  duration?: number;
  errors: string[];
  conflicts: SyncConflict[];
}

/**
 * Push request payload
 */
export interface PushRequest {
  sessionId: string;
  itemType: SyncItemType;
  items: any[];
  compressed?: boolean;
  checksum?: string;
}

/**
 * Push response
 */
export interface PushResponse {
  success: boolean;
  accepted: number;
  rejected: number;
  conflicts: SyncConflict[];
  errors: string[];
}

/**
 * Pull request payload
 */
export interface PullRequest {
  sessionId?: string;
  itemType?: SyncItemType;
  since?: number; // timestamp
  limit?: number;
  sensorTypes?: SensorType[];
}

/**
 * Pull response
 */
export interface PullResponse {
  success: boolean;
  items: any[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}

/**
 * Sync health status
 */
export interface SyncHealthStatus {
  healthy: boolean;
  lastSuccessfulSync?: number;
  pendingItems: number;
  failedItems: number;
  oldestPendingItem?: number;
  avgSyncDuration?: number;
  issues: Array<{
    severity: 'warning' | 'error' | 'critical';
    message: string;
    itemsAffected?: number;
  }>;
}

/**
 * Sync event types
 */
export enum SyncEventType {
  SYNC_STARTED = 'sync_started',
  SYNC_PROGRESS = 'sync_progress',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',
  SYNC_PAUSED = 'sync_paused',
  SYNC_RESUMED = 'sync_resumed',
  SYNC_CANCELLED = 'sync_cancelled',
  ITEM_SYNCED = 'item_synced',
  ITEM_FAILED = 'item_failed',
  CONFLICT_DETECTED = 'conflict_detected',
  QUEUE_UPDATED = 'queue_updated',
}

/**
 * Sync event
 */
export interface SyncEvent {
  type: SyncEventType;
  timestamp: number;
  sessionId?: string;
  data?: any;
}

/**
 * Sync listener callback
 */
export type SyncListener = (event: SyncEvent) => void;
