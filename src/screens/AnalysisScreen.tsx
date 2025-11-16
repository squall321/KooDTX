/**
 * AnalysisScreen
 * Phase 252: Advanced sensor data analysis
 *
 * Features:
 * - Comprehensive data analysis
 * - Pattern recognition
 * - Frequency analysis
 * - Activity classification
 * - Report generation and sharing
 */

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
  SegmentedButtons,
  Divider,
  List,
} from 'react-native-paper';
import {LineChart} from 'react-native-chart-kit';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getSensorDataRepository} from '@database/repositories';
import {SensorType} from '@app-types/sensor.types';
import {
  performComprehensiveAnalysis,
  type ComprehensiveAnalysis,
} from '@utils/dataAnalysis';
import {StatisticsCard} from '@components/charts/StatisticsCard';
import {shareReport, exportReportAsText} from '@utils/reportGenerator';
import {logger} from '@utils/logger';

type HistoryStackParamList = {
  HistoryList: undefined;
  SessionDetail: {sessionId: string};
  Analysis: {sessionId: string; sensorType?: SensorType};
};

type Props = NativeStackScreenProps<HistoryStackParamList, 'Analysis'>;

const screenWidth = Dimensions.get('window').width;

type AxisType = 'x' | 'y' | 'z' | 'magnitude';

interface SensorDataPoint {
  timestamp: number;
  x?: number;
  y?: number;
  z?: number;
}

