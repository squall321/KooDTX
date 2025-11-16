/**
 * Data Analysis Utility
 * Phase 252: Advanced sensor data analysis
 *
 * Provides comprehensive analysis features:
 * - Pattern recognition
 * - Periodicity detection
 * - Activity classification
 * - Analysis reports
 */

import {
  calculateStatistics,
  detectOutliers,
  findPeaks,
  calculateTrend,
  type Statistics,
} from './statistics';
import {
  performFFT,
  isPeriodic,
  estimatePeriod,
  calculateSpectralCentroid,
  type FFTResult,
} from './fft';

export interface PatternAnalysis {
  hasPeaks: boolean;
  peakCount: number;
  peakIndices: number[];
  isPeriodic: boolean;
  estimatedPeriod: number | null; // seconds
  dominantFrequency: number | null; // Hz
  trend: 'increasing' | 'decreasing' | 'stable';
  trendSlope: number;
}

export interface OutlierAnalysis {
  hasOutliers: boolean;
  outlierCount: number;
  outlierIndices: number[];
  outlierPercentage: number;
}

export interface FrequencyAnalysis {
  fftResult: FFTResult;
  spectralCentroid: number; // Hz
  dominantFrequencies: Array<{
    frequency: number;
    magnitude: number;
  }>;
}

export interface ComprehensiveAnalysis {
  statistics: Statistics;
  patterns: PatternAnalysis;
  outliers: OutlierAnalysis;
  frequency?: FrequencyAnalysis; // Optional, requires enough data
  classification?: ActivityClassification;
  summary: string;
}

export interface ActivityClassification {
  activity: 'stationary' | 'walking' | 'running' | 'vibrating' | 'unknown';
  confidence: number; // 0-1
  reason: string;
}

/**
 * Perform pattern recognition analysis
 *
 * @param data - Time-series data
 * @param sampleRate - Sampling rate in Hz (default: 100)
 * @param peakThreshold - Minimum value for peak detection
 * @returns Pattern analysis result
 */
export function analyzePatterns(
  data: number[],
  sampleRate: number = 100,
  peakThreshold?: number
): PatternAnalysis {
  if (data.length === 0) {
    return {
      hasPeaks: false,
      peakCount: 0,
      peakIndices: [],
      isPeriodic: false,
      estimatedPeriod: null,
      dominantFrequency: null,
      trend: 'stable',
      trendSlope: 0,
    };
  }

  // Detect peaks
  const threshold =
    peakThreshold !== undefined
      ? peakThreshold
      : calculateStatistics(data).mean;
  const peakIndices = findPeaks(data, threshold);

  // Analyze periodicity
  let periodic = false;
  let period: number | null = null;
  let dominantFreq: number | null = null;

  try {
    periodic = isPeriodic(data, sampleRate);
    if (periodic) {
      period = estimatePeriod(data, sampleRate);
      dominantFreq = period ? 1 / period : null;
    }
  } catch (error) {
    // FFT might fail for very small datasets
    periodic = false;
  }

  // Analyze trend
  const trendSlope = calculateTrend(data);
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

  if (trendSlope > 0.001) {
    trend = 'increasing';
  } else if (trendSlope < -0.001) {
    trend = 'decreasing';
  }

  return {
    hasPeaks: peakIndices.length > 0,
    peakCount: peakIndices.length,
    peakIndices,
    isPeriodic: periodic,
    estimatedPeriod: period,
    dominantFrequency: dominantFreq,
    trend,
    trendSlope,
  };
}

/**
 * Perform outlier analysis
 *
 * @param data - Dataset
 * @returns Outlier analysis result
 */
export function analyzeOutliers(data: number[]): OutlierAnalysis {
  if (data.length === 0) {
    return {
      hasOutliers: false,
      outlierCount: 0,
      outlierIndices: [],
      outlierPercentage: 0,
    };
  }

  const outlierIndices = detectOutliers(data);
  const outlierPercentage = (outlierIndices.length / data.length) * 100;

  return {
    hasOutliers: outlierIndices.length > 0,
    outlierCount: outlierIndices.length,
    outlierIndices,
    outlierPercentage,
  };
}

/**
 * Perform frequency domain analysis
 *
 * @param data - Time-series data
 * @param sampleRate - Sampling rate in Hz
 * @param topN - Number of top frequencies to extract
 * @returns Frequency analysis result
 */
