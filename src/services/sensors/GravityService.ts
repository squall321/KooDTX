/**
 * GravityService
 * Handles gravity sensor data collection
 *
 * The gravity sensor measures the direction and magnitude of gravity.
 * It's a virtual sensor derived from accelerometer and gyroscope data.
 *
 * Key characteristics:
 * - Measures gravity force in m/s² (should be ~9.81 on Earth)
 * - Indicates device tilt relative to gravity
 * - Filters out user-induced motion (unlike raw accelerometer)
 * - Useful for: orientation detection, level tools, tilt-based UI
 */

import type {GravityData, SensorType} from '@app-types/sensor.types';
import {getSensorDataRepository} from '@database/repositories/SensorDataRepository';

/**
 * Gravity sensor configuration
 */
interface GravityConfig {
  sampleInterval: number; // Sample interval in milliseconds (default: 100ms = 10Hz)
  calculateMagnitude: boolean; // Calculate total gravity magnitude (default: true)
}

/**
 * Default gravity sensor configuration
 */
const DEFAULT_CONFIG: GravityConfig = {
  sampleInterval: 100,
  calculateMagnitude: true,
};

/**
 * GravityService class
 */
export class GravityService {
  private subscription: any = null;
  private isRunning: boolean = false;
  private config: GravityConfig = DEFAULT_CONFIG;
  private repository = getSensorDataRepository();

  /**
   * Check if gravity sensor is available on the device
   *
   * Note: Gravity is a virtual sensor derived from accelerometer and gyroscope.
   * React Native Sensors library does not provide gravity sensor.
   * A native module implementation is required.
   */
  async isAvailable(): Promise<boolean> {
    console.warn(
      'GravityService: Gravity sensor requires native module implementation. ' +
      'Sensor is not available in current React Native Sensors library. ' +
      'Gravity is a virtual sensor computed from accelerometer and gyroscope.'
    );
    return false;
  }

