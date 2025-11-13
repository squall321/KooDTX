/**
 * Audio Service
 * Phase 93: Complete audio recording service
 *
 * Features:
 * - Start/stop audio recording
 * - Real-time dB level monitoring
 * - Audio configuration (sample rate, channels)
 * - File storage path management
 * - Buffer management
 * - Error handling
 */

import {NativeAudioRecorderBridgeInstance, type AudioDataEvent} from '@native';
import {audioDataProcessor, type AudioFormat, type AudioChunkMetadata} from './AudioDataProcessor';

/**
 * Audio recording state
 */
export enum AudioRecordingState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  RECORDING = 'recording',
  PAUSED = 'paused',
  STOPPING = 'stopping',
  ERROR = 'error',
}

/**
 * Audio statistics
 */
export interface AudioStatistics {
  totalDuration: number; // milliseconds
  totalChunks: number;
  totalSamples: number;
  currentDbLevel: number;
  currentRmsLevel: number;
  peakDbLevel: number;
  isSilent: boolean;
}

/**
 * Audio recording options
 */
export interface AudioRecordingOptions {
  sampleRate?: number; // Hz (default: 44100)
  channels?: 1 | 2; // Mono or Stereo (default: 1)
  bitsPerSample?: 8 | 16; // Bit depth (default: 16)
}

/**
 * Audio level listener
 */
export type AudioLevelListener = (dbLevel: number, rmsLevel: number) => void;

/**
 * Audio chunk listener
 */
export type AudioChunkListener = (metadata: AudioChunkMetadata) => void;

/**
 * Audio error listener
 */
export type AudioErrorListener = (error: Error) => void;

/**
 * Audio Service Class
 */
class AudioServiceClass {
  private static instance: AudioServiceClass;

  // State
  private state: AudioRecordingState = AudioRecordingState.IDLE;
  private sessionId: string | null = null;

  // Configuration
  private format: AudioFormat = {
    sampleRate: 44100,
    channels: 1,
    bitsPerSample: 16,
  };

  // Statistics
  private statistics: AudioStatistics = {
    totalDuration: 0,
    totalChunks: 0,
    totalSamples: 0,
    currentDbLevel: -96,
    currentRmsLevel: 0,
    peakDbLevel: -96,
    isSilent: true,
  };

  // Listeners
  private levelListeners: Set<AudioLevelListener> = new Set();
  private chunkListeners: Set<AudioChunkListener> = new Set();
  private errorListeners: Set<AudioErrorListener> = new Set();

  // Native listeners
  private removeDataListener: (() => void) | null = null;
  private removeErrorListener: (() => void) | null = null;

  // Recording time
  private startTime: number | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AudioServiceClass {
    if (!AudioServiceClass.instance) {
      AudioServiceClass.instance = new AudioServiceClass();
    }
    return AudioServiceClass.instance;
  }

  /**
   * Get current state
   */
  public getState(): AudioRecordingState {
    return this.state;
  }

  /**
   * Get current statistics
   */
  public getStatistics(): AudioStatistics {
    if (this.startTime) {
      this.statistics.totalDuration = Date.now() - this.startTime;
    }
    return {...this.statistics};
  }

  /**
   * Get audio format
   */
  public getFormat(): AudioFormat {
    return {...this.format};
  }

  /**
   * Start audio recording
   * Phase 93: Audio start with configuration
   *
   * @param sessionId Session ID
   * @param options Recording options
   */
  public async startRecording(
    sessionId: string,
    options: AudioRecordingOptions = {},
  ): Promise<void> {
    if (this.state !== AudioRecordingState.IDLE) {
      throw new Error(`Cannot start recording in state: ${this.state}`);
    }

    try {
      this.state = AudioRecordingState.INITIALIZING;
      this.sessionId = sessionId;

      // Apply options
      this.format = {
        sampleRate: options.sampleRate ?? 44100,
        channels: options.channels ?? 1,
        bitsPerSample: options.bitsPerSample ?? 16,
      };

      // Initialize audio data processor
      await audioDataProcessor.initializeSession(sessionId);

      // Initialize native audio recorder
      await NativeAudioRecorderBridgeInstance.initialize(
        this.format.sampleRate,
        this.format.channels,
        this.format.bitsPerSample,
      );

      // Setup native listeners
      this.setupNativeListeners();

      // Reset statistics
      this.resetStatistics();

      // Start recording
      await NativeAudioRecorderBridgeInstance.startRecording();

      this.state = AudioRecordingState.RECORDING;
      this.startTime = Date.now();

      console.log('Audio recording started:', sessionId);

    } catch (error) {
      this.state = AudioRecordingState.ERROR;
      const err = error instanceof Error ? error : new Error(String(error));
      this.notifyError(err);
      throw err;
    }
  }

  /**
   * Stop audio recording
   * Phase 93: Audio stop
   */
  public async stopRecording(): Promise<void> {
    if (this.state !== AudioRecordingState.RECORDING && this.state !== AudioRecordingState.PAUSED) {
      throw new Error(`Cannot stop recording in state: ${this.state}`);
    }

    try {
      this.state = AudioRecordingState.STOPPING;

      // Stop native recording
      await NativeAudioRecorderBridgeInstance.stopRecording();

      // Flush remaining audio data
      await audioDataProcessor.flush(this.format);

      // Remove native listeners
      this.removeNativeListeners();

      this.state = AudioRecordingState.IDLE;
      this.sessionId = null;
      this.startTime = null;

      console.log('Audio recording stopped');

    } catch (error) {
      this.state = AudioRecordingState.ERROR;
      const err = error instanceof Error ? error : new Error(String(error));
      this.notifyError(err);
      throw err;
    }
  }

