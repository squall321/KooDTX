/**
 * Sensor Data Buffer
 * Manages buffering and batching of sensor data
 */

import type {SensorData, SensorType} from '@app-types/sensor.types';

export interface BufferConfig {
  maxSize?: number;
  flushInterval?: number;
  onFlush?: (batch: SensorData[]) => void | Promise<void>;
  autoFlush?: boolean;
}

export interface BufferStats {
  totalReceived: number;
  totalFlushed: number;
  currentSize: number;
  lastFlushTime: number | null;
  flushCount: number;
}

/**
 * SensorDataBuffer class
 * Buffers sensor data and flushes in batches
 */
export class SensorDataBuffer {
  private buffer: SensorData[] = [];
  private maxSize: number;
  private flushInterval: number;
  private onFlush: ((batch: SensorData[]) => void | Promise<void>) | null;
  private autoFlush: boolean;
  private flushTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  // Statistics
  private stats: BufferStats = {
    totalReceived: 0,
    totalFlushed: 0,
    currentSize: 0,
    lastFlushTime: null,
    flushCount: 0,
  };

  constructor(config: BufferConfig = {}) {
    this.maxSize = config.maxSize || 100;
    this.flushInterval = config.flushInterval || 1000;
    this.onFlush = config.onFlush || null;
    this.autoFlush = config.autoFlush !== false;
  }

  /**
   * Start the buffer (enables auto-flush if configured)
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    if (this.autoFlush && this.flushInterval > 0) {
      this.startFlushTimer();
    }
  }

  /**
   * Stop the buffer (disables auto-flush)
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.stopFlushTimer();

    // Flush remaining data
    if (this.buffer.length > 0) {
      await this.flush();
    }

    this.isRunning = false;
  }

  /**
   * Add data to buffer
   */
  add(data: SensorData): void {
    this.buffer.push(data);
    this.stats.totalReceived++;
    this.stats.currentSize = this.buffer.length;

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.maxSize) {
      this.flush();
    }
  }

  /**
   * Add multiple data points to buffer
   */
  addBatch(data: SensorData[]): void {
    data.forEach(item => this.add(item));
  }

  /**
   * Flush buffer
   */
  async flush(): Promise<SensorData[]> {
    if (this.buffer.length === 0) {
      return [];
    }

    const batch = [...this.buffer];
    this.buffer = [];
    this.stats.currentSize = 0;
    this.stats.totalFlushed += batch.length;
    this.stats.lastFlushTime = Date.now();
    this.stats.flushCount++;

    if (this.onFlush) {
      try {
        await this.onFlush(batch);
      } catch (error) {
        // If flush fails, restore the buffer
        this.buffer = [...batch, ...this.buffer];
        this.stats.currentSize = this.buffer.length;
        throw error;
      }
    }

    return batch;
  }

  /**
   * Clear buffer without flushing
   */
  clear(): void {
    this.buffer = [];
    this.stats.currentSize = 0;
  }

  /**
   * Get current buffer
   */
  getBuffer(): SensorData[] {
    return [...this.buffer];
  }

  /**
   * Get buffer size
   */
  getSize(): number {
    return this.buffer.length;
  }

  /**
   * Get buffer statistics
   */
  getStats(): BufferStats {
    return {...this.stats};
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalReceived: 0,
      totalFlushed: 0,
      currentSize: this.buffer.length,
      lastFlushTime: null,
      flushCount: 0,
    };
  }

  /**
   * Get data by sensor type
   */
  getBySensorType(sensorType: SensorType): SensorData[] {
    return this.buffer.filter(data => data.sensorType === sensorType);
  }

  /**
   * Get data count by sensor type
   */
  getCountBySensorType(): Record<SensorType, number> {
    const counts = {} as Record<SensorType, number>;

    this.buffer.forEach(data => {
      counts[data.sensorType] = (counts[data.sensorType] || 0) + 1;
    });

    return counts;
  }

  /**
   * Filter buffer by time range
   */
  filterByTimeRange(startTime: number, endTime: number): SensorData[] {
    return this.buffer.filter(
      data => data.timestamp >= startTime && data.timestamp <= endTime,
    );
  }

  /**
   * Set flush callback
   */
  setFlushCallback(callback: (batch: SensorData[]) => void | Promise<void>): void {
    this.onFlush = callback;
  }

  /**
   * Set max buffer size
   */
  setMaxSize(size: number): void {
    if (size <= 0) {
      throw new Error('Max size must be positive');
    }
    this.maxSize = size;

    // If current buffer exceeds new max size, flush
    if (this.buffer.length >= this.maxSize) {
      this.flush();
    }
  }

  /**
   * Set flush interval
   */
  setFlushInterval(interval: number): void {
    if (interval < 0) {
      throw new Error('Flush interval must be non-negative');
    }
    this.flushInterval = interval;

    // Restart timer if running
    if (this.isRunning && this.autoFlush) {
      this.stopFlushTimer();
      if (interval > 0) {
        this.startFlushTimer();
      }
    }
  }

  /**
   * Check if buffer is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      return;
    }

    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush().catch(() => {
          // Ignore flush errors in auto-flush
        });
      }
    }, this.flushInterval);
  }

  /**
   * Stop flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
