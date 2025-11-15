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
  FAB,
} from 'react-native-paper';
import {SensorType} from '@app-types/sensor.types';
import {useSensorCollectionWithDB, usePermissions, useAudioRecording} from '@hooks';
import {getRecordingSessionRepository} from '@database/repositories';
import {generateSessionId} from '@utils';
import type {EventMarker} from '@database/models/RecordingSession';

export function RecordingScreen() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Event Marker state
  const [showEventMarkerDialog, setShowEventMarkerDialog] = useState(false);
  const [eventMarkerLabel, setEventMarkerLabel] = useState('');
  const [eventMarkerDescription, setEventMarkerDescription] = useState('');

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

  // Audio recording hook
  const {
    isRecording: isAudioRecording,
    recordingDuration: audioDuration,
    start: startAudio,
    stop: stopAudio,
    error: audioError,
  } = useAudioRecording({
    sessionId: sessionId || undefined,
    sampleRate: 44100,
    channels: 2,
    onError: err => {
      console.error('Audio recording error:', err);
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
      const needsGPS = enabledSensors[SensorType.GPS];
      const needsAudio = enabledSensors[SensorType.AUDIO];

      if ((needsGPS && permissions.location !== 'granted') ||
          (needsAudio && permissions.microphone !== 'granted')) {
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

      // Start sensor collection (excluding AUDIO as it's handled separately)
      const sensorsToStart = Object.entries(enabledSensors)
        .filter(([type, enabled]) => enabled && type !== SensorType.AUDIO)
        .map(([type]) => type as SensorType);

      if (sensorsToStart.length > 0) {
        await start(sensorsToStart);
      }

      // Start audio recording if enabled
      if (enabledSensors[SensorType.AUDIO]) {
        await startAudio();
      }
    } catch (err) {
      console.error('Failed to start recording:', err);
    } finally {
      setIsStarting(false);
    }
  }, [enabledSensors, sampleRate, sessionNotes, start, startAudio, sessionRepo, permissions, requestPermissions, openSettings]);

  // Stop recording
  const handleStopRecording = useCallback(async () => {
    try {
      // Stop sensor collection
      if (runningSensors.length > 0) {
        await stop();
      }

      // Stop audio recording if it's running
      if (isAudioRecording) {
        await stopAudio();
      }

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
  }, [stop, stopAudio, isAudioRecording, runningSensors, sessionId, sessionRepo]);

  // Add event marker
  const handleAddEventMarker = useCallback(async () => {
    if (!sessionId || !eventMarkerLabel.trim()) {
      return;
    }

    try {
      const session = await sessionRepo.findBySessionId(sessionId);
      if (!session) {
        console.error('Session not found');
        return;
      }

      const newMarker: EventMarker = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        label: eventMarkerLabel.trim(),
        timestamp: Date.now(),
        description: eventMarkerDescription.trim() || undefined,
      };

      const existingMarkers = session.eventMarkers || [];
      await sessionRepo.updateBySessionId(sessionId, {
        eventMarkers: [...existingMarkers, newMarker],
      });

      // Reset form and close dialog
      setEventMarkerLabel('');
      setEventMarkerDescription('');
      setShowEventMarkerDialog(false);
    } catch (err) {
      console.error('Failed to add event marker:', err);
    }
  }, [sessionId, eventMarkerLabel, eventMarkerDescription, sessionRepo]);

  // Get statistics
  const bufferStats = isRunning ? getBufferStats() : null;
  const saverStats = isRunning ? getSaverStats() : null;

  // Check if permissions are needed
  const needsLocationPermission = enabledSensors[SensorType.GPS] && permissions.location !== 'granted';
  const needsMicrophonePermission = enabledSensors[SensorType.AUDIO] && permissions.microphone !== 'granted';

  return (
    <ScrollView style={styles.container}>
      {/* Permission Banners */}
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
      {needsMicrophonePermission && !isRunning && (
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
          오디오 녹음을 사용하려면 마이크 권한이 필요합니다.
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
            <Checkbox.Item
              label="오디오 (Audio)"
              status={enabledSensors[SensorType.AUDIO] ? 'checked' : 'unchecked'}
              onPress={() => toggleSensor(SensorType.AUDIO)}
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
              센서 오류: {error.message}
            </Text>
          )}
          {audioError && (
            <Text variant="bodySmall" style={styles.error}>
              오디오 오류: {audioError.message}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Real-time Data Display */}
      {isRunning && (
        <Card style={styles.card}>
          <Card.Title title="실시간 데이터" />
          <Card.Content>
            {/* Audio Recording Status */}
            {isAudioRecording && (
              <View style={[styles.dataItem, styles.audioStatusItem]}>
                <Text variant="titleSmall">🎤 오디오 녹음 중</Text>
                <Text variant="bodySmall">
                  녹음 시간: {Math.floor(audioDuration / 1000)}초
                </Text>
              </View>
            )}

            {runningSensors.length === 0 && !isAudioRecording ? (
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

        {/* Event Marker Dialog */}
        <Dialog visible={showEventMarkerDialog} onDismiss={() => setShowEventMarkerDialog(false)}>
          <Dialog.Title>이벤트 마커 추가</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="라벨 *"
              value={eventMarkerLabel}
              onChangeText={setEventMarkerLabel}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="예: 급정거, 회전, 신호등..."
            />
            <TextInput
              label="설명 (선택)"
              value={eventMarkerDescription}
              onChangeText={setEventMarkerDescription}
              multiline
              numberOfLines={3}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="추가 설명을 입력하세요"
            />
            <Text variant="bodySmall" style={styles.timestampHint}>
              타임스탬프: {new Date().toLocaleTimeString('ko-KR')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEventMarkerDialog(false)}>취소</Button>
            <Button
              onPress={handleAddEventMarker}
              disabled={!eventMarkerLabel.trim()}
            >
              추가
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Floating Action Button - Only visible when recording */}
      {isRunning && (
        <FAB
          icon="flag-plus"
          label="이벤트 표시"
          style={styles.fab}
          onPress={() => setShowEventMarkerDialog(true)}
        />
      )}
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
  audioStatusItem: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
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
  dialogInput: {
    marginBottom: 12,
  },
  timestampHint: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
