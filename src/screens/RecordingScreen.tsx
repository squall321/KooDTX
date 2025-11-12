/**
 * RecordingScreen
 * Main screen for sensor data recording
 */

import React, {useState, useCallback} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Text,
  Button,
  Card,
  Checkbox,
  Divider,
  Portal,
  Dialog,
  TextInput,
  ActivityIndicator,
  Banner,
} from 'react-native-paper';
import {SensorType} from '@types/sensor.types';
import {useSensorCollectionWithDB, usePermissions} from '@hooks';
import {getRecordingSessionRepository} from '@database/repositories';
import {generateSessionId} from '@utils';

export function RecordingScreen() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Permissions
  const {permissions, isLoading: permissionsLoading, requestPermissions, openSettings} = usePermissions();

  // Sensor selection
  const [enabledSensors, setEnabledSensors] = useState<Record<SensorType, boolean>>({
    [SensorType.ACCELEROMETER]: true,
    [SensorType.GYROSCOPE]: true,
    [SensorType.MAGNETOMETER]: true,
    [SensorType.GPS]: false,
    [SensorType.AUDIO]: false,
  });

  // Sensor settings
  const [sampleRate] = useState(100);

  // Latest sensor data for display
  const [latestData, setLatestData] = useState<Record<SensorType, any>>({});

  const sessionRepo = getRecordingSessionRepository();

  // Sensor collection hook with DB
  const {
    isRunning,
    runningSensors,
    error,
    start,
    stop,
    getBufferStats,
    getSaverStats,
  } = useSensorCollectionWithDB(sessionId, {
    enabled: false, // Manual control
    sensors: Object.entries(enabledSensors)
      .filter(([, enabled]) => enabled)
      .reduce((acc, [type]) => {
        acc[type as SensorType] = {
          enabled: true,
          sampleRate,
        };
        return acc;
      }, {} as any),
    bufferSize: 100,
    flushInterval: 5000,
    retryAttempts: 3,
    onData: data => {
      // Update latest data for display
      setLatestData(prev => ({
        ...prev,
        [data.sensorType]: data,
      }));
    },
    onError: err => {
      console.error('Recording error:', err);
    },
  });

  // Toggle sensor
  const toggleSensor = useCallback((sensorType: SensorType) => {
    if (isRunning) {
      return; // Cannot change while recording
    }
    setEnabledSensors(prev => ({
      ...prev,
      [sensorType]: !prev[sensorType],
    }));
  }, [isRunning]);

  // Start recording
  const handleStartRecording = useCallback(async () => {
    setIsStarting(true);

    try {
      // Check permissions first
      if (permissions.location !== 'granted' && enabledSensors[SensorType.GPS]) {
        const granted = await requestPermissions();
        if (!granted) {
          openSettings();
          setIsStarting(false);
          return;
        }
      }

      const newSessionId = generateSessionId();
      setSessionId(newSessionId);

      // Create session in database
      await sessionRepo.create({
        sessionId: newSessionId,
        startTime: Date.now(),
        enabledSensors: Object.entries(enabledSensors)
          .filter(([, enabled]) => enabled)
          .map(([type]) => type as SensorType),
        sampleRate,
        notes: sessionNotes,
      });

      // Start sensor collection
      const sensorsToStart = Object.entries(enabledSensors)
        .filter(([, enabled]) => enabled)
        .map(([type]) => type as SensorType);

      await start(sensorsToStart);
    } catch (err) {
      console.error('Failed to start recording:', err);
    } finally {
      setIsStarting(false);
    }
  }, [enabledSensors, sampleRate, sessionNotes, start, sessionRepo, permissions, requestPermissions, openSettings]);

  // Stop recording
  const handleStopRecording = useCallback(async () => {
    try {
      await stop();

      // Update session in database
      if (sessionId) {
        await sessionRepo.updateBySessionId(sessionId, {
          endTime: Date.now(),
          isActive: false,
        });
      }

      setSessionId(null);
      setLatestData({});
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }, [stop, sessionId, sessionRepo]);

  // Get statistics
  const bufferStats = isRunning ? getBufferStats() : null;
  const saverStats = isRunning ? getSaverStats() : null;

  // Check if GPS is enabled but permission not granted
  const needsLocationPermission = enabledSensors[SensorType.GPS] && permissions.location !== 'granted';

  return (
    <ScrollView style={styles.container}>
      {/* Permission Banner */}
      {needsLocationPermission && !isRunning && (
        <Banner
          visible={true}
          actions={[
            {
              label: '권한 요청',
              onPress: requestPermissions,
              loading: permissionsLoading,
            },
          ]}
          icon="alert-circle"
        >
          GPS 센서를 사용하려면 위치 권한이 필요합니다.
        </Banner>
      )}

      <Card style={styles.card}>
        <Card.Title title="센서 녹음" subtitle="센서 데이터 수집 및 저장" />
        <Card.Content>
          {/* Status */}
          <View style={styles.statusContainer}>
            <Text variant="titleMedium">
              상태: {isRunning ? '🔴 녹음 중' : '⚪ 대기 중'}
            </Text>
            {isRunning && sessionId && (
              <Text variant="bodySmall" style={styles.sessionId}>
                세션: {sessionId}
              </Text>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Sensor Selection */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            센서 선택
          </Text>

          <View style={styles.sensorList}>
            <Checkbox.Item
              label="가속도계 (Accelerometer)"
              status={enabledSensors[SensorType.ACCELEROMETER] ? 'checked' : 'unchecked'}
              onPress={() => toggleSensor(SensorType.ACCELEROMETER)}
              disabled={isRunning}
            />
            <Checkbox.Item
              label="자이로스코프 (Gyroscope)"
              status={enabledSensors[SensorType.GYROSCOPE] ? 'checked' : 'unchecked'}
              onPress={() => toggleSensor(SensorType.GYROSCOPE)}
              disabled={isRunning}
            />
            <Checkbox.Item
              label="자기계 (Magnetometer)"
              status={enabledSensors[SensorType.MAGNETOMETER] ? 'checked' : 'unchecked'}
              onPress={() => toggleSensor(SensorType.MAGNETOMETER)}
              disabled={isRunning}
            />
            <Checkbox.Item
              label="GPS"
              status={enabledSensors[SensorType.GPS] ? 'checked' : 'unchecked'}
              onPress={() => toggleSensor(SensorType.GPS)}
              disabled={isRunning}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Settings */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            설정
          </Text>
          <Text variant="bodyMedium">
            샘플링 레이트: {sampleRate} Hz
          </Text>

          {/* Notes Button */}
          <Button
            mode="outlined"
            onPress={() => setShowNotesDialog(true)}
            style={styles.notesButton}
            disabled={isRunning}
          >
            메모 {sessionNotes ? '✓' : ''}
          </Button>

          <Divider style={styles.divider} />

          {/* Control Buttons */}
          <View style={styles.buttonContainer}>
            {!isRunning ? (
              <Button
                mode="contained"
                onPress={handleStartRecording}
                icon="record"
                style={styles.button}
                loading={isStarting}
                disabled={Object.values(enabledSensors).every(v => !v) || isStarting}
              >
                {isStarting ? '시작 중...' : '녹음 시작'}
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleStopRecording}
                icon="stop"
                style={styles.button}
                buttonColor="#f44336"
              >
                녹음 중지
              </Button>
            )}
          </View>

          {/* Error Display */}
          {error && (
            <Text variant="bodySmall" style={styles.error}>
              오류: {error.message}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Real-time Data Display */}
      {isRunning && (
        <Card style={styles.card}>
          <Card.Title title="실시간 데이터" />
          <Card.Content>
            {runningSensors.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  센서 초기화 중...
                </Text>
              </View>
            ) : (
              runningSensors.map(sensorType => {
                const data = latestData[sensorType];
                return (
                  <View key={sensorType} style={styles.dataItem}>
                    <Text variant="titleSmall">{sensorType}</Text>
                    {data && 'x' in data && (
                      <Text variant="bodySmall">
                        X: {data.x?.toFixed(3)}, Y: {data.y?.toFixed(3)}, Z: {data.z?.toFixed(3)}
                      </Text>
                    )}
                    {data && 'latitude' in data && (
                      <Text variant="bodySmall">
                        Lat: {data.latitude?.toFixed(6)}, Lng: {data.longitude?.toFixed(6)}
                      </Text>
                    )}
                    {!data && (
                      <Text variant="bodySmall" style={styles.waitingText}>
                        데이터 대기 중...
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </Card.Content>
        </Card>
      )}

      {/* Statistics */}
      {isRunning && bufferStats && saverStats && (
        <Card style={styles.card}>
          <Card.Title title="통계" />
          <Card.Content>
            <Text variant="bodyMedium">
              버퍼: {bufferStats.currentSize} / {bufferStats.totalReceived}
            </Text>
            <Text variant="bodyMedium">
              저장: {saverStats.totalSaved} (실패: {saverStats.totalFailed})
            </Text>
            <Text variant="bodyMedium">
              배치: {saverStats.totalBatches}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Notes Dialog */}
      <Portal>
        <Dialog visible={showNotesDialog} onDismiss={() => setShowNotesDialog(false)}>
          <Dialog.Title>메모</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="세션 메모"
              value={sessionNotes}
              onChangeText={setSessionNotes}
              multiline
              numberOfLines={4}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowNotesDialog(false)}>확인</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  sessionId: {
    marginTop: 4,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sensorList: {
    marginLeft: -8,
  },
  notesButton: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    paddingVertical: 8,
  },
  error: {
    color: '#f44336',
    marginTop: 8,
  },
  dataItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  waitingText: {
    color: '#999',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
});
