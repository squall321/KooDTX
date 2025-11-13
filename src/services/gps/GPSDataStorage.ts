/**
 * GPS Data Storage Service
 * Phase 85: GPS data storage with JSONL format and WatermelonDB integration
 *
 * Features:
 * - GPS data format definition (lat/lon/alt/accuracy)
 * - Timestamp synchronization
 * - JSONL file storage
 * - WatermelonDB metadata storage
 * - Integration with SensorDataPersistence
 */

import {sensorDataPersistence} from '@services/sensors/SensorDataPersistence';
import type {GPSPosition} from './GPSService';
import {getUTC, sensorTimestampToUTC} from '@utils/timestamp';
import type {AndroidSensorType} from '@native';

/**
 * GPS data sample for storage
 */
export interface GPSDataSample {
  /**
   * Sensor type (for compatibility with sensor persistence)
   */
  sensorType: AndroidSensorType;

  /**
   * Sensor name
   */
  sensorName: string;

  /**
   * Sensor timestamp (nanoseconds since boot)
   */
  timestamp: number;

  /**
   * System time (milliseconds UTC)
   */
  systemTime: number;

  /**
   * Latitude in degrees
   */
  latitude: number;

  /**
   * Longitude in degrees
   */
  longitude: number;

  /**
   * Altitude in meters (null if unavailable)
   */
  altitude: number | null;

  /**
   * Horizontal accuracy in meters
   */
  accuracy: number;

  /**
   * Altitude accuracy in meters (null if unavailable)
   */
  altitudeAccuracy: number | null;

  /**
   * Heading in degrees (0-360, null if unavailable)
   */
  heading: number | null;

  /**
   * Speed in meters per second (null if unavailable)
   */
  speed: number | null;
}

/**
 * GPS storage statistics
 */
export interface GPSStorageStats {
  totalSamples: number;
  totalChunks: number;
  totalBytes: number;
  lastSaveTime: number | null;
  failedWrites: number;
}

/**
 * GPS Data Storage Service
 * Handles GPS data persistence with JSONL format
 */
class GPSDataStorageService {
  private static instance: GPSDataStorageService;

  // Virtual sensor type for GPS (using high number to avoid conflicts)
  private readonly GPS_SENSOR_TYPE = 65536 as AndroidSensorType;

  // Statistics
  private stats: GPSStorageStats = {
    totalSamples: 0,
    totalChunks: 0,
    totalBytes: 0,
    lastSaveTime: null,
    failedWrites: 0,
  };

