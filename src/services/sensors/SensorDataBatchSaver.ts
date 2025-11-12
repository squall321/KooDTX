/**
 * Sensor Data Batch Saver
 * Handles batch saving of sensor data
 */

import type {SensorData, SensorType} from '@types/sensor.types';

export interface BatchSaveResult {
  success: boolean;
  savedCount: number;
  failedCount: number;
  errors: Error[];
}

export interface BatchSaverConfig {
  onSave?: (batch: SensorData[]) => Promise<void>;
  onError?: (error: Error, batch: SensorData[]) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface BatchSaverStats {
  totalBatches: number;
  totalSaved: number;
  totalFailed: number;
  lastSaveTime: number | null;
}

/**
 * SensorDataBatchSaver class
 * Saves sensor data in batches with retry logic
 */
export class SensorDataBatchSaver {
  private onSave: ((batch: SensorData[]) => Promise<void>) | null;
  private onError: ((error: Error, batch: SensorData[]) => void) | null;
  private retryAttempts: number;
  private retryDelay: number;

  // Statistics
  private stats: BatchSaverStats = {
    totalBatches: 0,
    totalSaved: 0,
    totalFailed: 0,
    lastSaveTime: null,
  };

  // Failed batches queue
  private failedBatches: Array<{batch: SensorData[]; attempts: number}> = [];

  constructor(config: BatchSaverConfig = {}) {
    this.onSave = config.onSave || null;
    this.onError = config.onError || null;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Save a batch of sensor data
   */
  async saveBatch(batch: SensorData[]): Promise<BatchSaveResult> {
    if (batch.length === 0) {
      return {
        success: true,
        savedCount: 0,
        failedCount: 0,
        errors: [],
      };
    }

    this.stats.totalBatches++;

    try {
      if (this.onSave) {
        await this.onSave(batch);
      } else {
        // Default: store in memory (for testing or when no save handler is set)
        await this.defaultSave(batch);
      }

      this.stats.totalSaved += batch.length;
      this.stats.lastSaveTime = Date.now();

      return {
        success: true,
        savedCount: batch.length,
        failedCount: 0,
        errors: [],
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      this.stats.totalFailed += batch.length;

      // Add to failed queue for retry
      this.failedBatches.push({batch, attempts: 0});

      if (this.onError) {
        this.onError(err, batch);
      }

      return {
        success: false,
        savedCount: 0,
        failedCount: batch.length,
        errors: [err],
      };
    }
  }

  /**
   * Retry failed batches
   */
  async retryFailedBatches(): Promise<BatchSaveResult> {
    if (this.failedBatches.length === 0) {
      return {
        success: true,
        savedCount: 0,
        failedCount: 0,
        errors: [],
      };
    }

    const results: BatchSaveResult = {
      success: true,
      savedCount: 0,
      failedCount: 0,
      errors: [],
    };

    const batchesToRetry = [...this.failedBatches];
    this.failedBatches = [];

    for (const {batch, attempts} of batchesToRetry) {
      if (attempts >= this.retryAttempts) {
        // Max retries reached, skip this batch
        results.failedCount += batch.length;
        results.success = false;
        results.errors.push(
          new Error(`Max retry attempts reached for batch of ${batch.length} items`),
        );
        continue;
      }

      // Wait before retry
      if (attempts > 0) {
        await this.sleep(this.retryDelay * Math.pow(2, attempts - 1));
      }

      try {
        if (this.onSave) {
          await this.onSave(batch);
        } else {
          await this.defaultSave(batch);
        }

        results.savedCount += batch.length;
        this.stats.totalSaved += batch.length;
        this.stats.totalFailed -= batch.length;
        this.stats.lastSaveTime = Date.now();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        results.errors.push(err);

        // Re-add to failed queue with incremented attempts
        this.failedBatches.push({batch, attempts: attempts + 1});

        if (this.onError) {
          this.onError(err, batch);
        }
      }
    }

    if (results.errors.length > 0) {
      results.success = false;
    }

    return results;
  }

  /**
   * Get failed batches count
   */
  getFailedBatchesCount(): number {
    return this.failedBatches.length;
  }

  /**
   * Get total failed items count
   */
  getFailedItemsCount(): number {
    return this.failedBatches.reduce((sum, {batch}) => sum + batch.length, 0);
  }

  /**
   * Clear failed batches queue
   */
  clearFailedBatches(): void {
    this.failedBatches = [];
  }

  /**
   * Get statistics
   */
  getStats(): BatchSaverStats {
    return {...this.stats};
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalBatches: 0,
      totalSaved: 0,
      totalFailed: 0,
      lastSaveTime: null,
    };
  }

  /**
   * Set save callback
   */
  setSaveCallback(callback: (batch: SensorData[]) => Promise<void>): void {
    this.onSave = callback;
  }

  /**
   * Set error callback
   */
  setErrorCallback(callback: (error: Error, batch: SensorData[]) => void): void {
    this.onError = callback;
  }

  /**
   * Default save implementation (in-memory storage)
   */
  private async defaultSave(batch: SensorData[]): Promise<void> {
    // Simulate async save
    await this.sleep(10);

    // In real implementation, this would save to database or file
    // For now, just log the save operation
    console.log(`Saved batch of ${batch.length} sensor data items`);
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Group batch by sensor type
   */
  static groupBySensorType(batch: SensorData[]): Record<SensorType, SensorData[]> {
    const grouped = {} as Record<SensorType, SensorData[]>;

    batch.forEach(data => {
      if (!grouped[data.sensorType]) {
        grouped[data.sensorType] = [];
      }
      grouped[data.sensorType].push(data);
    });

    return grouped;
  }

  /**
   * Sort batch by timestamp
   */
  static sortByTimestamp(batch: SensorData[]): SensorData[] {
    return [...batch].sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Filter batch by time range
   */
  static filterByTimeRange(
    batch: SensorData[],
    startTime: number,
    endTime: number,
  ): SensorData[] {
    return batch.filter(
      data => data.timestamp >= startTime && data.timestamp <= endTime,
    );
  }
}
