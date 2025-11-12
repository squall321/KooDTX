/**
 * useSensorCollectionWithDB Hook
 * Manages multiple sensor data collection with automatic database storage
 */

import {useEffect, useRef, useState, useCallback} from 'react';
import type {SensorType, SensorData, SensorConfig} from '@types/sensor.types';
import {getSensorManager} from '@services/sensors';
import {getSensorDataService} from '@services/SensorDataService';

export interface UseSensorCollectionWithDBOptions {
  enabled?: boolean;
  sensors?: Partial<Record<SensorType, SensorConfig>>;
  onData?: (data: SensorData) => void;
  onError?: (error: Error) => void;
  bufferSize?: number;
  flushInterval?: number;
  retryAttempts?: number;
}

export interface UseSensorCollectionWithDBResult {
  isRunning: boolean;
  runningSensors: SensorType[];
  error: Error | null;
  start: (enabledSensors: SensorType[]) => Promise<void>;
  stop: () => Promise<void>;
  getBufferStats: () => any;
  getSaverStats: () => any;
  getFailedBatchesCount: () => number;
  flush: () => Promise<void>;
}

/**
 * Hook for managing multiple sensors with automatic database storage
 */
export function useSensorCollectionWithDB(
  sessionId: string | null,
  options: UseSensorCollectionWithDBOptions = {},
): UseSensorCollectionWithDBResult {
  const {
    enabled = false,
    sensors,
    onData,
    onError,
    bufferSize = 100,
    flushInterval = 5000,
    retryAttempts = 3,
  } = options;

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runningSensors, setRunningSensors] = useState<SensorType[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const sensorManager = useRef(getSensorManager());
  const dataService = useRef(
    getSensorDataService({
      bufferSize,
      flushInterval,
      retryAttempts,
      onError: err => {
        setError(err);
        if (onError) {
          onError(err);
        }
      },
    }),
  );

  const dataCallbackRef = useRef(onData);
  const errorCallbackRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    dataCallbackRef.current = onData;
    errorCallbackRef.current = onError;
  }, [onData, onError]);

  // Start sensor collection
  const start = useCallback(
    async (enabledSensors: SensorType[]) => {
      if (!sessionId) {
        const err = new Error('Session ID is required to start sensors');
        setError(err);
        if (errorCallbackRef.current) {
          errorCallbackRef.current(err);
        }
        return;
      }

      if (isRunning) {
        return;
      }

      try {
        setError(null);

        // Start data service
        dataService.current.start();

        // Start sensor collection
        await sensorManager.current.startCollection(sessionId, enabledSensors, {
          sensors,
          onData: data => {
            // Add to database service buffer
            dataService.current.addData(data);

            // Call individual data callback
            if (dataCallbackRef.current) {
              dataCallbackRef.current(data);
            }
          },
          onError: err => {
            setError(err);
            if (errorCallbackRef.current) {
              errorCallbackRef.current(err);
            }
          },
        });

        setIsRunning(true);
        setRunningSensors(sensorManager.current.getRunningSensors());
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsRunning(false);
        if (errorCallbackRef.current) {
          errorCallbackRef.current(error);
        }
      }
    },
    [sessionId, sensors, isRunning],
  );

  // Stop sensor collection
  const stop = useCallback(async () => {
    if (!isRunning) {
      return;
    }

    try {
      await sensorManager.current.stopCollection();
      await dataService.current.stop();

      setIsRunning(false);
      setRunningSensors([]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (errorCallbackRef.current) {
        errorCallbackRef.current(error);
      }
    }
  }, [isRunning]);

  // Get buffer statistics
  const getBufferStats = useCallback(() => {
    return dataService.current.getBufferStats();
  }, []);

  // Get saver statistics
  const getSaverStats = useCallback(() => {
    return dataService.current.getSaverStats();
  }, []);

  // Get failed batches count
  const getFailedBatchesCount = useCallback(() => {
    return dataService.current.getFailedBatchesCount();
  }, []);

  // Manually flush buffer
  const flush = useCallback(async () => {
    await dataService.current.flush();
  }, []);

  // Auto start based on enabled option
  useEffect(() => {
    if (enabled && sessionId && !isRunning && sensors) {
      const enabledSensorTypes = Object.entries(sensors)
        .filter(([, config]) => config?.enabled)
        .map(([type]) => type as SensorType);

      if (enabledSensorTypes.length > 0) {
        start(enabledSensorTypes);
      }
    } else if (!enabled && isRunning) {
      stop();
    }
  }, [enabled, sessionId, sensors, isRunning, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRunning) {
        stop();
      }
    };
  }, [isRunning, stop]);

  return {
    isRunning,
    runningSensors,
    error,
    start,
    stop,
    getBufferStats,
    getSaverStats,
    getFailedBatchesCount,
    flush,
  };
}
