/**
 * StepEventRepository
 * Handles CRUD operations for step detection events
 */

import {Q} from '@nozbe/watermelondb';
import type {StepDetectorData, StepActivityType} from '@app-types/sensor.types';
import {database, StepEvent} from '../index';

export class StepEventRepository {
  private collection = database.get<StepEvent>('step_events');

  /**
   * Create a single step event record
   */
  async create(data: StepDetectorData): Promise<StepEvent> {
    return database.write(async () => {
      return this.collection.create(record => {
        record.sessionId = data.sessionId;
        record.timestamp = data.timestamp;
        record.elapsedRealtimeNanos = data.elapsedRealtimeNanos;
        record.utcEpochMs = data.utcEpochMs;
        record.activityType = data.activityType;
        record.confidence = data.confidence;
        record.isUploaded = data.isUploaded ?? false;
      });
    });
  }

  /**
   * Create multiple step event records in batch
   */
  async createBatch(dataArray: StepDetectorData[]): Promise<StepEvent[]> {
    return database.write(async () => {
      const records = await Promise.all(
        dataArray.map(data =>
          this.collection.create(record => {
            record.sessionId = data.sessionId;
            record.timestamp = data.timestamp;
            record.elapsedRealtimeNanos = data.elapsedRealtimeNanos;
            record.utcEpochMs = data.utcEpochMs;
            record.activityType = data.activityType;
            record.confidence = data.confidence;
            record.isUploaded = data.isUploaded ?? false;
          }),
        ),
      );
      return records;
    });
  }

  /**
   * Find step events by session ID
   */
  async findBySession(sessionId: string): Promise<StepEvent[]> {
    return this.collection.query(Q.where('session_id', sessionId)).fetch();
  }

  /**
   * Find step events by activity type
   */
  async findByActivityType(activityType: StepActivityType): Promise<StepEvent[]> {
    return this.collection.query(Q.where('activity_type', activityType)).fetch();
  }

  /**
   * Find step events by session and activity type
   */
  async findBySessionAndActivity(
    sessionId: string,
    activityType: StepActivityType,
  ): Promise<StepEvent[]> {
    return this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.where('activity_type', activityType),
      )
      .fetch();
  }

  /**
   * Find step events in time range
   */
  async findByTimeRange(
    startTime: number,
    endTime: number,
  ): Promise<StepEvent[]> {
    return this.collection
      .query(
        Q.where('timestamp', Q.gte(startTime)),
        Q.where('timestamp', Q.lte(endTime)),
      )
      .fetch();
  }

  /**
   * Count steps for a session
   */
  async countStepsBySession(sessionId: string): Promise<number> {
    const count = await this.collection
      .query(Q.where('session_id', sessionId))
      .fetchCount();
    return count;
  }

  /**
   * Count steps by activity type for a session
   */
  async countStepsBySessionAndActivity(
    sessionId: string,
    activityType: StepActivityType,
  ): Promise<number> {
    const count = await this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.where('activity_type', activityType),
      )
      .fetchCount();
    return count;
  }

  /**
   * Get step statistics for a session
   */
  async getSessionStatistics(sessionId: string): Promise<{
    totalSteps: number;
    walkingSteps: number;
    runningSteps: number;
    unknownSteps: number;
    averageConfidence: number;
  }> {
    const allSteps = await this.findBySession(sessionId);

    const walkingSteps = allSteps.filter(s => s.activityType === 'walking').length;
    const runningSteps = allSteps.filter(s => s.activityType === 'running').length;
    const unknownSteps = allSteps.filter(s => s.activityType === 'unknown').length;

    const totalConfidence = allSteps.reduce(
      (sum, step) => sum + (step.confidence ?? 0),
      0,
    );
    const averageConfidence = allSteps.length > 0 ? totalConfidence / allSteps.length : 0;

    return {
      totalSteps: allSteps.length,
      walkingSteps,
      runningSteps,
      unknownSteps,
      averageConfidence,
    };
  }

  /**
   * Get latest step event
   */
  async getLatest(): Promise<StepEvent | null> {
    const results = await this.collection
      .query(Q.sortBy('timestamp', Q.desc), Q.take(1))
      .fetch();
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get latest step event for session
   */
  async getLatestBySession(sessionId: string): Promise<StepEvent | null> {
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
   * Mark step events as uploaded
   */
  async markAsUploaded(stepEventIds: string[]): Promise<void> {
    await database.write(async () => {
      const records = await this.collection
        .query(Q.where('id', Q.oneOf(stepEventIds)))
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
   * Get pending upload step events
   */
  async getPendingUpload(): Promise<StepEvent[]> {
    return this.collection.query(Q.where('is_uploaded', false)).fetch();
  }

  /**
   * Delete step events by session
   */
  async deleteBySession(sessionId: string): Promise<void> {
    await database.write(async () => {
      const records = await this.findBySession(sessionId);
      await Promise.all(records.map(record => record.markAsDeleted()));
    });
  }

  /**
   * Delete all step events
   */
  async deleteAll(): Promise<void> {
    await database.write(async () => {
      const records = await this.collection.query().fetch();
      await Promise.all(records.map(record => record.markAsDeleted()));
    });
  }
}

// Singleton instance
let repositoryInstance: StepEventRepository | null = null;

/**
 * Get singleton instance of StepEventRepository
 */
export function getStepEventRepository(): StepEventRepository {
  if (!repositoryInstance) {
    repositoryInstance = new StepEventRepository();
  }
  return repositoryInstance;
}

/**
 * Reset singleton instance (mainly for testing)
 */
export function resetStepEventRepository(): void {
  repositoryInstance = null;
}
