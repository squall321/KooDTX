/**
 * DiagnosticsScreen
 * Phase 193-196: 시스템 진단 및 모니터링 화면
 */

import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, ScrollView, Platform} from 'react-native';
import {
  Card,
  Text,
  Divider,
  ProgressBar,
  List,
  Chip,
  Button,
} from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import {logger} from '../utils/logger';

interface SystemInfo {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  batteryLevel: number;
  batteryCharging: boolean;
  temperature: number;
  diskFree: number;
  diskTotal: number;
}

interface SensorQuality {
  sensorType: string;
  dropRate: number; // percentage
  latency: number; // ms
  jitter: number; // ms
}

export function DiagnosticsScreen() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    cpuUsage: 0,
    memoryUsage: 0,
    memoryTotal: 0,
    batteryLevel: 0,
    batteryCharging: false,
    temperature: 0,
    diskFree: 0,
    diskTotal: 0,
  });

  const [sensorQuality] = useState<SensorQuality[]>([
    {sensorType: 'Accelerometer', dropRate: 0.05, latency: 2.3, jitter: 0.8},
    {sensorType: 'Gyroscope', dropRate: 0.12, latency: 2.1, jitter: 1.2},
    {sensorType: 'Magnetometer', dropRate: 0.08, latency: 3.5, jitter: 1.5},
    {sensorType: 'GPS', dropRate: 2.5, latency: 50.2, jitter: 12.3},
  ]);

  useEffect(() => {
    loadSystemInfo();
    const interval = setInterval(loadSystemInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemInfo = async () => {
    try {
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      const isCharging = await DeviceInfo.isBatteryCharging();
      const freeDisk = await DeviceInfo.getFreeDiskStorage();
      const totalDisk = await DeviceInfo.getTotalDiskCapacity();

      // Simulated values (replace with actual metrics in production)
      setSystemInfo({
        cpuUsage: Math.random() * 30 + 10, // 10-40%
        memoryUsage: Math.random() * 100 + 50, // 50-150 MB
        memoryTotal: 256,
        batteryLevel: batteryLevel * 100,
        batteryCharging: isCharging,
        temperature: Math.random() * 10 + 30, // 30-40°C
        diskFree: freeDisk / (1024 * 1024 * 1024), // Convert to GB
        diskTotal: totalDisk / (1024 * 1024 * 1024),
      });
    } catch (error) {
      logger.error('Failed to load system info:', error);
    }
  };

  const formatSize = (gb: number): string => {
    return `${gb.toFixed(2)} GB`;
  };

  const getQualityStatus = (dropRate: number): {label: string; color: string} => {
    if (dropRate < 1) return {label: '우수', color: '#4CAF50'};
    if (dropRate < 5) return {label: '양호', color: '#FFC107'};
    return {label: '불량', color: '#F44336'};
  };

  return (
    <ScrollView style={styles.container}>
      {/* System Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">시스템 상태</Text>
          <Divider style={styles.divider} />

          {/* CPU */}
          <View style={styles.metricContainer}>
            <View style={styles.metricHeader}>
              <Text variant="titleSmall">CPU 사용률</Text>
              <Text variant="titleSmall" style={styles.metricValue}>
                {systemInfo.cpuUsage.toFixed(1)}%
              </Text>
            </View>
            <ProgressBar
              progress={systemInfo.cpuUsage / 100}
              color={systemInfo.cpuUsage > 80 ? '#F44336' : '#2196F3'}
              style={styles.progressBar}
            />
          </View>

          {/* Memory */}
          <View style={styles.metricContainer}>
            <View style={styles.metricHeader}>
              <Text variant="titleSmall">메모리 사용</Text>
              <Text variant="titleSmall" style={styles.metricValue}>
                {systemInfo.memoryUsage.toFixed(0)} / {systemInfo.memoryTotal} MB
              </Text>
            </View>
            <ProgressBar
              progress={systemInfo.memoryUsage / systemInfo.memoryTotal}
              color={
                systemInfo.memoryUsage / systemInfo.memoryTotal > 0.8
                  ? '#F44336'
                  : '#4CAF50'
              }
              style={styles.progressBar}
            />
          </View>

          {/* Battery */}
          <View style={styles.metricContainer}>
            <View style={styles.metricHeader}>
              <Text variant="titleSmall">배터리</Text>
              <View style={styles.batteryInfo}>
                <Text variant="titleSmall" style={styles.metricValue}>
                  {systemInfo.batteryLevel.toFixed(0)}%
                </Text>
                {systemInfo.batteryCharging && (
                  <Chip mode="flat" compact style={styles.chargingChip}>
                    ⚡ 충전 중
                  </Chip>
                )}
              </View>
            </View>
            <ProgressBar
              progress={systemInfo.batteryLevel / 100}
              color={
                systemInfo.batteryLevel < 20
                  ? '#F44336'
                  : systemInfo.batteryLevel < 50
                  ? '#FFC107'
                  : '#4CAF50'
              }
              style={styles.progressBar}
            />
          </View>

          {/* Disk */}
          <View style={styles.metricContainer}>
            <View style={styles.metricHeader}>
              <Text variant="titleSmall">디스크 공간</Text>
              <Text variant="titleSmall" style={styles.metricValue}>
                {formatSize(systemInfo.diskFree)} / {formatSize(systemInfo.diskTotal)}
              </Text>
            </View>
            <ProgressBar
              progress={1 - systemInfo.diskFree / systemInfo.diskTotal}
              color={
                systemInfo.diskFree / systemInfo.diskTotal < 0.1
                  ? '#F44336'
                  : '#4CAF50'
              }
              style={styles.progressBar}
            />
          </View>

          {/* Temperature */}
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              CPU 온도
            </Text>
            <Text variant="bodyMedium" style={systemInfo.temperature > 40 ? styles.warningText : undefined}>
              {systemInfo.temperature.toFixed(1)}°C
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Sensor Quality */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">센서 품질</Text>
          <Divider style={styles.divider} />

          {sensorQuality.map(sensor => {
            const status = getQualityStatus(sensor.dropRate);
            return (
              <Card key={sensor.sensorType} style={styles.sensorCard}>
                <List.Item
                  title={sensor.sensorType}
                  description={`레이턴시: ${sensor.latency.toFixed(1)}ms · 지터: ${sensor.jitter.toFixed(1)}ms`}
                  right={() => (
                    <View style={styles.sensorQualityInfo}>
                      <Chip
                        mode="flat"
                        style={[styles.qualityChip, {backgroundColor: status.color + '20'}]}
                        textStyle={{color: status.color}}
                      >
                        {status.label}
                      </Chip>
                      <Text variant="bodySmall" style={styles.dropRateText}>
                        드롭률: {sensor.dropRate.toFixed(2)}%
                      </Text>
                    </View>
                  )}
                />
                {sensor.dropRate > 1 && (
                  <View style={styles.warningContainer}>
                    <Text variant="bodySmall" style={styles.warningText}>
                      ⚠️ 드롭률이 높습니다. 샘플링 레이트를 낮추는 것을 권장합니다.
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}
        </Card.Content>
      </Card>

      {/* Device Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">기기 정보</Text>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              제조사
            </Text>
            <Text variant="bodyMedium">{DeviceInfo.getBrand()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              모델
            </Text>
            <Text variant="bodyMedium">{DeviceInfo.getModel()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              OS
            </Text>
            <Text variant="bodyMedium">
              {Platform.OS} {DeviceInfo.getSystemVersion()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              앱 버전
            </Text>
            <Text variant="bodyMedium">
              {DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">진단 작업</Text>
          <Divider style={styles.divider} />

          <Button
            mode="contained"
            icon="refresh"
            onPress={loadSystemInfo}
            style={styles.button}
          >
            시스템 정보 새로고침
          </Button>

          <Button
            mode="outlined"
            icon="bug"
            onPress={() => {
              // TODO: Export diagnostics data
            }}
            style={styles.button}
          >
            진단 데이터 내보내기
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 12,
  },
  divider: {
    marginVertical: 12,
  },
  metricContainer: {
    marginBottom: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chargingChip: {
    backgroundColor: '#4CAF50',
    height: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  label: {
    color: '#666',
  },
  warningText: {
    color: '#F44336',
  },
  sensorCard: {
    marginTop: 8,
    backgroundColor: '#fafafa',
    elevation: 0,
  },
  sensorQualityInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  qualityChip: {
    height: 24,
  },
  dropRateText: {
    fontSize: 11,
    color: '#666',
  },
  warningContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  button: {
    marginTop: 12,
  },
});

export default DiagnosticsScreen;
