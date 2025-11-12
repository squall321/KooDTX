/**
 * Significant motion service
 * One-shot event detection for falls, throws, shakes, and impacts
 * Automatically resets after each detection
 */

import {accelerometer, setUpdateIntervalForType, SensorTypes} from 'react-native-sensors';
import type {Subscription} from 'rxjs';
import {
  SensorType,
  type SignificantMotionData,
  SignificantMotionType,
} from '@app-types/sensor.types';
import {SensorService, type SensorDataCallback, type SensorErrorCallback} from './SensorService';

/**
 * Significant motion configuration
 */
interface SignificantMotionConfig {
  // Minimum magnitude to consider significant (m/s²)
  minMagnitude: number;
  // Free fall threshold (acceleration close to 0)
  freeFallThreshold: number;
  // Free fall duration requirement (ms)
  freeFallDuration: number;
  // Impact threshold (sudden high acceleration)
  impactThreshold: number;
  // Shake frequency threshold (oscillations per second)
  shakeFrequency: number;
  // Shake duration (ms)
  shakeDuration: number;
  // Auto re-enable after detection (ms)
  autoReEnableDelay: number;
  // Motion classification enabled
  classificationEnabled: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SignificantMotionConfig = {
  minMagnitude: 15.0, // 15 m/s² (significant motion)
  freeFallThreshold: 2.0, // < 2 m/s² (near weightless)
  freeFallDuration: 200, // 200ms minimum
  impactThreshold: 25.0, // 25 m/s² (strong impact)
  shakeFrequency: 3, // 3 Hz minimum
  shakeDuration: 500, // 500ms
  autoReEnableDelay: 2000, // 2 seconds
  classificationEnabled: true,
};

/**
 * Accelerometer reading
 */
interface AccelReading {
  magnitude: number;
  timestamp: number;
  x: number;
  y: number;
  z: number;
}

export class SignificantMotionService extends SensorService<SignificantMotionData> {
  private subscription: Subscription | null = null;
  private config: SignificantMotionConfig = DEFAULT_CONFIG;

  // Detection state
  private recentReadings: AccelReading[] = [];
  private isDetected: boolean = false;
  private detectionStartTime: number = 0;
  private motionStartTime: number = 0;
  private reEnableTimer: NodeJS.Timeout | null = null;

  // Free fall tracking
  private freeFallStartTime: number = 0;
  private isInFreeFall: boolean = false;

  constructor() {
    super();
  }

  getSensorType(): SensorType {
    return SensorType.SIGNIFICANT_MOTION;
  }

  /**
   * Configure detection parameters
   */
  configure(config: Partial<SignificantMotionConfig>): void {
    this.config = {...this.config, ...config};
  }

  /**
   * Enable/disable motion classification
   */
  setClassification(enabled: boolean): void {
    this.config.classificationEnabled = enabled;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Uses accelerometer for motion detection
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
    onData: SensorDataCallback<SignificantMotionData>,
    onError?: SensorErrorCallback,
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Significant motion service is already running');
    }

    // Set high update rate for accurate detection (100 Hz)
    const updateInterval = 10; // 10ms = 100 Hz
    setUpdateIntervalForType(SensorTypes.accelerometer, updateInterval);

    this.sessionId = sessionId;
    this.dataCallback = onData;
    this.errorCallback = onError || null;

    // Reset detection state
    this.isDetected = false;
    this.recentReadings = [];
    this.freeFallStartTime = 0;
    this.isInFreeFall = false;
    this.motionStartTime = 0;

