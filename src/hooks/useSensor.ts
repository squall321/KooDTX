/**
 * useSensor Hook
 * Phase 87: Custom Hook for sensor data collection with store integration
 *
 * Features:
 * - Sensor start/stop control
 * - Real-time sensor data subscription
 * - Integration with useSensorStore
 * - Lifecycle management
 * - Automatic cleanup
 */

import {useEffect, useRef, useState, useCallback} from 'react';
import type {SensorType, SensorData} from '@app-types/sensor.types';
import {getSensorManager} from '@services/sensors';
import {
  useSensorStore,
  useSensorActions,
  useRecordingState,
  RecordingState,
} from '@store';
import type {AndroidSensorType} from '@native';

export interface UseSensorOptions {
  /**
   * Enable automatic sensor start/stop
   */
  enabled?: boolean;

  /**
   * Sample rate in Hz
   */
  sampleRate?: number;

  /**
   * Custom data callback (in addition to store updates)
   */
  onData?: (data: SensorData) => void;

  /**
   * Error callback
   */
  onError?: (error: Error) => void;

  /**
   * Update store with real-time data
   * @default true
   */
  updateStore?: boolean;
}

export interface UseSensorResult {
  /**
   * Sensor availability
   */
  isAvailable: boolean;

  /**
   * Sensor running state
   */
  isRunning: boolean;

  /**
   * Latest sensor data (local state)
   */
  latestData: SensorData | null;

  /**
   * Latest error
   */
  error: Error | null;

  /**
   * Start sensor
   */
  start: () => Promise<void>;

  /**
   * Stop sensor
   */
  stop: () => Promise<void>;

  /**
   * Reset error
   */
  clearError: () => void;
}

/**
 * Hook for managing a single sensor with store integration
 *
 * @example
 * ```tsx
 * const sensor = useSensor('accelerometer', sessionId, {
 *   enabled: true,
 *   sampleRate: 100,
 *   onData: (data) => console.log(data),
 * });
 *
 * // Manual control
 * await sensor.start();
 * await sensor.stop();
 * ```
 */
export function useSensor(
  sensorType: SensorType,
  sessionId: string | null,
  options: UseSensorOptions = {},
): UseSensorResult {
  const {
    enabled = false,
    sampleRate = 100,
    onData,
    onError,
    updateStore = true,
  } = options;

  // Local state
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Store integration
  const recordingState = useRecordingState();
  const sensorActions = useSensorActions();

  // Refs
  const sensorManager = useRef(getSensorManager());
  const dataCallbackRef = useRef(onData);
  const errorCallbackRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    dataCallbackRef.current = onData;
    errorCallbackRef.current = onError;
  }, [onData, onError]);

  /**
   * Check sensor availability on mount
   */
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const service = sensorManager.current.getService(sensorType);
        if (service) {
          const available = await service.isAvailable();
          setIsAvailable(available);
        } else {
          setIsAvailable(false);
        }
      } catch (err) {
        setIsAvailable(false);
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);

        // Report error to store
        if (updateStore) {
          sensorActions.setError(errorObj);
        }
      }
    };

    checkAvailability();
  }, [sensorType, updateStore, sensorActions]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Start sensor
   */
  const start = useCallback(async () => {
    if (!sessionId) {
      const err = new Error('Session ID is required to start sensor');
      setError(err);
      if (errorCallbackRef.current) {
        errorCallbackRef.current(err);
      }
      if (updateStore) {
        sensorActions.setError(err);
      }
      return;
    }

    if (!isAvailable) {
      const err = new Error(`Sensor ${sensorType} is not available`);
      setError(err);
      if (errorCallbackRef.current) {
        errorCallbackRef.current(err);
      }
      if (updateStore) {
        sensorActions.setError(err);
      }
      return;
    }

    if (isRunning) {
      return;
    }

    try {
      setError(null);
      const service = sensorManager.current.getService(sensorType);
      if (!service) {
        throw new Error(`Sensor service not found: ${sensorType}`);
      }

      // Set sample rate
      service.setSampleRate(sampleRate);

      // Start sensor
      await service.start(
        sessionId,
        data => {
          // Update local state
          setLatestData(data);

          // Update store with real-time data
          if (updateStore) {
            // Convert SensorType to AndroidSensorType if needed
            const androidSensorType = data.sensorType as unknown as AndroidSensorType;

            sensorActions.updateRealtimeData({
              sensorType: androidSensorType,
              values: data.values,
              timestamp: data.timestamp,
              accuracy: data.accuracy,
            });

            // Increment sample count
            sensorActions.incrementSampleCount(1);
          }

          // Call custom callback
          if (dataCallbackRef.current) {
            dataCallbackRef.current(data);
          }
        },
        err => {
          setError(err);
          setIsRunning(false);

          // Report error to store
          if (updateStore) {
            sensorActions.setError(err);
          }

          // Call error callback
          if (errorCallbackRef.current) {
            errorCallbackRef.current(err);
          }
        },
      );

      setIsRunning(true);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setIsRunning(false);

      // Report error to store
      if (updateStore) {
        sensorActions.setError(errorObj);
      }

      if (errorCallbackRef.current) {
        errorCallbackRef.current(errorObj);
      }
    }
  }, [
    sessionId,
    sensorType,
    isAvailable,
    isRunning,
    sampleRate,
    updateStore,
    sensorActions,
  ]);

  /**
   * Stop sensor
   */
  const stop = useCallback(async () => {
    if (!isRunning) {
      return;
    }

    try {
      const service = sensorManager.current.getService(sensorType);
      if (service) {
        await service.stop();
      }
      setIsRunning(false);
      setLatestData(null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);

      // Report error to store
      if (updateStore) {
        sensorActions.setError(errorObj);
      }

      if (errorCallbackRef.current) {
        errorCallbackRef.current(errorObj);
      }
    }
  }, [sensorType, isRunning, updateStore, sensorActions]);

  /**
   * Auto start/stop based on enabled option
   */
  useEffect(() => {
    if (enabled && sessionId && isAvailable && !isRunning) {
      start();
    } else if (!enabled && isRunning) {
      stop();
    }
  }, [enabled, sessionId, isAvailable, isRunning, start, stop]);

  /**
   * Auto stop when recording stops
   */
  useEffect(() => {
    if (
      isRunning &&
      (recordingState === RecordingState.STOPPED ||
        recordingState === RecordingState.ERROR)
    ) {
      stop();
    }
  }, [recordingState, isRunning, stop]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (isRunning) {
        const service = sensorManager.current.getService(sensorType);
        if (service) {
          service.stop().catch(err => {
            console.error('Failed to stop sensor on cleanup:', err);
          });
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isAvailable,
    isRunning,
    latestData,
    error,
    start,
    stop,
    clearError,
  };
}

/**
 * Export default
 */
export default useSensor;
