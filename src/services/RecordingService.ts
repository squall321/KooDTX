/**
 * Recording Service
 * Phase 96: Integrated sensor + audio recording service
 * Phase 97: Wake lock management
 * Phase 99: Background recording optimization
 *
 * Features:
 * - Simultaneous sensor and audio recording
 * - Synchronized timestamps
 * - Shared session ID
 * - Unified start/stop control
 * - Data consistency guarantee
 * - Error synchronization
 * - Performance optimization
 * - Wake lock management (keep screen on)
 * - Foreground service for background recording
 */

import {sensorService, SensorService, SensorConfig, RecordingState as SensorRecordingState} from './SensorService';
import {audioService, AudioRecordingOptions, AudioRecordingState} from './audio/AudioService';
import {wakeLockService, WakeLockOptions} from './power/WakeLockService';
import {foregroundServiceManager, ForegroundServiceOptions} from './background/ForegroundServiceManager';
import {AndroidSensorType, SensorDataSample} from '@native';
import {v4 as uuidv4} from 'uuid';
import {logger} from '../utils/logger';

/**
 * Recording mode
 */
export enum RecordingMode {
  SENSOR_ONLY = 'sensor_only',
  AUDIO_ONLY = 'audio_only',
  SENSOR_AND_AUDIO = 'sensor_and_audio',
}

/**
 * Integrated recording state
 */
export enum IntegratedRecordingState {
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
 * Recording session
 */
export interface RecordingSessionInfo {
  sessionId: string;
  mode: RecordingMode;
  startTimestamp: number;
  endTimestamp?: number;
  state: IntegratedRecordingState;
  sensorEnabled: boolean;
  audioEnabled: boolean;
  enabledSensors: AndroidSensorType[];
}

/**
 * Recording configuration
 */
export interface RecordingConfig {
  mode: RecordingMode;
  sensorConfigs?: SensorConfig[];
  audioOptions?: AudioRecordingOptions;
  wakeLockOptions?: WakeLockOptions; // Phase 97: Wake lock configuration
  foregroundServiceOptions?: ForegroundServiceOptions; // Phase 99: Background recording
}

/**
 * Recording statistics
 */
export interface IntegratedRecordingStats {
  sessionId: string;
  duration: number; // milliseconds
  sensorStats?: {
    totalSamples: number;
    totalDropped: number;
    sensorsActive: number;
  };
  audioStats?: {
    totalDuration: number;
    totalChunks: number;
    peakDbLevel: number;
  };
}

/**
 * Recording event
 */
export interface RecordingEvent {
  type: 'state_change' | 'error' | 'stats_update';
  sessionId?: string;
  state?: IntegratedRecordingState;
  error?: Error;
  stats?: IntegratedRecordingStats;
  timestamp: number;
}

/**
 * Recording event listener
 */
export type RecordingEventListener = (event: RecordingEvent) => void;

/**
 * Sensor data handler
 */
export type IntegratedSensorDataHandler = (
  sessionId: string,
  sensorType: AndroidSensorType,
  samples: SensorDataSample[],
) => void | Promise<void>;

/**
 * Recording Service
 * Manages integrated sensor + audio recording
 */
export class RecordingService {
  private static instance: RecordingService;

  // Current session
  private currentSession: RecordingSessionInfo | null = null;
  private state: IntegratedRecordingState = IntegratedRecordingState.IDLE;

  // Handlers
  private sensorDataHandler?: IntegratedSensorDataHandler;

  // Event listeners
  private eventListeners: Set<RecordingEventListener> = new Set();

  // Synchronization
  private sessionStartTime: number | null = null;

  // Error tracking
  private sensorError: Error | null = null;
  private audioError: Error | null = null;

