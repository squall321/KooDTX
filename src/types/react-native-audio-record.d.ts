/**
 * TypeScript Type Definitions for react-native-audio-record
 * Phase 89: Audio recording library types
 */

declare module 'react-native-audio-record' {
  /**
   * Audio recording options
   */
  export interface AudioRecordOptions {
    /**
     * Sample rate in Hz
     * @default 44100
     */
    sampleRate?: number;

    /**
     * Number of channels (1 = mono, 2 = stereo)
     * @default 1
     */
    channels?: 1 | 2;

    /**
     * Bits per sample (8 or 16)
     * @default 16
     */
    bitsPerSample?: 8 | 16;

    /**
     * Audio source (Android only)
     * @default 6 (VOICE_RECOGNITION)
     */
    audioSource?: number;

    /**
     * Wave file name
     * @default 'audio.wav'
     */
    wavFile?: string;
  }

  /**
   * Audio recording module
   */
  class AudioRecord {
    /**
     * Initialize the audio recorder with options
     * @param options Recording options
     */
    static init(options: AudioRecordOptions): void;

    /**
     * Start recording
     */
    static start(): void;

    /**
     * Stop recording
     * @returns Promise that resolves to the audio file path
     */
    static stop(): Promise<string>;

    /**
     * Pause recording (iOS only)
     */
    static pause(): void;

    /**
     * Resume recording (iOS only)
     */
    static resume(): void;

    /**
     * Subscribe to audio data events
     * @param callback Callback function that receives audio data
     * @returns Subscription that can be removed
     */
    static on(
      event: 'data',
      callback: (data: string) => void,
    ): {remove: () => void};

    /**
     * Unsubscribe from audio data events
     */
    static off(event: 'data'): void;
  }

  export default AudioRecord;
}
