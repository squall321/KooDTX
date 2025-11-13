/**
 * Sensor Data Stream
 * Handles real-time sensor data streaming with backpressure handling
 */

import {EmitterSubscription} from 'react-native';
import {
  NativeSensorBridge,
  AndroidSensorType,
  SensorDataBatch,
  SensorDataSample,
} from '@native';

/**
 * Stream state
 */
export enum StreamState {
  IDLE = 'idle',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
}

/**
 * Stream statistics
 */
export interface StreamStats {
  totalSamples: number;
  samplesPerSecond: number;
  droppedSamples: number;
  lastUpdate: number;
  bufferUtilization: number; // 0-1
}

/**
 * Stream data handler
 */
export type StreamDataHandler = (
  sensorType: AndroidSensorType,
  samples: SensorDataSample[],
) => void | Promise<void>;

/**
 * Stream error handler
 */
export type StreamErrorHandler = (error: Error) => void;

/**
 * Stream options
 */
export interface StreamOptions {
  maxBufferSize?: number; // Maximum buffer size before dropping
  maxProcessingTime?: number; // Maximum time to process (ms)
  dropStrategy?: 'oldest' | 'newest'; // Which samples to drop
  enableBackpressure?: boolean; // Enable backpressure handling
  statsInterval?: number; // Stats update interval (ms)
}

/**
 * Sensor Data Stream
 * Manages real-time sensor data streaming with backpressure
 */
export class SensorDataStream {
  private sensorType: AndroidSensorType;
  private state: StreamState = StreamState.IDLE;
  private dataHandler?: StreamDataHandler;
  private errorHandler?: StreamErrorHandler;
  private subscription?: () => void;

  // Buffer management
  private buffer: SensorDataSample[] = [];
  private maxBufferSize: number;
  private dropStrategy: 'oldest' | 'newest';
  private enableBackpressure: boolean;
  private isProcessing: boolean = false;

  // Statistics
  private stats: StreamStats = {
    totalSamples: 0,
    samplesPerSecond: 0,
    droppedSamples: 0,
    lastUpdate: Date.now(),
    bufferUtilization: 0,
  };
  private sampleCountWindow: number[] = [];
  private statsInterval?: NodeJS.Timeout;

  // Processing
  private maxProcessingTime: number;
  private processingQueue: Promise<void> = Promise.resolve();

  constructor(sensorType: AndroidSensorType, options: StreamOptions = {}) {
    this.sensorType = sensorType;
    this.maxBufferSize = options.maxBufferSize || 1000;
    this.maxProcessingTime = options.maxProcessingTime || 100;
    this.dropStrategy = options.dropStrategy || 'oldest';
    this.enableBackpressure = options.enableBackpressure ?? true;

    if (options.statsInterval) {
      this.startStatsTracking(options.statsInterval);
    }
  }

  /**
   * Start streaming
   */
  start(
    dataHandler: StreamDataHandler,
    errorHandler?: StreamErrorHandler,
  ): void {
    if (this.state === StreamState.ACTIVE) {
      console.warn(
        `Stream for sensor ${this.sensorType} is already active`,
      );
      return;
    }

    this.dataHandler = dataHandler;
    this.errorHandler = errorHandler;
    this.state = StreamState.ACTIVE;
    this.buffer = [];
    this.isProcessing = false;

    // Subscribe to sensor data
    this.subscription = NativeSensorBridge.addDataListener(
      this.sensorType,
      this.handleBatch.bind(this),
    );
  }

  /**
   * Stop streaming
   */
  async stop(): Promise<void> {
    if (this.state === StreamState.IDLE) {
      return;
    }

    this.state = StreamState.IDLE;

    // Unsubscribe
    if (this.subscription) {
      this.subscription();
      this.subscription = undefined;
    }

    // Flush remaining buffer
    await this.flush();

    // Clear handlers
    this.dataHandler = undefined;
    this.errorHandler = undefined;
  }

  /**
   * Pause streaming (stop processing but keep subscription)
   */
  pause(): void {
    if (this.state === StreamState.ACTIVE) {
      this.state = StreamState.PAUSED;
    }
  }

  /**
   * Resume streaming
   */
  resume(): void {
    if (this.state === StreamState.PAUSED) {
      this.state = StreamState.ACTIVE;
      this.processBuffer();
    }
  }

  /**
   * Get current state
   */
  getState(): StreamState {
    return this.state;
  }

  /**
   * Get current statistics
   */
  getStats(): StreamStats {
    return {...this.stats};
  }

  /**
   * Flush remaining buffer
   */
  async flush(): Promise<void> {
    if (this.buffer.length > 0) {
      await this.processBuffer();
    }

    // Wait for pending processing
    await this.processingQueue;
  }

  /**
   * Handle incoming batch
   */
  private handleBatch(batch: SensorDataBatch): void {
    if (this.state === StreamState.IDLE) {
      return;
    }

    // Update stats
    this.stats.totalSamples += batch.count;
    this.sampleCountWindow.push(batch.count);

    // Add to buffer
    if (this.enableBackpressure && this.buffer.length >= this.maxBufferSize) {
      // Buffer overflow - drop samples
      this.handleBufferOverflow(batch.data);
    } else {
      this.buffer.push(...batch.data);
      this.stats.bufferUtilization = this.buffer.length / this.maxBufferSize;
    }

    // Process buffer if not paused
    if (this.state === StreamState.ACTIVE) {
      this.processBuffer();
    }
  }