  /**
   * Pause audio recording
   */
  public async pauseRecording(): Promise<void> {
    if (this.state !== AudioRecordingState.RECORDING) {
      throw new Error(`Cannot pause recording in state: ${this.state}`);
    }

    try {
      await NativeAudioRecorderBridgeInstance.pauseRecording();
      this.state = AudioRecordingState.PAUSED;
      console.log('Audio recording paused');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.notifyError(err);
      throw err;
    }
  }

  /**
   * Resume audio recording
   */
  public async resumeRecording(): Promise<void> {
    if (this.state !== AudioRecordingState.PAUSED) {
      throw new Error(`Cannot resume recording in state: ${this.state}`);
    }

    try {
      await NativeAudioRecorderBridgeInstance.resumeRecording();
      this.state = AudioRecordingState.RECORDING;
      console.log('Audio recording resumed');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.notifyError(err);
      throw err;
    }
  }

  /**
   * Setup native audio data and error listeners
   * Phase 93: Real-time dB level monitoring
   */
  private setupNativeListeners(): void {
    // Audio data listener
    this.removeDataListener = NativeAudioRecorderBridgeInstance.addDataListener(
      async (event: AudioDataEvent) => {
        try {
          // Update statistics
          this.updateStatistics(event);

          // Notify level listeners
          this.notifyLevelListeners(event.dbLevel, event.rmsLevel);

          // Process audio data
          const chunkMetadata = await audioDataProcessor.processAudioData(
            event,
            this.format,
          );

          // Notify chunk listeners if chunk was saved
          if (chunkMetadata) {
            this.notifyChunkListeners(chunkMetadata);
          }

        } catch (error) {
          console.error('Error processing audio data:', error);
          const err = error instanceof Error ? error : new Error(String(error));
          this.notifyError(err);
        }
      },
    );

    // Audio error listener
    this.removeErrorListener = NativeAudioRecorderBridgeInstance.addErrorListener(
      (event) => {
        const error = new Error(event.error);
        this.notifyError(error);
      },
    );
  }

  /**
   * Remove native listeners
   */
  private removeNativeListeners(): void {
    this.removeDataListener?.();
    this.removeErrorListener?.();
    this.removeDataListener = null;
    this.removeErrorListener = null;
  }

  /**
   * Update statistics
   * Phase 93: Buffer management and statistics
   *
   * @param event Audio data event
   */
  private updateStatistics(event: AudioDataEvent): void {
    this.statistics.totalSamples += event.data.length;
    this.statistics.currentDbLevel = event.dbLevel;
    this.statistics.currentRmsLevel = event.rmsLevel;
    this.statistics.isSilent = event.isSilent;

    // Update peak dB level
    if (event.dbLevel > this.statistics.peakDbLevel) {
      this.statistics.peakDbLevel = event.dbLevel;
    }
  }

  /**
   * Reset statistics
   */
  private resetStatistics(): void {
    this.statistics = {
      totalDuration: 0,
      totalChunks: 0,
      totalSamples: 0,
      currentDbLevel: -96,
      currentRmsLevel: 0,
      peakDbLevel: -96,
      isSilent: true,
    };
  }

  /**
   * Add audio level listener
   * Phase 93: Real-time dB level monitoring
   *
   * @param listener Level listener
   * @returns Function to remove listener
   */
  public addLevelListener(listener: AudioLevelListener): () => void {
    this.levelListeners.add(listener);
    return () => this.levelListeners.delete(listener);
  }

  /**
   * Add audio chunk listener
   *
   * @param listener Chunk listener
   * @returns Function to remove listener
   */
  public addChunkListener(listener: AudioChunkListener): () => void {
    this.chunkListeners.add(listener);
    return () => this.chunkListeners.delete(listener);
  }

  /**
   * Add error listener
   * Phase 93: Error handling
   *
   * @param listener Error listener
   * @returns Function to remove listener
   */
  public addErrorListener(listener: AudioErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Notify level listeners
   */
  private notifyLevelListeners(dbLevel: number, rmsLevel: number): void {
    this.levelListeners.forEach(listener => listener(dbLevel, rmsLevel));
  }

  /**
   * Notify chunk listeners
   */
  private notifyChunkListeners(metadata: AudioChunkMetadata): void {
    this.statistics.totalChunks++;
    this.chunkListeners.forEach(listener => listener(metadata));
  }

  /**
   * Notify error listeners
   */
  private notifyError(error: Error): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  /**
   * Remove all listeners
   */
  public removeAllListeners(): void {
    this.levelListeners.clear();
    this.chunkListeners.clear();
    this.errorListeners.clear();
  }

  /**
   * Check if recording
   */
  public isRecording(): boolean {
    return this.state === AudioRecordingState.RECORDING;
  }

  /**
   * Check if paused
   */
  public isPaused(): boolean {
    return this.state === AudioRecordingState.PAUSED;
  }

  /**
   * Get current session ID
   */
  public getSessionId(): string | null {
    return this.sessionId;
  }
}

/**
 * Export singleton instance
 */
export const audioService = AudioServiceClass.getInstance();

/**
 * Export default
 */
export default audioService;
