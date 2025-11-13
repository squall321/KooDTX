/**
 * RotationVectorService
 * Handles rotation vector sensor data collection
 *
 * Rotation vector represents device orientation as a quaternion.
 * It combines accelerometer, gyroscope, and magnetometer data for accurate orientation.
 *
 * Key characteristics:
 * - Quaternion representation (qx, qy, qz, qw) - no gimbal lock
 * - Can be converted to Euler angles (heading, pitch, roll)
 * - Fused sensor data for high accuracy
 * - Useful for: AR/VR, compass, 3D positioning, camera stabilization
 */

import type {RotationVectorData, SensorType} from '@app-types/sensor.types';
import {getSensorDataRepository} from '@database/repositories/SensorDataRepository';

/**
 * Rotation vector sensor configuration
 */
interface RotationVectorConfig {
  sampleInterval: number; // Sample interval in milliseconds (default: 100ms = 10Hz)
  calculateEulerAngles: boolean; // Convert quaternion to Euler angles (default: true)
  angleUnit: 'degrees' | 'radians'; // Unit for Euler angles (default: degrees)
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: RotationVectorConfig = {
  sampleInterval: 100,
  calculateEulerAngles: true,
  angleUnit: 'degrees',
};

/**
 * Quaternion interface
 */
interface Quaternion {
  qx: number;
  qy: number;
  qz: number;
  qw: number;
}

/**
 * Euler angles interface
 */
interface EulerAngles {
  heading: number; // Yaw (rotation around Z-axis, 0-360°)
  pitch: number;   // Rotation around X-axis (-180 to 180°)
  roll: number;    // Rotation around Y-axis (-90 to 90°)
}

/**
 * RotationVectorService class
 */
export class RotationVectorService {
  private subscription: any = null;
  private isRunning: boolean = false;
  private config: RotationVectorConfig = DEFAULT_CONFIG;
  private repository = getSensorDataRepository();

  /**
   * Check if rotation vector sensor is available
   *
   * Note: Rotation vector is a virtual sensor combining accel, gyro, and magnetometer.
   * React Native Sensors library does not provide this sensor.
   * A native module implementation is required.
   */
  async isAvailable(): Promise<boolean> {
    console.warn(
      'RotationVectorService: Rotation vector sensor requires native module. ' +
      'Not available in React Native Sensors library. ' +
      'This is a virtual sensor fusing accelerometer, gyroscope, and magnetometer.'
    );
    return false;
  }