  /**
   * Handle buffer overflow
   */
  private handleBufferOverflow(newSamples: SensorDataSample[]): void {
    const overflow = this.buffer.length + newSamples.length - this.maxBufferSize;

    if (this.dropStrategy === 'oldest') {
      // Drop oldest samples
      const dropped = this.buffer.splice(0, overflow);
      this.stats.droppedSamples += dropped.length;
      this.buffer.push(...newSamples);
    } else {
      // Drop newest samples
      const kept = newSamples.slice(0, this.maxBufferSize - this.buffer.length);
      this.buffer.push(...kept);
      this.stats.droppedSamples += newSamples.length - kept.length;
    }

    console.warn(
      `Buffer overflow for sensor ${this.sensorType}: dropped ${overflow} samples`,
    );
  }

  /**
   * Process buffer
   */
  private processBuffer(): void {
    if (this.isProcessing || this.buffer.length === 0 || !this.dataHandler) {
      return;
    }

    this.isProcessing = true;

    // Chain processing to avoid concurrent calls
    this.processingQueue = this.processingQueue
      .then(async () => {
        try {
          // Extract samples from buffer
          const samples = this.buffer.splice(0, this.buffer.length);
          this.stats.bufferUtilization = 0;

          // Process with timeout
          await this.processWithTimeout(samples);
        } catch (error) {
          this.handleError(error as Error);
        } finally {
          this.isProcessing = false;

          // Process remaining buffer if any
          if (this.buffer.length > 0 && this.state === StreamState.ACTIVE) {
            this.processBuffer();
          }
        }
      })
      .catch(error => {
        console.error('Processing queue error:', error);
        this.isProcessing = false;
      });
  }

  /**
   * Process samples with timeout
   */
  private async processWithTimeout(
    samples: SensorDataSample[],
  ): Promise<void> {
    if (!this.dataHandler) {
      return;
    }

    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Processing timeout'));
      }, this.maxProcessingTime);
    });

    try {
      const processingPromise = Promise.resolve(
        this.dataHandler(this.sensorType, samples),
      );
      await Promise.race([processingPromise, timeoutPromise]);
    } catch (error) {
      if ((error as Error).message === 'Processing timeout') {
        console.error(
          `Processing timeout for sensor ${this.sensorType}: ${samples.length} samples took > ${this.maxProcessingTime}ms`,
        );
      }
      throw error;
    }
  }

  /**
   * Handle error
   */
  private handleError(error: Error): void {
    console.error(`Stream error for sensor ${this.sensorType}:`, error);
    this.state = StreamState.ERROR;

    if (this.errorHandler) {
      this.errorHandler(error);
    }
  }

  /**
   * Start statistics tracking
   */
  private startStatsTracking(interval: number): void {
    this.statsInterval = setInterval(() => {
      this.updateStats();
    }, interval);
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const now = Date.now();
    const elapsed = (now - this.stats.lastUpdate) / 1000; // seconds

    if (elapsed > 0) {
      // Calculate samples per second
      const samplesInWindow = this.sampleCountWindow.reduce(
        (sum, count) => sum + count,
        0,
      );
      this.stats.samplesPerSecond = samplesInWindow / elapsed;

      // Reset window
      this.sampleCountWindow = [];
      this.stats.lastUpdate = now;
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stop();

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = undefined;
    }

    this.buffer = [];
    this.sampleCountWindow = [];
  }
}

/**
 * Stream Manager
 * Manages multiple sensor streams
 */
export class StreamManager {
  private streams: Map<AndroidSensorType, SensorDataStream> = new Map();
  private globalErrorHandler?: StreamErrorHandler;

  /**
   * Create or get stream for sensor
   */
  getStream(
    sensorType: AndroidSensorType,
    options?: StreamOptions,
  ): SensorDataStream {
    let stream = this.streams.get(sensorType);

    if (!stream) {
      stream = new SensorDataStream(sensorType, options);
      this.streams.set(sensorType, stream);
    }

    return stream;
  }

  /**
   * Start stream
   */
  startStream(
    sensorType: AndroidSensorType,
    dataHandler: StreamDataHandler,
    errorHandler?: StreamErrorHandler,
    options?: StreamOptions,
  ): SensorDataStream {
    const stream = this.getStream(sensorType, options);
    const handler = errorHandler || this.globalErrorHandler;
    stream.start(dataHandler, handler);
    return stream;
  }

  /**
   * Stop stream
   */
  async stopStream(sensorType: AndroidSensorType): Promise<void> {
    const stream = this.streams.get(sensorType);
    if (stream) {
      await stream.stop();
    }
  }

  /**
   * Stop all streams
   */
  async stopAllStreams(): Promise<void> {
    const stopPromises = Array.from(this.streams.values()).map(stream =>
      stream.stop(),
    );
    await Promise.all(stopPromises);
  }

  /**
   * Flush all streams
   */
  async flushAllStreams(): Promise<void> {
    const flushPromises = Array.from(this.streams.values()).map(stream =>
      stream.flush(),
    );
    await Promise.all(flushPromises);
  }

  /**
   * Get all statistics
   */
  getAllStats(): Map<AndroidSensorType, StreamStats> {
    const stats = new Map<AndroidSensorType, StreamStats>();
    this.streams.forEach((stream, sensorType) => {
      stats.set(sensorType, stream.getStats());
    });
    return stats;
  }

  /**
   * Set global error handler
   */
  setGlobalErrorHandler(handler: StreamErrorHandler): void {
    this.globalErrorHandler = handler;
  }

  /**
   * Cleanup all streams
   */
  cleanup(): void {
    this.streams.forEach(stream => stream.cleanup());
    this.streams.clear();
    this.globalErrorHandler = undefined;
  }
}

/**
 * Singleton instance
 */
export const streamManager = new StreamManager();

/**
 * Export default
 */
export default streamManager;
