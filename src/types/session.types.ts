/**
 * Session Types
 * Type definitions for recording sessions
 */

import type {SyncableRecord} from './common.types';
import type {SensorType} from './sensor.types';

/**
 * Session status enum
 */
export enum SessionStatus {
  IDLE = 'idle',
  PREPARING = 'preparing',
  RECORDING = 'recording',
  PAUSED = 'paused',
  STOPPING = 'stopping',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Session metadata
 */
export interface SessionMetadata {
  /**
   * User-provided notes or description
   */
  notes?: string;

  /**
   * Tags for categorization
   */
  tags?: string[];

  /**
   * Location information
   */
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  /**
   * Environment conditions
   */
  environment?: {
    indoorOutdoor?: 'indoor' | 'outdoor';
    lighting?: 'dark' | 'dim' | 'normal' | 'bright';
    temperature?: number;
    humidity?: number;
  };

  /**
   * Activity type
   */
  activityType?: 'walking' | 'running' | 'sitting' | 'standing' | 'cycling' | 'driving' | 'other';

  /**
   * Subject information (anonymized)
   */
  subject?: {
    id: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    height?: number; // in cm
    weight?: number; // in kg
  };

  /**
   * Device information
   */
  device?: {
    manufacturer: string;
    model: string;
    osVersion: string;
    appVersion: string;
  };

  /**
   * Custom metadata fields
   */
  customFields?: Record<string, any>;
}

/**
 * Session statistics
 */
export interface SessionStats {
  /**
   * Total number of sensor data points collected
   */
  totalDataPoints: number;

  /**
   * Data points per sensor type
   */
  dataPointsBySensor: Partial<Record<SensorType, number>>;

  /**
   * Total duration in milliseconds
   */
  duration: number;

  /**
   * Average sample rate (samples per second)
   */
  avgSampleRate: number;

  /**
   * Total file size in bytes
   */
  totalFileSize: number;

  /**
   * Audio recording count
   */
  audioRecordingCount: number;

  /**
   * Total audio duration in seconds
   */
  totalAudioDuration: number;

  /**
   * Step count data
   */
  stepStats?: {
    totalSteps: number;
    walkingSteps: number;
    runningSteps: number;
  };

  /**
   * GPS track statistics
   */
  gpsStats?: {
    totalDistance: number; // in meters
    avgSpeed: number; // in m/s
    maxSpeed: number; // in m/s
    elevationGain: number; // in meters
    elevationLoss: number; // in meters
  };
}

/**
 * Session configuration
 */
export interface SessionConfig {
  /**
   * Enabled sensor types
   */
  enabledSensors: SensorType[];

  /**
   * Sample rate in Hz (samples per second)
   */
  sampleRate: number;

  /**
   * Auto-stop after duration (milliseconds)
   */
  autoStopAfter?: number;

  /**
   * Auto-pause when device is stationary
   */
  autoPauseOnStationary?: boolean;

  /**
   * Save to local storage
   */
  saveToLocal: boolean;

  /**
   * Auto-sync to server
   */
  autoSync: boolean;

  /**
   * Sync interval in milliseconds (if autoSync is true)
   */
  syncInterval?: number;

  /**
   * Compress data before saving
   */
  compressData: boolean;

  /**
   * File format for sensor data
   */
  dataFormat: 'json' | 'jsonl' | 'csv';

  /**
   * Audio recording settings (if audio sensor is enabled)
   */
  audioSettings?: {
    enabled: boolean;
    format: 'wav' | 'aac' | 'mp3';
    sampleRate: number;
    bitrate: number;
    channels: 1 | 2;
    segmentDuration: number; // in seconds
  };
}

/**
 * Session interface (extends SyncableRecord)
 */
export interface Session extends SyncableRecord {
  /**
   * Unique session identifier
   */
  sessionId: string;

  /**
   * Session status
   */
  status: SessionStatus;

  /**
   * Start timestamp (milliseconds since epoch)
   */
  startTime: number;

  /**
   * End timestamp (milliseconds since epoch)
   */
  endTime?: number;

  /**
   * Session configuration
   */
  config: SessionConfig;

  /**
   * Session metadata
   */
  metadata: SessionMetadata;

  /**
   * Session statistics (computed)
   */
  stats?: SessionStats;

  /**
   * Is uploaded to server
   */
  isUploaded: boolean;

  /**
   * Upload progress (0-100)
   */
  uploadProgress?: number;

  /**
   * Error message if failed
   */
  errorMessage?: string;
}

/**
 * Session creation parameters
 */
export interface CreateSessionParams {
  config: SessionConfig;
  metadata?: Partial<SessionMetadata>;
}

/**
 * Session update parameters
 */
export interface UpdateSessionParams {
  status?: SessionStatus;
  endTime?: number;
  metadata?: Partial<SessionMetadata>;
  stats?: Partial<SessionStats>;
  errorMessage?: string;
}

/**
 * Session filter parameters
 */
export interface SessionFilterParams {
  status?: SessionStatus | SessionStatus[];
  startDate?: Date;
  endDate?: Date;
  sensorTypes?: SensorType[];
  isUploaded?: boolean;
  tags?: string[];
  activityType?: string;
}

/**
 * Session export options
 */
export interface SessionExportOptions {
  format: 'json' | 'jsonl' | 'csv' | 'zip';
  includeSensorData: boolean;
  includeAudioFiles: boolean;
  includeMetadata: boolean;
  compress: boolean;
  splitByDate?: boolean;
  splitBySensor?: boolean;
}

/**
 * Session import result
 */
export interface SessionImportResult {
  success: boolean;
  sessionId?: string;
  dataPointsImported: number;
  filesImported: number;
  errors: string[];
  warnings: string[];
}
