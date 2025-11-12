/**
 * Common types used throughout the application
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Sync status
 */
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

/**
 * Record with sync metadata
 */
export interface SyncableRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: SyncStatus;
  syncedAt?: number;
  deviceId: string;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

/**
 * Geolocation coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Environment type
 */
export type Environment = 'development' | 'staging' | 'production';
