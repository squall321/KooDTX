/**
 * DataVisualizationScreen
 * Phase 251: Advanced data visualization and analysis
 *
 * Features:
 * - Statistical analysis
 * - Multiple chart types
 * - Data filtering
 * - Export functionality
 */

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import {
  Text,
  Card,
  SegmentedButtons,
  ActivityIndicator,
  Button,
  Chip,
} from 'react-native-paper';
import {LineChart, BarChart} from 'react-native-chart-kit';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getSensorDataRepository} from '@database/repositories';
import {SensorType} from '@app-types/sensor.types';
import {
  calculateStatistics,
  calculateHistogram,
  detectOutliers,
  calculateMovingAverage,
  calculateTrend,
  type Statistics,
  type HistogramBin,
} from '@utils/statistics';
import {StatisticsCard} from '@components/charts/StatisticsCard';
import {logger} from '@utils/logger';

type HistoryStackParamList = {
  HistoryList: undefined;
  SessionDetail: {sessionId: string};
  DataVisualization: {sessionId: string; sensorType?: SensorType};
};

type Props = NativeStackScreenProps<
  HistoryStackParamList,
  'DataVisualization'
>;

const screenWidth = Dimensions.get('window').width;

type ChartType = 'line' | 'histogram' | 'moving_avg';
type AxisType = 'x' | 'y' | 'z' | 'magnitude';

interface SensorDataPoint {
  timestamp: number;
  x?: number;
  y?: number;
  z?: number;
}

