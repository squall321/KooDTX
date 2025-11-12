/**
 * useSensor Hook
 * Manages individual sensor data collection
 */

import {useEffect, useRef, useState, useCallback} from 'react';
import type {SensorType, SensorData} from '@types/sensor.types';
import {getSensorManager} from '@services/sensors';

export interface UseSensorOptions {
  enabled?: boolean;
  sampleRate?: number;
  onData?: (data: SensorData) => void;
  onError?: (error: Error) => void;
}

export interface UseSensorResult {
  isAvailable: boolean;
  isRunning: boolean;
  latestData: SensorData | null;
  error: Error | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

/**
 * Hook for managing a single sensor
 */
export function useSensor(
  sensorType: SensorType,
  sessionId: string | null,
  options: UseSensorOptions = {},
): UseSensorResult {
  const {enabled = false, sampleRate = 100, onData, onError} = options;

  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const sensorManager = useRef(getSensorManager());
  const dataCallbackRef = useRef(onData);
  const errorCallbackRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    dataCallbackRef.current = onData;
    errorCallbackRef.current = onError;
  }, [onData, onError]);

  // Check sensor availability on mount
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
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    checkAvailability();
  }, [sensorType]);

  // Start sensor
  const start = useCallback(async () => {
    if (!sessionId) {
      const err = new Error('Session ID is required to start sensor');
      setError(err);
      if (errorCallbackRef.current) {
        errorCallbackRef.current(err);
      }
      return;
    }

    if (!isAvailable) {
      const err = new Error(`Sensor ${sensorType} is not available`);
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
          setLatestData(data);
          if (dataCallbackRef.current) {
            dataCallbackRef.current(data);
          }
        },
        err => {
          setError(err);
          setIsRunning(false);
          if (errorCallbackRef.current) {
            errorCallbackRef.current(err);
          }
        },
      );

      setIsRunning(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsRunning(false);
      if (errorCallbackRef.current) {
        errorCallbackRef.current(error);
      }
    }
  }, [sessionId, sensorType, isAvailable, isRunning, sampleRate]);

  // Stop sensor
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
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (errorCallbackRef.current) {
        errorCallbackRef.current(error);
      }
    }
  }, [sensorType, isRunning]);

  // Auto start/stop based on enabled option
  useEffect(() => {
    if (enabled && sessionId && isAvailable && !isRunning) {
      start();
    } else if (!enabled && isRunning) {
      stop();
    }
  }, [enabled, sessionId, isAvailable, isRunning, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRunning) {
        stop();
      }
    };
  }, [isRunning, stop]);

  return {
    isAvailable,
    isRunning,
    latestData,
    error,
    start,
    stop,
  };
}