export function analyzeFrequency(
  data: number[],
  sampleRate: number = 100,
  topN: number = 5
): FrequencyAnalysis | null {
  if (data.length < 4) {
    // Need at least 4 samples for meaningful FFT
    return null;
  }

  try {
    const fftResult = performFFT(data, sampleRate, topN);
    const spectralCentroid = calculateSpectralCentroid(fftResult);

    const dominantFrequencies = fftResult.components.map(comp => ({
      frequency: comp.frequency,
      magnitude: comp.magnitude,
    }));

    return {
      fftResult,
      spectralCentroid,
      dominantFrequencies,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Classify activity based on sensor data patterns
 *
 * @param data - Magnitude data from accelerometer
 * @param sampleRate - Sampling rate in Hz
 * @returns Activity classification
 */
export function classifyActivity(
  data: number[],
  sampleRate: number = 100
): ActivityClassification {
  if (data.length < 10) {
    return {
      activity: 'unknown',
      confidence: 0,
      reason: 'Insufficient data for classification',
    };
  }

  const stats = calculateStatistics(data);
  const patterns = analyzePatterns(data, sampleRate);

  // Stationary: low variance, no peaks
  if (stats.stdDev < 0.5 && patterns.peakCount === 0) {
    return {
      activity: 'stationary',
      confidence: 0.9,
      reason: 'Low variance and no significant peaks detected',
    };
  }

  // Vibrating: high frequency, periodic
  if (
    patterns.isPeriodic &&
    patterns.dominantFrequency &&
    patterns.dominantFrequency > 5
  ) {
    return {
      activity: 'vibrating',
      confidence: 0.8,
      reason: `Periodic pattern with high frequency (${patterns.dominantFrequency.toFixed(1)} Hz)`,
    };
  }

  // Walking: moderate variance, periodic at 1-3 Hz
  if (
    patterns.isPeriodic &&
    patterns.dominantFrequency &&
    patterns.dominantFrequency >= 1 &&
    patterns.dominantFrequency <= 3 &&
    stats.stdDev > 0.5 &&
    stats.stdDev < 3
  ) {
    return {
      activity: 'walking',
      confidence: 0.75,
      reason: `Periodic pattern at walking frequency (${patterns.dominantFrequency.toFixed(1)} Hz)`,
    };
  }

  // Running: high variance, periodic at 2-4 Hz
  if (
    patterns.isPeriodic &&
    patterns.dominantFrequency &&
    patterns.dominantFrequency >= 2 &&
    patterns.dominantFrequency <= 4 &&
    stats.stdDev >= 3
  ) {
    return {
      activity: 'running',
      confidence: 0.7,
      reason: `High variance with running frequency (${patterns.dominantFrequency.toFixed(1)} Hz)`,
    };
  }

  // Unknown: doesn't match clear patterns
  return {
    activity: 'unknown',
    confidence: 0.3,
    reason: 'Pattern does not match known activity signatures',
  };
}

/**
 * Perform comprehensive analysis on sensor data
 *
 * @param data - Time-series sensor data
 * @param sampleRate - Sampling rate in Hz
 * @param options - Analysis options
 * @returns Comprehensive analysis result
 */
export function performComprehensiveAnalysis(
  data: number[],
  sampleRate: number = 100,
  options: {
    includeFrequency?: boolean;
    includeClassification?: boolean;
  } = {}
): ComprehensiveAnalysis {
  const {
    includeFrequency = true,
    includeClassification = true,
  } = options;

  // Basic statistics
  const statistics = calculateStatistics(data);

  // Pattern analysis
  const patterns = analyzePatterns(data, sampleRate);

  // Outlier analysis
  const outliers = analyzeOutliers(data);

  // Frequency analysis (optional)
  let frequency: FrequencyAnalysis | undefined;
  if (includeFrequency && data.length >= 4) {
    const freqAnalysis = analyzeFrequency(data, sampleRate);
    if (freqAnalysis) {
      frequency = freqAnalysis;
    }
  }

  // Activity classification (optional)
  let classification: ActivityClassification | undefined;
  if (includeClassification) {
    classification = classifyActivity(data, sampleRate);
  }

  // Generate summary
  const summary = generateAnalysisSummary({
    statistics,
    patterns,
    outliers,
    frequency,
    classification,
  });

  return {
    statistics,
    patterns,
    outliers,
    frequency,
    classification,
    summary,
  };
}

/**
 * Generate human-readable summary of analysis
 */
function generateAnalysisSummary(analysis: {
  statistics: Statistics;
  patterns: PatternAnalysis;
  outliers: OutlierAnalysis;
  frequency?: FrequencyAnalysis;
  classification?: ActivityClassification;
}): string {
  const parts: string[] = [];

  // Statistics summary
  parts.push(
    `데이터 포인트: ${analysis.statistics.count}개, ` +
      `평균: ${analysis.statistics.mean.toFixed(2)}, ` +
      `표준편차: ${analysis.statistics.stdDev.toFixed(2)}`
  );

  // Pattern summary
  if (analysis.patterns.isPeriodic && analysis.patterns.estimatedPeriod) {
    parts.push(
      `주기적 패턴 감지됨 (주기: ${analysis.patterns.estimatedPeriod.toFixed(2)}초)`
    );
  }

  if (analysis.patterns.hasPeaks) {
    parts.push(`${analysis.patterns.peakCount}개의 피크 감지됨`);
  }

  // Trend summary
  const trendText = {
    increasing: '상승 추세',
    decreasing: '하락 추세',
    stable: '안정적',
  }[analysis.patterns.trend];
  parts.push(`추세: ${trendText}`);

  // Outlier summary
  if (analysis.outliers.hasOutliers) {
    parts.push(
      `이상치 ${analysis.outliers.outlierCount}개 (${analysis.outliers.outlierPercentage.toFixed(1)}%)`
    );
  }

  // Classification summary
  if (analysis.classification && analysis.classification.activity !== 'unknown') {
    const activityText = {
      stationary: '정지',
      walking: '걷기',
      running: '달리기',
      vibrating: '진동',
      unknown: '알 수 없음',
    }[analysis.classification.activity];

    parts.push(
      `활동 분류: ${activityText} (신뢰도: ${(analysis.classification.confidence * 100).toFixed(0)}%)`
    );
  }

  return parts.join('. ');
}

/**
 * Format comprehensive analysis as text report
 *
 * @param analysis - Comprehensive analysis result
 * @param sensorType - Sensor type name
 * @param axis - Axis name
 * @returns Formatted text report
 */
export function formatAnalysisReport(
  analysis: ComprehensiveAnalysis,
  sensorType: string,
  axis: string
): string {
  const sections: string[] = [];

  // Header
  sections.push('# 센서 데이터 분석 리포트\n');
  sections.push(`센서: ${sensorType}`);
  sections.push(`축: ${axis}\n`);

  // Summary
  sections.push('## 요약');
  sections.push(analysis.summary + '\n');

  // Statistics
  sections.push('## 통계 정보');
  sections.push(`- 데이터 개수: ${analysis.statistics.count}`);
  sections.push(`- 평균: ${analysis.statistics.mean.toFixed(4)}`);
  sections.push(`- 중앙값: ${analysis.statistics.median.toFixed(4)}`);
  sections.push(`- 표준편차: ${analysis.statistics.stdDev.toFixed(4)}`);
  sections.push(`- 최소값: ${analysis.statistics.min.toFixed(4)}`);
  sections.push(`- 최대값: ${analysis.statistics.max.toFixed(4)}`);
  sections.push(`- 범위: ${analysis.statistics.range.toFixed(4)}`);
  sections.push(`- Q1: ${analysis.statistics.quartiles.q1.toFixed(4)}`);
  sections.push(`- Q2: ${analysis.statistics.quartiles.q2.toFixed(4)}`);
  sections.push(`- Q3: ${analysis.statistics.quartiles.q3.toFixed(4)}`);
  sections.push(`- IQR: ${analysis.statistics.iqr.toFixed(4)}\n`);

  // Patterns
  sections.push('## 패턴 분석');
  sections.push(
    `- 주기적 패턴: ${analysis.patterns.isPeriodic ? '예' : '아니오'}`
  );
  if (analysis.patterns.estimatedPeriod) {
    sections.push(
      `- 추정 주기: ${analysis.patterns.estimatedPeriod.toFixed(2)}초`
    );
  }
  if (analysis.patterns.dominantFrequency) {
    sections.push(
      `- 주요 주파수: ${analysis.patterns.dominantFrequency.toFixed(2)} Hz`
    );
  }
  sections.push(`- 피크 개수: ${analysis.patterns.peakCount}`);
  sections.push(`- 추세: ${analysis.patterns.trend}`);
  sections.push(`- 추세 기울기: ${analysis.patterns.trendSlope.toFixed(6)}\n`);

  // Outliers
  sections.push('## 이상치 분석');
  sections.push(
    `- 이상치 감지: ${analysis.outliers.hasOutliers ? '예' : '아니오'}`
  );
  sections.push(`- 이상치 개수: ${analysis.outliers.outlierCount}`);
  sections.push(
    `- 이상치 비율: ${analysis.outliers.outlierPercentage.toFixed(2)}%\n`
  );

  // Frequency analysis
  if (analysis.frequency) {
    sections.push('## 주파수 분석');
    sections.push(
      `- 주요 주파수: ${analysis.frequency.fftResult.dominantFrequency.toFixed(2)} Hz`
    );
    sections.push(
      `- 스펙트럼 중심: ${analysis.frequency.spectralCentroid.toFixed(2)} Hz`
    );
    sections.push('- 상위 주파수 성분:');
    analysis.frequency.dominantFrequencies.forEach((comp, idx) => {
      sections.push(
        `  ${idx + 1}. ${comp.frequency.toFixed(2)} Hz (크기: ${comp.magnitude.toFixed(4)})`
      );
    });
    sections.push('');
  }

  // Activity classification
  if (analysis.classification) {
    sections.push('## 활동 분류');
    sections.push(`- 분류 결과: ${analysis.classification.activity}`);
    sections.push(
      `- 신뢰도: ${(analysis.classification.confidence * 100).toFixed(1)}%`
    );
    sections.push(`- 근거: ${analysis.classification.reason}\n`);
  }

  return sections.join('\n');
}