    return new Promise((resolve, reject) => {
      try {
        this.subscription = accelerometer.subscribe(
          ({x, y, z, timestamp}) => {
            if (!this.isDetected) {
              this.processAccelerometerData(x, y, z, timestamp || Date.now());
            }
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

    if (this.reEnableTimer) {
      clearTimeout(this.reEnableTimer);
      this.reEnableTimer = null;
    }

    this.cleanup();
  }

  /**
   * Process accelerometer data for significant motion detection
   */
  private processAccelerometerData(
    x: number,
    y: number,
    z: number,
    timestamp: number,
  ): void {
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Store reading
    const reading: AccelReading = {
      magnitude,
      timestamp,
      x,
      y,
      z,
    };
    this.recentReadings.push(reading);

    // Keep only recent readings (last 2 seconds)
    const cutoffTime = timestamp - 2000;
    this.recentReadings = this.recentReadings.filter(r => r.timestamp > cutoffTime);

    // Check for significant motion
    this.detectSignificantMotion(reading);
  }

  /**
   * Detect significant motion
   */
  private detectSignificantMotion(current: AccelReading): void {
    // Check for free fall
    if (this.detectFreeFall(current)) {
      return; // Free fall detected, event already triggered
    }

    // Check for impact
    if (this.detectImpact(current)) {
      return; // Impact detected, event already triggered
    }

    // Check for shake
    if (this.detectShake()) {
      return; // Shake detected, event already triggered
    }

    // Check for generic significant motion
    if (current.magnitude >= this.config.minMagnitude) {
      this.onSignificantMotionDetected(
        SignificantMotionType.UNKNOWN,
        current.magnitude,
        0,
      );
    }
  }

  /**
   * Detect free fall
   */
  private detectFreeFall(current: AccelReading): boolean {
    const isLowMagnitude = current.magnitude < this.config.freeFallThreshold;

    if (isLowMagnitude) {
      if (!this.isInFreeFall) {
        // Start of free fall
        this.isInFreeFall = true;
        this.freeFallStartTime = current.timestamp;
      } else {
        // Check duration
        const duration = current.timestamp - this.freeFallStartTime;
        if (duration >= this.config.freeFallDuration) {
          // Free fall detected
          this.onSignificantMotionDetected(
            SignificantMotionType.FALL,
            current.magnitude,
            duration,
          );
          this.isInFreeFall = false;
          return true;
        }
      }
    } else {
      // Reset free fall tracking
      this.isInFreeFall = false;
      this.freeFallStartTime = 0;
    }

    return false;
  }

  /**
   * Detect impact
   */
  private detectImpact(current: AccelReading): boolean {
    if (current.magnitude >= this.config.impactThreshold) {
      this.onSignificantMotionDetected(
        SignificantMotionType.IMPACT,
        current.magnitude,
        0,
      );
      return true;
    }
    return false;
  }

  /**
   * Detect shake
   */
  private detectShake(): boolean {
    if (this.recentReadings.length < 10) {
      return false; // Not enough data
    }

    // Get readings from last shakeDuration
    const cutoffTime = Date.now() - this.config.shakeDuration;
    const shakeReadings = this.recentReadings.filter(r => r.timestamp > cutoffTime);

    if (shakeReadings.length < 5) {
      return false;
    }

    // Count direction changes (zero crossings)
    let directionChanges = 0;
    let lastDirection = 0;

    for (let i = 1; i < shakeReadings.length; i++) {
      const delta = shakeReadings[i].magnitude - shakeReadings[i - 1].magnitude;
      const currentDirection = delta > 0 ? 1 : -1;

      if (lastDirection !== 0 && currentDirection !== lastDirection) {
        directionChanges++;
      }

      lastDirection = currentDirection;
    }

    // Calculate frequency
    const duration = shakeReadings[shakeReadings.length - 1].timestamp - shakeReadings[0].timestamp;
    const frequency = (directionChanges / 2) / (duration / 1000); // Hz

    if (frequency >= this.config.shakeFrequency) {
      const avgMagnitude = shakeReadings.reduce((sum, r) => sum + r.magnitude, 0) / shakeReadings.length;
      this.onSignificantMotionDetected(
        SignificantMotionType.SHAKE,
        avgMagnitude,
        duration,
      );
      return true;
    }

    return false;
  }

  /**
   * Handle detected significant motion
   */
  private onSignificantMotionDetected(
    motionType: SignificantMotionType,
    magnitude: number,
    duration: number,
  ): void {
    if (this.isDetected || !this.dataCallback || !this.sessionId) {
      return;
    }

    // Mark as detected (one-shot)
    this.isDetected = true;
    this.detectionStartTime = Date.now();

    // Calculate elapsed realtime in nanoseconds
    const elapsedMs = performance.now();
    const elapsedRealtimeNanos = Math.floor(elapsedMs * 1_000_000);

    // Create significant motion event
    const motionData: SignificantMotionData = {
      id: `sig-motion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sensorType: SensorType.SIGNIFICANT_MOTION,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      elapsedRealtimeNanos,
      motionType: this.config.classificationEnabled
        ? motionType
        : SignificantMotionType.UNKNOWN,
      magnitude,
      duration: duration > 0 ? duration : undefined,
      isUploaded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.dataCallback(motionData);

    // Auto re-enable after delay
    this.reEnableTimer = setTimeout(() => {
      this.isDetected = false;
      this.reEnableTimer = null;
    }, this.config.autoReEnableDelay);
  }

  /**
   * Manually reset the detector (enable immediately)
   */
  reset(): void {
    this.isDetected = false;
    if (this.reEnableTimer) {
      clearTimeout(this.reEnableTimer);
      this.reEnableTimer = null;
    }
  }

  /**
   * Get detection status
   */
  getStatus(): {
    isActive: boolean;
    lastDetectionTime: number;
    timeSinceDetection: number;
  } {
    return {
      isActive: !this.isDetected,
      lastDetectionTime: this.detectionStartTime,
      timeSinceDetection: this.detectionStartTime > 0
        ? Date.now() - this.detectionStartTime
        : 0,
    };
  }
}
