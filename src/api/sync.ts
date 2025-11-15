/**
 * Sync API
 * Phase 107: Data synchronization
 *
 * Features:
 * - Push sync (local -> server)
 * - Pull sync (server -> local)
 * - Batch synchronization
 * - Delta sync parameters
 * - Conflict resolution
 */

import {apiClient} from './client';
import {ApiResponse, PaginationParams} from './types';

/**
 * Sync direction
 */
export enum SyncDirection {
  PUSH = 'push',
  PULL = 'pull',
  BIDIRECTIONAL = 'bidirectional',
}

/**
 * Sync status
 */
export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Sync item
 */
export interface SyncItem {
  id: string;
  type: 'session' | 'sensor_data' | 'audio' | 'metadata';
  localId: string;
  serverId?: string;
  status: SyncStatus;
  priority: number;
  createdAt: number;
  updatedAt: number;
  data?: any;
  error?: string;
}

/**
 * Sync push request
 */
export interface SyncPushRequest {
  items: SyncItem[];
  batchId?: string;
}

/**
 * Sync push response
 */
export interface SyncPushResponse {
  batchId: string;
  synced: number;
  failed: number;
  results: Array<{
    localId: string;
    serverId?: string;
    status: SyncStatus;
    error?: string;
  }>;
}

/**
 * Sync pull request
 */
export interface SyncPullRequest {
  lastSyncTimestamp?: number;
  types?: Array<'session' | 'metadata'>;
  limit?: number;
}

/**
 * Sync pull response
 */
export interface SyncPullResponse {
  items: Array<{
    id: string;
    type: string;
    data: any;
    updatedAt: number;
  }>;
  hasMore: boolean;
  nextTimestamp?: number;
}

/**
 * Sync stats
 */
export interface SyncStats {
  lastSyncTimestamp: number;
  totalPushed: number;
  totalPulled: number;
  pendingItems: number;
  failedItems: number;
}

/**
 * Sync API
 */
export const syncApi = {
  /**
   * Push local changes to server
   * Phase 107: Sync push with batch support
   *
   * @param request Sync push request
   * @returns Sync push response
   */
  async syncPush(
    request: SyncPushRequest,
  ): Promise<ApiResponse<SyncPushResponse>> {
    return await apiClient.post<ApiResponse<SyncPushResponse>>(
      '/sync/push',
      request,
    );
  },

  /**
   * Pull server changes to local
   * Phase 107: Sync pull with delta support
   *
   * @param request Sync pull request
   * @returns Sync pull response
   */
  async syncPull(
    request: SyncPullRequest = {},
  ): Promise<ApiResponse<SyncPullResponse>> {
    return await apiClient.post<ApiResponse<SyncPullResponse>>(
      '/sync/pull',
      request,
    );
  },

  /**
   * Batch synchronization
   * Phase 107: Push and pull in one request
   *
   * @param pushRequest Push request
   * @param pullRequest Pull request
   * @returns Both push and pull responses
   */
  async syncBatch(
    pushRequest: SyncPushRequest,
    pullRequest: SyncPullRequest = {},
  ): Promise<{
    push: ApiResponse<SyncPushResponse>;
    pull: ApiResponse<SyncPullResponse>;
  }> {
    const [pushResponse, pullResponse] = await Promise.all([
      this.syncPush(pushRequest),
      this.syncPull(pullRequest),
    ]);

    return {
      push: pushResponse,
      pull: pullResponse,
    };
  },

  /**
   * Get sync stats
   * Phase 107: Sync statistics
   *
   * @returns Sync stats
   */
  async getSyncStats(): Promise<ApiResponse<SyncStats>> {
    return await apiClient.get<ApiResponse<SyncStats>>('/sync/stats');
  },

  /**
   * Get pending sync items
   * Phase 107: Query pending items
   *
   * @param params Pagination parameters
   * @returns Pending sync items
   */
  async getPendingItems(
    params?: PaginationParams,
  ): Promise<ApiResponse<SyncItem[]>> {
    return await apiClient.get<ApiResponse<SyncItem[]>>('/sync/pending', {
      params,
    });
  },

  /**
   * Resolve sync conflict
   * Phase 107: Conflict resolution (Last-Write-Wins)
   *
   * @param itemId Item ID
   * @param resolution Resolution strategy
   * @returns Resolved item
   */
  async resolveConflict(
    itemId: string,
    resolution: 'server' | 'local',
  ): Promise<ApiResponse<SyncItem>> {
    return await apiClient.post<ApiResponse<SyncItem>>(
      `/sync/conflicts/${itemId}/resolve`,
      {resolution},
    );
  },

  /**
   * Retry failed sync items
   * Phase 107: Retry failed syncs
   *
   * @param itemIds Item IDs to retry
   * @returns Retry results
   */
  async retryFailedItems(
    itemIds: string[],
  ): Promise<ApiResponse<SyncPushResponse>> {
    return await apiClient.post<ApiResponse<SyncPushResponse>>(
      '/sync/retry',
      {itemIds},
    );
  },
};

/**
 * Export default
 */
export default syncApi;
