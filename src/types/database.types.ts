/**
 * Database model types for WatermelonDB
 */

/**
 * Base model interface for all database models
 */
export interface BaseModel {
  id: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Database table names
 */
export enum TableName {
  SENSOR_DATA = 'sensor_data',
  RECORDING_SESSIONS = 'recording_sessions',
  SYNC_QUEUE = 'sync_queue',
  USER_SETTINGS = 'user_settings',
}

/**
 * Sync queue entry
 */
export interface SyncQueueEntry extends BaseModel {
  tableName: TableName;
  recordId: string;
  operation: 'create' | 'update' | 'delete';
  data: string; // JSON stringified data
  retryCount: number;
  lastAttempt?: number;
  error?: string;
}

/**
 * User settings
 */
export interface UserSettings extends BaseModel {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  syncEnabled: boolean;
  syncInterval: number; // in milliseconds
  wifiOnlySync: boolean;
  serverUrl: string;
  apiKey?: string;
  notifications: {
    enabled: boolean;
    syncComplete: boolean;
    recordingComplete: boolean;
    errors: boolean;
  };
}

/**
 * Database migration version
 */
export interface MigrationVersion {
  version: number;
  appliedAt: number;
}

/**
 * Database statistics
 */
export interface DatabaseStats {
  totalRecords: number;
  pendingSyncRecords: number;
  lastSyncTime?: number;
  databaseSize: number; // in bytes
  byTable: {
    [key in TableName]: number;
  };
}

/**
 * Query filter options
 */
export interface QueryFilter {
  where?: Record<string, unknown>;
  orderBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
