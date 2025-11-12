/**
 * StepCountRepository
 * Handles CRUD operations for step count samples
 */

import {Q} from '@nozbe/watermelondb';
import type {StepCounterData} from '@app-types/sensor.types';
import {database, StepCount} from '../index';

export class StepCountRepository {
  private collection = database.get<StepCount>('step_counts');

  /**
   * Create a single step count record
   */
  async create(data: StepCounterData): Promise<StepCount> {
    return database.write(async () => {
      return this.collection.create(record => {
        record.sessionId = data.sessionId;
        record.timestamp = data.timestamp;
        record.elapsedRealtimeNanos = data.elapsedRealtimeNanos;
        record.count = data.count;
        record.delta = data.delta;
        record.isUploaded = data.isUploaded ?? false;
      });
    });
  }

  /**
   * Create multiple step count records in batch
   */
  async createBatch(dataArray: StepCounterData[]): Promise<StepCount[]> {
    return database.write(async () => {
      const records = await Promise.all(
        dataArray.map(data =>
          this.collection.create(record => {
            record.sessionId = data.sessionId;
            record.timestamp = data.timestamp;
            record.elapsedRealtimeNanos = data.elapsedRealtimeNanos;
            record.count = data.count;
            record.delta = data.delta;
            record.isUploaded = data.isUploaded ?? false;
          }),
        ),
      );
      return records;
    });
  }

  /**
   * Find step counts by session ID
   */
  async findBySession(sessionId: string): Promise<StepCount[]> {
    return this.collection.query(Q.where('session_id', sessionId)).fetch();
  }

  /**
   * Find step counts in time range
   */
  async findByTimeRange(
    startTime: number,
    endTime: number,
  ): Promise<StepCount[]> {
    return this.collection
      .query(
        Q.where('timestamp', Q.gte(startTime)),
        Q.where('timestamp', Q.lte(endTime)),
      )
      .fetch();
  }

  /**
   * Get total steps for a session
   */
  async getTotalStepsBySession(sessionId: string): Promise<number> {
    const records = await this.findBySession(sessionId);
    if (records.length === 0) {
      return 0;
    }

    // Return the latest count value
    const sortedRecords = records.sort((a, b) => b.timestamp - a.timestamp);
    return sortedRecords[0].count;
  }

  /**
   * Get step statistics for a session
   */
  async getSessionStatistics(sessionId: string): Promise<{
    totalSteps: number;
    sampleCount: number;
    averageStepsPerSample: number;
    maxDelta: number;
    minDelta: number;
  }> {
    const records = await this.findBySession(sessionId);

    if (records.length === 0) {
      return {
        totalSteps: 0,
        sampleCount: 0,
        averageStepsPerSample: 0,
        maxDelta: 0,
        minDelta: 0,
      };
    }

    const sortedRecords = records.sort((a, b) => a.timestamp - b.timestamp);
    const totalSteps = sortedRecords[sortedRecords.length - 1].count;
    const deltas = records.map(r => r.delta);
    const maxDelta = Math.max(...deltas);
    const minDelta = Math.min(...deltas);
    const averageStepsPerSample = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;

    return {
      totalSteps,
      sampleCount: records.length,
      averageStepsPerSample,
      maxDelta,
      minDelta,
    };
  }

  /**
   * Get latest step count
   */
  async getLatest(): Promise<StepCount | null> {
    const results = await this.collection
      .query(Q.sortBy('timestamp', Q.desc), Q.take(1))
      .fetch();
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get latest step count for session
   */
  async getLatestBySession(sessionId: string): Promise<StepCount | null> {
    const results = await this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.sortBy('timestamp', Q.desc),
        Q.take(1),
      )
      .fetch();
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get step count timeline (for visualization)
   */
  async getTimeline(
    sessionId: string,
    limit?: number,
  ): Promise<Array<{timestamp: number; count: number; delta: number}>> {
    let query = this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.sortBy('timestamp', Q.asc),
      );

    if (limit) {
      query = this.collection
        .query(
          Q.where('session_id', sessionId),
          Q.sortBy('timestamp', Q.asc),
          Q.take(limit),
        );
    }

    const records = await query.fetch();
    return records.map(r => ({
      timestamp: r.timestamp,
      count: r.count,
      delta: r.delta,
    }));
  }

  /**
   * Mark step counts as uploaded
   */
  async markAsUploaded(stepCountIds: string[]): Promise<void> {
    await database.write(async () => {
      const records = await this.collection
        .query(Q.where('id', Q.oneOf(stepCountIds)))
        .fetch();

      await Promise.all(
        records.map(record =>
          record.update(r => {
            r.isUploaded = true;
          }),
        ),
      );
    });
  }

  /**
   * Get pending upload step counts
   */
  async getPendingUpload(): Promise<StepCount[]> {
    return this.collection.query(Q.where('is_uploaded', false)).fetch();
  }

  /**
   * Delete step counts by session
   */
  async deleteBySession(sessionId: string): Promise<void> {
    await database.write(async () => {
      const records = await this.findBySession(sessionId);
      await Promise.all(records.map(record => record.markAsDeleted()));
    });
  }

  /**
   * Delete all step counts
   */
  async deleteAll(): Promise<void> {
    await database.write(async () => {
      const records = await this.collection.query().fetch();
      await Promise.all(records.map(record => record.markAsDeleted()));
    });
  }
}

// Singleton instance
let repositoryInstance: StepCountRepository | null = null;

/**
 * Get singleton instance of StepCountRepository
 */
export function getStepCountRepository(): StepCountRepository {
  if (!repositoryInstance) {
    repositoryInstance = new StepCountRepository();
  }
  return repositoryInstance;
}

/**
 * Reset singleton instance (mainly for testing)
 */
export function resetStepCountRepository(): void {
  repositoryInstance = null;
}
