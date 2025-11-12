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
 * Union type for all sensor data
 */
export type SensorData =
  | AccelerometerData
  | GyroscopeData
  | MagnetometerData
  | GPSData
  | AudioData
  | StepDetectorData;

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
}
