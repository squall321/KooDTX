/**
 * Statistics Utilities
 *
 * Statistical calculation functions for sensor data analysis.
 *
 * Usage:
 *   import { calculateStatistics, detectOutliers } from '@/utils/statistics';
 *
 *   const stats = calculateStatistics(sensorData);
 *   const outliers = detectOutliers(sensorData, 'zscore');
 */

export interface Statistics {
  mean: number;        // 평균
  median: number;      // 중앙값
  mode: number | null; // 최빈값
  stdDev: number;      // 표준편차
  variance: number;    // 분산
  min: number;         // 최소값
  max: number;         // 최대값
  range: number;       // 범위
  sum: number;         // 합계
  count: number;       // 개수
  quartiles: [number, number, number]; // Q1, Q2, Q3
}

/**
 * Calculate basic statistics for a dataset
 */
export function calculateStatistics(data: number[]): Statistics {
  if (data.length === 0) {
    throw new Error('Cannot calculate statistics for empty dataset');
  }

  const sorted = [...data].sort((a, b) => a - b);
  const count = data.length;
  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  // Variance and Standard Deviation
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  // Median
  const median =
    count % 2 === 0
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];

  // Mode
  const frequency: { [key: number]: number } = {};
  let maxFreq = 0;
  let mode: number | null = null;

  data.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mode = val;
    }
  });

  // Quartiles
  const q1 = percentile(sorted, 25);
  const q2 = median;
  const q3 = percentile(sorted, 75);

  return {
    mean,
    median,
    mode: maxFreq > 1 ? mode : null, // Only return mode if it appears more than once
    stdDev,
    variance,
    min: sorted[0],
    max: sorted[count - 1],
    range: sorted[count - 1] - sorted[0],
    sum,
    count,
    quartiles: [q1, q2, q3],
  };
}

/**
 * Calculate percentile
 */
function percentile(sortedData: number[], p: number): number {
  const index = (p / 100) * (sortedData.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) {
    return sortedData[lower];
  }

  return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
}

/**
 * Detect outliers using Z-score method
 *
 * @param data - Input data
 * @param threshold - Z-score threshold (default: 3)
 * @returns Array of outlier indices
 */
export function detectOutliersZScore(data: number[], threshold: number = 3): number[] {
  const stats = calculateStatistics(data);
  const outliers: number[] = [];

  data.forEach((value, index) => {
    const zScore = Math.abs((value - stats.mean) / stats.stdDev);
    if (zScore > threshold) {
      outliers.push(index);
    }
  });

  return outliers;
}

/**
 * Detect outliers using IQR (Interquartile Range) method
 *
 * @param data - Input data
 * @returns Array of outlier indices
 */
export function detectOutliersIQR(data: number[]): number[] {
  const stats = calculateStatistics(data);
  const [q1, , q3] = stats.quartiles;
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers: number[] = [];

  data.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      outliers.push(index);
    }
  });

  return outliers;
}

/**
 * Wrapper function for outlier detection
 */
export function detectOutliers(
  data: number[],
  method: 'zscore' | 'iqr' = 'zscore'
): number[] {
  return method === 'zscore' ? detectOutliersZScore(data) : detectOutliersIQR(data);
}

/**
 * Calculate moving average
 *
 * @param data - Input data
 * @param windowSize - Size of the moving window
 * @returns Array of moving averages
 */
export function calculateMovingAverage(data: number[], windowSize: number): number[] {
  if (windowSize > data.length) {
    throw new Error('Window size cannot be larger than data length');
  }

  const result: number[] = [];

  for (let i = 0; i <= data.length - windowSize; i++) {
    const window = data.slice(i, i + windowSize);
    const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
    result.push(avg);
  }

  return result;
}

/**
 * Detect peaks in signal
 *
 * @param data - Input data
 * @param threshold - Minimum value for a peak
 * @returns Array of peak indices
 */
export function detectPeaks(data: number[], threshold: number = 0): number[] {
  const peaks: number[] = [];

  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > threshold) {
      peaks.push(i);
    }
  }

  return peaks;
}

/**
 * Calculate correlation coefficient between two datasets
 *
 * @param x - First dataset
 * @param y - Second dataset
 * @returns Pearson correlation coefficient (-1 to 1)
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new Error('Datasets must have the same length');
  }

  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denominatorX += diffX * diffX;
    denominatorY += diffY * diffY;
  }

  const denominator = Math.sqrt(denominatorX * denominatorY);

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

/**
 * Normalize data to range [0, 1]
 */
export function normalize(data: number[]): number[] {
  const stats = calculateStatistics(data);
  const { min, max } = stats;
  const range = max - min;

  if (range === 0) {
    return data.map(() => 0.5);
  }

  return data.map(val => (val - min) / range);
}

/**
 * Standardize data (z-score normalization)
 */
export function standardize(data: number[]): number[] {
  const stats = calculateStatistics(data);
  const { mean, stdDev } = stats;

  if (stdDev === 0) {
    return data.map(() => 0);
  }

  return data.map(val => (val - mean) / stdDev);
}
