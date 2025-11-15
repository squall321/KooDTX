/**
 * useRealtimeChart Hook
 * Phase 151: Hook for real-time chart data updates
 *
 * Features:
 * - Real-time data updates
 * - Buffer management
 * - Data smoothing
 * - Auto-scaling
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface RealtimeChartOptions {
  /**
   * Maximum number of data points to display
   * @default 50
   */
  maxDataPoints?: number;

  /**
   * Update interval in milliseconds
   * @default 100
   */
  updateInterval?: number;

  /**
   * Whether to smooth data
   * @default false
   */
  smoothData?: boolean;

  /**
   * Smoothing factor (0-1)
   * @default 0.3
   */
  smoothingFactor?: number;

  /**
   * Initial data
   */
  initialData?: number[];
}

/**
 * useRealtimeChart Hook
 * Phase 151: Manage real-time chart data
 */
export const useRealtimeChart = (options: RealtimeChartOptions = {}) => {
  const {
    maxDataPoints = 50,
    updateInterval = 100,
    smoothData = false,
    smoothingFactor = 0.3,
    initialData = [],
  } = options;

  const [data, setData] = useState<number[]>(initialData);
  const [labels, setLabels] = useState<string[]>([]);
  const lastValueRef = useRef<number>(0);
  const updateTimerRef = useRef<NodeJS.Timeout>();

  /**
   * Add new data point
   */
  const addDataPoint = useCallback(
    (value: number, label?: string) => {
      setData(prevData => {
        let newValue = value;

        // Apply smoothing if enabled
        if (smoothData && prevData.length > 0) {
          const lastValue = prevData[prevData.length - 1];
          newValue = lastValue + smoothingFactor * (value - lastValue);
        }

        lastValueRef.current = newValue;

        // Add new data point and limit to maxDataPoints
        const newData = [...prevData, newValue];
        if (newData.length > maxDataPoints) {
          return newData.slice(newData.length - maxDataPoints);
        }
        return newData;
      });

      // Update labels
      if (label) {
        setLabels(prevLabels => {
          const newLabels = [...prevLabels, label];
          if (newLabels.length > maxDataPoints) {
            return newLabels.slice(newLabels.length - maxDataPoints);
          }
          return newLabels;
        });
      } else {
        setLabels(prevLabels => {
          const newLabels = [...prevLabels, `${prevLabels.length}`];
          if (newLabels.length > maxDataPoints) {
            return newLabels.slice(newLabels.length - maxDataPoints);
          }
          return newLabels;
        });
      }
    },
    [maxDataPoints, smoothData, smoothingFactor]
  );

  /**
   * Add multiple data points
   */
  const addDataPoints = useCallback(
    (values: number[], newLabels?: string[]) => {
      setData(prevData => {
        const newData = [...prevData, ...values];
        if (newData.length > maxDataPoints) {
          return newData.slice(newData.length - maxDataPoints);
        }
        return newData;
      });

      if (newLabels) {
        setLabels(prevLabels => {
          const combined = [...prevLabels, ...newLabels];
          if (combined.length > maxDataPoints) {
            return combined.slice(combined.length - maxDataPoints);
          }
          return combined;
        });
      }
    },
    [maxDataPoints]
  );

  /**
   * Clear all data
   */
  const clearData = useCallback(() => {
    setData([]);
    setLabels([]);
    lastValueRef.current = 0;
  }, []);

  /**
   * Reset to initial data
   */
  const resetData = useCallback(() => {
    setData(initialData);
    setLabels([]);
    lastValueRef.current = 0;
  }, [initialData]);

  /**
   * Get statistics
   */
  const getStats = useCallback(() => {
    if (data.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        current: 0,
      };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    const current = data[data.length - 1];

    return { min, max, avg, current };
  }, [data]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  return {
    data,
    labels,
    addDataPoint,
    addDataPoints,
    clearData,
    resetData,
    getStats,
  };
};

export default useRealtimeChart;
