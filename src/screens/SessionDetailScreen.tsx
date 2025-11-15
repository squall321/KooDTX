/**
 * SessionDetailScreen
 *
 * 녹음 세션의 상세 정보를 표시하는 화면
 * - 세션 정보 (ID, 시작/종료 시간, 센서 목록)
 * - 센서 데이터 통계 (각 센서별 데이터 수, 평균값)
 * - 내보내기 기능 (CSV, JSON)
 * - 세션 삭제 기능
 */

import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {View, ScrollView, StyleSheet, Alert} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  Portal,
  Dialog,
  IconButton,
  List,
} from 'react-native-paper';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RecordingSession, SensorDataRecord, AudioRecording, EventMarker} from '@database/models';
import {
  getRecordingSessionRepository,
  getSensorDataRepository,
  getAudioRecordingRepository,
} from '@database/repositories';
import {formatTimestamp, calculateDuration, formatDuration} from '@utils/date';
import {SensorType} from '@app-types/sensor.types';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import {getAudioRecorderService} from '@services/audio/AudioRecorderService';
import {DataPreview, AudioWaveform} from '@components';

type HistoryStackParamList = {
  HistoryList: undefined;
  SessionDetail: {sessionId: string};
  Chart: {sessionId: string};
};

type Props = NativeStackScreenProps<HistoryStackParamList, 'SessionDetail'>;

interface SensorStats {
  count: number;
  avgX?: number;
  avgY?: number;
  avgZ?: number;
  avgLatitude?: number;
  avgLongitude?: number;
  avgAltitude?: number;
}

interface DataChunk {
  sensorType: SensorType;
  startTime: number;
  endTime: number;
  count: number;
  size: number; // estimated size in bytes
  uploaded: boolean;
}

