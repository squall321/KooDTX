/**
 * Step counter service
 * Cumulative step counting with boot detection
 * Tracks total step count since device boot
 */

import {accelerometer, setUpdateIntervalForType, SensorTypes} from 'react-native-sensors';
import type {Subscription} from 'rxjs';
import {SensorType, type StepCounterData} from '@app-types/sensor.types';
import {SensorService, type SensorDataCallback, type SensorErrorCallback} from './SensorService';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys for persisting step counter state
 */
const STORAGE_KEYS = {
  BOOT_TIME: '@step_counter_boot_time',
  LAST_COUNT: '@step_counter_last_count',
  SESSION_START_COUNT: '@step_counter_session_start',
};

/**
 * Step counter configuration
 */
interface StepCounterConfig {
  // Sample interval in milliseconds
  sampleInterval: number;
  // Minimum acceleration magnitude to consider as potential step
  minMagnitude: number;
  // Maximum time between peaks to consider as same step (ms)
  maxTimeBetweenSteps: number;
  // Minimum time between peaks to avoid duplicates (ms)
  minTimeBetweenSteps: number;
}

/**
 * Default step counter configuration
 */
const DEFAULT_CONFIG: StepCounterConfig = {
  sampleInterval: 1000, // 1 second
  minMagnitude: 1.5,
  maxTimeBetweenSteps: 2000,
  minTimeBetweenSteps: 200,
};

/**
 * Accelerometer reading for step detection
 */
interface AccelReading {
  magnitude: number;
  timestamp: number;
}

export class StepCounterService extends SensorService<StepCounterData> {
  private subscription: Subscription | null = null;
  private sampleTimer: NodeJS.Timeout | null = null;
  private config: StepCounterConfig = DEFAULT_CONFIG;

  // Step counting state
  private cumulativeCount: number = 0;
  private lastReportedCount: number = 0;
  private sessionStartCount: number = 0;
  private bootTime: number = 0;

  // Step detection state (similar to StepDetectorService)
  private lastPeakTime: number = 0;
  private recentReadings: AccelReading[] = [];

  constructor() {
    super();
    this.loadPersistedState();
  }

  getSensorType(): SensorType {
    return SensorType.STEP_COUNTER;
  }

