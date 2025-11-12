/**
 * AudioRecorderService
 *
 * 오디오 녹음 서비스
 * - react-native-audio-recorder-player 사용
 * - 오디오 파일 녹음 및 저장
 * - 녹음 상태 관리
 */

import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';

export interface AudioRecordingOptions {
  sessionId: string;
  sampleRate?: number;
  channels?: number;
  bitsPerSample?: number;
}

export interface AudioRecordingResult {
  filePath: string;
  duration: number;
  fileSize: number;
}

export interface RecordingProgress {
  currentPosition: number;
  currentMetering?: number;
}

export type AudioRecordingCallback = (progress: RecordingProgress) => void;
export type AudioErrorCallback = (error: Error) => void;

export class AudioRecorderService {
  private static instance: AudioRecorderService;
  private audioRecorderPlayer: AudioRecorderPlayer;
  private isRecording: boolean = false;
  private recordingPath: string | null = null;
  private sessionId: string | null = null;
  private onProgressCallback?: AudioRecordingCallback;

  private constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
  }

  static getInstance(): AudioRecorderService {
    if (!AudioRecorderService.instance) {
      AudioRecorderService.instance = new AudioRecorderService();
    }
    return AudioRecorderService.instance;
  }

  /**
   * Start recording audio
   */
  async startRecording(
    options: AudioRecordingOptions,
    onProgress?: AudioRecordingCallback,
    onError?: AudioErrorCallback,
  ): Promise<string> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    try {
      this.sessionId = options.sessionId;
      this.onProgressCallback = onProgress;

      // Generate file path
      const timestamp = Date.now();
      const fileName = `audio_${options.sessionId}_${timestamp}.m4a`;
      const directory =
        Platform.OS === 'ios'
          ? RNFS.DocumentDirectoryPath
          : RNFS.ExternalDirectoryPath || RNFS.DocumentDirectoryPath;

      this.recordingPath = `${directory}/${fileName}`;

      // Audio configuration
      const audioSet: any = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: options.channels || 2,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
      };

      if (options.sampleRate) {
        audioSet.AudioSamplingRate = options.sampleRate;
      }

      // Start recording
      await this.audioRecorderPlayer.startRecorder(
        this.recordingPath,
        audioSet,
      );

      this.isRecording = true;

      // Setup progress listener
      this.audioRecorderPlayer.addRecordBackListener(e => {
        if (this.onProgressCallback) {
          this.onProgressCallback({
            currentPosition: e.currentPosition,
            currentMetering: e.currentMetering,
          });
        }
      });

      return this.recordingPath;
    } catch (error) {
      console.error('Failed to start recording:', error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Stop recording audio
   */
  async stopRecording(): Promise<AudioRecordingResult | null> {
    if (!this.isRecording) {
      return null;
    }

    try {
      const result = await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();

      this.isRecording = false;

      if (!this.recordingPath) {
        throw new Error('Recording path not found');
      }

      // Get file info
      const fileInfo = await RNFS.stat(this.recordingPath);

      return {
        filePath: this.recordingPath,
        duration: parseFloat(result) || 0, // duration in seconds
        fileSize: fileInfo.size,
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      throw error;
    } finally {
      this.recordingPath = null;
      this.sessionId = null;
      this.onProgressCallback = undefined;
    }
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get current recording path
   */
  getCurrentRecordingPath(): string | null {
    return this.recordingPath;
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Play audio file
   */
  async startPlayer(filePath: string, onProgress?: (progress: number) => void): Promise<void> {
    try {
      await this.audioRecorderPlayer.startPlayer(filePath);

      if (onProgress) {
        this.audioRecorderPlayer.addPlayBackListener(e => {
          if (e.currentPosition && e.duration) {
            onProgress(e.currentPosition / e.duration);
          }
        });
      }
    } catch (error) {
      console.error('Failed to start player:', error);
      throw error;
    }
  }

  /**
   * Stop playing audio
   */
  async stopPlayer(): Promise<void> {
    try {
      await this.audioRecorderPlayer.stopPlayer();
      this.audioRecorderPlayer.removePlayBackListener();
    } catch (error) {
      console.error('Failed to stop player:', error);
      throw error;
    }
  }

  /**
   * Pause playing audio
   */
  async pausePlayer(): Promise<void> {
    try {
      await this.audioRecorderPlayer.pausePlayer();
    } catch (error) {
      console.error('Failed to pause player:', error);
      throw error;
    }
  }

  /**
   * Resume playing audio
   */
  async resumePlayer(): Promise<void> {
    try {
      await this.audioRecorderPlayer.resumePlayer();
    } catch (error) {
      console.error('Failed to resume player:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.isRecording) {
        await this.stopRecording();
      }
      await this.stopPlayer();
    } catch (error) {
      console.error('Failed to cleanup audio recorder:', error);
    }
  }
}

export const getAudioRecorderService = (): AudioRecorderService => {
  return AudioRecorderService.getInstance();
};
