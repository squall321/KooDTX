/**
 * SyncQueue Model
 * Manages the queue of items to be synchronized with the server
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date, relation} from '@nozbe/watermelondb/decorators';
import type {Associations} from '@nozbe/watermelondb/Model';
import type {RecordingSession} from './RecordingSession';

export type SyncItemType = 'session' | 'sensor_data' | 'audio' | 'step_event' | 'step_count' | 'file';
export type QueueStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export class SyncQueue extends Model {
  static override table = 'sync_queue';

  static override associations: Associations = {
    recording_sessions: {type: 'belongs_to', key: 'session_id'},
  };

  @field('session_id') sessionId!: string;
  @field('item_type') itemType!: SyncItemType;
  @field('item_id') itemId!: string;
  @field('status') status!: QueueStatus;
  @field('retry_count') retryCount!: number;
  @field('max_retries') maxRetries!: number;
  @field('priority') priority!: number;
  @field('error_message') errorMessage?: string;
  @field('last_attempt_at') lastAttemptAt?: number;
  @field('next_retry_at') nextRetryAt?: number;
  @field('completed_at') completedAt?: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('recording_sessions', 'session_id') session!: RecordingSession;

  /**
   * Check if this item can be retried
   */
  canRetry(): boolean {
    return this.retryCount < this.maxRetries && this.status === 'failed';
  }

  /**
   * Check if this item is pending and ready to sync
   */
  isReadyToSync(): boolean {
    if (this.status !== 'pending') {
      return false;
    }

    // If there's a next_retry_at timestamp, check if it's time to retry
    if (this.nextRetryAt) {
      return Date.now() >= this.nextRetryAt;
    }

    return true;
  }

  /**
   * Check if this item has expired (too many retries)
   */
  hasExpired(): boolean {
    return this.retryCount >= this.maxRetries && this.status === 'failed';
  }

  /**
   * Get a human-readable status description
   */
  getStatusDescription(): string {
    switch (this.status) {
      case 'pending':
        return this.retryCount > 0 ? `Waiting to retry (${this.retryCount}/${this.maxRetries})` : 'Waiting to sync';
      case 'in_progress':
        return 'Syncing...';
      case 'completed':
        return 'Synced';
      case 'failed':
        return this.hasExpired() ? 'Failed (max retries reached)' : `Failed (${this.retryCount}/${this.maxRetries} retries)`;
      default:
        return 'Unknown';
    }
  }
}
