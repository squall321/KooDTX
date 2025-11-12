/**
 * ChartScreen
 *
 * 센서 데이터를 Line Chart로 시각화하는 화면
 * - 시간에 따른 센서 데이터 변화 표시
 * - 센서별 토글 기능
 * - X/Y/Z 축별 차트
 */

import React, {useCallback, useEffect, useState} from 'react';
import {View, ScrollView, StyleSheet, Dimensions, Alert} from 'react-native';
import {
  Text,
  Card,
  Chip,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import {LineChart} from 'react-native-chart-kit';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {SensorDataRecord} from '@database/models';
import {getSensorDataRepository} from '@database/repositories';
import {SensorType} from '@types/sensor.types';

type HistoryStackParamList = {
  HistoryList: undefined;
  SessionDetail: {sessionId: string};
  Chart: {sessionId: string};
};

type Props = NativeStackScreenProps<HistoryStackParamList, 'Chart'>;

const screenWidth = Dimensions.get('window').width;
const MAX_DATA_POINTS = 100; // Maximum data points to display

interface ChartDataset {
  data: number[];
  color?: (opacity: number) => string;
  strokeWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  legend?: string[];
}

export function ChartScreen({route}: Props) {
  const {sessionId} = route.params;
  const [sensorData, setSensorData] = useState<SensorDataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<SensorType>(
    SensorType.ACCELEROMETER,
  );
  const [availableSensors, setAvailableSensors] = useState<SensorType[]>([]);

  const dataRepo = getSensorDataRepository();

  // Load sensor data
  const loadSensorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dataRepo.findBySession(sessionId);
      setSensorData(data);

      // Get unique sensor types
      const sensors = Array.from(
        new Set(data.map(d => d.sensorType as SensorType)),
      );
      setAvailableSensors(sensors);

      // Set first sensor as default
      if (sensors.length > 0 && !sensors.includes(selectedSensor)) {
        const firstSensor = sensors[0];
        if (firstSensor) {
          setSelectedSensor(firstSensor);
        }
      }
    } catch (error) {
      console.error('Failed to load sensor data:', error);
      Alert.alert('오류', '센서 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, dataRepo, selectedSensor]);

  useEffect(() => {
    loadSensorData();
  }, [loadSensorData]);

  // Sample data to reduce number of points
  const sampleData = useCallback(
    (data: SensorDataRecord[]): SensorDataRecord[] => {
      if (data.length <= MAX_DATA_POINTS) {
        return data;
      }

      const step = Math.ceil(data.length / MAX_DATA_POINTS);
      return data.filter((_, index) => index % step === 0);
    },
    [],
  );

  // Prepare chart data for 3-axis sensors
  const prepare3AxisChartData = useCallback(
    (data: SensorDataRecord[]): ChartData => {
      const sampledData = sampleData(data);

      const xData = sampledData.map(d => d.x || 0);
      const yData = sampledData.map(d => d.y || 0);
      const zData = sampledData.map(d => d.z || 0);

      // Create labels (show every 10th timestamp)
      const labels = sampledData.map((d, i) => {
        if (i % 10 === 0) {
          const date = new Date(d.timestamp);
          return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        }
        return '';
      });

      return {
        labels,
        datasets: [
          {
            data: xData,
            color: () => 'rgba(255, 0, 0, 1)', // Red for X
            strokeWidth: 2,
          },
          {
            data: yData,
            color: () => 'rgba(0, 255, 0, 1)', // Green for Y
            strokeWidth: 2,
          },
          {
            data: zData,
            color: () => 'rgba(0, 0, 255, 1)', // Blue for Z
            strokeWidth: 2,
          },
        ],
        legend: ['X축', 'Y축', 'Z축'],
      };
    },
    [sampleData],
  );

  // Prepare chart data for GPS
  const prepareGPSChartData = useCallback(
    (data: SensorDataRecord[], field: 'latitude' | 'longitude' | 'altitude') => {
      const sampledData = sampleData(data);

      const values = sampledData.map(d => {
        if (field === 'latitude') return d.latitude || 0;
        if (field === 'longitude') return d.longitude || 0;
        return d.altitude || 0;
      });

      const labels = sampledData.map((d, i) => {
        if (i % 10 === 0) {
          const date = new Date(d.timestamp);
          return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        }
        return '';
      });

      const fieldNames = {
        latitude: '위도',
        longitude: '경도',
        altitude: '고도',
      };

      return {
        labels,
        datasets: [
          {
            data: values,
            color: () => 'rgba(75, 192, 192, 1)',
            strokeWidth: 2,
          },
        ],
        legend: [fieldNames[field]],
      };
    },
    [sampleData],
  );

  // Render chart
  const renderChart = useCallback(
    (chartData: ChartData, title: string) => {
      if (!chartData.datasets[0] || chartData.datasets[0].data.length === 0) {
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{title}</Text>
              <Text variant="bodyMedium" style={styles.noDataText}>
                데이터가 없습니다
              </Text>
            </Card.Content>
          </Card>
        );
      }

      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              {title}
            </Text>

            {/* Legend */}
            {chartData.legend && (
              <View style={styles.legendContainer}>
                {chartData.legend.map((label, index) => (
                  <Chip
                    key={label}
                    mode="outlined"
                    compact
                    style={[
                      styles.legendChip,
                      {
                        borderColor:
                          index === 0
                            ? 'rgba(255, 0, 0, 1)'
                            : index === 1
                              ? 'rgba(0, 255, 0, 1)'
                              : 'rgba(0, 0, 255, 1)',
                      },
                    ]}>
                    {label}
                  </Chip>
                ))}
              </View>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator>
              <LineChart
                data={chartData}
                width={Math.max(screenWidth - 60, chartData.labels.length * 20)}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '2',
                    strokeWidth: '1',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '', // solid lines
                  },
                }}
                bezier
                style={styles.chart}
                withInnerLines
                withOuterLines
                withVerticalLines
                withHorizontalLines
              />
            </ScrollView>

            <Text variant="bodySmall" style={styles.chartNote}>
              {chartData.datasets[0]?.data.length || 0}개 데이터 포인트 표시
            </Text>
          </Card.Content>
        </Card>
      );
    },
    [],
  );

  // Get sensor name
  const getSensorName = useCallback((sensor: SensorType): string => {
    const names: Record<SensorType, string> = {
      [SensorType.ACCELEROMETER]: '가속도계',
      [SensorType.GYROSCOPE]: '자이로스코프',
      [SensorType.MAGNETOMETER]: '자기계',
      [SensorType.GPS]: 'GPS',
      [SensorType.AUDIO]: '오디오',
    };
    return names[sensor] || sensor;
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          차트 데이터 로딩 중...
        </Text>
      </View>
    );
  }

  // Filter data by selected sensor
  const filteredData = sensorData.filter(
    d => d.sensorType === selectedSensor,
  );

  // Prepare segmented buttons for sensor selection
  const sensorButtons = availableSensors.map(sensor => ({
    value: sensor,
    label: getSensorName(sensor),
  }));

  return (
    <ScrollView style={styles.container}>
      {/* Sensor Selection */}
      {availableSensors.length > 1 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              센서 선택
            </Text>
            <SegmentedButtons
              value={selectedSensor}
              onValueChange={value => setSelectedSensor(value as SensorType)}
              buttons={sensorButtons}
            />
          </Card.Content>
        </Card>
      )}

      {/* Empty state */}
      {filteredData.length === 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.noDataText}>
              선택한 센서의 데이터가 없습니다
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* 3-Axis Sensors Charts */}
      {(selectedSensor === SensorType.ACCELEROMETER ||
        selectedSensor === SensorType.GYROSCOPE ||
        selectedSensor === SensorType.MAGNETOMETER) &&
        filteredData.length > 0 && (
          <>
            {renderChart(
              prepare3AxisChartData(filteredData),
              `${getSensorName(selectedSensor)} - 3축 데이터`,
            )}
          </>
        )}

      {/* GPS Charts */}
      {selectedSensor === SensorType.GPS && filteredData.length > 0 && (
        <>
          {renderChart(
            prepareGPSChartData(filteredData, 'latitude'),
            'GPS - 위도',
          )}
          {renderChart(
            prepareGPSChartData(filteredData, 'longitude'),
            'GPS - 경도',
          )}
          {renderChart(
            prepareGPSChartData(filteredData, 'altitude'),
            'GPS - 고도',
          )}
        </>
      )}
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
  card: {
    margin: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  chartTitle: {
    marginBottom: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  legendChip: {
    borderWidth: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartNote: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
});
