/**
 * Audio Record Service
 * Phase 89: Basic audio recording service using react-native-audio-record
 *
 * Features:
 * - Initialize audio recorder
 * - Start/stop recording
 * - Configure sample rate, channels, bit depth
 * - Save to WAV file
 * - Basic test functionality
 */

import AudioRecord from 'react-native-audio-record';
import type {AudioRecordOptions} from 'react-native-audio-record';
import RNFS from 'react-native-fs';

/**
 * Audio format configuration
 */
export interface AudioConfig {
  sampleRate: number; // Hz (e.g., 44100, 48000)
  channels: 1 | 2; // 1 = mono, 2 = stereo
  bitsPerSample: 8 | 16; // bit depth
  wavFile?: string; // output filename
}

/**
 * Recording state
 */
export enum RecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

/**
 * Default audio configuration
 * 44.1kHz, Mono, 16-bit (CD quality)
 */
const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 44100,
  channels: 1,
  bitsPerSample: 16,
  wavFile: 'audio_recording.wav',
};

/**
 * Audio Record Service Class
 * Manages audio recording using react-native-audio-record
 */
class AudioRecordServiceClass {
  private static instance: AudioRecordServiceClass;
  private state: RecordingState = RecordingState.IDLE;
  private config: AudioConfig = DEFAULT_AUDIO_CONFIG;
  private audioFilePath: string | null = null;
  private initialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AudioRecordServiceClass {
    if (!AudioRecordServiceClass.instance) {
      AudioRecordServiceClass.instance = new AudioRecordServiceClass();
    }
    return AudioRecordServiceClass.instance;
  }

  /**
   * Initialize audio recorder with configuration
   */
  public initialize(config: Partial<AudioConfig> = {}): void {
    this.config = {
      ...DEFAULT_AUDIO_CONFIG,
      ...config,
    };

    const options: AudioRecordOptions = {
      sampleRate: this.config.sampleRate,
      channels: this.config.channels,
      bitsPerSample: this.config.bitsPerSample,
      audioSource: 6, // VOICE_RECOGNITION (Android)
      wavFile: this.config.wavFile,
    };

    try {
      AudioRecord.init(options);
      this.initialized = true;
      console.log('AudioRecordService initialized:', this.config);
    } catch (error) {
      console.error('Failed to initialize AudioRecordService:', error);
      throw error;
    }
  }

  /**
   * Check if initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current recording state
   */
  public getState(): RecordingState {
    return this.state;
  }

  /**
   * Get current audio configuration
   */
  public getConfig(): AudioConfig {
    return {...this.config};
  }

  /**
   * Check if currently recording
   */
  public isRecording(): boolean {
    return this.state === RecordingState.RECORDING;
  }

  /**
   * Start recording
   */
  public start(): void {
    if (!this.initialized) {
      throw new Error('AudioRecordService not initialized. Call initialize() first.');
    }

    if (this.state === RecordingState.RECORDING) {
      console.warn('Already recording');
      return;
    }

    try {
      AudioRecord.start();
      this.state = RecordingState.RECORDING;
      this.audioFilePath = null;
      console.log('Audio recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   * @returns Audio file path
   */
  public async stop(): Promise<string> {
    if (this.state !== RecordingState.RECORDING) {
      throw new Error('Not currently recording');
    }

    try {
      const audioFilePath = await AudioRecord.stop();
      this.state = RecordingState.STOPPED;
      this.audioFilePath = audioFilePath;
      console.log('Audio recording stopped. File:', audioFilePath);
      return audioFilePath;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Pause recording (iOS only)
   */
  public pause(): void {
    if (this.state !== RecordingState.RECORDING) {
      throw new Error('Not currently recording');
    }

    try {
      AudioRecord.pause();
      this.state = RecordingState.PAUSED;
      console.log('Audio recording paused');
    } catch (error) {
      console.error('Failed to pause recording:', error);
      throw error;
    }
  }

  /**
   * Resume recording (iOS only)
   */
  public resume(): void {
    if (this.state !== RecordingState.PAUSED) {
      throw new Error('Not currently paused');
    }

    try {
      AudioRecord.resume();
      this.state = RecordingState.RECORDING;
      console.log('Audio recording resumed');
    } catch (error) {
      console.error('Failed to resume recording:', error);
      throw error;
    }
  }

  /**
   * Get last recorded audio file path
   */
  public getAudioFilePath(): string | null {
    return this.audioFilePath;
  }

  /**
   * Reset state
   */
  public reset(): void {
    this.state = RecordingState.IDLE;
    this.audioFilePath = null;
  }

  /**
   * Test basic recording functionality
   * Records for specified duration then stops
   */
  public async testRecording(durationMs: number = 3000): Promise<string> {
    console.log(`Testing audio recording for ${durationMs}ms...`);

    if (!this.initialized) {
      this.initialize();
    }

    // Start recording
    this.start();

    // Wait for specified duration
    await new Promise(resolve => setTimeout(resolve, durationMs));

    // Stop recording
    const filePath = await this.stop();

    // Check if file exists
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    // Get file info
    const fileInfo = await RNFS.stat(filePath);
    console.log('Audio recording test completed:', {
      filePath,
      fileSize: fileInfo.size,
      duration: durationMs,
    });

    return filePath;
  }

  /**
   * Get audio file size
   */
  public async getAudioFileSize(filePath: string): Promise<number> {
    try {
      const fileInfo = await RNFS.stat(filePath);
      return fileInfo.size;
    } catch (error) {
      console.error('Failed to get audio file size:', error);
      return 0;
    }
  }

  /**
   * Delete audio file
   */
  public async deleteAudioFile(filePath: string): Promise<void> {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        await RNFS.unlink(filePath);
        console.log('Audio file deleted:', filePath);
      }
    } catch (error) {
      console.error('Failed to delete audio file:', error);
      throw error;
    }
  }
}

/**
 * Export singleton instance
 */
export const audioRecordService = AudioRecordServiceClass.getInstance();

/**
 * Export default
 */
export default audioRecordService;
