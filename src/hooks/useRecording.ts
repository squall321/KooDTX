/**
 * useRecording Hook
 * Phase 126: Recording control logic integration
 *
 * Integrates RecordingService with React components
 * Provides easy-to-use recording controls and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  recordingService,
  RecordingConfig,
  IntegratedRecordingState,
  RecordingMode,
  RecordingEvent,
  IntegratedRecordingStats,
} from '../services/RecordingService';
import { AndroidSensorType } from '@native';

export interface UseRecordingOptions {
  onStateChange?: (state: IntegratedRecordingState) => void;
  onError?: (error: Error) => void;
  onStatsUpdate?: (stats: IntegratedRecordingStats) => void;
}

export interface UseRecordingReturn {
  // State
  state: IntegratedRecordingState;
  sessionId: string | null;
  isRecording: boolean;
  isStarting: boolean;
  isStopping: boolean;
  error: Error | null;
  stats: IntegratedRecordingStats | null;

  // Actions
  startRecording: (config: RecordingConfig) => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;

  // Utilities
  getCurrentSession: () => any;
  getStats: () => IntegratedRecordingStats | null;
}

export const useRecording = (options: UseRecordingOptions = {}): UseRecordingReturn => {
  const { onStateChange, onError, onStatsUpdate } = options;

  const [state, setState] = useState<IntegratedRecordingState>(
    recordingService.getCurrentState()
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<IntegratedRecordingStats | null>(null);

  const listenerIdRef = useRef<string | null>(null);

  // Event listener
  useEffect(() => {
    const handleEvent = (event: RecordingEvent) => {
      switch (event.type) {
        case 'state_change':
          if (event.state) {
            setState(event.state);
            onStateChange?.(event.state);
          }
          break;

        case 'error':
          if (event.error) {
            setError(event.error);
            onError?.(event.error);
          }
          break;

        case 'stats_update':
          if (event.stats) {
            setStats(event.stats);
            onStatsUpdate?.(event.stats);
          }
          break;
      }
    };

    const listenerId = recordingService.addEventListener(handleEvent);
    listenerIdRef.current = listenerId;

    return () => {
      if (listenerIdRef.current) {
        recordingService.removeEventListener(listenerIdRef.current);
      }
    };
  }, [onStateChange, onError, onStatsUpdate]);

  // Start recording
  const startRecording = useCallback(async (config: RecordingConfig) => {
    try {
      setError(null);
      const newSessionId = await recordingService.startRecording(config);
      setSessionId(newSessionId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      setError(null);
      await recordingService.stopRecording();
      setSessionId(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  // Pause recording
  const pauseRecording = useCallback(async () => {
    try {
      setError(null);
      await recordingService.pauseRecording();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(async () => {
    try {
      setError(null);
      await recordingService.resumeRecording();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  // Get current session
  const getCurrentSession = useCallback(() => {
    return recordingService.getCurrentSession();
  }, []);

  // Get stats
  const getStats = useCallback(() => {
    const currentStats = recordingService.getStats();
    if (currentStats) {
      setStats(currentStats);
    }
    return currentStats;
  }, []);

  return {
    // State
    state,
    sessionId,
    isRecording: state === IntegratedRecordingState.RECORDING,
    isStarting: state === IntegratedRecordingState.STARTING,
    isStopping: state === IntegratedRecordingState.STOPPING,
    error,
    stats,

    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,

    // Utilities
    getCurrentSession,
    getStats,
  };
};

// Quick start helper for common recording configurations
export const createRecordingConfig = (
  mode: RecordingMode = RecordingMode.SENSOR_AND_AUDIO,
  sensors: AndroidSensorType[] = [
    AndroidSensorType.ACCELEROMETER,
    AndroidSensorType.GYROSCOPE,
    AndroidSensorType.MAGNETOMETER,
  ]
): RecordingConfig => {
  const config: RecordingConfig = {
    mode,
  };

  if (mode === RecordingMode.SENSOR_ONLY || mode === RecordingMode.SENSOR_AND_AUDIO) {
    config.sensorConfigs = sensors.map(sensorType => ({
      sensorType,
      samplingPeriodUs: 10000, // 100Hz
    }));
  }

  if (mode === RecordingMode.AUDIO_ONLY || mode === RecordingMode.SENSOR_AND_AUDIO) {
    config.audioOptions = {
      sampleRate: 44100,
      channels: 2,
      bitsPerSample: 16,
      audioEncoder: 'aac',
      outputFormat: 'm4a',
    };
  }

  // Wake lock to keep screen on during recording
  config.wakeLockOptions = {
    tag: 'KooDTX:Recording',
    brightness: 0.01, // Dim screen to save battery
  };

  // Foreground service for background recording
  config.foregroundServiceOptions = {
    notificationTitle: 'KooDTX 녹음 중',
    notificationText: '센서 데이터와 오디오를 수집하고 있습니다',
    channelId: 'recording',
    channelName: '녹음 알림',
  };

  return config;
};

export default useRecording;
