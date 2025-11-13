/**
 * Sensor Data Persistence Service
 * Phase 81: Data Storage Logic
 *
 * Handles:
 * - JSONL format writing
 * - 1-minute chunk files
 * - WatermelonDB metadata storage
 * - SyncQueue integration
 * - Atomic write guarantee
 * - Disk I/O optimization
 */

import RNFS from 'react-native-fs';
import {database} from '@database';
import {Q} from '@nozbe/watermelondb';
import type {SensorDataSample, AndroidSensorType} from '@native';
import {AppDirectories} from '@utils/fileSystem';
import type {SyncQueue, RecordingSession, SensorDataChunk} from '@database/models';

/**
 * Chunk configuration
 */
export interface ChunkConfig {
  /**
   * Chunk duration in milliseconds (default: 60000 = 1 minute)
   */
  chunkDuration: number;

  /**
   * Maximum samples per chunk before force flush
   */
  maxSamplesPerChunk: number;

  /**
   * Directory to store chunk files
   */
  chunkDirectory: string;
}

/**
 * Write result
 */
export interface WriteResult {
  success: boolean;
  chunkId?: string;
  filePath?: string;
  sampleCount?: number;
  fileSize?: number;
  error?: Error;
}

/**
 * Persistence statistics
 */
export interface PersistenceStats {
  totalChunks: number;
  totalSamples: number;
  totalBytes: number;
  chunksInProgress: number;
  failedWrites: number;
  lastWriteTime: number | null;
}

/**
 * Active chunk info
 */
interface ActiveChunk {
  chunkId: string;
  sessionId: string;
  sensorType: AndroidSensorType;
  startTime: number;
  samples: SensorDataSample[];
  tempFilePath: string;
}

/**
 * Sensor Data Persistence Service
 * Handles atomic writing of sensor data to JSONL chunk files
 */
export class SensorDataPersistence {
  private static instance: SensorDataPersistence;

  private config: ChunkConfig;
  private activeChunks: Map<string, ActiveChunk> = new Map();
  private writeQueue: Promise<void> = Promise.resolve();

  // Statistics
  private stats: PersistenceStats = {
    totalChunks: 0,
    totalSamples: 0,
    totalBytes: 0,
    chunksInProgress: 0,
    failedWrites: 0,
    lastWriteTime: null,
  };