  // Buffer for batching
  private buffer: GPSDataSample[] = [];
  private bufferFlushInterval: number = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): GPSDataStorageService {
    if (!GPSDataStorageService.instance) {
      GPSDataStorageService.instance = new GPSDataStorageService();
    }
    return GPSDataStorageService.instance;
  }

  /**
   * Save GPS position
   */
  async savePosition(
    sessionId: string,
    position: GPSPosition,
  ): Promise<void> {
    // Convert GPS position to data sample
    const sample = this.convertPositionToSample(position);

    // Add to buffer
    this.buffer.push(sample);

    // Start auto-flush if not already running
    if (!this.flushTimer) {
      this.startAutoFlush(sessionId);
    }

    // Flush if buffer is large enough (e.g., 50 samples)
    if (this.buffer.length >= 50) {
      await this.flush(sessionId);
    }
  }

  /**
   * Save multiple GPS positions
   */
  async savePositions(
    sessionId: string,
    positions: GPSPosition[],
  ): Promise<void> {
    for (const position of positions) {
      const sample = this.convertPositionToSample(position);
      this.buffer.push(sample);
    }

    // Flush if buffer is large enough
    if (this.buffer.length >= 50) {
      await this.flush(sessionId);
    }
  }

  /**
   * Flush buffered data to storage
   */
  async flush(sessionId: string): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    // Get samples to write
    const samplesToWrite = [...this.buffer];
    this.buffer = [];

    try {
      // Write to persistence layer
      const results = await sensorDataPersistence.writeSamples(
        sessionId,
        this.GPS_SENSOR_TYPE,
        samplesToWrite as any, // Type cast for compatibility
      );

      // Update statistics
      for (const result of results) {
        if (result.success) {
          this.stats.totalSamples += result.sampleCount || 0;
          this.stats.totalChunks++;
          this.stats.totalBytes += result.fileSize || 0;
          this.stats.lastSaveTime = getUTC();
        } else {
          this.stats.failedWrites++;
          console.error('Failed to write GPS data:', result.error);
        }
      }
    } catch (error) {
      this.stats.failedWrites++;
      console.error('Failed to flush GPS data:', error);

      // Put samples back to buffer for retry
      this.buffer.unshift(...samplesToWrite);
    }
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(sessionId: string): void {
    if (this.flushTimer) {
      return;
    }

    this.flushTimer = setInterval(async () => {
      if (this.buffer.length > 0) {
        await this.flush(sessionId);
      }
    }, this.bufferFlushInterval);
  }

  /**
   * Stop auto-flush timer
   */
  private stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Convert GPS position to data sample
   */
  private convertPositionToSample(position: GPSPosition): GPSDataSample {
    // Synchronize timestamp
    const systemTime = getUTC();

    // Convert GPS timestamp to nanoseconds
    // GPS timestamp is already in milliseconds, convert to nanoseconds
    const timestampNanos = position.timestamp * 1_000_000;

    return {
      sensorType: this.GPS_SENSOR_TYPE,
      sensorName: 'GPS',
      timestamp: timestampNanos,
      systemTime,
      latitude: position.latitude,
      longitude: position.longitude,
      altitude: position.altitude,
      accuracy: position.accuracy,
      altitudeAccuracy: position.altitudeAccuracy,
      heading: position.heading,
      speed: position.speed,
    };
  }

  /**
   * Get statistics
   */
  getStatistics(): GPSStorageStats {
    return {...this.stats};
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.stats = {
      totalSamples: 0,
      totalChunks: 0,
      totalBytes: 0,
      lastSaveTime: null,
      failedWrites: 0,
    };
  }

  /**
   * Set buffer flush interval
   */
  setFlushInterval(intervalMs: number): void {
    this.bufferFlushInterval = intervalMs;

    // Restart timer with new interval
    if (this.flushTimer) {
      this.stopAutoFlush();
      // Timer will restart on next save
    }
  }

  /**
   * Get buffer size
   */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * Cleanup - flush remaining data and stop timers
   */
  async cleanup(sessionId: string): Promise<void> {
    this.stopAutoFlush();

    // Flush remaining data
    if (this.buffer.length > 0) {
      await this.flush(sessionId);
    }
  }
}

/**
 * Singleton instance
 */
export const gpsDataStorage = GPSDataStorageService.getInstance();

/**
 * Convenience functions
 */

/**
 * Save GPS position
 */
export async function saveGPSPosition(
  sessionId: string,
  position: GPSPosition,
): Promise<void> {
  return gpsDataStorage.savePosition(sessionId, position);
}

/**
 * Save multiple GPS positions
 */
export async function saveGPSPositions(
  sessionId: string,
  positions: GPSPosition[],
): Promise<void> {
  return gpsDataStorage.savePositions(sessionId, positions);
}

/**
 * Flush GPS data
 */
export async function flushGPSData(sessionId: string): Promise<void> {
  return gpsDataStorage.flush(sessionId);
}

/**
 * Get GPS storage statistics
 */
export function getGPSStorageStatistics(): GPSStorageStats {
  return gpsDataStorage.getStatistics();
}

/**
 * Reset GPS storage statistics
 */
export function resetGPSStorageStatistics(): void {
  gpsDataStorage.resetStatistics();
}

/**
 * Set GPS flush interval
 */
export function setGPSFlushInterval(intervalMs: number): void {
  gpsDataStorage.setFlushInterval(intervalMs);
}

/**
 * Get GPS buffer size
 */
export function getGPSBufferSize(): number {
  return gpsDataStorage.getBufferSize();
}

/**
 * Cleanup GPS storage
 */
export async function cleanupGPSStorage(sessionId: string): Promise<void> {
  return gpsDataStorage.cleanup(sessionId);
}

/**
 * Export default
 */
export default gpsDataStorage;
