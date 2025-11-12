/**
 * Step detector service
 * Event-based step detection with walking/running classification
 * Uses accelerometer data to detect steps and classify activity type
 */

import {accelerometer, setUpdateIntervalForType, SensorTypes} from 'react-native-sensors';
import type {Subscription} from 'rxjs';
import {SensorType, type StepDetectorData, StepActivityType} from '@app-types/sensor.types';
import {SensorService, type SensorDataCallback, type SensorErrorCallback} from './SensorService';

/**
 * Step detection configuration
 */
interface StepDetectionConfig {
  // Minimum acceleration magnitude to consider as potential step
  minMagnitude: number;
  // Maximum time between peaks to consider as same step (ms)
  maxTimeBetweenSteps: number;
  // Minimum time between peaks to avoid duplicates (ms)
  minTimeBetweenSteps: number;
  // Threshold for running vs walking (acceleration magnitude)
  runningThreshold: number;
  // Window size for activity classification (number of steps)
  activityWindowSize: number;
}

/**
 * Default step detection configuration
 */
const DEFAULT_CONFIG: StepDetectionConfig = {
  minMagnitude: 1.5, // m/s² above gravity
  maxTimeBetweenSteps: 2000, // 2 seconds
  minTimeBetweenSteps: 200, // 200ms (max 5 steps per second)
  runningThreshold: 2.5, // Higher acceleration = running
  activityWindowSize: 5, // Classify based on last 5 steps
};

/**
 * Accelerometer reading for step detection
 */
interface AccelReading {
  magnitude: number;
  timestamp: number;
}

export class StepDetectorService extends SensorService<StepDetectorData> {
  private subscription: Subscription | null = null;
  private config: StepDetectionConfig = DEFAULT_CONFIG;

  // Step detection state
  private lastPeakTime: number = 0;
  private lastPeakMagnitude: number = 0;
  private recentReadings: AccelReading[] = [];
  private recentStepMagnitudes: number[] = [];
  private bootTimeOffset: number = 0;

  // Activity detection
  private activityDetectionEnabled: boolean = true;

  constructor() {
    super();
    // Calculate boot time offset (approximate)
    this.bootTimeOffset = Date.now() - performance.now();
  }

  getSensorType(): SensorType {
    return SensorType.STEP_DETECTOR;
  }

  /**
   * Configure step detection parameters
   */
  configure(config: Partial<StepDetectionConfig>): void {
    this.config = {...this.config, ...config};
  }

  /**
   * Enable/disable activity detection (walking vs running)
   */
  setActivityDetection(enabled: boolean): void {
    this.activityDetectionEnabled = enabled;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Step detector uses accelerometer, so check its availability
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
    onData: SensorDataCallback<StepDetectorData>,
    onError?: SensorErrorCallback,
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Step detector service is already running');
    }

    // Set high update rate for accurate step detection (50 Hz)
    const updateInterval = 20; // 20ms = 50 Hz
    setUpdateIntervalForType(SensorTypes.accelerometer, updateInterval);

    this.sessionId = sessionId;
    this.dataCallback = onData;
    this.errorCallback = onError || null;

    // Reset state
    this.lastPeakTime = 0;
    this.lastPeakMagnitude = 0;
    this.recentReadings = [];
    this.recentStepMagnitudes = [];

    return new Promise((resolve, reject) => {
      try {
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
      if (timeSinceLastPeak < this.config.maxTimeBetweenSteps) {
        // Valid step detected
        this.onStepDetected(current);
      } else if (this.lastPeakTime > 0) {
        // Too much time passed, might be starting new activity
        this.recentStepMagnitudes = [];
        this.onStepDetected(current);
      } else {
        // First step
        this.onStepDetected(current);
      }

      this.lastPeakTime = current.timestamp;
      this.lastPeakMagnitude = current.magnitude;
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

    for (let i = currentIndex + 1; i < Math.min(this.recentReadings.length, currentIndex + windowSize); i++) {
      if (this.recentReadings[i].magnitude > current.magnitude) {
        return false;
      }
    }

    return true;
  }

  /**
   * Handle detected step
   */
  private onStepDetected(reading: AccelReading): void {
    if (!this.dataCallback || !this.sessionId) {
      return;
    }

    // Store magnitude for activity classification
    this.recentStepMagnitudes.push(reading.magnitude);
    if (this.recentStepMagnitudes.length > this.config.activityWindowSize) {
      this.recentStepMagnitudes.shift();
    }

    // Classify activity type
    const activityType = this.classifyActivity();

    // Calculate confidence based on consistency of recent magnitudes
    const confidence = this.calculateConfidence();

    // Calculate elapsed realtime in nanoseconds (approximate)
    const elapsedMs = performance.now();
    const elapsedRealtimeNanos = Math.floor(elapsedMs * 1_000_000);

    // Create step event
    const stepData: StepDetectorData = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sensorType: SensorType.STEP_DETECTOR,
      timestamp: reading.timestamp,
      sessionId: this.sessionId,
      elapsedRealtimeNanos,
      utcEpochMs: reading.timestamp,
      activityType,
      confidence,
      isUploaded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.dataCallback(stepData);
  }

  /**
   * Classify activity type based on recent step magnitudes
   */
  private classifyActivity(): StepActivityType {
    if (!this.activityDetectionEnabled || this.recentStepMagnitudes.length < 2) {
      return StepActivityType.UNKNOWN;
    }

    // Calculate average magnitude
    const avgMagnitude = this.recentStepMagnitudes.reduce((sum, m) => sum + m, 0) / this.recentStepMagnitudes.length;

    // Classify based on threshold
    if (avgMagnitude >= this.config.runningThreshold) {
      return StepActivityType.RUNNING;
    } else {
      return StepActivityType.WALKING;
    }
  }

  /**
   * Calculate confidence level for activity classification
   */
  private calculateConfidence(): number {
    if (this.recentStepMagnitudes.length < 2) {
      return 0.5; // Low confidence with insufficient data
    }

    // Calculate standard deviation
    const mean = this.recentStepMagnitudes.reduce((sum, m) => sum + m, 0) / this.recentStepMagnitudes.length;
    const variance = this.recentStepMagnitudes.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / this.recentStepMagnitudes.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher confidence
    // Normalize to 0-1 range (assuming max std dev of 2.0)
    const confidence = Math.max(0, Math.min(1, 1 - (stdDev / 2.0)));

    return confidence;
  }

  /**
   * Get current step detection statistics
   */
  getStatistics(): {
    averageMagnitude: number;
    activityType: StepActivityType;
    confidence: number;
  } {
    return {
      averageMagnitude: this.recentStepMagnitudes.length > 0
        ? this.recentStepMagnitudes.reduce((sum, m) => sum + m, 0) / this.recentStepMagnitudes.length
        : 0,
      activityType: this.classifyActivity(),
      confidence: this.calculateConfidence(),
    };
  }
}
