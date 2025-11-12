/**
 * LinearAccelerationService
 * Handles linear acceleration sensor data collection
 *
 * Linear acceleration measures device acceleration WITHOUT gravity.
 * It's calculated as: Linear Accel = Raw Accel - Gravity
 *
 * Key characteristics:
 * - Measures only user-induced motion (no gravity component)
 * - Values in m/s² (typically 0 when device is stationary)
 * - Virtual sensor derived from accelerometer and gravity sensor
 * - Useful for: gesture detection, shake detection, motion tracking
 */

import type {LinearAccelerationData, SensorType} from '@app-types/sensor.types';
import {getSensorDataRepository} from '@database/repositories/SensorDataRepository';

/**
 * Linear acceleration sensor configuration
 */
interface LinearAccelerationConfig {
  sampleInterval: number; // Sample interval in milliseconds (default: 100ms = 10Hz)
  calculateMagnitude: boolean; // Calculate total acceleration magnitude (default: true)
  noiseFilter: boolean; // Apply low-pass filter to reduce noise (default: true)
  noiseThreshold: number; // Minimum magnitude to record (m/s², default: 0.1)
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: LinearAccelerationConfig = {
  sampleInterval: 100,
  calculateMagnitude: true,
  noiseFilter: true,
  noiseThreshold: 0.1,
};

/**
 * LinearAccelerationService class
 */
export class LinearAccelerationService {
  private subscription: any = null;
  private isRunning: boolean = false;
  private config: LinearAccelerationConfig = DEFAULT_CONFIG;
  private repository = getSensorDataRepository();

  // Low-pass filter state for noise reduction
  private filteredX: number = 0;
  private filteredY: number = 0;
  private filteredZ: number = 0;
  private readonly ALPHA = 0.8; // Filter coefficient (0.8 = light filtering)

  /**
   * Check if linear acceleration sensor is available
   *
   * Note: Linear acceleration is a virtual sensor derived from accelerometer and gravity.
   * React Native Sensors library does not provide this sensor.
   * A native module implementation is required.
   */
  async isAvailable(): Promise<boolean> {
    console.warn(
      'LinearAccelerationService: Linear acceleration sensor requires native module. ' +
      'Not available in React Native Sensors library. ' +
      'This is a virtual sensor: Linear = Accelerometer - Gravity'
    );
    return false;
  }