  private constructor(config?: Partial<ChunkConfig>) {
    this.config = {
      chunkDuration: config?.chunkDuration || 60000, // 1 minute
      maxSamplesPerChunk: config?.maxSamplesPerChunk || 12000, // ~200Hz * 60s
      chunkDirectory: config?.chunkDirectory || AppDirectories.sensorData,
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<ChunkConfig>): SensorDataPersistence {
    if (!SensorDataPersistence.instance) {
      SensorDataPersistence.instance = new SensorDataPersistence(config);
    }
    return SensorDataPersistence.instance;
  }

  /**
   * Write sensor data samples
   * Automatically creates chunks based on time windows
   */
  async writeSamples(
    sessionId: string,
    sensorType: AndroidSensorType,
    samples: SensorDataSample[],
  ): Promise<WriteResult[]> {
    if (samples.length === 0) {
      return [];
    }

    const results: WriteResult[] = [];

    // Group samples by chunk (1-minute windows)
    const chunkGroups = this.groupSamplesByChunk(samples);

    for (const [chunkKey, chunkSamples] of chunkGroups.entries()) {
      const result = await this.writeChunk(sessionId, sensorType, chunkSamples);
      results.push(result);
    }

    return results;
  }

  /**
   * Write a single chunk of data
   */
  private async writeChunk(
    sessionId: string,
    sensorType: AndroidSensorType,
    samples: SensorDataSample[],
  ): Promise<WriteResult> {
    const chunkStartTime = this.getChunkStartTime(samples[0].timestamp);
    const chunkKey = `${sessionId}_${sensorType}_${chunkStartTime}`;

    try {
      // Get or create active chunk
      let activeChunk = this.activeChunks.get(chunkKey);

      if (!activeChunk) {
        activeChunk = await this.createActiveChunk(
          sessionId,
          sensorType,
          chunkStartTime,
        );
        this.activeChunks.set(chunkKey, activeChunk);
        this.stats.chunksInProgress++;
      }

      // Add samples to chunk
      activeChunk.samples.push(...samples);

      // Check if chunk should be flushed
      const shouldFlush = this.shouldFlushChunk(activeChunk);

      if (shouldFlush) {
        return await this.flushChunk(chunkKey);
      }

      return {
        success: true,
        chunkId: activeChunk.chunkId,
        sampleCount: activeChunk.samples.length,
      };
    } catch (error) {
      this.stats.failedWrites++;
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Flush chunk to disk
   */
  async flushChunk(chunkKey: string): Promise<WriteResult> {
    const activeChunk = this.activeChunks.get(chunkKey);

    if (!activeChunk) {
      return {
        success: false,
        error: new Error(`Chunk ${chunkKey} not found`),
      };
    }

    // Queue write to ensure atomicity
    return new Promise((resolve) => {
      this.writeQueue = this.writeQueue
        .then(async () => {
          try {
            const result = await this.writeChunkToFile(activeChunk);

            // Remove from active chunks
            this.activeChunks.delete(chunkKey);
            this.stats.chunksInProgress--;

            // Update statistics
            if (result.success) {
              this.stats.totalChunks++;
              this.stats.totalSamples += result.sampleCount || 0;
              this.stats.totalBytes += result.fileSize || 0;
              this.stats.lastWriteTime = Date.now();
            }

            resolve(result);
          } catch (error) {
            this.stats.failedWrites++;
            resolve({
              success: false,
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
        })
        .catch((error) => {
          console.error('Write queue error:', error);
          resolve({
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        });
    });
  }

  /**
   * Flush all active chunks
   */
  async flushAll(): Promise<WriteResult[]> {
    const chunkKeys = Array.from(this.activeChunks.keys());
    const results: WriteResult[] = [];

    for (const chunkKey of chunkKeys) {
      const result = await this.flushChunk(chunkKey);
      results.push(result);
    }

    return results;
  }

  /**
   * Write chunk to file (atomic operation)
   */
  private async writeChunkToFile(chunk: ActiveChunk): Promise<WriteResult> {
    try {
      // 1. Convert samples to JSONL format
      const jsonlContent = this.samplesToJSONL(chunk.samples);

      // 2. Write to temporary file (atomic write preparation)
      await RNFS.writeFile(chunk.tempFilePath, jsonlContent, 'utf8');

      // 3. Get final file path
      const finalFilePath = this.getFinalFilePath(chunk);

      // 4. Move temp file to final location (atomic operation)
      await RNFS.moveFile(chunk.tempFilePath, finalFilePath);

      // 5. Get file size
      const fileStats = await RNFS.stat(finalFilePath);

      // 6. Save metadata to WatermelonDB
      await this.saveChunkMetadata(chunk, finalFilePath, fileStats.size);

      // 7. Add to SyncQueue
      await this.addToSyncQueue(chunk.chunkId, finalFilePath);

      return {
        success: true,
        chunkId: chunk.chunkId,
        filePath: finalFilePath,
        sampleCount: chunk.samples.length,
        fileSize: Number(fileStats.size),
      };
    } catch (error) {
      // Cleanup temp file on error
      try {
        if (await RNFS.exists(chunk.tempFilePath)) {
          await RNFS.unlink(chunk.tempFilePath);
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }

      throw error;
    }
  }

  /**
   * Convert samples to JSONL format
   * Each line is a JSON object followed by newline
   */
  private samplesToJSONL(samples: SensorDataSample[]): string {
    return samples
      .map((sample) => JSON.stringify(sample))
      .join('\n') + '\n';
  }

  /**
   * Save chunk metadata to WatermelonDB
   */
  private async saveChunkMetadata(
    chunk: ActiveChunk,
    filePath: string,
    fileSize: number,
  ): Promise<void> {
    await database.write(async () => {
      const chunkCollection = database.get<SensorDataChunk>('sensor_data_chunks');

      await chunkCollection.create((record) => {
        record._raw.id = chunk.chunkId;
        record.sessionId = chunk.sessionId;
        record.sensorType = chunk.sensorType.toString();
        record.startTime = chunk.startTime;
        record.endTime = chunk.samples[chunk.samples.length - 1].timestamp;
        record.sampleCount = chunk.samples.length;
        record.filePath = filePath;
        record.fileSize = fileSize;
        record.synced = false;
        record.createdAt = Date.now();
      });
    });
  }

  /**
   * Add chunk to sync queue
   */
  private async addToSyncQueue(chunkId: string, filePath: string): Promise<void> {
    await database.write(async () => {
      const syncQueueCollection = database.get<SyncQueue>('sync_queue');

      await syncQueueCollection.create((record) => {
        record.entityType = 'sensor_data_chunk';
        record.entityId = chunkId;
        record.action = 'upload';
        record.priority = 1;
        record.retryCount = 0;
        record.lastAttempt = null;
        record.createdAt = Date.now();
      });
    });
  }

  /**
   * Create active chunk
   */
  private async createActiveChunk(
    sessionId: string,
    sensorType: AndroidSensorType,
    startTime: number,
  ): Promise<ActiveChunk> {
    const chunkId = this.generateChunkId(sessionId, sensorType, startTime);
    const tempFilePath = `${this.config.chunkDirectory}/temp_${chunkId}.jsonl`;

    return {
      chunkId,
      sessionId,
      sensorType,
      startTime,
      samples: [],
      tempFilePath,
    };
  }

  /**
   * Generate unique chunk ID
   */
  private generateChunkId(
    sessionId: string,
    sensorType: AndroidSensorType,
    startTime: number,
  ): string {
    return `chunk_${sessionId}_${sensorType}_${startTime}`;
  }

  /**
   * Get final file path for chunk
   */
  private getFinalFilePath(chunk: ActiveChunk): string {
    return `${this.config.chunkDirectory}/${chunk.chunkId}.jsonl`;
  }

  /**
   * Get chunk start time (round down to chunk duration)
   */
  private getChunkStartTime(timestamp: number): number {
    return Math.floor(timestamp / this.config.chunkDuration) * this.config.chunkDuration;
  }

  /**
   * Group samples by chunk windows
   */
  private groupSamplesByChunk(
    samples: SensorDataSample[],
  ): Map<string, SensorDataSample[]> {
    const groups = new Map<string, SensorDataSample[]>();

    for (const sample of samples) {
      const chunkStartTime = this.getChunkStartTime(sample.timestamp);
      const chunkKey = chunkStartTime.toString();

      if (!groups.has(chunkKey)) {
        groups.set(chunkKey, []);
      }

      groups.get(chunkKey)!.push(sample);
    }

    return groups;
  }

  /**
   * Check if chunk should be flushed
   */
  private shouldFlushChunk(chunk: ActiveChunk): boolean {
    // Flush if max samples reached
    if (chunk.samples.length >= this.config.maxSamplesPerChunk) {
      return true;
    }

    // Flush if chunk time window has passed
    const now = Date.now();
    const chunkEndTime = chunk.startTime + this.config.chunkDuration;

    if (now >= chunkEndTime) {
      return true;
    }

    return false;
  }

  /**
   * Get statistics
   */
  getStats(): PersistenceStats {
    return {...this.stats};
  }

  /**
   * Get active chunk count
   */
  getActiveChunkCount(): number {
    return this.activeChunks.size;
  }

  /**
   * Get chunk info by session
   */
  async getChunksBySession(sessionId: string): Promise<SensorDataChunk[]> {
    const chunks = await database
      .get<SensorDataChunk>('sensor_data_chunks')
      .query(Q.where('session_id', sessionId))
      .fetch();

    return chunks;
  }

  /**
   * Read chunk file
   */
  async readChunkFile(filePath: string): Promise<SensorDataSample[]> {
    try {
      const content = await RNFS.readFile(filePath, 'utf8');
      const lines = content.trim().split('\n');

      return lines.map((line) => JSON.parse(line) as SensorDataSample);
    } catch (error) {
      console.error('Failed to read chunk file:', error);
      throw error;
    }
  }

  /**
   * Delete chunk file and metadata
   */
  async deleteChunk(chunkId: string): Promise<void> {
    await database.write(async () => {
      // Get chunk metadata
      const chunk = await database
        .get<SensorDataChunk>('sensor_data_chunks')
        .find(chunkId);

      // Delete file
      if (await RNFS.exists(chunk.filePath)) {
        await RNFS.unlink(chunk.filePath);
      }

      // Delete metadata
      await chunk.destroyPermanently();
    });
  }

  /**
   * Cleanup - flush all pending chunks
   */
  async cleanup(): Promise<void> {
    await this.flushAll();
    await this.writeQueue; // Wait for all pending writes
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalChunks: 0,
      totalSamples: 0,
      totalBytes: 0,
      chunksInProgress: 0,
      failedWrites: 0,
      lastWriteTime: null,
    };
  }
}

/**
 * Singleton instance
 */
export const sensorDataPersistence = SensorDataPersistence.getInstance();

/**
 * Export default
 */
export default sensorDataPersistence;
