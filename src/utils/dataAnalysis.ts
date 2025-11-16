/**
 * Data Analysis Utilities
 *
 * Advanced analysis functions for sensor data.
 *
 * Usage:
 *   import { DataAnalysis } from '@/utils/dataAnalysis';
 *
 *   const stats = DataAnalysis.calculateStatistics(data);
 *   const outliers = DataAnalysis.detectOutliersZScore(data);
 *   const peaks = DataAnalysis.detectPeaks(data, 0.5);
 */

import {
  calculateStatistics,
  detectOutliersZScore,
  detectOutliersIQR,
  calculateMovingAverage,
  detectPeaks,
  calculateCorrelation,
  normalize,
  standardize,
  Statistics,
} from './statistics';

export class DataAnalysis {
  /**
   * Calculate comprehensive statistics
   */
  static calculateStatistics(data: number[]): Statistics {
    return calculateStatistics(data);
  }

  /**
   * Detect outliers using Z-score method
   *
   * Outliers are data points that are more than `threshold` standard deviations
   * away from the mean.
   *
   * @param data - Input data
   * @param threshold - Z-score threshold (default: 3)
   * @returns Array of outlier indices
   */
  static detectOutliersZScore(data: number[], threshold: number = 3): number[] {
    return detectOutliersZScore(data, threshold);
  }

  /**
   * Detect outliers using IQR (Interquartile Range) method
   *
   * Outliers are data points below Q1 - 1.5*IQR or above Q3 + 1.5*IQR.
   *
   * @param data - Input data
   * @returns Array of outlier indices
   */
  static detectOutliersIQR(data: number[]): number[] {
    return detectOutliersIQR(data);
  }

  /**
   * Detect peaks in signal
   *
   * A peak is a data point that is larger than its immediate neighbors
   * and above the threshold.
   *
   * @param data - Input data
   * @param threshold - Minimum value for a peak (default: 0)
   * @returns Array of peak indices
   */
  static detectPeaks(data: number[], threshold: number = 0): number[] {
    return detectPeaks(data, threshold);
  }

  /**
   * Calculate moving average (smoothing)
   *
   * @param data - Input data
   * @param windowSize - Size of the moving window
   * @returns Array of moving averages
   */
  static movingAverage(data: number[], windowSize: number): number[] {
    return calculateMovingAverage(data, windowSize);
  }

  /**
   * Calculate correlation between two datasets
   *
   * Returns Pearson correlation coefficient between -1 and 1:
   * - 1: Perfect positive correlation
   * - 0: No correlation
   * - -1: Perfect negative correlation
   *
   * @param x - First dataset
   * @param y - Second dataset
   * @returns Correlation coefficient
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    return calculateCorrelation(x, y);
  }

  /**
   * Normalize data to range [0, 1]
   */
  static normalize(data: number[]): number[] {
    return normalize(data);
  }

  /**
   * Standardize data (z-score normalization)
   *
   * Result has mean=0 and stdDev=1
   */
  static standardize(data: number[]): number[] {
    return standardize(data);
  }

  /**
   * Analyze periodicity in signal
   *
   * Detects repeating patterns by finding peaks in autocorrelation.
   *
   * @param data - Input data
   * @param maxLag - Maximum lag to check (default: data.length / 2)
   * @returns Detected period (or null if no clear period found)
   */
  static analyzePeriodicity(data: number[], maxLag?: number): number | null {
    maxLag = maxLag || Math.floor(data.length / 2);

    const autocorrelation: number[] = [];

    // Calculate autocorrelation
    for (let lag = 1; lag < maxLag; lag++) {
      let sum = 0;
      let count = 0;

      for (let i = 0; i < data.length - lag; i++) {
        sum += data[i] * data[i + lag];
        count++;
      }

      autocorrelation.push(sum / count);
    }

    // Find peaks in autocorrelation
    const peaks = this.detectPeaks(autocorrelation, 0);

    if (peaks.length === 0) {
      return null;
    }

    // Return the first significant peak (likely period)
    return peaks[0] + 1; // +1 because lag starts at 1
  }

  /**
   * Detect trend direction in data
   *
   * @param data - Input data
   * @returns 'increasing', 'decreasing', or 'stable'
   */
  static detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) {
      return 'stable';
    }

    // Simple linear regression
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }

    // Slope of the regression line
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Determine trend based on slope
    if (Math.abs(slope) < 0.01) {
      return 'stable';
    } else if (slope > 0) {
      return 'increasing';
    } else {
      return 'decreasing';
    }
  }

  /**
   * Split data into windows
   *
   * @param data - Input data
   * @param windowSize - Size of each window
   * @param overlap - Overlap between windows (default: 0)
   * @returns Array of windows
   */
  static createWindows(
    data: number[],
    windowSize: number,
    overlap: number = 0
  ): number[][] {
    const windows: number[][] = [];
    const step = windowSize - overlap;

    for (let i = 0; i + windowSize <= data.length; i += step) {
      windows.push(data.slice(i, i + windowSize));
    }

    return windows;
  }

  /**
   * Calculate RMS (Root Mean Square)
   *
   * Useful for measuring signal magnitude.
   *
   * @param data - Input data
   * @returns RMS value
   */
  static calculateRMS(data: number[]): number {
    const sumOfSquares = data.reduce((sum, val) => sum + val * val, 0);
    return Math.sqrt(sumOfSquares / data.length);
  }

  /**
   * Calculate signal-to-noise ratio (SNR)
   *
   * @param signal - Signal data
   * @param noise - Noise data
   * @returns SNR in dB
   */
  static calculateSNR(signal: number[], noise: number[]): number {
    const signalPower = this.calculateRMS(signal) ** 2;
    const noisePower = this.calculateRMS(noise) ** 2;

    if (noisePower === 0) {
      return Infinity;
    }

    return 10 * Math.log10(signalPower / noisePower);
  }

  /**
   * Generate summary report for sensor data
   *
   * @param data - Input data
   * @param label - Label for the dataset
   * @returns Object containing analysis results
   */
  static generateReport(data: number[], label: string = 'Dataset') {
    const stats = this.calculateStatistics(data);
    const outliersZScore = this.detectOutliersZScore(data);
    const outliersIQR = this.detectOutliersIQR(data);
    const peaks = this.detectPeaks(data);
    const trend = this.detectTrend(data);
    const period = this.analyzePeriodicity(data);
    const rms = this.calculateRMS(data);

    return {
      label,
      statistics: stats,
      outliers: {
        zscore: {
          count: outliersZScore.length,
          indices: outliersZScore,
        },
        iqr: {
          count: outliersIQR.length,
          indices: outliersIQR,
        },
      },
      peaks: {
        count: peaks.length,
        indices: peaks,
      },
      trend,
      period: period || 'No clear periodicity detected',
      rms,
    };
  }
}

// Export for convenience
export { Statistics };
