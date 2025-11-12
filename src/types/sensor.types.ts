/**
 * Sensor data types for KooDTX
 */

import type {SyncStatus} from './common.types';

/**
 * Sensor type enum
 */
export enum SensorType {
  ACCELEROMETER = 'accelerometer',
  GYROSCOPE = 'gyroscope',
  MAGNETOMETER = 'magnetometer',
  GPS = 'gps',
  AUDIO = 'audio',
  STEP_DETECTOR = 'step_detector',
  STEP_COUNTER = 'step_counter',
  SIGNIFICANT_MOTION = 'significant_motion',
  PROXIMITY = 'proximity',
  LIGHT = 'light',
  PRESSURE = 'pressure',
}

/**
 * Base sensor data interface
 */
export interface BaseSensorData {
  id?: string;
  sensorType: SensorType;
  timestamp: number;
  sessionId: string;
  isUploaded?: boolean;
  createdAt?: number;
  updatedAt?: number;
  syncStatus?: SyncStatus;
  syncedAt?: number;
  deviceId?: string;
}

/**
 * Accelerometer data (3-axis acceleration in m/s²)
 */
export interface AccelerometerData extends BaseSensorData {
  sensorType: SensorType.ACCELEROMETER;
  x: number;
  y: number;
  z: number;
}

/**
 * Gyroscope data (3-axis rotation rate in rad/s)
 */
export interface GyroscopeData extends BaseSensorData {
  sensorType: SensorType.GYROSCOPE;
  x: number;
  y: number;
  z: number;
}

/**
 * Magnetometer data (3-axis magnetic field in μT)
 */
export interface MagnetometerData extends BaseSensorData {
  sensorType: SensorType.MAGNETOMETER;
  x: number;
  y: number;
  z: number;
}

/**
 * GPS data
 */
export interface GPSData extends BaseSensorData {
  sensorType: SensorType.GPS;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  speed?: number;
  heading?: number;
}

/**
 * Audio recording metadata
 */
export interface AudioData extends BaseSensorData {
  sensorType: SensorType.AUDIO;
  filePath: string;
  fileSize: number;
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
  isUploaded: boolean;
  uploadedUrl?: string;
}

/**
 * Step activity type
 */
export enum StepActivityType {
  WALKING = 'walking',
  RUNNING = 'running',
  UNKNOWN = 'unknown',
}

/**
 * Step detector data (event-based step detection)
 */
export interface StepDetectorData extends BaseSensorData {
  sensorType: SensorType.STEP_DETECTOR;
  elapsedRealtimeNanos: number; // Elapsed time in nanoseconds since boot
  utcEpochMs: number; // UTC timestamp in milliseconds
  activityType: StepActivityType; // Walking or running classification
  confidence?: number; // Confidence level (0-1) for activity classification
}

/**
 * Step counter data (cumulative step count)
 */
export interface StepCounterData extends BaseSensorData {
  sensorType: SensorType.STEP_COUNTER;
  elapsedRealtimeNanos: number; // Elapsed time in nanoseconds since boot
  count: number; // Cumulative step count since boot
  delta: number; // Steps since last sample
}

/**
 * Significant motion event types
 */
export enum SignificantMotionType {
  FALL = 'fall',               // Free fall detected
  THROW = 'throw',             // Throwing motion
  SHAKE = 'shake',             // Strong shaking
  IMPACT = 'impact',           // Sudden impact
  UNKNOWN = 'unknown',         // Unclassified significant motion
}

/**
 * Significant motion data (one-shot event detection)
 */
export interface SignificantMotionData extends BaseSensorData {
  sensorType: SensorType.SIGNIFICANT_MOTION;
  elapsedRealtimeNanos: number; // Elapsed time in nanoseconds since boot
  motionType: SignificantMotionType; // Type of motion detected
  magnitude: number; // Motion magnitude (m/s²)
  duration?: number; // Duration of motion event (ms)
}

/**
 * Proximity sensor data
 */
export interface ProximityData extends BaseSensorData {
  sensorType: SensorType.PROXIMITY;
  distance: number; // Distance in centimeters (device-specific max range)
  isNear: boolean; // Boolean indicating if object is near
  maxRange: number; // Maximum detection range of the sensor (cm)
}

/**
 * Light sensor data (ambient light)
 */
export interface LightData extends BaseSensorData {
  sensorType: SensorType.LIGHT;
  lux: number; // Illuminance in lux (SI unit)
  brightnessLevel?: 'dark' | 'dim' | 'normal' | 'bright' | 'very_bright'; // Categorized brightness
}

/**
 * Pressure sensor data (barometer)
 */
export interface PressureData extends BaseSensorData {
  sensorType: SensorType.PRESSURE;
  pressure: number; // Atmospheric pressure in hPa (hectopascals) or mbar
  altitude?: number; // Estimated altitude in meters (calculated from pressure)
  seaLevelPressure?: number; // Reference sea level pressure for altitude calculation (hPa)
}

/**
 * Union type for all sensor data
 */
export type SensorData =
  | AccelerometerData
  | GyroscopeData
  | MagnetometerData
  | GPSData
  | AudioData
  | StepDetectorData
  | StepCounterData
  | SignificantMotionData
  | ProximityData
  | LightData
  | PressureData;

/**
 * Sensor recording session
 */
export interface RecordingSession extends SyncableRecord {
  sessionId: string;
  startTime: number;
  endTime?: number;
  isActive: boolean;
  enabledSensors: SensorType[];
  sampleRate: number;
  dataCount: number;
  notes?: string;
}

/**
 * Sensor configuration
 */
export interface SensorConfig {
  enabled: boolean;
  sampleRate: number;
  sensitivity?: number;
}

/**
 * Complete sensor settings
 */
export interface SensorSettings {
  [SensorType.ACCELEROMETER]: SensorConfig;
  [SensorType.GYROSCOPE]: SensorConfig;
  [SensorType.MAGNETOMETER]: SensorConfig;
  [SensorType.GPS]: SensorConfig;
  [SensorType.AUDIO]: SensorConfig & {
    format: 'wav' | 'aac' | 'mp3';
    bitrate: number;
    channels: 1 | 2;
  };
  [SensorType.STEP_DETECTOR]: SensorConfig & {
    activityDetection: boolean; // Enable walking/running classification
  };
  [SensorType.STEP_COUNTER]: SensorConfig & {
    resetOnBoot: boolean; // Track boot events and reset count
  };
  [SensorType.SIGNIFICANT_MOTION]: SensorConfig & {
    motionClassification: boolean; // Enable motion type classification
    minimumMagnitude: number; // Minimum magnitude to trigger (m/s²)
  };
  [SensorType.PROXIMITY]: SensorConfig & {
    wakeOnProximity: boolean; // Wake screen when object detected
  };
  [SensorType.LIGHT]: SensorConfig & {
    autoBrightness: boolean; // Enable automatic brightness adjustment
    brightnessThresholds?: {
      dark: number; // lux threshold for dark (< value)
      dim: number; // lux threshold for dim
      normal: number; // lux threshold for normal
      bright: number; // lux threshold for bright
    };
  };
  [SensorType.PRESSURE]: SensorConfig & {
    altitudeCalculation: boolean; // Calculate altitude from pressure
    seaLevelPressure: number; // Reference pressure for altitude calculation (default: 1013.25 hPa)
  };
}
