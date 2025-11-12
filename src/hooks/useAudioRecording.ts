/**
 * useAudioRecording
 *
 * Hook for managing audio recording
 * - Start/stop audio recording
 * - Save recording metadata to database
 * - Handle recording state
 */

import {useState, useCallback, useEffect} from 'react';
import {
  getAudioRecorderService,
  type AudioRecordingOptions,
  type AudioRecordingResult,
  type RecordingProgress,
} from '@services/audio/AudioRecorderService';
import {getAudioRecordingRepository} from '@database/repositories';

export interface UseAudioRecordingOptions {
  sessionId: string | null;
  sampleRate?: number;
  channels?: number;
  onProgress?: (progress: RecordingProgress) => void;
  onError?: (error: Error) => void;
}

export interface UseAudioRecordingResult {
  isRecording: boolean;
  recordingDuration: number;
  filePath: string | null;
  start: () => Promise<void>;
  stop: () => Promise<AudioRecordingResult | null>;
  error: Error | null;
}

export function useAudioRecording(
  options: UseAudioRecordingOptions,
): UseAudioRecordingResult {
  const {sessionId, sampleRate = 44100, channels = 2, onProgress, onError} = options;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const audioService = getAudioRecorderService();
  const audioRepo = getAudioRecordingRepository();

  // Start recording
  const start = useCallback(async () => {
    if (!sessionId) {
      const err = new Error('Session ID is required');
      setError(err);
      if (onError) onError(err);
      return;
    }

    if (isRecording) {
      return;
    }

    try {
      setError(null);
      setRecordingDuration(0);

      const recordingOptions: AudioRecordingOptions = {
        sessionId,
        sampleRate,
        channels,
      };

      const path = await audioService.startRecording(
        recordingOptions,
        progress => {
          setRecordingDuration(progress.currentPosition);
          if (onProgress) onProgress(progress);
        },
        err => {
          setError(err);
          if (onError) onError(err);
        },
      );

      setFilePath(path);
      setIsRecording(true);
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (onError) onError(error);
    }
  }, [sessionId, sampleRate, channels, isRecording, audioService, onProgress, onError]);

  // Stop recording
  const stop = useCallback(async (): Promise<AudioRecordingResult | null> => {
    if (!isRecording || !sessionId) {
      return null;
    }

    try {
      const result = await audioService.stopRecording();
      setIsRecording(false);

      if (result) {
        // Save to database
        await audioRepo.create({
          sessionId,
          timestamp: Date.now(),
          filePath: result.filePath,
          fileSize: result.fileSize,
          duration: result.duration,
          sampleRate,
          channels,
          format: 'm4a',
        });

        setFilePath(null);
        setRecordingDuration(0);
      }

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      if (onError) onError(error);
      return null;
    }
  }, [isRecording, sessionId, audioService, audioRepo, sampleRate, channels, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        audioService.stopRecording().catch(console.error);
      }
    };
  }, [isRecording, audioService]);

  return {
    isRecording,
    recordingDuration,
    filePath,
    start,
    stop,
    error,
  };
}