export function SessionDetailScreen({route, navigation}: Props) {
  const {sessionId} = route.params;
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [sensorData, setSensorData] = useState<SensorDataRecord[]>([]);
  const [sensorStats, setSensorStats] = useState<
    Record<SensorType, SensorStats>
  >({} as Record<SensorType, SensorStats>);
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [expandedChunks, setExpandedChunks] = useState<Record<SensorType, boolean>>({} as Record<SensorType, boolean>);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [previewSensorType, setPreviewSensorType] = useState<SensorType | null>(null);

  const sessionRepo = getRecordingSessionRepository();
  const dataRepo = getSensorDataRepository();
  const audioRepo = getAudioRecordingRepository();
  const audioService = getAudioRecorderService();

  // Calculate data chunks (10-second intervals)
  const dataChunks = useMemo(() => {
    const chunks: Record<SensorType, DataChunk[]> = {} as Record<SensorType, DataChunk[]>;
    const CHUNK_DURATION = 10000; // 10 seconds

    // Group data by sensor type
    const groupedData = sensorData.reduce((acc, record) => {
      const type = record.sensorType as SensorType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(record);
      return acc;
    }, {} as Record<SensorType, SensorDataRecord[]>);

    // Create chunks for each sensor type
    Object.entries(groupedData).forEach(([type, records]) => {
      const sensorType = type as SensorType;
      chunks[sensorType] = [];

      if (records.length === 0) return;

      // Sort by timestamp
      const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
      const startTime = sortedRecords[0].timestamp;
      const endTime = sortedRecords[sortedRecords.length - 1].timestamp;

      // Create chunks
      let currentChunkStart = startTime;
      while (currentChunkStart < endTime) {
        const currentChunkEnd = currentChunkStart + CHUNK_DURATION;
        const chunkRecords = sortedRecords.filter(
          r => r.timestamp >= currentChunkStart && r.timestamp < currentChunkEnd
        );

        if (chunkRecords.length > 0) {
          chunks[sensorType].push({
            sensorType,
            startTime: currentChunkStart,
            endTime: currentChunkEnd,
            count: chunkRecords.length,
            size: chunkRecords.length * 50, // Estimated 50 bytes per record
            uploaded: session?.isUploaded || false,
          });
        }

        currentChunkStart = currentChunkEnd;
      }
    });

    return chunks;
  }, [sensorData, session]);

  // Load session and sensor data
  const loadSessionData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load session
      const sessionData = await sessionRepo.findById(sessionId);
      if (!sessionData) {
        Alert.alert('오류', '세션을 찾을 수 없습니다.');
        navigation.goBack();
        return;
      }
      setSession(sessionData);

      // Load sensor data
      const data = await dataRepo.findBySession(sessionId);
      setSensorData(data);

      // Load audio recordings
      const audioData = await audioRepo.findBySession(sessionId);
      setAudioRecordings(audioData);

      // Calculate statistics
      const stats: Record<SensorType, SensorStats> = {} as Record<
        SensorType,
        SensorStats
      >;

      // Group data by sensor type
      const groupedData = data.reduce(
        (acc, record) => {
          const type = record.sensorType as SensorType;
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(record);
          return acc;
        },
        {} as Record<SensorType, SensorDataRecord[]>,
      );

      // Calculate stats for each sensor type
      Object.entries(groupedData).forEach(([type, records]) => {
        const sensorType = type as SensorType;
        const count = records.length;

        if (
          sensorType === SensorType.ACCELEROMETER ||
          sensorType === SensorType.GYROSCOPE ||
          sensorType === SensorType.MAGNETOMETER
        ) {
          // For 3-axis sensors
          const sumX = records.reduce((sum, r) => sum + (r.x || 0), 0);
          const sumY = records.reduce((sum, r) => sum + (r.y || 0), 0);
          const sumZ = records.reduce((sum, r) => sum + (r.z || 0), 0);

          stats[sensorType] = {
            count,
            avgX: sumX / count,
            avgY: sumY / count,
            avgZ: sumZ / count,
          };
        } else if (sensorType === SensorType.GPS) {
          // For GPS
          const sumLat = records.reduce(
            (sum, r) => sum + (r.latitude || 0),
            0,
          );
          const sumLon = records.reduce(
            (sum, r) => sum + (r.longitude || 0),
            0,
          );
          const sumAlt = records.reduce(
            (sum, r) => sum + (r.altitude || 0),
            0,
          );

          stats[sensorType] = {
            count,
            avgLatitude: sumLat / count,
            avgLongitude: sumLon / count,
            avgAltitude: sumAlt / count,
          };
        }
      });

      setSensorStats(stats);
    } catch (error) {
      console.error('Failed to load session data:', error);
      Alert.alert('오류', '세션 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, sessionRepo, dataRepo, navigation]);

  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  // Cleanup: stop audio on unmount
  useEffect(() => {
    return () => {
      if (playingAudioId) {
        audioService.stopPlayer().catch(console.error);
      }
    };
  }, [playingAudioId, audioService]);

  // Export to CSV
  const exportToCSV = useCallback(async () => {
    if (!session || sensorData.length === 0) {
      Alert.alert('알림', '내보낼 데이터가 없습니다.');
      return;
    }

    setIsExporting(true);
    try {
      // Create CSV content
      const headers = [
        'timestamp',
        'sensorType',
        'x',
        'y',
        'z',
        'latitude',
        'longitude',
        'altitude',
        'accuracy',
      ];
      const csvContent =
        headers.join(',') +
        '\n' +
        sensorData
          .map(record => {
            return [
              record.timestamp,
              record.sensorType,
              record.x || '',
              record.y || '',
              record.z || '',
              record.latitude || '',
              record.longitude || '',
              record.altitude || '',
              record.accuracy || '',
            ].join(',');
          })
          .join('\n');

      // Write to file
      const fileName = `session_${sessionId}_${Date.now()}.csv`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, csvContent, 'utf8');

      // Share file
      await Share.open({
        title: '세션 데이터 내보내기',
        url: `file://${filePath}`,
        type: 'text/csv',
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Failed to export CSV:', error);
        Alert.alert('오류', 'CSV 내보내기에 실패했습니다.');
      }
    } finally {
      setIsExporting(false);
    }
  }, [session, sensorData, sessionId]);

  // Export to JSON
  const exportToJSON = useCallback(async () => {
    if (!session || sensorData.length === 0) {
      Alert.alert('알림', '내보낼 데이터가 없습니다.');
      return;
    }

    setIsExporting(true);
    try {
      const exportData = {
        session: {
          sessionId: session.sessionId,
          startTime: session.startTime,
          endTime: session.endTime,
          isActive: session.isActive,
          enabledSensors: session.enabledSensors,
          sampleRate: session.sampleRate,
          notes: session.notes,
        },
        data: sensorData.map(record => ({
          timestamp: record.timestamp,
          sensorType: record.sensorType,
          x: record.x,
          y: record.y,
          z: record.z,
          latitude: record.latitude,
          longitude: record.longitude,
          altitude: record.altitude,
          accuracy: record.accuracy,
          speed: record.speed,
          heading: record.heading,
        })),
        statistics: sensorStats,
      };

      // Write to file
      const fileName = `session_${sessionId}_${Date.now()}.json`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');

      // Share file
      await Share.open({
        title: '세션 데이터 내보내기',
        url: `file://${filePath}`,
        type: 'application/json',
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Failed to export JSON:', error);
        Alert.alert('오류', 'JSON 내보내기에 실패했습니다.');
      }
    } finally {
      setIsExporting(false);
    }
  }, [session, sensorData, sensorStats, sessionId]);

  // Play/Stop audio recording
  const toggleAudioPlayback = useCallback(async (recording: AudioRecording) => {
    try {
      if (playingAudioId === recording.id) {
        // Stop current playback
        await audioService.stopPlayer();
        setPlayingAudioId(null);
      } else {
        // Stop any current playback first
        if (playingAudioId) {
          await audioService.stopPlayer();
        }

        // Start new playback
        await audioService.startPlayer(recording.filePath);
        setPlayingAudioId(recording.id);
      }
    } catch (error) {
      console.error('Failed to toggle audio playback:', error);
      Alert.alert('오류', '오디오 재생에 실패했습니다.');
      setPlayingAudioId(null);
    }
  }, [playingAudioId, audioService]);

  // Share audio file
  const shareAudioFile = useCallback(async (recording: AudioRecording) => {
    try {
      // Check if file exists
      const fileExists = await RNFS.exists(recording.filePath);
      if (!fileExists) {
        Alert.alert('오류', '오디오 파일을 찾을 수 없습니다.');
        return;
      }

      await Share.open({
        title: '오디오 파일 공유',
        url: `file://${recording.filePath}`,
        type: 'audio/m4a',
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Failed to share audio:', error);
        Alert.alert('오류', '오디오 파일 공유에 실패했습니다.');
      }
    }
  }, []);

  // Delete session
  const handleDelete = useCallback(async () => {
    setDeleteDialogVisible(false);
    try {
      // Stop any playing audio
      if (playingAudioId) {
        await audioService.stopPlayer();
      }

      // Delete audio recordings and files
      for (const recording of audioRecordings) {
        try {
          const fileExists = await RNFS.exists(recording.filePath);
          if (fileExists) {
            await RNFS.unlink(recording.filePath);
          }
        } catch (fileError) {
          console.error('Failed to delete audio file:', fileError);
        }
      }
      await audioRepo.deleteBySession(sessionId);

      // Delete sensor data
      await dataRepo.deleteBySession(sessionId);

      // Delete session
      await sessionRepo.delete(sessionId);

      Alert.alert('완료', '세션이 삭제되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to delete session:', error);
      Alert.alert('오류', '세션 삭제에 실패했습니다.');
    }
  }, [sessionId, dataRepo, sessionRepo, audioRepo, audioService, audioRecordings, playingAudioId, navigation]);

  // Render sensor stats
  const renderSensorStats = useCallback(
    (type: SensorType, stats: SensorStats) => {
      const sensorNames: Partial<Record<SensorType, string>> = {
        [SensorType.ACCELEROMETER]: '가속도계',
        [SensorType.GYROSCOPE]: '자이로스코프',
        [SensorType.MAGNETOMETER]: '자기계',
        [SensorType.GPS]: 'GPS',
      };

      return (
        <Card key={type} style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium">{sensorNames[type] || type}</Text>
            <Divider style={styles.divider} />

            <View style={styles.statRow}>
              <Text variant="bodySmall" style={styles.statLabel}>
                데이터 수
              </Text>
              <Text variant="bodyMedium">{stats.count.toLocaleString()}</Text>
            </View>

            {stats.avgX !== undefined && (
              <>
                <View style={styles.statRow}>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    평균 X
                  </Text>
                  <Text variant="bodyMedium">
                    {stats.avgX.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    평균 Y
                  </Text>
                  <Text variant="bodyMedium">
                    {stats.avgY?.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    평균 Z
                  </Text>
                  <Text variant="bodyMedium">
                    {stats.avgZ?.toFixed(4)}
                  </Text>
                </View>
              </>
            )}

            {stats.avgLatitude !== undefined && (
              <>
                <View style={styles.statRow}>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    평균 위도
                  </Text>
                  <Text variant="bodyMedium">
                    {stats.avgLatitude.toFixed(6)}°
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    평균 경도
                  </Text>
                  <Text variant="bodyMedium">
                    {stats.avgLongitude?.toFixed(6)}°
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    평균 고도
                  </Text>
                  <Text variant="bodyMedium">
                    {stats.avgAltitude?.toFixed(2)}m
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      );
    },
    [],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          세션 데이터 로딩 중...
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="bodyLarge">세션을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const duration = session.endTime
    ? formatDuration(calculateDuration(session.startTime, session.endTime))
    : '진행 중';

  return (
    <ScrollView style={styles.container}>
      {/* Session Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall">세션 정보</Text>
            {session.isActive && (
              <Chip mode="flat" style={styles.activeChip}>
                🔴 녹음 중
              </Chip>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              세션 ID
            </Text>
            <Text variant="bodyMedium">{session.sessionId}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              시작 시간
            </Text>
            <Text variant="bodyMedium">
              {formatTimestamp(session.startTime)}
            </Text>
          </View>

          {session.endTime && (
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.label}>
                종료 시간
              </Text>
              <Text variant="bodyMedium">
                {formatTimestamp(session.endTime)}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              소요 시간
            </Text>
            <Text variant="bodyMedium">{duration}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              샘플 레이트
            </Text>
            <Text variant="bodyMedium">{session.sampleRate}Hz</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              활성 센서
            </Text>
            <View style={styles.chipsContainer}>
              {session.enabledSensors.map(sensor => (
                <Chip key={sensor} mode="outlined" style={styles.sensorChip}>
                  {sensor}
                </Chip>
              ))}
            </View>
          </View>

          {session.notes && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="bodySmall" style={styles.label}>
                  메모
                </Text>
                <Text variant="bodyMedium">{session.notes}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Event Markers */}
      {session.eventMarkers && session.eventMarkers.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">이벤트 마커</Text>
            <Divider style={styles.divider} />

            <View style={styles.statsOverview}>
              <Text variant="bodyMedium">
                총 {session.eventMarkers.length}개의 이벤트
              </Text>
            </View>

            {session.eventMarkers.map((marker: EventMarker, index: number) => (
              <Card key={marker.id} style={styles.eventMarkerCard}>
                <List.Item
                  title={`🚩 ${marker.label}`}
                  description={`${formatTimestamp(marker.timestamp)}${marker.description ? `\n${marker.description}` : ''}`}
                  left={() => (
                    <View style={styles.eventMarkerIndex}>
                      <Text variant="bodySmall" style={styles.eventMarkerIndexText}>
                        {index + 1}
                      </Text>
                    </View>
                  )}
                />
              </Card>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Sensor Statistics */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">센서 데이터 통계</Text>
          <Divider style={styles.divider} />

          <View style={styles.statsOverview}>
            <Text variant="bodyMedium">
              총 데이터: {sensorData.length.toLocaleString()}개
            </Text>
          </View>

          {Object.entries(sensorStats).map(([type, stats]) =>
            renderSensorStats(type as SensorType, stats),
          )}
        </Card.Content>
      </Card>

      {/* Data Chunks */}
      {Object.keys(dataChunks).length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">데이터 청크</Text>
            <Divider style={styles.divider} />

            <View style={styles.statsOverview}>
              <Text variant="bodySmall" style={{color: '#666'}}>
                10초 단위로 그룹화된 센서 데이터
              </Text>
            </View>

            {Object.entries(dataChunks).map(([type, chunks]) => {
              const sensorType = type as SensorType;
              const isExpanded = expandedChunks[sensorType];
              const totalChunks = chunks.length;
              const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

              return (
                <Card key={type} style={styles.chunkSensorCard}>
                  <List.Accordion
                    title={type}
                    description={`${totalChunks}개 청크 · ${(totalSize / 1024).toFixed(2)} KB`}
                    expanded={isExpanded}
                    onPress={() =>
                      setExpandedChunks(prev => ({
                        ...prev,
                        [sensorType]: !prev[sensorType],
                      }))
                    }
                    left={props => <List.Icon {...props} icon="database" />}
                  >
                    {chunks.map((chunk, index) => {
                      const duration = (chunk.endTime - chunk.startTime) / 1000;
                      return (
                        <List.Item
                          key={index}
                          title={`청크 #${index + 1}`}
                          description={`${formatTimestamp(chunk.startTime)} · ${duration}초 · ${chunk.count}개 · ${(chunk.size / 1024).toFixed(2)} KB`}
                          left={() => (
                            <View style={styles.chunkStatus}>
                              <Text variant="bodySmall">
                                {chunk.uploaded ? '✓' : '○'}
                              </Text>
                            </View>
                          )}
                          style={styles.chunkItem}
                        />
                      );
                    })}
                    <Button
                      mode="outlined"
                      icon="eye"
                      onPress={() => {
                        setPreviewSensorType(sensorType);
                        setShowDataPreview(true);
                      }}
                      style={styles.previewButton}
                      compact
                    >
                      데이터 미리보기
                    </Button>
                  </List.Accordion>
                </Card>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {/* Audio Recordings */}
      {audioRecordings.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">오디오 녹음</Text>
            <Divider style={styles.divider} />

            <View style={styles.statsOverview}>
              <Text variant="bodyMedium">
                녹음 파일: {audioRecordings.length}개
              </Text>
            </View>

            {audioRecordings.map((recording) => {
              const isPlaying = playingAudioId === recording.id;
              const durationSeconds = Math.floor(recording.duration / 1000);
              const fileSizeMB = (recording.fileSize / (1024 * 1024)).toFixed(2);

              return (
                <View key={recording.id}>
                  <Card style={styles.audioCard}>
                    <List.Item
                      title={formatTimestamp(recording.timestamp)}
                      description={`${durationSeconds}초 · ${fileSizeMB}MB · ${recording.format}`}
                      left={() => (
                        <IconButton
                          icon={isPlaying ? 'stop' : 'play'}
                          size={24}
                          onPress={() => toggleAudioPlayback(recording)}
                        />
                      )}
                      right={() => (
                        <IconButton
                          icon="share-variant"
                          size={20}
                          onPress={() => shareAudioFile(recording)}
                        />
                      )}
                    />
                  </Card>
                  <AudioWaveform
                    filePath={recording.filePath}
                    duration={recording.duration}
                  />
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">작업</Text>
          <Divider style={styles.divider} />

          <Button
            mode="contained"
            icon="chart-line"
            onPress={() => navigation.navigate('Chart', {sessionId})}
            disabled={sensorData.length === 0}
            style={styles.button}>
            차트 보기
          </Button>

          <Button
            mode="contained"
            icon="file-export"
            onPress={exportToCSV}
            loading={isExporting}
            disabled={isExporting || sensorData.length === 0}
            style={styles.button}>
            CSV로 내보내기
          </Button>

          <Button
            mode="contained"
            icon="code-json"
            onPress={exportToJSON}
            loading={isExporting}
            disabled={isExporting || sensorData.length === 0}
            style={styles.button}>
            JSON으로 내보내기
          </Button>

          <Button
            mode="contained"
            icon="delete"
            onPress={() => setDeleteDialogVisible(true)}
            buttonColor="#dc3545"
            style={styles.button}>
            세션 삭제
          </Button>
        </Card.Content>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>세션 삭제</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              이 세션과 모든 센서 데이터를 삭제하시겠습니까? 이 작업은 되돌릴
              수 없습니다.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>취소</Button>
            <Button onPress={handleDelete} buttonColor="#dc3545">
              삭제
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Data Preview Dialog */}
        <Dialog
          visible={showDataPreview}
          onDismiss={() => setShowDataPreview(false)}
          style={styles.previewDialog}>
          <Dialog.Title>센서 데이터 미리보기</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {previewSensorType && (
                <DataPreview
                  data={sensorData.filter(d => d.sensorType === previewSensorType)}
                  maxRows={100}
                />
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowDataPreview(false)}>닫기</Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: '#ffebee',
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    color: '#666',
    marginBottom: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  sensorChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  statsOverview: {
    marginBottom: 16,
  },
  statsCard: {
    marginTop: 12,
    backgroundColor: '#fafafa',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statLabel: {
    color: '#666',
  },
  audioCard: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    elevation: 0,
  },
  eventMarkerCard: {
    marginTop: 8,
    backgroundColor: '#fff3e0',
    elevation: 1,
  },
  eventMarkerIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  eventMarkerIndexText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chunkSensorCard: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    elevation: 0,
  },
  chunkItem: {
    paddingLeft: 16,
    backgroundColor: '#fafafa',
  },
  chunkStatus: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  button: {
    marginTop: 12,
  },
  previewButton: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  previewDialog: {
    maxHeight: '80%',
  },
});