  /**
   * Configure gravity sensor settings
   */
  configure(config: Partial<GravityConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Start collecting gravity data
   *
   * @param sessionId - Recording session ID
   * @param onData - Callback for gravity data
   * @param onError - Callback for errors
   */
  async start(
    sessionId: string,
    onData: (data: GravityData) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    // Check if sensor is available
    const available = await this.isAvailable();
    if (!available) {
      const error = new Error(
        'Gravity sensor is not available on this device. ' +
        'A native module implementation is required for Android (Sensor.TYPE_GRAVITY) ' +
        'and iOS (Core Motion sensor fusion).'
      );
      if (onError) {
        onError(error);
      }
      throw error;
    }

    if (this.isRunning) {
      console.warn('GravityService: Already running');
      return;
    }

    // TODO: Implement native module integration
    // For now, this is a placeholder for the interface

    this.isRunning = true;
    console.log(`GravityService: Started with config:`, this.config);
  }

  /**
   * Stop collecting gravity data
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('GravityService: Not running');
      return;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.isRunning = false;
    console.log('GravityService: Stopped');
  }

  /**
   * Calculate magnitude of gravity vector
   */
  private calculateMagnitude(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Get device tilt angles from gravity vector
   *
   * @param x - Gravity X component (m/s²)
   * @param y - Gravity Y component (m/s²)
   * @param z - Gravity Z component (m/s²)
   * @returns Tilt angles in degrees
   */
  getTiltAngles(x: number, y: number, z: number): {
    pitch: number; // Forward/backward tilt (-90 to 90°)
    roll: number;  // Left/right tilt (-180 to 180°)
  } {
    const g = this.calculateMagnitude(x, y, z);

    // Pitch: rotation around X-axis (forward/backward)
    // When device is flat: pitch = 0°
    // When device top is up: pitch = -90°
    // When device bottom is up: pitch = 90°
    const pitch = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

    // Roll: rotation around Y-axis (left/right)
    // When device is flat: roll = 0°
    // When device left edge is down: roll = -90°
    // When device right edge is down: roll = 90°
    const roll = Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);

    return { pitch, roll };
  }

  /**
   * Detect device orientation from gravity
   *
   * @returns Device orientation (portrait, landscape, etc.)
   */
  detectOrientation(x: number, y: number, z: number):
    'portrait' | 'portrait_upside_down' | 'landscape_left' | 'landscape_right' | 'face_up' | 'face_down' {

    const threshold = 5.0; // m/s² threshold for dominant axis

    // Face up: Z-axis has negative gravity (screen facing up)
    if (z < -threshold && Math.abs(z) > Math.abs(x) && Math.abs(z) > Math.abs(y)) {
      return 'face_up';
    }

    // Face down: Z-axis has positive gravity (screen facing down)
    if (z > threshold && Math.abs(z) > Math.abs(x) && Math.abs(z) > Math.abs(y)) {
      return 'face_down';
    }

    // Portrait: Y-axis has positive gravity (top of device pointing up)
    if (y > threshold && Math.abs(y) > Math.abs(x)) {
      return 'portrait';
    }

    // Portrait upside down: Y-axis has negative gravity
    if (y < -threshold && Math.abs(y) > Math.abs(x)) {
      return 'portrait_upside_down';
    }

    // Landscape left: X-axis has positive gravity
    if (x > threshold) {
      return 'landscape_left';
    }

    // Landscape right: X-axis has negative gravity
    if (x < -threshold) {
      return 'landscape_right';
    }

    // Default to portrait
    return 'portrait';
  }

  /**
   * Check if device is approximately level (flat)
   *
   * @param tolerance - Tolerance in degrees (default: 5°)
   * @returns true if device is level
   */
  isLevel(x: number, y: number, z: number, tolerance: number = 5): boolean {
    const { pitch, roll } = this.getTiltAngles(x, y, z);
    return Math.abs(pitch) < tolerance && Math.abs(roll) < tolerance;
  }

  /**
   * Get current sensor type
   */
  getSensorType(): SensorType {
    return 'gravity' as SensorType;
  }

  /**
   * Check if sensor is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get current configuration
   */
  getConfig(): GravityConfig {
    return { ...this.config };
  }
}

/**
 * Native Module Implementation Guide
 *
 * Android (Java/Kotlin):
 * ```java
 * import android.hardware.Sensor;
 * import android.hardware.SensorEvent;
 * import android.hardware.SensorEventListener;
 * import android.hardware.SensorManager;
 *
 * public class GravityModule extends ReactContextBaseJavaModule implements SensorEventListener {
 *   private SensorManager sensorManager;
 *   private Sensor gravitySensor;
 *
 *   @ReactMethod
 *   public void isAvailable(Promise promise) {
 *     Sensor sensor = sensorManager.getDefaultSensor(Sensor.TYPE_GRAVITY);
 *     promise.resolve(sensor != null);
 *   }
 *
 *   @ReactMethod
 *   public void startGravityUpdates(int sampleInterval) {
 *     gravitySensor = sensorManager.getDefaultSensor(Sensor.TYPE_GRAVITY);
 *     if (gravitySensor != null) {
 *       sensorManager.registerListener(
 *         this,
 *         gravitySensor,
 *         sampleInterval * 1000 // Convert ms to microseconds
 *       );
 *     }
 *   }
 *
 *   @Override
 *   public void onSensorChanged(SensorEvent event) {
 *     if (event.sensor.getType() == Sensor.TYPE_GRAVITY) {
 *       WritableMap data = Arguments.createMap();
 *       data.putDouble("x", event.values[0]); // Gravity X (m/s²)
 *       data.putDouble("y", event.values[1]); // Gravity Y (m/s²)
 *       data.putDouble("z", event.values[2]); // Gravity Z (m/s²)
 *       data.putDouble("timestamp", System.currentTimeMillis());
 *
 *       sendEvent("GravityData", data);
 *     }
 *   }
 * }
 * ```
 *
 * iOS (Objective-C/Swift):
 * ```objc
 * #import <CoreMotion/CoreMotion.h>
 *
 * @implementation GravityModule {
 *   CMMotionManager *motionManager;
 * }
 *
 * RCT_EXPORT_MODULE();
 *
 * RCT_REMAP_METHOD(isAvailable,
 *                  isAvailableWithResolver:(RCTPromiseResolveBlock)resolve
 *                  rejecter:(RCTPromiseRejectBlock)reject) {
 *   // Gravity is derived from accelerometer and gyroscope
 *   BOOL available = motionManager.deviceMotionAvailable;
 *   resolve(@(available));
 * }
 *
 * RCT_EXPORT_METHOD(startGravityUpdates:(NSInteger)sampleInterval) {
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
 *           // CMDeviceMotion.gravity provides filtered gravity vector
 *           NSDictionary *data = @{
 *             @"x": @(motion.gravity.x * 9.81), // Convert G to m/s²
 *             @"y": @(motion.gravity.y * 9.81),
 *             @"z": @(motion.gravity.z * 9.81),
 *             @"timestamp": @([[NSDate date] timeIntervalSince1970] * 1000)
 *           };
 *
 *           [self sendEventWithName:@"GravityData" body:data];
 *         }
 *       }];
 *   }
 * }
 *
 * - (void)stopGravityUpdates {
 *   [motionManager stopDeviceMotionUpdates];
 * }
 *
 * @end
 * ```
 *
 * Key differences between platforms:
 * - Android: TYPE_GRAVITY sensor (virtual sensor, fusion of accel + gyro)
 * - iOS: CMDeviceMotion.gravity (from CMMotionManager)
 * - Both provide gravity in device coordinate system
 * - Android values are in m/s², iOS values are in G (need to multiply by 9.81)
 * - iOS provides more accurate sensor fusion with Kalman filtering
 */
