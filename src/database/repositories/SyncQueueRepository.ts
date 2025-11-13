/**
 * SyncQueueRepository
 * Handles CRUD operations for sync queue items
 */

import {Q} from '@nozbe/watermelondb';
import {database, SyncQueue} from '../index';
import type {SyncItemType, QueueStatus} from '../models/SyncQueue';

export interface CreateSyncQueueData {
  sessionId: string;
  itemType: SyncItemType;
  itemId: string;
  priority?: number;
  maxRetries?: number;
}

export interface UpdateSyncQueueData {
  status?: QueueStatus;
  retryCount?: number;
  errorMessage?: string;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  completedAt?: number;
}

export class SyncQueueRepository {
  private collection = database.get<SyncQueue>('sync_queue');

  /**
   * Create a new sync queue item
   */
  async create(data: CreateSyncQueueData): Promise<SyncQueue> {
    return database.write(async () => {
      return this.collection.create(record => {
        record.sessionId = data.sessionId;
        record.itemType = data.itemType;
        record.itemId = data.itemId;
        record.status = 'pending';
        record.retryCount = 0;
        record.maxRetries = data.maxRetries || 3;
        record.priority = data.priority || 0;
      });
    });
  }

  /**
   * Find sync queue item by ID
   */
  async findById(id: string): Promise<SyncQueue | null> {
    try {
      return await this.collection.find(id);
    } catch {
      return null;
    }
  }

  /**
   * Find sync queue item by item ID and type
   */
  async findByItemIdAndType(
    itemId: string,
    itemType: SyncItemType,
  ): Promise<SyncQueue | null> {
    const items = await this.collection
      .query(Q.where('item_id', itemId), Q.where('item_type', itemType))
      .fetch();
    return items[0] || null;
  }

  /**
   * Find all pending items sorted by priority (highest first)
   */
  async findPending(): Promise<SyncQueue[]> {
    return this.collection
      .query(
        Q.where('status', 'pending'),
        Q.sortBy('priority', Q.desc),
        Q.sortBy('created_at', Q.asc),
      )
      .fetch();
  }

  /**
   * Find pending items ready to sync (including items ready to retry)
   */
  async findReadyToSync(limit?: number): Promise<SyncQueue[]> {
    const now = Date.now();
    const query = this.collection.query(
      Q.where('status', 'pending'),
      Q.or(
        Q.where('next_retry_at', Q.lte(now)),
        Q.where('next_retry_at', null),
      ),
      Q.sortBy('priority', Q.desc),
      Q.sortBy('created_at', Q.asc),
    );

    if (limit) {
      return query.extend(Q.take(limit)).fetch();
    }
    return query.fetch();
  }