export function DataVisualizationScreen({route}: Props) {
  const {sessionId, sensorType: initialSensorType} = route.params;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [sensorData, setSensorData] = useState<SensorDataPoint[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorType>(
    initialSensorType || SensorType.ACCELEROMETER
  );
  const [selectedAxis, setSelectedAxis] = useState<AxisType>('magnitude');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [availableSensors, setAvailableSensors] = useState<SensorType[]>([]);
  const [showOutliers, setShowOutliers] = useState(false);

  const dataRepo = getSensorDataRepository();

  // Load sensor data
  const loadSensorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dataRepo.findBySession(sessionId);

      // Get unique sensor types
      const sensors = Array.from(new Set(data.map(d => d.sensorType as SensorType)));
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

  // Calculate statistics
  const statistics = useMemo<Statistics | null>(() => {
    if (axisData.length === 0) return null;
    try {
      return calculateStatistics(axisData);
    } catch (error) {
      logger.error('Failed to calculate statistics:', error);
      return null;
    }
  }, [axisData]);

  // Calculate histogram
  const histogram = useMemo<HistogramBin[]>(() => {
    if (axisData.length === 0) return [];
    try {
      return calculateHistogram(axisData, 10);
    } catch (error) {
      logger.error('Failed to calculate histogram:', error);
      return [];
    }
  }, [axisData]);

  // Detect outliers
  const outlierIndices = useMemo(() => {
    if (!showOutliers || axisData.length === 0) return [];
    try {
      return detectOutliers(axisData);
    } catch (error) {
      logger.error('Failed to detect outliers:', error);
      return [];
    }
  }, [axisData, showOutliers]);

  // Calculate moving average
  const movingAvgData = useMemo(() => {
    if (axisData.length < 5) return [];
    try {
      return calculateMovingAverage(axisData, 5);
    } catch (error) {
      logger.error('Failed to calculate moving average:', error);
      return [];
    }
  }, [axisData]);

  // Calculate trend
  const trend = useMemo(() => {
    if (axisData.length < 2) return 0;
    try {
      return calculateTrend(axisData);
    } catch (error) {
      logger.error('Failed to calculate trend:', error);
      return 0;
    }
  }, [axisData]);

  // Prepare chart data
  const lineChartData = useMemo(() => {
    const displayData =
      chartType === 'moving_avg' ? movingAvgData : axisData;

    // Sample data for display (max 50 points)
    const maxPoints = 50;
    const step = Math.ceil(displayData.length / maxPoints);
    const sampledData = displayData.filter((_, index) => index % step === 0);

    return {
      labels: sampledData.map((_, index) => (index % 5 === 0 ? `${index}` : '')),
      datasets: [
        {
          data: sampledData.length > 0 ? sampledData : [0],
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [axisData, movingAvgData, chartType]);

  // Prepare histogram data
  const histogramData = useMemo(() => {
    return {
      labels: histogram.map(
        bin => `${bin.min.toFixed(1)}-${bin.max.toFixed(1)}`
      ),
      datasets: [
        {
          data: histogram.length > 0 ? histogram.map(bin => bin.count) : [0],
        },
      ],
    };
  }, [histogram]);

  // Export statistics as text
  const exportStatistics = useCallback(async () => {
    if (!statistics) {
      Alert.alert('알림', '통계 데이터가 없습니다.');
      return;
    }

    const text = `
# 센서 데이터 통계

센서: ${selectedSensor}
축: ${selectedAxis === 'magnitude' ? '크기' : selectedAxis.toUpperCase()}
데이터 개수: ${statistics.count}

## 기본 통계
평균: ${statistics.mean.toFixed(4)}
중앙값: ${statistics.median.toFixed(4)}
표준편차: ${statistics.stdDev.toFixed(4)}
최소값: ${statistics.min.toFixed(4)}
최대값: ${statistics.max.toFixed(4)}
범위: ${statistics.range.toFixed(4)}

## 사분위수
Q1 (25%): ${statistics.quartiles.q1.toFixed(4)}
Q2 (50%): ${statistics.quartiles.q2.toFixed(4)}
Q3 (75%): ${statistics.quartiles.q3.toFixed(4)}
IQR: ${statistics.iqr.toFixed(4)}

## 추가 정보
추세: ${trend > 0 ? '상승' : trend < 0 ? '하락' : '평탄'} (${trend.toFixed(6)})
이상치 개수: ${outlierIndices.length}
    `.trim();

    try {
      await Share.share({
        message: text,
        title: '센서 데이터 통계',
      });
    } catch (error) {
      logger.error('Failed to share statistics:', error);
      Alert.alert('오류', '공유에 실패했습니다.');
    }
  }, [statistics, selectedSensor, selectedAxis, trend, outlierIndices]);

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

      {/* Chart Type Selection */}
      <Card style={styles.card}>
        <Card.Title title="차트 타입" />
        <Card.Content>
          <SegmentedButtons
            value={chartType}
            onValueChange={value => setChartType(value as ChartType)}
            buttons={[
              {value: 'line', label: '선형'},
              {value: 'histogram', label: '히스토그램'},
              {value: 'moving_avg', label: '이동평균'},
            ]}
          />
        </Card.Content>
      </Card>

      {/* Chart Display */}
      <Card style={styles.card}>
        <Card.Title title="데이터 시각화" />
        <Card.Content>
          {chartType === 'histogram' ? (
            <BarChart
              data={histogramData}
              width={screenWidth - 64}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#f0f0f0',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
            />
          ) : (
            <LineChart
              data={lineChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#f0f0f0',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '3',
                  strokeWidth: '2',
                  stroke: '#007AFF',
                },
              }}
              bezier
              style={styles.chart}
            />
          )}

          {/* Trend indicator */}
          {chartType !== 'histogram' && (
            <View style={styles.trendContainer}>
              <Text variant="labelLarge">
                추세:{' '}
                {trend > 0.001
                  ? '📈 상승'
                  : trend < -0.001
                  ? '📉 하락'
                  : '➡️ 평탄'}
              </Text>
            </View>
          )}

          {/* Outlier toggle */}
          <View style={styles.outlierContainer}>
            <Chip
              selected={showOutliers}
              onPress={() => setShowOutliers(!showOutliers)}
              icon={showOutliers ? 'check' : 'alert-circle-outline'}
            >
              이상치 표시 ({outlierIndices.length}개)
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Statistics Card */}
      {statistics && (
        <StatisticsCard
          statistics={statistics}
          title={`통계 정보 (${selectedSensor} - ${selectedAxis === 'magnitude' ? '크기' : selectedAxis.toUpperCase()})`}
        />
      )}

      {/* Export Button */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={exportStatistics}
            icon="share-variant"
          >
            통계 내보내기
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
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
  trendContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  outlierContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 24,
  },
});
