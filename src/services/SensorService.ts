/**
 * Sensor Service
 * High-level service for managing sensor data collection sessions
 */

import {v4 as uuidv4} from 'uuid';
import {
  NativeSensorBridge,
  AndroidSensorType,
  SensorSamplingRate,
  SensorDataSample,
} from '@native';
import {
  streamManager,
  SensorDataStream,
  StreamState,
  StreamStats,
} from './SensorDataStream';

/**
 * Recording state
 */
export enum RecordingState {
  IDLE = 'idle',
  STARTING = 'starting',
  RECORDING = 'recording',
  PAUSING = 'pausing',
  PAUSED = 'paused',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
}

/**
 * Sensor configuration
 */
export interface SensorConfig {
  sensorType: AndroidSensorType;
  enabled: boolean;
  samplingRate?: SensorSamplingRate;
  batchSize?: number;
}

/**
 * Recording session info
 */
export interface RecordingSession {
  sessionId: string;
  deviceId: string;
  startTime: number;
  endTime?: number;
  state: RecordingState;
  enabledSensors: AndroidSensorType[];
  sensorConfigs: Map<AndroidSensorType, SensorConfig>;
}

/**
 * Recording statistics
 */
export interface RecordingStats {
  sessionId: string;
  duration: number; // milliseconds
  sensorStats: Map<AndroidSensorType, StreamStats>;
  totalSamples: number;
  totalDropped: number;
}

/**
 * Sensor data handler
 */
export type SensorDataHandler = (
  sessionId: string,
  sensorType: AndroidSensorType,
  samples: SensorDataSample[],
) => void | Promise<void>;

/**
 * Recording event listener
 */
export type RecordingEventListener = (event: RecordingEvent) => void;

/**
 * Recording event
 */
export interface RecordingEvent {
  type: 'state_change' | 'error' | 'stats_update';
  sessionId?: string;
  state?: RecordingState;
  error?: Error;
  stats?: RecordingStats;
  timestamp: number;
}

/**
 * Sensor Service Options
 */
export interface SensorServiceOptions {
  deviceId?: string;
  defaultSamplingRate?: SensorSamplingRate;
  defaultBatchSize?: number;
  enableAutoFlush?: boolean;
  autoFlushInterval?: number; // milliseconds
  maxBufferSize?: number;
  enableStats?: boolean;
  statsInterval?: number;
}

/**
 * Sensor Service
 * Manages sensor data collection sessions
 */
export class SensorService {
  private static instance: SensorService;

  // Current session
  private currentSession: RecordingSession | null = null;
  private recordingState: RecordingState = RecordingState.IDLE;

  // Configuration
  private deviceId: string;
  private defaultSamplingRate: SensorSamplingRate;
  private defaultBatchSize: number;
  private enableAutoFlush: boolean;
  private autoFlushInterval: number;
  private maxBufferSize: number;
  private enableStats: boolean;
  private statsInterval: number;

  // Data handler
  private dataHandler?: SensorDataHandler;

  // Event listeners
  private eventListeners: RecordingEventListener[] = [];

  // Auto-flush timer
  private autoFlushTimer?: NodeJS.Timeout;

  // Stats timer
  private statsTimer?: NodeJS.Timeout;

  /**
   * Private constructor (Singleton)
   */
  private constructor(options: SensorServiceOptions = {}) {
    this.deviceId = options.deviceId || this.generateDeviceId();
    this.defaultSamplingRate =
      options.defaultSamplingRate || SensorSamplingRate.GAME;
    this.defaultBatchSize = options.defaultBatchSize || 50;
    this.enableAutoFlush = options.enableAutoFlush ?? true;
    this.autoFlushInterval = options.autoFlushInterval || 5000;
    this.maxBufferSize = options.maxBufferSize || 1000;
    this.enableStats = options.enableStats ?? true;
    this.statsInterval = options.statsInterval || 5000;
  }

  /**
   * Get singleton instance
   */
  static getInstance(options?: SensorServiceOptions): SensorService {
    if (!SensorService.instance) {
      SensorService.instance = new SensorService(options);
    }
    return SensorService.instance;
  }

  /**
   * Initialize service
   */
  async initialize(): Promise<void> {
    // Check sensor availability
    const sensors = await NativeSensorBridge.getAvailableSensors();
    console.log(`SensorService initialized with ${sensors.length} sensors`);

    // Setup global error handler
    streamManager.setGlobalErrorHandler(this.handleStreamError.bind(this));
  }