  /**
   * Configure sensor settings
   */
  configure(config: Partial<LinearAccelerationConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Start collecting linear acceleration data
   */
  async start(
    sessionId: string,
    onData: (data: LinearAccelerationData) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const available = await this.isAvailable();
    if (!available) {
      const error = new Error(
        'Linear acceleration sensor is not available on this device. ' +
        'Native module implementation required for Android (TYPE_LINEAR_ACCELERATION) ' +
        'and iOS (Core Motion userAcceleration).'
      );
      if (onError) {
        onError(error);
      }
      throw error;
    }

    if (this.isRunning) {
      console.warn('LinearAccelerationService: Already running');
      return;
    }

    // Reset filter state
    this.filteredX = 0;
    this.filteredY = 0;
    this.filteredZ = 0;

    this.isRunning = true;
    console.log('LinearAccelerationService: Started with config:', this.config);
  }

  /**
   * Stop collecting data
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('LinearAccelerationService: Not running');
      return;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.isRunning = false;
    console.log('LinearAccelerationService: Stopped');
  }

  /**
   * Apply low-pass filter to reduce noise
   */
  private applyLowPassFilter(x: number, y: number, z: number): {x: number; y: number; z: number} {
    this.filteredX = this.ALPHA * this.filteredX + (1 - this.ALPHA) * x;
    this.filteredY = this.ALPHA * this.filteredY + (1 - this.ALPHA) * y;
    this.filteredZ = this.ALPHA * this.filteredZ + (1 - this.ALPHA) * z;

    return {
      x: this.filteredX,
      y: this.filteredY,
      z: this.filteredZ,
    };
  }

  /**
   * Calculate magnitude of acceleration vector
   */
  private calculateMagnitude(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Detect shake gesture from linear acceleration
   *
   * @param magnitude - Acceleration magnitude (m/s²)
   * @param threshold - Shake threshold (default: 15 m/s²)
   * @returns true if shake detected
   */
  detectShake(magnitude: number, threshold: number = 15): boolean {
    return magnitude > threshold;
  }

  /**
   * Detect sudden impact/jolt
   *
   * @param magnitude - Acceleration magnitude (m/s²)
   * @param threshold - Impact threshold (default: 25 m/s²)
   * @returns Impact severity (none, light, moderate, strong)
   */
  detectImpact(magnitude: number): 'none' | 'light' | 'moderate' | 'strong' {
    if (magnitude < 10) return 'none';
    if (magnitude < 20) return 'light';
    if (magnitude < 35) return 'moderate';
    return 'strong';
  }

  /**
   * Classify motion type based on linear acceleration
   *
   * @returns Motion classification
   */
  classifyMotion(x: number, y: number, z: number, magnitude: number):
    'stationary' | 'slow_movement' | 'walking' | 'running' | 'vehicle' | 'falling' {

    if (magnitude < 0.5) {
      return 'stationary'; // Device is still
    }

    if (magnitude < 2) {
      return 'slow_movement'; // Gentle hand movement
    }

    if (magnitude < 5) {
      return 'walking'; // Normal walking pace
    }

    if (magnitude < 10) {
      return 'running'; // Fast movement or running
    }

    // Check for free fall (low Z acceleration)
    if (Math.abs(z) < 2 && magnitude > 8) {
      return 'falling';
    }

    return 'vehicle'; // In car, train, etc.
  }

  /**
   * Calculate velocity from acceleration (integration over time)
   *
   * Note: This is approximate and accumulates drift over time.
   * Use for short-term velocity estimation only.
   *
   * @param ax - X acceleration (m/s²)
   * @param ay - Y acceleration (m/s²)
   * @param az - Z acceleration (m/s²)
   * @param dt - Time interval (seconds)
   * @param vx - Previous X velocity (m/s)
   * @param vy - Previous Y velocity (m/s)
   * @param vz - Previous Z velocity (m/s)
   * @returns Updated velocity vector
   */
  integrateVelocity(
    ax: number, ay: number, az: number,
    dt: number,
    vx: number = 0, vy: number = 0, vz: number = 0
  ): {vx: number; vy: number; vz: number; speed: number} {
    // Apply noise threshold to prevent drift
    const threshold = this.config.noiseThreshold;
    const axFiltered = Math.abs(ax) < threshold ? 0 : ax;
    const ayFiltered = Math.abs(ay) < threshold ? 0 : ay;
    const azFiltered = Math.abs(az) < threshold ? 0 : az;

    // Integrate: v = v0 + a * dt
    const newVx = vx + axFiltered * dt;
    const newVy = vy + ayFiltered * dt;
    const newVz = vz + azFiltered * dt;

    const speed = Math.sqrt(newVx * newVx + newVy * newVy + newVz * newVz);

    return { vx: newVx, vy: newVy, vz: newVz, speed };
  }

  /**
   * Detect gesture patterns from acceleration data
   */
  detectGesture(history: Array<{x: number; y: number; z: number; timestamp: number}>):
    'tap' | 'double_tap' | 'swipe_left' | 'swipe_right' | 'swipe_up' | 'swipe_down' | 'shake' | 'none' {

    if (history.length < 3) return 'none';

    // Calculate average and peak acceleration
    let sumX = 0, sumY = 0, sumZ = 0;
    let maxX = 0, maxY = 0, maxZ = 0;

    for (const sample of history) {
      sumX += Math.abs(sample.x);
      sumY += Math.abs(sample.y);
      sumZ += Math.abs(sample.z);
      maxX = Math.max(maxX, Math.abs(sample.x));
      maxY = Math.max(maxY, Math.abs(sample.y));
      maxZ = Math.max(maxZ, Math.abs(sample.z));
    }

    const avgX = sumX / history.length;
    const avgY = sumY / history.length;
    const avgZ = sumZ / history.length;

    // Shake: high acceleration in multiple axes
    if (maxX > 15 && maxY > 15) {
      return 'shake';
    }

    // Swipe detection: dominant axis with high peak
    if (maxX > 10 && maxX > maxY && maxX > maxZ) {
      // Check direction
      const lastX = history[history.length - 1].x;
      return lastX > 0 ? 'swipe_right' : 'swipe_left';
    }

    if (maxY > 10 && maxY > maxX && maxY > maxZ) {
      const lastY = history[history.length - 1].y;
      return lastY > 0 ? 'swipe_down' : 'swipe_up';
    }

    // Tap: short duration, sharp Z acceleration
    if (maxZ > 8 && avgZ < 5) {
      return 'tap';
    }

    return 'none';
  }

  /**
   * Get current sensor type
   */
  getSensorType(): SensorType {
    return 'linear_acceleration' as SensorType;
  }

  /**
   * Check if sensor is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get current configuration
   */
  getConfig(): LinearAccelerationConfig {
    return { ...this.config };
  }
}

/**
 * Native Module Implementation Guide
 *
 * Android:
 * ```java
 * import android.hardware.Sensor;
 * import android.hardware.SensorEvent;
 * import android.hardware.SensorEventListener;
 * import android.hardware.SensorManager;
 *
 * public class LinearAccelerationModule extends ReactContextBaseJavaModule
 *     implements SensorEventListener {
 *
 *   private SensorManager sensorManager;
 *   private Sensor linearAccelSensor;
 *
 *   @ReactMethod
 *   public void isAvailable(Promise promise) {
 *     Sensor sensor = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION);
 *     promise.resolve(sensor != null);
 *   }
 *
 *   @ReactMethod
 *   public void start(int sampleInterval) {
 *     linearAccelSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION);
 *     if (linearAccelSensor != null) {
 *       sensorManager.registerListener(
 *         this,
 *         linearAccelSensor,
 *         sampleInterval * 1000 // ms to microseconds
 *       );
 *     }
 *   }
 *
 *   @Override
 *   public void onSensorChanged(SensorEvent event) {
 *     if (event.sensor.getType() == Sensor.TYPE_LINEAR_ACCELERATION) {
 *       WritableMap data = Arguments.createMap();
 *       data.putDouble("x", event.values[0]); // m/s²
 *       data.putDouble("y", event.values[1]);
 *       data.putDouble("z", event.values[2]);
 *       data.putDouble("timestamp", System.currentTimeMillis());
 *
 *       sendEvent("LinearAccelerationData", data);
 *     }
 *   }
 * }
 * ```
 *
 * iOS:
 * ```objc
 * #import <CoreMotion/CoreMotion.h>
 *
 * @implementation LinearAccelerationModule {
 *   CMMotionManager *motionManager;
 * }
 *
 * RCT_EXPORT_MODULE();
 *
 * RCT_REMAP_METHOD(isAvailable,
 *                  resolver:(RCTPromiseResolveBlock)resolve
 *                  rejecter:(RCTPromiseRejectBlock)reject) {
 *   BOOL available = motionManager.deviceMotionAvailable;
 *   resolve(@(available));
 * }
 *
 * RCT_EXPORT_METHOD(start:(NSInteger)sampleInterval) {
 *   if (!motionManager) {
 *     motionManager = [[CMMotionManager alloc] init];
 *   }
 *
 *   if (motionManager.deviceMotionAvailable) {
 *     motionManager.deviceMotionUpdateInterval = sampleInterval / 1000.0;
 *
 *     [motionManager startDeviceMotionUpdatesToQueue:[NSOperationQueue mainQueue]
 *       withHandler:^(CMDeviceMotion *motion, NSError *error) {
 *         if (motion) {
 *           // CMDeviceMotion.userAcceleration provides linear acceleration
 *           // Values are in G, convert to m/s²
 *           NSDictionary *data = @{
 *             @"x": @(motion.userAcceleration.x * 9.81),
 *             @"y": @(motion.userAcceleration.y * 9.81),
 *             @"z": @(motion.userAcceleration.z * 9.81),
 *             @"timestamp": @([[NSDate date] timeIntervalSince1970] * 1000)
 *           };
 *
 *           [self sendEventWithName:@"LinearAccelerationData" body:data];
 *         }
 *       }];
 *   }
 * }
 *
 * @end
 * ```
 *
 * Platform differences:
 * - Android: TYPE_LINEAR_ACCELERATION = Accel - Gravity (software fusion)
 * - iOS: userAcceleration from CMDeviceMotion (Kalman filtered)
 * - iOS values in G (multiply by 9.81 for m/s²)
 * - Both remove gravity component automatically
 * - iOS typically has better noise filtering
 */
