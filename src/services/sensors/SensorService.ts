/**
 * Base sensor service abstract class
 * All sensor services should extend this class
 */

import type {SensorType, SensorData} from '@app-types/sensor.types';

/**
 * Sensor callback types
 */
export type SensorDataCallback<T extends SensorData = SensorData> = (
  data: T,
) => void;
export type SensorErrorCallback = (error: Error) => void;

/**
 * Abstract sensor service class
 * Provides common interface for all sensor services
 */
export abstract class SensorService<T extends SensorData = SensorData> {
  protected isRunning: boolean = false;
  protected sampleRate: number;
  protected sessionId: string | null = null;
  protected dataCallback: SensorDataCallback<T> | null = null;
  protected errorCallback: SensorErrorCallback | null = null;

  constructor(sampleRate: number = 100) {
    this.sampleRate = sampleRate;
  }

  /**
   * Get sensor type
   */
  abstract getSensorType(): SensorType;

  /**
   * Start sensor data collection
   */
  abstract start(
    sessionId: string,
    onData: SensorDataCallback<T>,
    onError?: SensorErrorCallback,
  ): Promise<void>;

  /**
   * Stop sensor data collection
   */
  abstract stop(): Promise<void>;

  /**
   * Check if sensor is available
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Set sample rate (Hz)
   */
  setSampleRate(rate: number): void {
    if (rate <= 0) {
      throw new Error('Sample rate must be positive');
    }
    this.sampleRate = rate;
  }

  /**
   * Get current sample rate
   */
  getSampleRate(): number {
    return this.sampleRate;
  }

  /**
   * Check if sensor is currently running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.dataCallback = null;
    this.errorCallback = null;
    this.sessionId = null;
    this.isRunning = false;
  }
}