  /**
   * Start recording session
   */
  async startRecording(
    sensorConfigs: SensorConfig[],
    dataHandler: SensorDataHandler,
  ): Promise<string> {
    if (this.recordingState !== RecordingState.IDLE) {
      throw new Error(
        `Cannot start recording: current state is ${this.recordingState}`,
      );
    }

    this.setRecordingState(RecordingState.STARTING);

    try {
      // Create session
      const sessionId = uuidv4();
      const enabledSensors = sensorConfigs
        .filter(config => config.enabled)
        .map(config => config.sensorType);

      this.currentSession = {
        sessionId,
        deviceId: this.deviceId,
        startTime: Date.now(),
        state: RecordingState.STARTING,
        enabledSensors,
        sensorConfigs: new Map(
          sensorConfigs.map(config => [config.sensorType, config]),
        ),
      };

      this.dataHandler = dataHandler;

      // Start sensors
      for (const config of sensorConfigs) {
        if (config.enabled) {
          await this.startSensor(sessionId, config);
        }
      }

      // Start auto-flush timer
      if (this.enableAutoFlush) {
        this.startAutoFlush();
      }

      // Start stats timer
      if (this.enableStats) {
        this.startStatsTracking();
      }

      this.setRecordingState(RecordingState.RECORDING);
      console.log(`Recording started: ${sessionId}`);

      return sessionId;
    } catch (error) {
      this.setRecordingState(RecordingState.ERROR);
      this.emitEvent({
        type: 'error',
        error: error as Error,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Stop recording session
   */
  async stopRecording(): Promise<void> {
    if (
      this.recordingState !== RecordingState.RECORDING &&
      this.recordingState !== RecordingState.PAUSED
    ) {
      throw new Error(
        `Cannot stop recording: current state is ${this.recordingState}`,
      );
    }

    this.setRecordingState(RecordingState.STOPPING);

    try {
      // Stop auto-flush timer
      this.stopAutoFlush();

      // Stop stats timer
      this.stopStatsTracking();

      // Flush all streams
      await streamManager.flushAllStreams();

      // Stop all streams
      await streamManager.stopAllStreams();

      // Stop all native sensors
      await NativeSensorBridge.stopAllSensors();

      // Update session
      if (this.currentSession) {
        this.currentSession.endTime = Date.now();
        this.currentSession.state = RecordingState.STOPPED;
      }

      this.setRecordingState(RecordingState.STOPPED);
      console.log(`Recording stopped: ${this.currentSession?.sessionId}`);

      // Clear current session
      const sessionId = this.currentSession?.sessionId;
      this.currentSession = null;
      this.dataHandler = undefined;

      // Emit final stats
      if (sessionId && this.enableStats) {
        this.emitStats(sessionId);
      }

      // Reset to idle
      this.setRecordingState(RecordingState.IDLE);
    } catch (error) {
      this.setRecordingState(RecordingState.ERROR);
      this.emitEvent({
        type: 'error',
        error: error as Error,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Pause recording
   */
  async pauseRecording(): Promise<void> {
    if (this.recordingState !== RecordingState.RECORDING) {
      throw new Error(
        `Cannot pause recording: current state is ${this.recordingState}`,
      );
    }

    this.setRecordingState(RecordingState.PAUSING);

    try {
      // Pause all streams
      const sensors = this.currentSession?.enabledSensors || [];
      for (const sensorType of sensors) {
        const stream = streamManager.getStream(sensorType);
        if (stream) {
          stream.pause();
        }
      }

      this.setRecordingState(RecordingState.PAUSED);
      console.log('Recording paused');
    } catch (error) {
      this.setRecordingState(RecordingState.ERROR);
      throw error;
    }
  }

  /**
   * Resume recording
   */
  async resumeRecording(): Promise<void> {
    if (this.recordingState !== RecordingState.PAUSED) {
      throw new Error(
        `Cannot resume recording: current state is ${this.recordingState}`,
      );
    }

    try {
      // Resume all streams
      const sensors = this.currentSession?.enabledSensors || [];
      for (const sensorType of sensors) {
        const stream = streamManager.getStream(sensorType);
        if (stream) {
          stream.resume();
        }
      }

      this.setRecordingState(RecordingState.RECORDING);
      console.log('Recording resumed');
    } catch (error) {
      this.setRecordingState(RecordingState.ERROR);
      throw error;
    }
  }

  /**
   * Get current recording state
   */
  getRecordingState(): RecordingState {
    return this.recordingState;
  }

  /**
   * Get current session
   */
  getCurrentSession(): RecordingSession | null {
    return this.currentSession;
  }

  /**
   * Get recording statistics
   */
  getRecordingStats(): RecordingStats | null {
    if (!this.currentSession) {
      return null;
    }

    const allStats = streamManager.getAllStats();
    let totalSamples = 0;
    let totalDropped = 0;

    allStats.forEach(stats => {
      totalSamples += stats.totalSamples;
      totalDropped += stats.droppedSamples;
    });

    const duration = Date.now() - this.currentSession.startTime;

    return {
      sessionId: this.currentSession.sessionId,
      duration,
      sensorStats: allStats,
      totalSamples,
      totalDropped,
    };
  }

  /**
   * Check if sensor is available
   */
  async isSensorAvailable(sensorType: AndroidSensorType): Promise<boolean> {
    return await NativeSensorBridge.isSensorAvailable(sensorType);
  }

  /**
   * Get available sensors
   */
  async getAvailableSensors() {
    return await NativeSensorBridge.getAvailableSensors();
  }

  /**
   * Add event listener
   */
  addEventListener(listener: RecordingEventListener): () => void {
    this.eventListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners(): void {
    this.eventListeners = [];
  }

  /**
   * Cleanup service
   */
  async cleanup(): Promise<void> {
    // Stop recording if active
    if (
      this.recordingState === RecordingState.RECORDING ||
      this.recordingState === RecordingState.PAUSED
    ) {
      await this.stopRecording();
    }

    // Stop timers
    this.stopAutoFlush();
    this.stopStatsTracking();

    // Cleanup stream manager
    streamManager.cleanup();

    // Clear listeners
    this.removeAllEventListeners();

    // Clear session
    this.currentSession = null;
    this.dataHandler = undefined;
  }

  /**
   * Start individual sensor
   */
  private async startSensor(
    sessionId: string,
    config: SensorConfig,
  ): Promise<void> {
    const {sensorType, samplingRate, batchSize} = config;

    // Start native sensor
    await NativeSensorBridge.startSensor(
      sensorType,
      samplingRate || this.defaultSamplingRate,
      batchSize || this.defaultBatchSize,
    );

    // Start stream
    streamManager.startStream(
      sensorType,
      async (type, samples) => {
        if (this.dataHandler) {
          await this.dataHandler(sessionId, type, samples);
        }
      },
      this.handleStreamError.bind(this),
      {
        maxBufferSize: this.maxBufferSize,
        enableBackpressure: true,
        dropStrategy: 'oldest',
      },
    );

    console.log(`Started sensor: ${sensorType}`);
  }

  /**
   * Set recording state and emit event
   */
  private setRecordingState(state: RecordingState): void {
    const previousState = this.recordingState;
    this.recordingState = state;

    if (this.currentSession) {
      this.currentSession.state = state;
    }

    // Emit state change event
    if (previousState !== state) {
      this.emitEvent({
        type: 'state_change',
        sessionId: this.currentSession?.sessionId,
        state,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: RecordingEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Emit statistics
   */
  private emitStats(sessionId: string): void {
    const stats = this.getRecordingStats();
    if (stats) {
      this.emitEvent({
        type: 'stats_update',
        sessionId,
        stats,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle stream error
   */
  private handleStreamError(error: Error): void {
    console.error('Stream error:', error);
    this.emitEvent({
      type: 'error',
      error,
      timestamp: Date.now(),
    });
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    this.autoFlushTimer = setInterval(async () => {
      try {
        await streamManager.flushAllStreams();
      } catch (error) {
        console.error('Auto-flush error:', error);
      }
    }, this.autoFlushInterval);
  }

  /**
   * Stop auto-flush timer
   */
  private stopAutoFlush(): void {
    if (this.autoFlushTimer) {
      clearInterval(this.autoFlushTimer);
      this.autoFlushTimer = undefined;
    }
  }

  /**
   * Start statistics tracking
   */
  private startStatsTracking(): void {
    this.statsTimer = setInterval(() => {
      if (this.currentSession) {
        this.emitStats(this.currentSession.sessionId);
      }
    }, this.statsInterval);
  }

  /**
   * Stop statistics tracking
   */
  private stopStatsTracking(): void {
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = undefined;
    }
  }

  /**
   * Generate device ID
   */
  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

/**
 * Get singleton instance
 */
export const sensorService = SensorService.getInstance();

/**
 * Export default
 */
export default sensorService;
