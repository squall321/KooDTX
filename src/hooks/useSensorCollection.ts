/**
 * useSensorCollection Hook
 * Manages multiple sensor data collection simultaneously
 */

import {useEffect, useRef, useState, useCallback} from 'react';
import type {SensorType, SensorData, SensorConfig} from '@app-types/sensor.types';
import {getSensorManager} from '@services/sensors';

export interface UseSensorCollectionOptions {
  enabled?: boolean;
  sensors?: Partial<Record<SensorType, SensorConfig>>;
  onData?: (data: SensorData) => void;
  onError?: (error: Error) => void;
  bufferSize?: number;
  batchInterval?: number;
  onBatch?: (batch: SensorData[]) => void;
}

export interface UseSensorCollectionResult {
  isRunning: boolean;
  runningSensors: SensorType[];
  dataBuffer: SensorData[];
  error: Error | null;
  start: (enabledSensors: SensorType[]) => Promise<void>;
  stop: () => Promise<void>;
  clearBuffer: () => void;
  flushBuffer: () => SensorData[];
}

/**
 * Hook for managing multiple sensors with buffering
 */
export function useSensorCollection(
  sessionId: string | null,
  options: UseSensorCollectionOptions = {},
): UseSensorCollectionResult {
  const {
    enabled = false,
    sensors,
    onData,
    onError,
    bufferSize = 100,
    batchInterval = 1000,
    onBatch,
  } = options;

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runningSensors, setRunningSensors] = useState<SensorType[]>([]);
  const [dataBuffer, setDataBuffer] = useState<SensorData[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const sensorManager = useRef(getSensorManager());
  const dataCallbackRef = useRef(onData);
  const errorCallbackRef = useRef(onError);
  const batchCallbackRef = useRef(onBatch);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when callbacks change
  useEffect(() => {
    dataCallbackRef.current = onData;
    errorCallbackRef.current = onError;
    batchCallbackRef.current = onBatch;
  }, [onData, onError, onBatch]);

  // Flush buffer callback
  const flushBuffer = useCallback((): SensorData[] => {
    const currentBuffer = dataBuffer;
    setDataBuffer([]);
    return currentBuffer;
  }, [dataBuffer]);

  // Clear buffer callback
  const clearBuffer = useCallback(() => {
    setDataBuffer([]);
  }, []);

  // Add data to buffer
  const addToBuffer = useCallback(
    (data: SensorData) => {
      setDataBuffer(prev => {
        const newBuffer = [...prev, data];

        // If buffer exceeds size, flush oldest data
        if (newBuffer.length >= bufferSize) {
          const batchData = newBuffer.splice(0, bufferSize);
          if (batchCallbackRef.current) {
            // Call batch callback asynchronously
            setTimeout(() => {
              if (batchCallbackRef.current) {
                batchCallbackRef.current(batchData);
              }
            }, 0);
          }
          return newBuffer;
        }

        return newBuffer;
      });
    },
    [bufferSize],
  );

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

        await sensorManager.current.startCollection(sessionId, enabledSensors, {
          sensors,
          onData: data => {
            // Add to buffer
            addToBuffer(data);

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

        // Start batch timer
        if (batchInterval > 0 && onBatch) {
          batchTimerRef.current = setInterval(() => {
            setDataBuffer(prev => {
              if (prev.length > 0 && batchCallbackRef.current) {
                batchCallbackRef.current([...prev]);
                return [];
              }
              return prev;
            });
          }, batchInterval);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsRunning(false);
        if (errorCallbackRef.current) {
          errorCallbackRef.current(error);
        }
      }
    },
    [sessionId, sensors, isRunning, addToBuffer, batchInterval, onBatch],
  );

  // Stop sensor collection
  const stop = useCallback(async () => {
    if (!isRunning) {
      return;
    }

    try {
      // Clear batch timer
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
        batchTimerRef.current = null;
      }

      // Flush remaining buffer
      if (dataBuffer.length > 0 && batchCallbackRef.current) {
        batchCallbackRef.current([...dataBuffer]);
      }

      await sensorManager.current.stopCollection();
      setIsRunning(false);
      setRunningSensors([]);
      setDataBuffer([]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (errorCallbackRef.current) {
        errorCallbackRef.current(error);
      }
    }
  }, [isRunning, dataBuffer]);

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
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
      }
      if (isRunning) {
        stop();
      }
    };
  }, [isRunning, stop]);

  return {
    isRunning,
    runningSensors,
    dataBuffer,
    error,
    start,
    stop,
    clearBuffer,
    flushBuffer,
  };
}
