/**
 * SensorDataRepository
 * Handles CRUD operations for sensor data
 */

import {Q} from '@nozbe/watermelondb';
import type {SensorType, SensorData} from '@app-types/sensor.types';
import {database, SensorDataRecord} from '../index';

export class SensorDataRepository {
  private collection = database.get<SensorDataRecord>('sensor_data');

  /**
   * Create a single sensor data record
   */
  async create(data: SensorData): Promise<SensorDataRecord> {
    return database.write(async () => {
      return this.collection.create(record => {
        record.sensorType = data.sensorType;
        record.sessionId = data.sessionId;
        record.timestamp = data.timestamp;

        // 3-axis data
        if ('x' in data) {
          record.x = data.x;
          record.y = data.y;
          record.z = data.z;
        }

        // GPS data
        if ('latitude' in data && data.latitude !== undefined) {
          record.latitude = data.latitude;
          record.longitude = data.longitude;
          record.altitude = data.altitude;
          record.accuracy = data.accuracy;
          record.speed = data.speed;
          record.heading = data.heading;
        }

        // Proximity data
        if ('distance' in data) {
          record.distance = data.distance;
          record.isNear = data.isNear;
          record.maxRange = data.maxRange;
        }

        record.isUploaded = data.isUploaded ?? false;
      });
    });
  }

  /**
   * Create multiple sensor data records in batch
   */
  async createBatch(dataArray: SensorData[]): Promise<SensorDataRecord[]> {
    return database.write(async () => {
      const records = await Promise.all(
        dataArray.map(data =>
          this.collection.create(record => {
            record.sensorType = data.sensorType;
            record.sessionId = data.sessionId;
            record.timestamp = data.timestamp;

            // 3-axis data
            if ('x' in data) {
              record.x = data.x;
              record.y = data.y;
              record.z = data.z;
            }

            // GPS data
            if ('latitude' in data && data.latitude !== undefined) {
              record.latitude = data.latitude;
              record.longitude = data.longitude;
              record.altitude = data.altitude;
              record.accuracy = data.accuracy;
              record.speed = data.speed;
              record.heading = data.heading;
            }

            // Proximity data
            if ('distance' in data) {
              record.distance = data.distance;
              record.isNear = data.isNear;
              record.maxRange = data.maxRange;
            }

            record.isUploaded = data.isUploaded ?? false;
          }),
        ),
      );
      return records;
    });
  }

  /**
   * Find sensor data by ID
   */
  async findById(id: string): Promise<SensorDataRecord | null> {
    try {
      return await this.collection.find(id);
    } catch {
      return null;
    }
  }

  /**
   * Find all sensor data for a session
   */
  async findBySession(sessionId: string): Promise<SensorDataRecord[]> {
    return this.collection.query(Q.where('session_id', sessionId)).fetch();
  }

  /**
   * Find sensor data by session and sensor type
   */
  async findBySessionAndType(
    sessionId: string,
    sensorType: SensorType,
  ): Promise<SensorDataRecord[]> {
    return this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.where('sensor_type', sensorType),
      )
      .fetch();
  }

  /**
   * Find sensor data by time range
   */
  async findByTimeRange(
    sessionId: string,
    startTime: number,
    endTime: number,
  ): Promise<SensorDataRecord[]> {
    return this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.where('timestamp', Q.gte(startTime)),
        Q.where('timestamp', Q.lte(endTime)),
      )
      .fetch();
  }

  /**
   * Find unuploaded sensor data
   */
  async findUnuploaded(limit?: number): Promise<SensorDataRecord[]> {
    const query = this.collection.query(Q.where('is_uploaded', false));
    if (limit) {
      return query.fetch();
    }
    return query.fetch();
  }

  /**
   * Update sensor data
   */
  async update(
    id: string,
    updates: Partial<SensorData>,
  ): Promise<SensorDataRecord> {
    const record = await this.collection.find(id);
    return database.write(async () => {
      return record.update(r => {
        if (updates.isUploaded !== undefined) {
          r.isUploaded = updates.isUploaded;
        }
      });
    });
  }

  /**
   * Mark records as uploaded
   */
  async markAsUploaded(ids: string[]): Promise<void> {
    return database.write(async () => {
      await Promise.all(
        ids.map(async id => {
          const record = await this.collection.find(id);
          return record.update(r => {
            r.isUploaded = true;
          });
        }),
      );
    });
  }

  /**
   * Delete sensor data by ID
   */
  async delete(id: string): Promise<void> {
    const record = await this.collection.find(id);
    return database.write(async () => {
      await record.destroyPermanently();
    });
  }

  /**
   * Delete all sensor data for a session
   */
  async deleteBySession(sessionId: string): Promise<void> {
    const records = await this.findBySession(sessionId);
    return database.write(async () => {
      await Promise.all(records.map(r => r.destroyPermanently()));
    });
  }

  /**
   * Count sensor data records
   */
  async count(sessionId?: string): Promise<number> {
    if (sessionId) {
      return this.collection
        .query(Q.where('session_id', sessionId))
        .fetchCount();
    }
    return this.collection.query().fetchCount();
  }

  /**
   * Count by sensor type
   */
  async countByType(
    sessionId: string,
    sensorType: SensorType,
  ): Promise<number> {
    return this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.where('sensor_type', sensorType),
      )
      .fetchCount();
  }

  /**
   * Clear all sensor data (use with caution)
   */
  async clearAll(): Promise<void> {
    const records = await this.collection.query().fetch();
    return database.write(async () => {
      await Promise.all(records.map(r => r.destroyPermanently()));
    });
  }
}

// Singleton instance
let repositoryInstance: SensorDataRepository | null = null;

/**
 * Get singleton instance of SensorDataRepository
 */
export function getSensorDataRepository(): SensorDataRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SensorDataRepository();
  }
  return repositoryInstance;
}

/**
 * Reset singleton instance (mainly for testing)
 */
export function resetSensorDataRepository(): void {
  repositoryInstance = null;
}