  /**
   * Load persisted state from AsyncStorage
   */
  private async loadPersistedState(): Promise<void> {
    try {
      const [bootTime, lastCount, sessionStart] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BOOT_TIME),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_START_COUNT),
      ]);

      const currentBootTime = Date.now() - performance.now();

      // Check if device was rebooted
      if (bootTime && parseFloat(bootTime) !== currentBootTime) {
        // Device rebooted, reset counts
        this.bootTime = currentBootTime;
        this.cumulativeCount = 0;
        this.lastReportedCount = 0;
        this.sessionStartCount = 0;
        await this.persistState();
      } else {
        // Same boot session, restore state
        this.bootTime = bootTime ? parseFloat(bootTime) : currentBootTime;
        this.cumulativeCount = lastCount ? parseInt(lastCount, 10) : 0;
        this.lastReportedCount = this.cumulativeCount;
        this.sessionStartCount = sessionStart ? parseInt(sessionStart, 10) : 0;
      }
    } catch (error) {
      console.error('Failed to load step counter state:', error);
      this.bootTime = Date.now() - performance.now();
      this.cumulativeCount = 0;
      this.lastReportedCount = 0;
      this.sessionStartCount = 0;
    }
  }

  /**
   * Persist current state to AsyncStorage
   */
  private async persistState(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.BOOT_TIME, this.bootTime.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_COUNT, this.cumulativeCount.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.SESSION_START_COUNT, this.sessionStartCount.toString()),
      ]);
    } catch (error) {
      console.error('Failed to persist step counter state:', error);
    }
  }

  /**
   * Configure step counter parameters
   */
  configure(config: Partial<StepCounterConfig>): void {
    this.config = {...this.config, ...config};
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Step counter uses accelerometer, so check its availability
      const testSubscription = accelerometer.subscribe(
        () => {
          testSubscription.unsubscribe();
        },
        () => {
          testSubscription.unsubscribe();
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async start(
    sessionId: string,
    onData: SensorDataCallback<StepCounterData>,
    onError?: SensorErrorCallback,
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Step counter service is already running');
    }

    // Set high update rate for accurate step detection (50 Hz)
    const updateInterval = 20; // 20ms = 50 Hz
    setUpdateIntervalForType(SensorTypes.accelerometer, updateInterval);

    this.sessionId = sessionId;
    this.dataCallback = onData;
    this.errorCallback = onError || null;

    // Record session start count
    this.sessionStartCount = this.cumulativeCount;
    await this.persistState();

    // Reset detection state
    this.lastPeakTime = 0;
    this.recentReadings = [];

    return new Promise((resolve, reject) => {
      try {
        // Start accelerometer monitoring for step detection
        this.subscription = accelerometer.subscribe(
          ({x, y, z, timestamp}) => {
            this.processAccelerometerData(x, y, z, timestamp || Date.now());
          },
          error => {
            this.isRunning = false;
            if (this.errorCallback) {
              this.errorCallback(
                error instanceof Error ? error : new Error(String(error)),
              );
            }
            reject(error);
          },
        );

        // Start periodic sampling
        this.sampleTimer = setInterval(() => {
          this.emitSample();
        }, this.config.sampleInterval);

        this.isRunning = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
      this.sampleTimer = null;
    }

    // Persist final state
    await this.persistState();

    this.cleanup();
  }

  /**
   * Process accelerometer data for step detection
   */
  private processAccelerometerData(
    x: number,
    y: number,
    z: number,
    timestamp: number,
  ): void {
    // Calculate magnitude (removing gravity approximately)
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const magnitudeWithoutGravity = Math.abs(magnitude - 9.81);

    // Store reading
    const reading: AccelReading = {
      magnitude: magnitudeWithoutGravity,
      timestamp,
    };
    this.recentReadings.push(reading);

    // Keep only recent readings (last 1 second)
    const cutoffTime = timestamp - 1000;
    this.recentReadings = this.recentReadings.filter(r => r.timestamp > cutoffTime);

    // Detect step using peak detection
    this.detectStep(reading);
  }

  /**
   * Detect steps using peak detection algorithm
   */
  private detectStep(current: AccelReading): void {
    // Check if this could be a peak
    if (current.magnitude < this.config.minMagnitude) {
      return;
    }

    const timeSinceLastPeak = current.timestamp - this.lastPeakTime;

    // Ignore if too soon after last peak (debouncing)
    if (timeSinceLastPeak < this.config.minTimeBetweenSteps) {
      return;
    }

    // Check if this is a local maximum (peak)
    const isPeak = this.isLocalMaximum(current);

    if (isPeak) {
      // Check if enough time has passed since last step
      if (
        timeSinceLastPeak < this.config.maxTimeBetweenSteps ||
        this.lastPeakTime === 0
      ) {
        // Valid step detected
        this.onStepDetected();
        this.lastPeakTime = current.timestamp;
      } else {
        // Too much time passed, might be starting new activity
        this.onStepDetected();
        this.lastPeakTime = current.timestamp;
      }
    }
  }

  /**
   * Check if current reading is a local maximum
   */
  private isLocalMaximum(current: AccelReading): boolean {
    const windowSize = 5; // Check 5 readings before and after
    const currentIndex = this.recentReadings.indexOf(current);

    if (currentIndex < windowSize || currentIndex >= this.recentReadings.length - 1) {
      return false; // Not enough data yet
    }

    // Check if current is greater than neighbors
    for (let i = Math.max(0, currentIndex - windowSize); i < currentIndex; i++) {
      if (this.recentReadings[i].magnitude >= current.magnitude) {
        return false;
      }
    }

    for (
      let i = currentIndex + 1;
      i < Math.min(this.recentReadings.length, currentIndex + windowSize);
      i++
    ) {
      if (this.recentReadings[i].magnitude > current.magnitude) {
        return false;
      }
    }

    return true;
  }

  /**
   * Handle detected step (increment cumulative count)
   */
  private onStepDetected(): void {
    this.cumulativeCount++;
  }

  /**
   * Emit a sample with current step count
   */
  private async emitSample(): Promise<void> {
    if (!this.dataCallback || !this.sessionId) {
      return;
    }

    // Calculate delta since last reported sample
    const delta = this.cumulativeCount - this.lastReportedCount;

    // Calculate elapsed realtime in nanoseconds (approximate)
    const elapsedMs = performance.now();
    const elapsedRealtimeNanos = Math.floor(elapsedMs * 1_000_000);

    // Create step count sample
    const sampleData: StepCounterData = {
      id: `step-count-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sensorType: SensorType.STEP_COUNTER,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      elapsedRealtimeNanos,
      count: this.cumulativeCount,
      delta,
      isUploaded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.dataCallback(sampleData);
    this.lastReportedCount = this.cumulativeCount;

    // Periodically persist state (every 10 samples)
    if (this.cumulativeCount % 10 === 0) {
      await this.persistState();
    }
  }

  /**
   * Get current step count statistics
   */
  getStatistics(): {
    totalSteps: number;
    sessionSteps: number;
    bootTime: number;
  } {
    return {
      totalSteps: this.cumulativeCount,
      sessionSteps: this.cumulativeCount - this.sessionStartCount,
      bootTime: this.bootTime,
    };
  }

  /**
   * Reset step count (for testing purposes)
   */
  async reset(): Promise<void> {
    this.cumulativeCount = 0;
    this.lastReportedCount = 0;
    this.sessionStartCount = 0;
    await this.persistState();
  }

  /**
   * Get session step count (steps since session started)
   */
  getSessionStepCount(): number {
    return this.cumulativeCount - this.sessionStartCount;
  }
}
