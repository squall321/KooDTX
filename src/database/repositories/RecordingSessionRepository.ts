/**
 * RecordingSessionRepository
 * Handles CRUD operations for recording sessions
 */

import {Q} from '@nozbe/watermelondb';
import type {SensorType} from '@types/sensor.types';
import {database, RecordingSession} from '../index';

export interface CreateSessionData {
  sessionId: string;
  startTime: number;
  enabledSensors: SensorType[];
  sampleRate: number;
  notes?: string;
}

export interface UpdateSessionData {
  endTime?: number;
  isActive?: boolean;
  dataCount?: number;
  notes?: string;
  isUploaded?: boolean;
}

export class RecordingSessionRepository {
  private collection = database.get<RecordingSession>('recording_sessions');

  /**
   * Create a new recording session
   */
  async create(data: CreateSessionData): Promise<RecordingSession> {
    return database.write(async () => {
      return this.collection.create(record => {
        record.sessionId = data.sessionId;
        record.startTime = data.startTime;
        record.isActive = true;
        record.enabledSensors = data.enabledSensors;
        record.sampleRate = data.sampleRate;
        record.dataCount = 0;
        record.notes = data.notes;
        record.isUploaded = false;
      });
    });
  }

  /**
   * Find session by ID
   */
  async findById(id: string): Promise<RecordingSession | null> {
    try {
      return await this.collection.find(id);
    } catch {
      return null;
    }
  }

  /**
   * Find session by session ID
   */
  async findBySessionId(sessionId: string): Promise<RecordingSession | null> {
    const sessions = await this.collection
      .query(Q.where('session_id', sessionId))
      .fetch();
    return sessions[0] || null;
  }

  /**
   * Find all sessions
   */
  async findAll(limit?: number): Promise<RecordingSession[]> {
    const query = this.collection.query(Q.sortBy('start_time', Q.desc));
    if (limit) {
      return query.fetch();
    }
    return query.fetch();
  }

  /**
   * Find active sessions
   */
  async findActive(): Promise<RecordingSession[]> {
    return this.collection.query(Q.where('is_active', true)).fetch();
  }

  /**
   * Find completed sessions
   */
  async findCompleted(limit?: number): Promise<RecordingSession[]> {
    const query = this.collection
      .query(Q.where('is_active', false), Q.sortBy('start_time', Q.desc));
    if (limit) {
      return query.fetch();
    }
    return query.fetch();
  }

  /**
   * Find unuploaded sessions
   */
  async findUnuploaded(): Promise<RecordingSession[]> {
    return this.collection
      .query(Q.where('is_uploaded', false), Q.where('is_active', false))
      .fetch();
  }

  /**
   * Update session
   */
  async update(
    id: string,
    updates: UpdateSessionData,
  ): Promise<RecordingSession> {
    const record = await this.collection.find(id);
    return database.write(async () => {
      return record.update(r => {
        if (updates.endTime !== undefined) {
          r.endTime = updates.endTime;
        }
        if (updates.isActive !== undefined) {
          r.isActive = updates.isActive;
        }
        if (updates.dataCount !== undefined) {
          r.dataCount = updates.dataCount;
        }
        if (updates.notes !== undefined) {
          r.notes = updates.notes;
        }
        if (updates.isUploaded !== undefined) {
          r.isUploaded = updates.isUploaded;
        }
      });
    });
  }

  /**
   * Update session by session ID
   */
  async updateBySessionId(
    sessionId: string,
    updates: UpdateSessionData,
  ): Promise<RecordingSession | null> {
    const session = await this.findBySessionId(sessionId);
    if (!session) {
      return null;
    }
    return this.update(session.id, updates);
  }

  /**
   * Increment data count
   */
  async incrementDataCount(
    sessionId: string,
    increment: number = 1,
  ): Promise<void> {
    const session = await this.findBySessionId(sessionId);
    if (session) {
      await database.write(async () => {
        await session.update(r => {
          r.dataCount = r.dataCount + increment;
        });
      });
    }
  }

  /**
   * Mark session as uploaded
   */
  async markAsUploaded(sessionId: string): Promise<void> {
    const session = await this.findBySessionId(sessionId);
    if (session) {
      await this.update(session.id, {isUploaded: true});
    }
  }

  /**
   * Delete session
   */
  async delete(id: string): Promise<void> {
    const record = await this.collection.find(id);
    return database.write(async () => {
      await record.destroyPermanently();
    });
  }

  /**
   * Delete session by session ID
   */
  async deleteBySessionId(sessionId: string): Promise<void> {
    const session = await this.findBySessionId(sessionId);
    if (session) {
      await this.delete(session.id);
    }
  }

  /**
   * Count sessions
   */
  async count(): Promise<number> {
    return this.collection.query().fetchCount();
  }

  /**
   * Clear all sessions (use with caution)
   */
  async clearAll(): Promise<void> {
    const records = await this.collection.query().fetch();
    return database.write(async () => {
      await Promise.all(records.map(r => r.destroyPermanently()));
    });
  }
}

// Singleton instance
let repositoryInstance: RecordingSessionRepository | null = null;

/**
 * Get singleton instance of RecordingSessionRepository
 */
export function getRecordingSessionRepository(): RecordingSessionRepository {
  if (!repositoryInstance) {
    repositoryInstance = new RecordingSessionRepository();
  }
  return repositoryInstance;
}

/**
 * Reset singleton instance (mainly for testing)
 */
export function resetRecordingSessionRepository(): void {
  repositoryInstance = null;
}
