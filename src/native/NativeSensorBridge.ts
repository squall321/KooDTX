/**
 * Native Sensor Bridge
 * TypeScript bridge for Android SensorModule
 */

import {
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
  Platform,
} from 'react-native';

const LINKING_ERROR =
  `The package 'SensorModule' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- Run 'pod install'\n", default: ''}) +
  '- Rebuild the app after installing the package\n' +
  '- You are running on a physical device (sensors not available on emulators)\n';

const SensorModuleNative = NativeModules.SensorModule
  ? NativeModules.SensorModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

/**
 * Android Sensor Types
 * https://developer.android.com/reference/android/hardware/Sensor
 */
export enum AndroidSensorType {
  ACCELEROMETER = 1,
  MAGNETIC_FIELD = 2,
  ORIENTATION = 3, // Deprecated
  GYROSCOPE = 4,
  LIGHT = 5,
  PRESSURE = 6,
  TEMPERATURE = 7, // Deprecated
  PROXIMITY = 8,
  GRAVITY = 9,
  LINEAR_ACCELERATION = 10,
  ROTATION_VECTOR = 11,
  RELATIVE_HUMIDITY = 12,
  AMBIENT_TEMPERATURE = 13,
  MAGNETIC_FIELD_UNCALIBRATED = 14,
  GAME_ROTATION_VECTOR = 15,
  GYROSCOPE_UNCALIBRATED = 16,
  SIGNIFICANT_MOTION = 17,
  STEP_DETECTOR = 18,
  STEP_COUNTER = 19,
  GEOMAGNETIC_ROTATION_VECTOR = 20,
  HEART_RATE = 21,
  POSE_6DOF = 28,
  STATIONARY_DETECT = 29,
  MOTION_DETECT = 30,
  HEART_BEAT = 31,
  LOW_LATENCY_OFFBODY_DETECT = 34,
  ACCELEROMETER_UNCALIBRATED = 35,
}

/**
 * Sampling Rate Options
 */
export enum SensorSamplingRate {
  FASTEST = 0, // ~200Hz - Maximum rate
  GAME = 1, // ~50Hz - Suitable for games
  UI = 2, // ~16Hz - Suitable for UI updates
  NORMAL = 3, // ~5Hz - Normal rate
}

/**
 * Sensor Information
 */
export interface SensorInfo {
  type: number;
  name: string;
  vendor: string;
  version: number;
  power: number; // mA
  resolution: number;
  maxRange: number;
  minDelay: number; // microseconds
  maxDelay: number; // microseconds
}

/**
 * Sensor Data Sample
 */
export interface SensorDataSample {
  sensorType: number;
  sensorName: string;
  timestamp: number; // nanoseconds (sensor timestamp)
  systemTime: number; // milliseconds (system time)
  values: number[]; // [x, y, z] or other sensor values
  accuracy: number;
}

/**
 * Sensor Data Batch
 */
export interface SensorDataBatch {
  sensorType: number;
  count: number;
  data: SensorDataSample[];
}

/**
 * Sensor Error Event
 */
export interface SensorErrorEvent {
  message: string;
  timestamp: number;
}

/**
 * Sensor Data Event Listener
 */
export type SensorDataListener = (batch: SensorDataBatch) => void;

/**
 * Sensor Error Event Listener
 */
export type SensorErrorListener = (error: SensorErrorEvent) => void;

/**
 * Native Sensor Bridge Class
 */
class NativeSensorBridge {
  private eventEmitter: NativeEventEmitter;
  private dataListeners: Map<number, SensorDataListener[]> = new Map();
  private errorListeners: SensorErrorListener[] = [];
  private subscriptions: Map<string, EmitterSubscription> = new Map();

  constructor() {
    this.eventEmitter = new NativeEventEmitter(SensorModuleNative);
    this.setupEventListeners();
  }

  /**
   * Setup native event listeners
   */
  private setupEventListeners() {
    // SensorData event
    const dataSubscription = this.eventEmitter.addListener(
      'SensorData',
      (batch: SensorDataBatch) => {
        const listeners = this.dataListeners.get(batch.sensorType);
        if (listeners) {
          listeners.forEach(listener => listener(batch));
        }
      },
    );
    this.subscriptions.set('SensorData', dataSubscription);

    // SensorError event
    const errorSubscription = this.eventEmitter.addListener(
      'SensorError',
      (error: SensorErrorEvent) => {
        this.errorListeners.forEach(listener => listener(error));
      },
    );
    this.subscriptions.set('SensorError', errorSubscription);
  }

  /**
   * Get list of available sensors on device
   */
  async getAvailableSensors(): Promise<SensorInfo[]> {
    return await SensorModuleNative.getAvailableSensors();
  }

  /**
   * Check if specific sensor type is available
   */
  async isSensorAvailable(sensorType: AndroidSensorType): Promise<boolean> {
    return await SensorModuleNative.isSensorAvailable(sensorType);
  }

  /**
   * Start collecting data from sensor
   *
   * @param sensorType - Android sensor type
   * @param samplingRate - Sampling rate (default: GAME)
   * @param batchSize - Number of samples to batch (default: 50)
   */
  async startSensor(
    sensorType: AndroidSensorType,
    samplingRate: SensorSamplingRate = SensorSamplingRate.GAME,
    batchSize: number = 50,
  ): Promise<boolean> {
    return await SensorModuleNative.startSensor(
      sensorType,
      samplingRate,
      batchSize,
    );
  }

  /**
   * Stop collecting data from sensor
   */
  async stopSensor(sensorType: AndroidSensorType): Promise<boolean> {
    return await SensorModuleNative.stopSensor(sensorType);
  }

  /**
   * Stop all active sensors
   */
  async stopAllSensors(): Promise<boolean> {
    return await SensorModuleNative.stopAllSensors();
  }

  /**
   * Add listener for sensor data
   *
   * @param sensorType - Android sensor type to listen to
   * @param listener - Callback function
   */
  addDataListener(
    sensorType: AndroidSensorType,
    listener: SensorDataListener,
  ): () => void {
    const listeners = this.dataListeners.get(sensorType) || [];
    listeners.push(listener);
    this.dataListeners.set(sensorType, listeners);

    // Return unsubscribe function
    return () => {
      const currentListeners = this.dataListeners.get(sensorType);
      if (currentListeners) {
        const index = currentListeners.indexOf(listener);
        if (index > -1) {
          currentListeners.splice(index, 1);
        }
        if (currentListeners.length === 0) {
          this.dataListeners.delete(sensorType);
        }
      }
    };
  }

  /**
   * Add listener for sensor errors
   */
  addErrorListener(listener: SensorErrorListener): () => void {
    this.errorListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.dataListeners.clear();
    this.errorListeners = [];
  }

  /**
   * Cleanup - remove all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach(subscription => subscription.remove());
    this.subscriptions.clear();
    this.removeAllListeners();
  }
}

/**
 * Singleton instance
 */
export const NativeSensorBridgeInstance = new NativeSensorBridge();

/**
 * Export default instance
 */
export default NativeSensorBridgeInstance;

/**
 * Convenience functions
 */

/**
 * Start accelerometer sensor
 */
export async function startAccelerometer(
  samplingRate: SensorSamplingRate = SensorSamplingRate.GAME,
  batchSize: number = 50,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.ACCELEROMETER,
    samplingRate,
    batchSize,
  );
}

/**
 * Start gyroscope sensor
 */
export async function startGyroscope(
  samplingRate: SensorSamplingRate = SensorSamplingRate.GAME,
  batchSize: number = 50,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.GYROSCOPE,
    samplingRate,
    batchSize,
  );
}

/**
 * Start magnetometer sensor
 */
export async function startMagnetometer(
  samplingRate: SensorSamplingRate = SensorSamplingRate.GAME,
  batchSize: number = 50,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.MAGNETIC_FIELD,
    samplingRate,
    batchSize,
  );
}

/**
 * Start gravity sensor
 */
export async function startGravity(
  samplingRate: SensorSamplingRate = SensorSamplingRate.GAME,
  batchSize: number = 50,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.GRAVITY,
    samplingRate,
    batchSize,
  );
}

/**
 * Start linear acceleration sensor
 */
export async function startLinearAcceleration(
  samplingRate: SensorSamplingRate = SensorSamplingRate.GAME,
  batchSize: number = 50,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.LINEAR_ACCELERATION,
    samplingRate,
    batchSize,
  );
}

/**
 * Start rotation vector sensor
 */
export async function startRotationVector(
  samplingRate: SensorSamplingRate = SensorSamplingRate.GAME,
  batchSize: number = 50,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.ROTATION_VECTOR,
    samplingRate,
    batchSize,
  );
}

/**
 * Start step detector sensor
 */
export async function startStepDetector(): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.STEP_DETECTOR,
    SensorSamplingRate.NORMAL,
    1,
  );
}

/**
 * Start step counter sensor
 */
export async function startStepCounter(): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.STEP_COUNTER,
    SensorSamplingRate.NORMAL,
    1,
  );
}

/**
 * Start light sensor
 */
export async function startLight(
  samplingRate: SensorSamplingRate = SensorSamplingRate.NORMAL,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.LIGHT,
    samplingRate,
    10,
  );
}

/**
 * Start pressure sensor
 */
export async function startPressure(
  samplingRate: SensorSamplingRate = SensorSamplingRate.NORMAL,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.PRESSURE,
    samplingRate,
    10,
  );
}

/**
 * Start proximity sensor
 */
export async function startProximity(): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.PROXIMITY,
    SensorSamplingRate.NORMAL,
    1,
  );
}

/**
 * Start temperature sensor
 */
export async function startTemperature(
  samplingRate: SensorSamplingRate = SensorSamplingRate.NORMAL,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.AMBIENT_TEMPERATURE,
    samplingRate,
    10,
  );
}

/**
 * Start humidity sensor
 */
export async function startHumidity(
  samplingRate: SensorSamplingRate = SensorSamplingRate.NORMAL,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.startSensor(
    AndroidSensorType.RELATIVE_HUMIDITY,
    samplingRate,
    10,
  );
}

/**
 * Stop specific sensor by type
 */
export async function stopSensor(
  sensorType: AndroidSensorType,
): Promise<boolean> {
  return await NativeSensorBridgeInstance.stopSensor(sensorType);
}

/**
 * Stop all sensors
 */
export async function stopAllSensors(): Promise<boolean> {
  return await NativeSensorBridgeInstance.stopAllSensors();
}