  /**
   * Private constructor (Singleton)
   */
  private constructor() {
    // Setup error listeners
    this.setupErrorListeners();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RecordingService {
    if (!RecordingService.instance) {
      RecordingService.instance = new RecordingService();
    }
    return RecordingService.instance;
  }

  /**
   * Start integrated recording
   * Phase 96: Simultaneous sensor + audio start
   *
   * @param config Recording configuration
   * @param sensorDataHandler Optional sensor data handler
   * @returns Session ID
   */
  public async startRecording(
    config: RecordingConfig,
    sensorDataHandler?: IntegratedSensorDataHandler,
  ): Promise<string> {
    if (this.state !== IntegratedRecordingState.IDLE) {
      throw new Error(`Cannot start recording in state: ${this.state}`);
    }

    this.setState(IntegratedRecordingState.STARTING);

    try {
      // Generate session ID and timestamp
      // Phase 96: Session ID sharing
      const sessionId = uuidv4();
      const startTimestamp = Date.now();
      this.sessionStartTime = startTimestamp;

      // Create session info
      this.currentSession = {
        sessionId,
        mode: config.mode,
        startTimestamp,
        state: IntegratedRecordingState.STARTING,
        sensorEnabled: config.mode === RecordingMode.SENSOR_ONLY || config.mode === RecordingMode.SENSOR_AND_AUDIO,
        audioEnabled: config.mode === RecordingMode.AUDIO_ONLY || config.mode === RecordingMode.SENSOR_AND_AUDIO,
        enabledSensors: config.sensorConfigs?.filter(c => c.enabled).map(c => c.sensorType) || [],
      };

      this.sensorDataHandler = sensorDataHandler;

      // Clear previous errors
      this.sensorError = null;
      this.audioError = null;

      // Configure wake lock
      // Phase 97: Wake lock configuration
      if (config.wakeLockOptions) {
        wakeLockService.configure(config.wakeLockOptions);
      }

      // Start services based on mode
      // Phase 96: Synchronized start
      if (config.mode === RecordingMode.SENSOR_AND_AUDIO) {
        // Start both simultaneously
        await Promise.all([
          this.startSensorRecording(sessionId, config.sensorConfigs || []),
          this.startAudioRecording(sessionId, config.audioOptions || {}),
        ]);
      } else if (config.mode === RecordingMode.SENSOR_ONLY) {
        await this.startSensorRecording(sessionId, config.sensorConfigs || []);
      } else if (config.mode === RecordingMode.AUDIO_ONLY) {
        await this.startAudioRecording(sessionId, config.audioOptions || {});
      }

      // Activate wake lock
      // Phase 97: Keep screen on during recording
      try {
        await wakeLockService.activate(sessionId);
      } catch (error) {
        logger.warn('Failed to activate wake lock:', error);
        // Don't fail recording if wake lock fails
      }

      // Start foreground service
      // Phase 99: Background recording support
      if (config.foregroundServiceOptions) {
        try {
          await foregroundServiceManager.startForegroundService(
            sessionId,
            config.foregroundServiceOptions,
          );
        } catch (error) {
          logger.warn('Failed to start foreground service:', error);
          // Don't fail recording if foreground service fails
        }
      }

      this.setState(IntegratedRecordingState.RECORDING);
      logger.log(`Integrated recording started: ${sessionId} (mode: ${config.mode})`);

      return sessionId;

    } catch (error) {
      this.setState(IntegratedRecordingState.ERROR);
      const err = error instanceof Error ? error : new Error(String(error));
      this.emitEvent({
        type: 'error',
        error: err,
        timestamp: Date.now(),
      });
      throw err;
    }
  }

  /**
   * Stop integrated recording
   * Phase 96: Synchronized stop
   */
  public async stopRecording(): Promise<void> {
    if (
      this.state !== IntegratedRecordingState.RECORDING &&
      this.state !== IntegratedRecordingState.PAUSED
    ) {
      throw new Error(`Cannot stop recording in state: ${this.state}`);
    }

    this.setState(IntegratedRecordingState.STOPPING);

    try {
      const promises: Promise<void>[] = [];

      // Stop sensor recording
      if (this.currentSession?.sensorEnabled) {
        const sensorState = sensorService.getRecordingState();
        if (sensorState === SensorRecordingState.RECORDING || sensorState === SensorRecordingState.PAUSED) {
          promises.push(sensorService.stopRecording());
        }
      }

      // Stop audio recording
      if (this.currentSession?.audioEnabled) {
        const audioState = audioService.getState();
        if (audioState === AudioRecordingState.RECORDING || audioState === AudioRecordingState.PAUSED) {
          promises.push(audioService.stopRecording());
        }
      }

      // Wait for both to stop
      // Phase 96: Synchronized stop
      await Promise.all(promises);

      // Update session
      if (this.currentSession) {
        this.currentSession.endTimestamp = Date.now();
        this.currentSession.state = IntegratedRecordingState.STOPPED;
      }

      this.setState(IntegratedRecordingState.STOPPED);
      logger.log(`Integrated recording stopped: ${this.currentSession?.sessionId}`);

      // Emit final stats
      this.emitStats();

      // Deactivate wake lock
      // Phase 97: Release wake lock
      try {
        await wakeLockService.deactivate(this.currentSession?.sessionId);
      } catch (error) {
        logger.warn('Failed to deactivate wake lock:', error);
        // Don't fail recording stop if wake lock deactivation fails
      }

      // Stop foreground service
      // Phase 99: Background recording cleanup
      if (foregroundServiceManager.isRunning()) {
        try {
          await foregroundServiceManager.stopForegroundService();
        } catch (error) {
          logger.warn('Failed to stop foreground service:', error);
          // Don't fail recording stop if foreground service stop fails
        }
      }

      // Clear session
      this.currentSession = null;
      this.sessionStartTime = null;
      this.sensorDataHandler = undefined;

      // Reset to idle
      this.setState(IntegratedRecordingState.IDLE);

    } catch (error) {
      this.setState(IntegratedRecordingState.ERROR);
      const err = error instanceof Error ? error : new Error(String(error));
      this.emitEvent({
        type: 'error',
        error: err,
        timestamp: Date.now(),
      });
      throw err;
    }
  }

  /**
   * Pause integrated recording
   */
  public async pauseRecording(): Promise<void> {
    if (this.state !== IntegratedRecordingState.RECORDING) {
      throw new Error(`Cannot pause recording in state: ${this.state}`);
    }

    this.setState(IntegratedRecordingState.PAUSING);

    try {
      const promises: Promise<void>[] = [];

      // Pause sensor recording
      if (this.currentSession?.sensorEnabled) {
        promises.push(sensorService.pauseRecording());
      }

      // Pause audio recording
      if (this.currentSession?.audioEnabled) {
        promises.push(audioService.pauseRecording());
      }

      await Promise.all(promises);

      // Deactivate wake lock during pause
      // Phase 97: Release wake lock on pause
      try {
        await wakeLockService.deactivate(this.currentSession?.sessionId);
      } catch (error) {
        logger.warn('Failed to deactivate wake lock on pause:', error);
      }

      this.setState(IntegratedRecordingState.PAUSED);
      logger.log('Integrated recording paused');

    } catch (error) {
      this.setState(IntegratedRecordingState.ERROR);
      throw error;
    }
  }

  /**
   * Resume integrated recording
   */
  public async resumeRecording(): Promise<void> {
    if (this.state !== IntegratedRecordingState.PAUSED) {
      throw new Error(`Cannot resume recording in state: ${this.state}`);
    }

    try {
      const promises: Promise<void>[] = [];

      // Resume sensor recording
      if (this.currentSession?.sensorEnabled) {
        promises.push(sensorService.resumeRecording());
      }

      // Resume audio recording
      if (this.currentSession?.audioEnabled) {
        promises.push(audioService.resumeRecording());
      }

      await Promise.all(promises);

      // Re-activate wake lock on resume
      // Phase 97: Re-activate wake lock on resume
      try {
        await wakeLockService.activate(this.currentSession?.sessionId);
      } catch (error) {
        logger.warn('Failed to re-activate wake lock on resume:', error);
      }

      this.setState(IntegratedRecordingState.RECORDING);
      logger.log('Integrated recording resumed');

    } catch (error) {
      this.setState(IntegratedRecordingState.ERROR);
      throw error;
    }
  }

  /**
   * Get current state
   */
  public getState(): IntegratedRecordingState {
    return this.state;
  }

  /**
   * Get current session
   */
  public getCurrentSession(): RecordingSessionInfo | null {
    return this.currentSession;
  }

  /**
   * Get integrated statistics
   */
  public getStatistics(): IntegratedRecordingStats | null {
    if (!this.currentSession) {
      return null;
    }

    const duration = Date.now() - this.currentSession.startTimestamp;

    const stats: IntegratedRecordingStats = {
      sessionId: this.currentSession.sessionId,
      duration,
    };

    // Add sensor stats
    if (this.currentSession.sensorEnabled) {
      const sensorStats = sensorService.getRecordingStats();
      if (sensorStats) {
        stats.sensorStats = {
          totalSamples: sensorStats.totalSamples,
          totalDropped: sensorStats.totalDropped,
          sensorsActive: this.currentSession.enabledSensors.length,
        };
      }
    }

    // Add audio stats
    if (this.currentSession.audioEnabled) {
      const audioStats = audioService.getStatistics();
      stats.audioStats = {
        totalDuration: audioStats.totalDuration,
        totalChunks: audioStats.totalChunks,
        peakDbLevel: audioStats.peakDbLevel,
      };
    }

    return stats;
  }

  /**
   * Check if recording
   */
  public isRecording(): boolean {
    return this.state === IntegratedRecordingState.RECORDING;
  }

  /**
   * Check if paused
   */
  public isPaused(): boolean {
    return this.state === IntegratedRecordingState.PAUSED;
  }

  /**
   * Add event listener
   */
  public addEventListener(listener: RecordingEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Remove all event listeners
   */
  public removeAllEventListeners(): void {
    this.eventListeners.clear();
  }

  /**
   * Cleanup service
   */
  public async cleanup(): Promise<void> {
    // Stop recording if active
    if (this.state === IntegratedRecordingState.RECORDING || this.state === IntegratedRecordingState.PAUSED) {
      await this.stopRecording();
    }

    // Force release wake lock
    // Phase 97: Emergency cleanup
    try {
      await wakeLockService.forceRelease();
    } catch (error) {
      logger.warn('Failed to force release wake lock during cleanup:', error);
    }

    // Force stop foreground service
    // Phase 99: Emergency cleanup
    try {
      await foregroundServiceManager.cleanup();
    } catch (error) {
      logger.warn('Failed to cleanup foreground service during cleanup:', error);
    }

    // Clear listeners
    this.removeAllEventListeners();

    // Clear session
    this.currentSession = null;
    this.sessionStartTime = null;
    this.sensorDataHandler = undefined;
  }

  /**
   * Start sensor recording
   * Phase 96: Sensor integration
   *
   * @param sessionId Session ID
   * @param sensorConfigs Sensor configurations
   */
  private async startSensorRecording(
    sessionId: string,
    sensorConfigs: SensorConfig[],
  ): Promise<void> {
    await sensorService.startRecording(
      sensorConfigs,
      async (sid, sensorType, samples) => {
        // Phase 96: Timestamp synchronization
        // Add session start time offset to all samples
        if (this.sessionStartTime) {
          samples.forEach(sample => {
            if (!sample.sessionTimestamp) {
              sample.sessionTimestamp = sample.timestamp - this.sessionStartTime!;
            }
          });
        }

        // Call user's data handler
        if (this.sensorDataHandler) {
          await this.sensorDataHandler(sessionId, sensorType, samples);
        }
      },
    );
  }

  /**
   * Start audio recording
   * Phase 96: Audio integration
   *
   * @param sessionId Session ID
   * @param audioOptions Audio options
   */
  private async startAudioRecording(
    sessionId: string,
    audioOptions: AudioRecordingOptions,
  ): Promise<void> {
    await audioService.startRecording(sessionId, audioOptions);
  }

  /**
   * Setup error listeners for both services
   * Phase 96: Error synchronization
   */
  private setupErrorListeners(): void {
    // Sensor error listener
    sensorService.addEventListener(event => {
      if (event.type === 'error' && event.error) {
        this.sensorError = event.error;
        this.handleSubserviceError('sensor', event.error);
      }
    });

    // Audio error listener
    audioService.addErrorListener(error => {
      this.audioError = error;
      this.handleSubserviceError('audio', error);
    });
  }

  /**
   * Handle sub-service error
   * Phase 96: Error synchronization
   *
   * @param service Service name
   * @param error Error
   */
  private handleSubserviceError(service: 'sensor' | 'audio', error: Error): void {
    logger.error(`${service} service error:`, error);

    // If recording, emit error and consider stopping
    if (this.state === IntegratedRecordingState.RECORDING || this.state === IntegratedRecordingState.PAUSED) {
      this.emitEvent({
        type: 'error',
        sessionId: this.currentSession?.sessionId,
        error: new Error(`${service} error: ${error.message}`),
        timestamp: Date.now(),
      });

      // Optionally stop recording on critical errors
      // this.stopRecording().catch(err => console.error('Failed to stop recording:', err));
    }
  }

  /**
   * Set state and emit event
   */
  private setState(state: IntegratedRecordingState): void {
    const previousState = this.state;
    this.state = state;

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
   * Emit event
   */
  private emitEvent(event: RecordingEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Emit statistics
   */
  private emitStats(): void {
    const stats = this.getStatistics();
    if (stats) {
      this.emitEvent({
        type: 'stats_update',
        stats,
        timestamp: Date.now(),
      });
    }
  }
}

/**
 * Export singleton instance
 */
export const recordingService = RecordingService.getInstance();

/**
 * Export default
 */
export default recordingService;
