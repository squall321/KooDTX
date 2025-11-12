/**
 * SensorDataService
 * Integrates sensor data collection with database storage
 */

import type {SensorType, SensorData} from '@app-types/sensor.types';
import {SensorDataBuffer, SensorDataBatchSaver} from '@services/sensors';
import {
  getSensorDataRepository,
  getRecordingSessionRepository,
} from '@database/repositories';

export interface SensorDataServiceConfig {
  bufferSize?: number;
  flushInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

/**
 * SensorDataService class
 * Manages sensor data buffering and database storage
 */
export class SensorDataService {
  private buffer: SensorDataBuffer;
  private batchSaver: SensorDataBatchSaver;
  private sensorDataRepo = getSensorDataRepository();
  private sessionRepo = getRecordingSessionRepository();
  private errorCallback: ((error: Error) => void) | null = null;

  constructor(config: SensorDataServiceConfig = {}) {
    const {
      bufferSize = 100,
      flushInterval = 5000,
      retryAttempts = 3,
      retryDelay = 1000,
      onError,
    } = config;

    this.errorCallback = onError || null;

    // Initialize buffer
    this.buffer = new SensorDataBuffer({
      maxSize: bufferSize,
      flushInterval,
      autoFlush: true,
      onFlush: async batch => {
        await this.saveBatch(batch);
      },
    });

    // Initialize batch saver
    this.batchSaver = new SensorDataBatchSaver({
      retryAttempts,
      retryDelay,
      onSave: async batch => {
        await this.persistBatch(batch);
      },
      onError: (error, batch) => {
        console.error(`Failed to save batch of ${batch.length} items:`, error);
        if (this.errorCallback) {
          this.errorCallback(error);
        }
      },
    });
  }

  /**
   * Start the service
   */
  start(): void {
    this.buffer.start();
  }

  /**
   * Stop the service and flush remaining data
   */
  async stop(): Promise<void> {
    await this.buffer.stop();

    // Retry any failed batches
    const retryResult = await this.batchSaver.retryFailedBatches();
    if (!retryResult.success) {
      console.warn(
        `Failed to retry ${retryResult.failedCount} items on service stop`,
      );
    }
  }

  /**
   * Add sensor data to buffer
   */
  addData(data: SensorData): void {
    this.buffer.add(data);
  }

  /**
   * Add multiple sensor data to buffer
   */
  addBatch(data: SensorData[]): void {
    this.buffer.addBatch(data);
  }

  /**
   * Get buffer statistics
   */
  getBufferStats() {
    return this.buffer.getStats();
  }

  /**
   * Get saver statistics
   */
  getSaverStats() {
    return this.batchSaver.getStats();
  }

  /**
   * Get failed batches count
   */
  getFailedBatchesCount(): number {
    return this.batchSaver.getFailedBatchesCount();
  }

  /**
   * Manually flush buffer
   */
  async flush(): Promise<void> {
    await this.buffer.flush();
  }

  /**
   * Save batch to database via batch saver
   */
  private async saveBatch(batch: SensorData[]): Promise<void> {
    if (batch.length === 0) {
      return;
    }

    const result = await this.batchSaver.saveBatch(batch);

    if (result.success) {
      console.log(`Successfully saved batch of ${result.savedCount} items`);

      // Update session data counts
      await this.updateSessionCounts(batch);
    } else {
      console.error(
        `Failed to save batch: ${result.failedCount} items failed`,
      );
    }
  }

  /**
   * Persist batch to database
   */
  private async persistBatch(batch: SensorData[]): Promise<void> {
    try {
      await this.sensorDataRepo.createBatch(batch);
    } catch (error) {
      console.error('Failed to persist batch to database:', error);
      throw error;
    }
  }

  /**
   * Update session data counts
   */
  private async updateSessionCounts(batch: SensorData[]): Promise<void> {
    try {
      // Group by session
      const sessionCounts = batch.reduce(
        (acc, data) => {
          acc[data.sessionId] = (acc[data.sessionId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Update each session
      await Promise.all(
        Object.entries(sessionCounts).map(([sessionId, count]) =>
          this.sessionRepo.incrementDataCount(sessionId, count),
        ),
      );
    } catch (error) {
      console.error('Failed to update session counts:', error);
      // Don't throw, this is not critical
    }
  }

  /**
   * Set error callback
   */
  setErrorCallback(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  /**
   * Clear error callback
   */
  clearErrorCallback(): void {
    this.errorCallback = null;
  }
}

// Singleton instance
let serviceInstance: SensorDataService | null = null;

/**
 * Get singleton instance of SensorDataService
 */
export function getSensorDataService(
  config?: SensorDataServiceConfig,
): SensorDataService {
  if (!serviceInstance) {
    serviceInstance = new SensorDataService(config);
  }
  return serviceInstance;
}

/**
 * Reset singleton instance (mainly for testing)
 */
export function resetSensorDataService(): void {
  if (serviceInstance) {
    serviceInstance.stop().catch(() => {
      // Ignore errors during reset
    });
    serviceInstance = null;
  }
}
