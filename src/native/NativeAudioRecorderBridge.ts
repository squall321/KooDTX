/**
 * Native Audio Recorder Bridge
 * Phase 90: TypeScript bridge for AudioRecorderModule
 *
 * Features:
 * - Initialize AudioRecord with configuration
 * - Get audio configuration
 * - Check audio recorder availability
 * - Get recording state
 */

import {NativeModules, NativeEventEmitter, Platform} from 'react-native';

const LINKING_ERROR =
  `The package 'AudioRecorderModule' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ios: "- Run 'pod install'\n", default: ''}) +
  '- Rebuild the app after installing the package\n' +
  '- You are running on a physical device (microphone not available on emulators)\n';

const AudioRecorderModuleNative = NativeModules.AudioRecorderModule
  ? NativeModules.AudioRecorderModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

/**
 * Audio configuration
 */
export interface AudioConfiguration {
  sampleRate: number; // Sample rate in Hz (e.g., 44100, 48000)
  channels: number; // Number of channels (1 = mono, 2 = stereo)
  bitsPerSample: number; // Bits per sample (8 or 16)
  bufferSize?: number; // Buffer size in bytes
  channelConfig?: string; // Channel configuration ("MONO" or "STEREO")
  audioFormat?: string; // Audio format ("PCM_8BIT" or "PCM_16BIT")
}

/**
 * Audio recorder availability
 */
export interface AudioAvailability {
  available: boolean;
  minBufferSize: number;
}

/**
 * Recording state
 */
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  state: 'IDLE' | 'RECORDING' | 'PAUSED';
  hasAudioRecord: boolean;
}

/**
 * Audio data event
 * Phase 91: Added RMS, dB, and silence detection
 */
export interface AudioDataEvent {
  data: number[];
  timestamp: number;
  sampleRate: number;
  channels: number;
  rmsLevel: number; // Root Mean Square level
  dbLevel: number; // Decibel level
  isSilent: boolean; // Silence detection flag
}

/**
 * Audio error event
 */
export interface AudioErrorEvent {
  error: string;
  timestamp: number;
}

/**
 * Audio data listener
 */
export type AudioDataListener = (event: AudioDataEvent) => void;

/**
 * Audio error listener
 */
export type AudioErrorListener = (event: AudioErrorEvent) => void;

/**
 * Native Audio Recorder Bridge Class
 */
class NativeAudioRecorderBridge {
  private static instance: NativeAudioRecorderBridge;
  private eventEmitter: NativeEventEmitter;
  private dataListeners: Set<AudioDataListener> = new Set();
  private errorListeners: Set<AudioErrorListener> = new Set();

  private constructor() {
    this.eventEmitter = new NativeEventEmitter(AudioRecorderModuleNative);
    this.setupEventListeners();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NativeAudioRecorderBridge {
    if (!NativeAudioRecorderBridge.instance) {
      NativeAudioRecorderBridge.instance = new NativeAudioRecorderBridge();
    }
    return NativeAudioRecorderBridge.instance;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Audio data events
    this.eventEmitter.addListener('AudioData', (event: AudioDataEvent) => {
      this.dataListeners.forEach(listener => listener(event));
    });

    // Audio error events
    this.eventEmitter.addListener('AudioError', (event: AudioErrorEvent) => {
      this.errorListeners.forEach(listener => listener(event));
    });
  }

  /**
   * Initialize audio recorder
   *
   * @param sampleRate Sample rate in Hz (e.g., 44100, 48000)
   * @param channels Number of channels (1 = mono, 2 = stereo)
   * @param bitsPerSample Bits per sample (8 or 16)
   * @returns Promise that resolves with audio configuration
   */
  public async initialize(
    sampleRate: number,
    channels: number,
    bitsPerSample: number,
  ): Promise<AudioConfiguration> {
    return AudioRecorderModuleNative.initialize(
      sampleRate,
      channels,
      bitsPerSample,
    );
  }

  /**
   * Get current audio configuration
   *
   * @returns Promise that resolves with audio configuration
   */
  public async getConfiguration(): Promise<AudioConfiguration> {
    return AudioRecorderModuleNative.getConfiguration();
  }

  /**
   * Check if audio recorder is available
   *
   * @returns Promise that resolves with availability status
   */
  public async isAvailable(): Promise<AudioAvailability> {
    return AudioRecorderModuleNative.isAvailable();
  }

  /**
   * Get current recording state
   *
   * @returns Promise that resolves with recording state
   */
  public async getRecordingState(): Promise<RecordingState> {
    return AudioRecorderModuleNative.getRecordingState();
  }

  /**
   * Start audio recording
   * Phase 91: Start recording with background thread
   *
   * @returns Promise that resolves when recording starts
   */
  public async startRecording(): Promise<{success: boolean; state: string}> {
    return AudioRecorderModuleNative.startRecording();
  }

  /**
   * Stop audio recording
   * Phase 91: Stop recording
   *
   * @returns Promise that resolves when recording stops
   */
  public async stopRecording(): Promise<{success: boolean; state: string}> {
    return AudioRecorderModuleNative.stopRecording();
  }

  /**
   * Pause audio recording
   * Phase 91: Pause recording
   *
   * @returns Promise that resolves when recording pauses
   */
  public async pauseRecording(): Promise<{success: boolean; state: string}> {
    return AudioRecorderModuleNative.pauseRecording();
  }

  /**
   * Resume audio recording
   * Phase 91: Resume recording
   *
   * @returns Promise that resolves when recording resumes
   */
  public async resumeRecording(): Promise<{success: boolean; state: string}> {
    return AudioRecorderModuleNative.resumeRecording();
  }

  /**
   * Add audio data listener
   *
   * @param listener Audio data listener
   * @returns Function to remove listener
   */
  public addDataListener(listener: AudioDataListener): () => void {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }

  /**
   * Add audio error listener
   *
   * @param listener Audio error listener
   * @returns Function to remove listener
   */
  public addErrorListener(listener: AudioErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Remove all listeners
   */
  public removeAllListeners(): void {
    this.dataListeners.clear();
    this.errorListeners.clear();
  }
}

/**
 * Export singleton instance
 */
export const NativeAudioRecorderBridgeInstance =
  NativeAudioRecorderBridge.getInstance();

/**
 * Export default
 */
export default NativeAudioRecorderBridge;