  /**
   * Configure sensor settings
   */
  configure(config: Partial<RotationVectorConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Start collecting rotation vector data
   */
  async start(
    sessionId: string,
    onData: (data: RotationVectorData) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const available = await this.isAvailable();
    if (!available) {
      const error = new Error(
        'Rotation vector sensor is not available on this device. ' +
        'Native module implementation required for Android (TYPE_ROTATION_VECTOR) ' +
        'and iOS (CMDeviceMotion attitude).'
      );
      if (onError) {
        onError(error);
      }
      throw error;
    }

    if (this.isRunning) {
      console.warn('RotationVectorService: Already running');
      return;
    }

    this.isRunning = true;
    console.log('RotationVectorService: Started with config:', this.config);
  }

  /**
   * Stop collecting data
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('RotationVectorService: Not running');
      return;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.isRunning = false;
    console.log('RotationVectorService: Stopped');
  }

  /**
   * Convert quaternion to Euler angles
   *
   * @param q - Quaternion (qx, qy, qz, qw)
   * @returns Euler angles (heading/yaw, pitch, roll)
   */
  quaternionToEuler(q: Quaternion): EulerAngles {
    const { qx, qy, qz, qw } = q;

    // Roll (rotation around Y-axis)
    const sinr_cosp = 2 * (qw * qx + qy * qz);
    const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
    let roll = Math.atan2(sinr_cosp, cosr_cosp);

    // Pitch (rotation around X-axis)
    const sinp = 2 * (qw * qy - qz * qx);
    let pitch;
    if (Math.abs(sinp) >= 1) {
      pitch = Math.sign(sinp) * Math.PI / 2; // Use 90 degrees if out of range
    } else {
      pitch = Math.asin(sinp);
    }

    // Yaw/Heading (rotation around Z-axis)
    const siny_cosp = 2 * (qw * qz + qx * qy);
    const cosy_cosp = 1 - 2 * (qy * qy + qz * qz);
    let heading = Math.atan2(siny_cosp, cosy_cosp);

    // Convert to degrees if configured
    if (this.config.angleUnit === 'degrees') {
      roll = roll * (180 / Math.PI);
      pitch = pitch * (180 / Math.PI);
      heading = heading * (180 / Math.PI);

      // Normalize heading to 0-360°
      if (heading < 0) {
        heading += 360;
      }
    }

    return { heading, pitch, roll };
  }

  /**
   * Convert Euler angles to quaternion
   *
   * @param heading - Yaw angle (degrees or radians)
   * @param pitch - Pitch angle (degrees or radians)
   * @param roll - Roll angle (degrees or radians)
   * @returns Quaternion
   */
  eulerToQuaternion(heading: number, pitch: number, roll: number): Quaternion {
    // Convert to radians if in degrees
    if (this.config.angleUnit === 'degrees') {
      heading = heading * (Math.PI / 180);
      pitch = pitch * (Math.PI / 180);
      roll = roll * (Math.PI / 180);
    }

    const cy = Math.cos(heading * 0.5);
    const sy = Math.sin(heading * 0.5);
    const cp = Math.cos(pitch * 0.5);
    const sp = Math.sin(pitch * 0.5);
    const cr = Math.cos(roll * 0.5);
    const sr = Math.sin(roll * 0.5);

    return {
      qw: cr * cp * cy + sr * sp * sy,
      qx: sr * cp * cy - cr * sp * sy,
      qy: cr * sp * cy + sr * cp * sy,
      qz: cr * cp * sy - sr * sp * cy,
    };
  }

  /**
   * Normalize quaternion to unit length
   */
  normalizeQuaternion(q: Quaternion): Quaternion {
    const magnitude = Math.sqrt(q.qx * q.qx + q.qy * q.qy + q.qz * q.qz + q.qw * q.qw);
    return {
      qx: q.qx / magnitude,
      qy: q.qy / magnitude,
      qz: q.qz / magnitude,
      qw: q.qw / magnitude,
    };
  }

  /**
   * Interpolate between two quaternions (SLERP - Spherical Linear Interpolation)
   *
   * @param q1 - Start quaternion
   * @param q2 - End quaternion
   * @param t - Interpolation factor (0-1)
   * @returns Interpolated quaternion
   */
  slerpQuaternion(q1: Quaternion, q2: Quaternion, t: number): Quaternion {
    // Calculate angle between quaternions
    let dot = q1.qx * q2.qx + q1.qy * q2.qy + q1.qz * q2.qz + q1.qw * q2.qw;

    // If dot < 0, negate q2 to take shorter path
    let q2Final = { ...q2 };
    if (dot < 0) {
      dot = -dot;
      q2Final = { qx: -q2.qx, qy: -q2.qy, qz: -q2.qz, qw: -q2.qw };
    }

    // Perform linear interpolation if quaternions are very close
    if (dot > 0.9995) {
      return this.normalizeQuaternion({
        qx: q1.qx + t * (q2Final.qx - q1.qx),
        qy: q1.qy + t * (q2Final.qy - q1.qy),
        qz: q1.qz + t * (q2Final.qz - q1.qz),
        qw: q1.qw + t * (q2Final.qw - q1.qw),
      });
    }

    // Calculate SLERP
    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const a = Math.sin((1 - t) * theta) / sinTheta;
    const b = Math.sin(t * theta) / sinTheta;

    return {
      qx: a * q1.qx + b * q2Final.qx,
      qy: a * q1.qy + b * q2Final.qy,
      qz: a * q1.qz + b * q2Final.qz,
      qw: a * q1.qw + b * q2Final.qw,
    };
  }

  /**
   * Get rotation matrix from quaternion (3x3 matrix)
   *
   * @param q - Quaternion
   * @returns 3x3 rotation matrix (row-major order)
   */
  quaternionToRotationMatrix(q: Quaternion): number[][] {
    const { qx, qy, qz, qw } = q;

    return [
      [
        1 - 2 * (qy * qy + qz * qz),
        2 * (qx * qy - qw * qz),
        2 * (qx * qz + qw * qy),
      ],
      [
        2 * (qx * qy + qw * qz),
        1 - 2 * (qx * qx + qz * qz),
        2 * (qy * qz - qw * qx),
      ],
      [
        2 * (qx * qz - qw * qy),
        2 * (qy * qz + qw * qx),
        1 - 2 * (qx * qx + qy * qy),
      ],
    ];
  }

  /**
   * Calculate angular difference between two quaternions (in degrees)
   *
   * @param q1 - First quaternion
   * @param q2 - Second quaternion
   * @returns Angular difference in degrees
   */
  quaternionAngularDifference(q1: Quaternion, q2: Quaternion): number {
    const dot = Math.abs(q1.qx * q2.qx + q1.qy * q2.qy + q1.qz * q2.qz + q1.qw * q2.qw);
    const angle = 2 * Math.acos(Math.min(1, dot));
    return angle * (180 / Math.PI);
  }

  /**
   * Get compass heading (0-360°) from rotation vector
   *
   * @param q - Quaternion
   * @returns Heading in degrees (0=North, 90=East, 180=South, 270=West)
   */
  getCompassHeading(q: Quaternion): number {
    const { heading } = this.quaternionToEuler(q);
    return heading;
  }

  /**
   * Detect device orientation from rotation vector
   *
   * @param euler - Euler angles
   * @returns Device orientation
   */
  detectOrientation(euler: EulerAngles):
    'portrait' | 'portrait_upside_down' | 'landscape_left' | 'landscape_right' | 'face_up' | 'face_down' {

    const { pitch, roll } = euler;

    // Face up/down detection (pitch close to ±90°)
    if (Math.abs(pitch) > 80) {
      return pitch > 0 ? 'face_down' : 'face_up';
    }

    // Portrait/landscape detection based on roll
    if (Math.abs(roll) < 45) {
      return 'portrait';
    } else if (Math.abs(roll) > 135) {
      return 'portrait_upside_down';
    } else if (roll > 0) {
      return 'landscape_right';
    } else {
      return 'landscape_left';
    }
  }

  /**
   * Get current sensor type
   */
  getSensorType(): SensorType {
    return 'rotation_vector' as SensorType;
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
  getConfig(): RotationVectorConfig {
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
 * public class RotationVectorModule extends ReactContextBaseJavaModule
 *     implements SensorEventListener {
 *
 *   private SensorManager sensorManager;
 *   private Sensor rotationSensor;
 *
 *   @ReactMethod
 *   public void isAvailable(Promise promise) {
 *     Sensor sensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
 *     promise.resolve(sensor != null);
 *   }
 *
 *   @ReactMethod
 *   public void start(int sampleInterval) {
 *     rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
 *     if (rotationSensor != null) {
 *       sensorManager.registerListener(
 *         this,
 *         rotationSensor,
 *         sampleInterval * 1000
 *       );
 *     }
 *   }
 *
 *   @Override
 *   public void onSensorChanged(SensorEvent event) {
 *     if (event.sensor.getType() == Sensor.TYPE_ROTATION_VECTOR) {
 *       // Android provides quaternion directly
 *       // values[0-2] = x,y,z components
 *       // values[3] = cos(θ/2) (optional, can be calculated)
 *       WritableMap data = Arguments.createMap();
 *       data.putDouble("qx", event.values[0]);
 *       data.putDouble("qy", event.values[1]);
 *       data.putDouble("qz", event.values[2]);
 *
 *       // Calculate qw if not provided
 *       double qw = event.values.length > 3 ? event.values[3] :
 *         Math.sqrt(1 - event.values[0]*event.values[0]
 *                    - event.values[1]*event.values[1]
 *                    - event.values[2]*event.values[2]);
 *       data.putDouble("qw", qw);
 *
 *       // Heading accuracy (if available)
 *       if (event.values.length > 4) {
 *         data.putDouble("accuracy", Math.toDegrees(event.values[4]));
 *       }
 *
 *       data.putDouble("timestamp", System.currentTimeMillis());
 *       sendEvent("RotationVectorData", data);
 *     }
 *   }
 * }
 * ```
 *
 * iOS:
 * ```objc
 * #import <CoreMotion/CoreMotion.h>
 *
 * @implementation RotationVectorModule {
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
 *     // Use CMAttitudeReferenceFrameXTrueNorthZVertical for compass heading
 *     [motionManager startDeviceMotionUpdatesUsingReferenceFrame:
 *       CMAttitudeReferenceFrameXTrueNorthZVertical
 *       toQueue:[NSOperationQueue mainQueue]
 *       withHandler:^(CMDeviceMotion *motion, NSError *error) {
 *         if (motion) {
 *           CMAttitude *attitude = motion.attitude;
 *
 *           // iOS provides quaternion directly
 *           NSDictionary *data = @{
 *             @"qx": @(attitude.quaternion.x),
 *             @"qy": @(attitude.quaternion.y),
 *             @"qz": @(attitude.quaternion.z),
 *             @"qw": @(attitude.quaternion.w),
 *             @"heading": @(attitude.yaw * 180 / M_PI),
 *             @"pitch": @(attitude.pitch * 180 / M_PI),
 *             @"roll": @(attitude.roll * 180 / M_PI),
 *             @"timestamp": @([[NSDate date] timeIntervalSince1970] * 1000)
 *           };
 *
 *           [self sendEventWithName:@"RotationVectorData" body:data];
 *         }
 *       }];
 *   }
 * }
 *
 * @end
 * ```
 *
 * Platform differences:
 * - Android: TYPE_ROTATION_VECTOR (fused accel + gyro + mag)
 * - iOS: CMAttitude from CMDeviceMotion (superior sensor fusion)
 * - Both provide quaternion representation
 * - iOS can provide Euler angles directly
 * - iOS has better magnetic calibration
 * - Android may need qw calculation if not provided
 *
 * Coordinate systems:
 * - Android: X=East, Y=North, Z=Up
 * - iOS: Depends on reference frame (use XTrueNorthZVertical for consistency)
 */