  /**
   * Find items by session ID
   */
  async findBySessionId(sessionId: string): Promise<SyncQueue[]> {
    return this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.sortBy('priority', Q.desc),
      )
      .fetch();
  }

  /**
   * Find items by status
   */
  async findByStatus(status: QueueStatus): Promise<SyncQueue[]> {
    return this.collection
      .query(
        Q.where('status', status),
        Q.sortBy('priority', Q.desc),
      )
      .fetch();
  }

  /**
   * Find failed items that can be retried
   */
  async findRetryable(): Promise<SyncQueue[]> {
    return this.collection
      .query(
        Q.where('status', 'failed'),
        Q.where('retry_count', Q.lt(Q.column('max_retries'))),
      )
      .fetch();
  }

  /**
   * Find items that have exceeded max retries
   */
  async findExpired(): Promise<SyncQueue[]> {
    return this.collection
      .query(
        Q.where('status', 'failed'),
        Q.where('retry_count', Q.gte(Q.column('max_retries'))),
      )
      .fetch();
  }

  /**
   * Update sync queue item
   */
  async update(id: string, updates: UpdateSyncQueueData): Promise<SyncQueue> {
    const record = await this.collection.find(id);
    return database.write(async () => {
      return record.update(r => {
        if (updates.status !== undefined) {
          r.status = updates.status;
        }
        if (updates.retryCount !== undefined) {
          r.retryCount = updates.retryCount;
        }
        if (updates.errorMessage !== undefined) {
          r.errorMessage = updates.errorMessage;
        }
        if (updates.lastAttemptAt !== undefined) {
          r.lastAttemptAt = updates.lastAttemptAt;
        }
        if (updates.nextRetryAt !== undefined) {
          r.nextRetryAt = updates.nextRetryAt;
        }
        if (updates.completedAt !== undefined) {
          r.completedAt = updates.completedAt;
        }
      });
    });
  }

  /**
   * Mark item as in progress
   */
  async markAsInProgress(id: string): Promise<SyncQueue> {
    return this.update(id, {
      status: 'in_progress',
      lastAttemptAt: Date.now(),
    });
  }

  /**
   * Mark item as completed
   */
  async markAsCompleted(id: string): Promise<SyncQueue> {
    return this.update(id, {
      status: 'completed',
      completedAt: Date.now(),
    });
  }

  /**
   * Mark item as failed and increment retry count
   */
  async markAsFailed(
    id: string,
    errorMessage: string,
    retryDelayMs: number = 30000,
  ): Promise<SyncQueue> {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('Sync queue item not found');
    }

    const newRetryCount = item.retryCount + 1;
    const nextRetryAt = Date.now() + retryDelayMs;

    // If we've reached max retries, keep status as failed
    // Otherwise, set back to pending for retry
    const newStatus: QueueStatus =
      newRetryCount >= item.maxRetries ? 'failed' : 'pending';

    return this.update(id, {
      status: newStatus,
      retryCount: newRetryCount,
      errorMessage,
      lastAttemptAt: Date.now(),
      nextRetryAt: newStatus === 'pending' ? nextRetryAt : undefined,
    });
  }

  /**
   * Reset item to pending (for manual retry)
   */
  async resetToPending(id: string): Promise<SyncQueue> {
    return this.update(id, {
      status: 'pending',
      errorMessage: undefined,
      nextRetryAt: undefined,
    });
  }

  /**
   * Delete sync queue item
   */
  async delete(id: string): Promise<void> {
    const record = await this.collection.find(id);
    return database.write(async () => {
      await record.destroyPermanently();
    });
  }

  /**
   * Delete by item ID and type
   */
  async deleteByItemIdAndType(
    itemId: string,
    itemType: SyncItemType,
  ): Promise<void> {
    const item = await this.findByItemIdAndType(itemId, itemType);
    if (item) {
      await this.delete(item.id);
    }
  }

  /**
   * Delete all completed items
   */
  async deleteCompleted(): Promise<number> {
    const items = await this.findByStatus('completed');
    await database.write(async () => {
      await Promise.all(items.map(item => item.destroyPermanently()));
    });
    return items.length;
  }

  /**
   * Delete all expired items (failed with max retries)
   */
  async deleteExpired(): Promise<number> {
    const items = await this.findExpired();
    await database.write(async () => {
      await Promise.all(items.map(item => item.destroyPermanently()));
    });
    return items.length;
  }

  /**
   * Count items by status
   */
  async countByStatus(status: QueueStatus): Promise<number> {
    return this.collection
      .query(Q.where('status', status))
      .fetchCount();
  }

  /**
   * Count all items
   */
  async count(): Promise<number> {
    return this.collection.query().fetchCount();
  }

  /**
   * Get sync queue statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    retryable: number;
    expired: number;
  }> {
    const [total, pending, inProgress, completed, failed, retryable, expired] =
      await Promise.all([
        this.count(),
        this.countByStatus('pending'),
        this.countByStatus('in_progress'),
        this.countByStatus('completed'),
        this.countByStatus('failed'),
        this.findRetryable().then(items => items.length),
        this.findExpired().then(items => items.length),
      ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      failed,
      retryable,
      expired,
    };
  }

  /**
   * Clear all sync queue items (use with caution)
   */
  async clearAll(): Promise<void> {
    const records = await this.collection.query().fetch();
    return database.write(async () => {
      await Promise.all(records.map(r => r.destroyPermanently()));
    });
  }
}

// Singleton instance
let repositoryInstance: SyncQueueRepository | null = null;

/**
 * Get singleton instance of SyncQueueRepository
 */
export function getSyncQueueRepository(): SyncQueueRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SyncQueueRepository();
  }
  return repositoryInstance;
}

/**
 * Reset singleton instance (mainly for testing)
 */
export function resetSyncQueueRepository(): void {
  repositoryInstance = null;
}
