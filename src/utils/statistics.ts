/**
 * Statistics Utility
 * Phase 251: Advanced data visualization and analysis
 *
 * Provides statistical analysis functions for sensor data
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
  quartiles: {
    q1: number;        // 1사분위수 (25%)
    q2: number;        // 2사분위수 (50%, median)
    q3: number;        // 3사분위수 (75%)
  };
  iqr: number;         // 사분위수 범위 (IQR)
}

/**
 * Calculate basic statistics for a dataset
 */
export function calculateStatistics(data: number[]): Statistics {
  if (data.length === 0) {
    throw new Error('Cannot calculate statistics for empty dataset');
  }

  const sorted = [...data].sort((a, b) => a - b);
  const n = data.length;

  // Mean
  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Median
  const median = calculateMedian(sorted);

  // Mode
  const mode = calculateMode(data);

  // Variance and Standard Deviation
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Min and Max
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  // Quartiles
  const q1 = calculatePercentile(sorted, 25);
  const q2 = median;
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;

  return {
    mean,
    median,
    mode,
    stdDev,
    variance,
    min,
    max,
    range,
    sum,
    count: n,
    quartiles: { q1, q2, q3 },
    iqr,
  };
}

/**
 * Calculate median of sorted array
 */
function calculateMedian(sorted: number[]): number {
  const n = sorted.length;
  const mid = Math.floor(n / 2);

  if (n % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Calculate mode (most frequent value)
 * Returns null if no mode exists (all values appear equally)
 */
function calculateMode(data: number[]): number | null {
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  let mode: number | null = null;

  data.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      mode = value;
    }
  });

  // Check if all values have the same frequency
  const allSameFreq = Object.values(frequency).every(freq => freq === maxFreq);
  return allSameFreq && Object.keys(frequency).length > 1 ? null : mode;
}

/**
 * Calculate percentile of sorted array
 */
function calculatePercentile(sorted: number[], percentile: number): number {
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Detect outliers using IQR method
 * Returns indices of outlier values
 */
export function detectOutliers(data: number[]): number[] {
  const stats = calculateStatistics(data);
  const lowerBound = stats.quartiles.q1 - 1.5 * stats.iqr;
  const upperBound = stats.quartiles.q3 + 1.5 * stats.iqr;

  const outlierIndices: number[] = [];
  data.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      outlierIndices.push(index);
    }
  });

  return outlierIndices;
}

/**
 * Detect outliers using Z-score method
 * Returns indices of outlier values (|z-score| > threshold)
 */
export function detectOutliersZScore(
  data: number[],
  threshold: number = 3
): number[] {
  const stats = calculateStatistics(data);
  const outlierIndices: number[] = [];

  data.forEach((value, index) => {
    const zScore = Math.abs((value - stats.mean) / stats.stdDev);
    if (zScore > threshold) {
      outlierIndices.push(index);
    }
  });

  return outlierIndices;
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
  data: number[],
  windowSize: number
): number[] {
  if (windowSize <= 0 || windowSize > data.length) {
    throw new Error('Invalid window size');
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
 * Calculate correlation coefficient between two datasets
 * Returns value between -1 and 1
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    throw new Error('Datasets must have the same non-zero length');
  }

  const n = x.length;
  const xStats = calculateStatistics(x);
  const yStats = calculateStatistics(y);

  let covariance = 0;
  for (let i = 0; i < n; i++) {
    covariance += (x[i] - xStats.mean) * (y[i] - yStats.mean);
  }
  covariance /= n;

  const correlation = covariance / (xStats.stdDev * yStats.stdDev);
  return correlation;
}

/**
 * Find peaks in data
 * Returns indices of peak points
 */
export function findPeaks(data: number[], threshold: number = 0): number[] {
  const peaks: number[] = [];

  for (let i = 1; i < data.length - 1; i++) {
    const isPeak =
      data[i] > data[i - 1] &&
      data[i] > data[i + 1] &&
      data[i] > threshold;

    if (isPeak) {
      peaks.push(i);
    }
  }

  return peaks;
}

/**
 * Calculate histogram bins
 */
export interface HistogramBin {
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export function calculateHistogram(
  data: number[],
  binCount: number = 10
): HistogramBin[] {
  if (data.length === 0) {
    return [];
  }

  const stats = calculateStatistics(data);
  const binWidth = stats.range / binCount;
  const bins: HistogramBin[] = [];

  // Initialize bins
  for (let i = 0; i < binCount; i++) {
    bins.push({
      min: stats.min + i * binWidth,
      max: stats.min + (i + 1) * binWidth,
      count: 0,
      percentage: 0,
    });
  }

  // Count data points in each bin
  data.forEach(value => {
    const binIndex = Math.min(
      Math.floor((value - stats.min) / binWidth),
      binCount - 1
    );
    bins[binIndex].count++;
  });

  // Calculate percentages
  bins.forEach(bin => {
    bin.percentage = (bin.count / data.length) * 100;
  });

  return bins;
}

/**
 * Format number to fixed decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format statistics for display
 */
export function formatStatistics(stats: Statistics): Record<string, string> {
  return {
    '평균': formatNumber(stats.mean),
    '중앙값': formatNumber(stats.median),
    '표준편차': formatNumber(stats.stdDev),
    '최소값': formatNumber(stats.min),
    '최대값': formatNumber(stats.max),
    '범위': formatNumber(stats.range),
    '1사분위수': formatNumber(stats.quartiles.q1),
    '3사분위수': formatNumber(stats.quartiles.q3),
    'IQR': formatNumber(stats.iqr),
    '개수': stats.count.toString(),
  };
}

/**
 * Calculate basic trend (linear regression slope)
 * Positive = upward trend, Negative = downward trend
 */
export function calculateTrend(data: number[]): number {
  const n = data.length;
  if (n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  data.forEach((y, x) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}