export function AnalysisScreen({route}: Props) {
  const {sessionId, sensorType: initialSensorType} = route.params;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sensorData, setSensorData] = useState<SensorDataPoint[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorType>(
    initialSensorType || SensorType.ACCELEROMETER
  );
  const [selectedAxis, setSelectedAxis] = useState<AxisType>('magnitude');
  const [availableSensors, setAvailableSensors] = useState<SensorType[]>([]);
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [sampleRate] = useState(100); // Default 100 Hz

  const dataRepo = getSensorDataRepository();

  // Load sensor data
  const loadSensorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dataRepo.findBySession(sessionId);

      // Get unique sensor types
      const sensors = Array.from(
        new Set(data.map(d => d.sensorType as SensorType))
      );
      setAvailableSensors(sensors);

      // Filter by selected sensor
      const filtered = data.filter(d => d.sensorType === selectedSensor);

      // Convert to data points
      const points: SensorDataPoint[] = filtered.map(d => ({
        timestamp: d.timestamp,
        x: d.x,
        y: d.y,
        z: d.z,
      }));

      setSensorData(points);
    } catch (error) {
      logger.error('Failed to load sensor data:', error);
      Alert.alert('오류', '센서 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, selectedSensor, dataRepo]);

  useEffect(() => {
    loadSensorData();
  }, [loadSensorData]);

  // Extract axis data
  const axisData = useMemo(() => {
    if (selectedAxis === 'magnitude') {
      return sensorData.map(d => {
        const x = d.x || 0;
        const y = d.y || 0;
        const z = d.z || 0;
        return Math.sqrt(x * x + y * y + z * z);
      });
    } else {
      return sensorData.map(d => d[selectedAxis] || 0);
    }
  }, [sensorData, selectedAxis]);

  // Perform analysis
  const runAnalysis = useCallback(async () => {
    if (axisData.length === 0) {
      Alert.alert('알림', '분석할 데이터가 없습니다.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = performComprehensiveAnalysis(axisData, sampleRate, {
        includeFrequency: true,
        includeClassification: selectedAxis === 'magnitude', // Only for magnitude
      });

      setAnalysis(result);
      logger.info('Analysis completed:', result.summary);
    } catch (error) {
      logger.error('Failed to perform analysis:', error);
      Alert.alert('오류', '데이터 분석에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [axisData, sampleRate, selectedAxis]);

  // Auto-run analysis when data changes
  useEffect(() => {
    if (axisData.length > 0) {
      runAnalysis();
    }
  }, [axisData, runAnalysis]);

  // Share report
  const handleShareReport = useCallback(async () => {
    if (!analysis) {
      Alert.alert('알림', '분석 결과가 없습니다.');
      return;
    }

    try {
      await shareReport(
        {
          sessionId,
          sensorType: selectedSensor,
          axis:
            selectedAxis === 'magnitude'
              ? '크기'
              : selectedAxis.toUpperCase(),
          analysis,
        },
        'text'
      );
    } catch (error) {
      logger.error('Failed to share report:', error);
      Alert.alert('오류', '리포트 공유에 실패했습니다.');
    }
  }, [analysis, sessionId, selectedSensor, selectedAxis]);

  // Prepare frequency spectrum chart
  const frequencyChartData = useMemo(() => {
    if (!analysis?.frequency) {
      return null;
    }

    const {frequencies, magnitudes} = analysis.frequency.fftResult;

    // Show first 50 frequency bins
    const maxBins = Math.min(50, frequencies.length);
    const freqLabels = frequencies
      .slice(0, maxBins)
      .map((f, i) => (i % 5 === 0 ? f.toFixed(1) : ''));

    return {
      labels: freqLabels,
      datasets: [
        {
          data:
            magnitudes.slice(0, maxBins).length > 0
              ? magnitudes.slice(0, maxBins)
              : [0],
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [analysis]);

  // Render loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>데이터 로딩 중...</Text>
      </View>
    );
  }

  // Render empty state
  if (sensorData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>데이터가 없습니다</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Sensor Selection */}
      {availableSensors.length > 1 && (
        <Card style={styles.card}>
          <Card.Title title="센서 선택" />
          <Card.Content>
            <SegmentedButtons
              value={selectedSensor}
              onValueChange={value => setSelectedSensor(value as SensorType)}
              buttons={availableSensors.map(sensor => ({
                value: sensor,
                label: sensor,
              }))}
            />
          </Card.Content>
        </Card>
      )}

      {/* Axis Selection */}
      <Card style={styles.card}>
        <Card.Title title="축 선택" />
        <Card.Content>
          <SegmentedButtons
            value={selectedAxis}
            onValueChange={value => setSelectedAxis(value as AxisType)}
            buttons={[
              {value: 'x', label: 'X'},
              {value: 'y', label: 'Y'},
              {value: 'z', label: 'Z'},
              {value: 'magnitude', label: '크기'},
            ]}
          />
        </Card.Content>
      </Card>

      {/* Analysis Button */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={runAnalysis}
            loading={isAnalyzing}
            disabled={isAnalyzing || axisData.length === 0}
            icon="chart-line"
          >
            {isAnalyzing ? '분석 중...' : '데이터 분석 실행'}
          </Button>
        </Card.Content>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Summary */}
          <Card style={styles.card}>
            <Card.Title title="분석 요약" />
            <Card.Content>
              <Text variant="bodyMedium">{analysis.summary}</Text>
            </Card.Content>
          </Card>

          {/* Activity Classification */}
          {analysis.classification && (
            <Card style={styles.card}>
              <Card.Title title="활동 분류" />
              <Card.Content>
                <View style={styles.classificationContainer}>
                  <Chip
                    icon="run"
                    mode="flat"
                    style={[
                      styles.activityChip,
                      analysis.classification.activity !== 'unknown' &&
                        styles.activityChipSuccess,
                    ]}
                  >
                    {getActivityLabel(analysis.classification.activity)}
                  </Chip>
                  <Text variant="bodyMedium" style={styles.confidenceText}>
                    신뢰도:{' '}
                    {(analysis.classification.confidence * 100).toFixed(0)}%
                  </Text>
                  <Text variant="bodySmall" style={styles.reasonText}>
                    {analysis.classification.reason}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Statistics */}
          <StatisticsCard
            statistics={analysis.statistics}
            title={`통계 정보 (${selectedSensor} - ${selectedAxis === 'magnitude' ? '크기' : selectedAxis.toUpperCase()})`}
          />

          {/* Pattern Analysis */}
          <Card style={styles.card}>
            <Card.Title title="패턴 분석" />
            <Card.Content>
              <List.Item
                title="주기적 패턴"
                description={analysis.patterns.isPeriodic ? '예' : '아니오'}
                left={props => <List.Icon {...props} icon="sine-wave" />}
              />
              {analysis.patterns.estimatedPeriod && (
                <List.Item
                  title="추정 주기"
                  description={`${analysis.patterns.estimatedPeriod.toFixed(2)}초`}
                  left={props => <List.Icon {...props} icon="timer" />}
                />
              )}
              {analysis.patterns.dominantFrequency && (
                <List.Item
                  title="주요 주파수"
                  description={`${analysis.patterns.dominantFrequency.toFixed(2)} Hz`}
                  left={props => <List.Icon {...props} icon="waveform" />}
                />
              )}
              <List.Item
                title="피크 개수"
                description={`${analysis.patterns.peakCount}개`}
                left={props => <List.Icon {...props} icon="chart-bell-curve" />}
              />
              <List.Item
                title="추세"
                description={getTrendLabel(analysis.patterns.trend)}
                left={props => <List.Icon {...props} icon="trending-up" />}
              />
            </Card.Content>
          </Card>

          {/* Outlier Analysis */}
          <Card style={styles.card}>
            <Card.Title title="이상치 분석" />
            <Card.Content>
              <List.Item
                title="이상치 감지"
                description={analysis.outliers.hasOutliers ? '예' : '아니오'}
                left={props => <List.Icon {...props} icon="alert-circle" />}
              />
              <List.Item
                title="이상치 개수"
                description={`${analysis.outliers.outlierCount}개`}
                left={props => <List.Icon {...props} icon="counter" />}
              />
              <List.Item
                title="이상치 비율"
                description={`${analysis.outliers.outlierPercentage.toFixed(2)}%`}
                left={props => <List.Icon {...props} icon="percent" />}
              />
            </Card.Content>
          </Card>

          {/* Frequency Analysis */}
          {analysis.frequency && frequencyChartData && (
            <Card style={styles.card}>
              <Card.Title title="주파수 분석" />
              <Card.Content>
                <LineChart
                  data={frequencyChartData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#f0f0f0',
                    decimalPlaces: 4,
                    color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  bezier
                  style={styles.chart}
                />

                <Divider style={styles.divider} />

                <List.Item
                  title="주요 주파수"
                  description={`${analysis.frequency.fftResult.dominantFrequency.toFixed(2)} Hz`}
                  left={props => <List.Icon {...props} icon="music-note" />}
                />
                <List.Item
                  title="스펙트럼 중심"
                  description={`${analysis.frequency.spectralCentroid.toFixed(2)} Hz`}
                  left={props => <List.Icon {...props} icon="target" />}
                />

                <Text variant="titleSmall" style={styles.sectionTitle}>
                  상위 주파수 성분
                </Text>
                {analysis.frequency.dominantFrequencies.map((comp, idx) => (
                  <List.Item
                    key={idx}
                    title={`${comp.frequency.toFixed(2)} Hz`}
                    description={`크기: ${comp.magnitude.toFixed(4)}`}
                    left={props => (
                      <List.Icon {...props} icon="checkbox-blank-circle" />
                    )}
                  />
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Export Buttons */}
          <Card style={styles.card}>
            <Card.Title title="리포트 내보내기" />
            <Card.Content>
              <Button
                mode="contained"
                onPress={handleShareReport}
                icon="share-variant"
                style={styles.exportButton}
              >
                리포트 공유
              </Button>
            </Card.Content>
          </Card>
        </>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

// Helper functions
function getActivityLabel(activity: string): string {
  const labels: Record<string, string> = {
    stationary: '정지',
    walking: '걷기',
    running: '달리기',
    vibrating: '진동',
    unknown: '알 수 없음',
  };
  return labels[activity] || activity;
}

function getTrendLabel(trend: string): string {
  const labels: Record<string, string> = {
    increasing: '📈 상승',
    decreasing: '📉 하락',
    stable: '➡️ 평탄',
  };
  return labels[trend] || trend;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  classificationContainer: {
    alignItems: 'center',
  },
  activityChip: {
    marginBottom: 12,
  },
  activityChipSuccess: {
    backgroundColor: '#d4edda',
  },
  confidenceText: {
    marginBottom: 8,
    fontWeight: '600',
  },
  reasonText: {
    color: '#666',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  exportButton: {
    marginTop: 8,
  },
  bottomSpacing: {
    height: 24,
  },
});
