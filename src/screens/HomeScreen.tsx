import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSyncStore } from '../store/useSyncStore';
import { useRecording, createRecordingConfig } from '../hooks';
import { RecordingMode } from '../services/RecordingService';
import { logger } from '../utils/logger';

type RootStackParamList = {
  Recording: undefined;
  Sessions: undefined;
  Sync: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AppStatus {
  isRecording: boolean;
  currentSession?: {
    id: string;
    name: string;
    duration: number;
  };
  totalSessions: number;
  pendingSyncItems: number;
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state: syncState, progress: syncProgress, queueSize } = useSyncStore();

  // Phase 126: Recording control logic integration
  const {
    isRecording,
    isStarting,
    isStopping,
    sessionId,
    state: recordingState,
    stats,
    startRecording,
    stopRecording,
    error: recordingError,
  } = useRecording({
    onError: (error) => {
      Alert.alert('녹음 오류', error.message);
    },
  });

  const [status, setStatus] = useState<AppStatus>({
    isRecording: false,
    totalSessions: 0,
    pendingSyncItems: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const loadStatus = async () => {
    // TODO: Load actual status from DatabaseService
    setStatus({
      isRecording,
      currentSession: sessionId
        ? {
            id: sessionId,
            name: `Session ${sessionId.slice(0, 8)}`,
            duration: recordingDuration,
          }
        : undefined,
      totalSessions: 0,
      pendingSyncItems: queueSize,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatus();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStatus();
  }, [queueSize, isRecording, sessionId, recordingDuration]);

  // Recording duration timer
  useEffect(() => {
    if (!isRecording) {
      setRecordingDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setRecordingDuration((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      // Create recording configuration with sensors and audio
      const config = createRecordingConfig(RecordingMode.SENSOR_AND_AUDIO);
      await startRecording(config);
    } catch (error) {
      logger.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
    } catch (error) {
      logger.error('Failed to stop recording:', error);
    }
  };

  const getSyncStatusColor = (): string => {
    switch (syncState) {
      case 'syncing':
        return '#007AFF';
      case 'error':
        return '#FF3B30';
      case 'idle':
        return queueSize > 0 ? '#FF9500' : '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getSyncStatusText = (): string => {
    switch (syncState) {
      case 'syncing':
        return '동기화 중...';
      case 'error':
        return '동기화 실패';
      case 'idle':
        return queueSize > 0 ? `대기 중 (${queueSize}개)` : '동기화 완료';
      default:
        return '대기 중';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Icon name="recording" size={48} color="#007AFF" />
        </View>
        <Text style={styles.appTitle}>KooDTX</Text>
        <Text style={styles.appSubtitle}>센서 데이터 수집 앱</Text>
      </View>

      {/* Current Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>현재 상태</Text>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: status.isRecording ? '#34C759' : '#8E8E93' },
            ]}
          />
        </View>
        <Text style={styles.statusText}>
          {status.isRecording ? '녹음 중' : '대기 중'}
        </Text>
        {status.currentSession && (
          <View style={styles.currentSession}>
            <Text style={styles.sessionLabel}>현재 세션</Text>
            <Text style={styles.sessionName}>{status.currentSession.name}</Text>
          </View>
        )}
      </View>

      {/* Start/Stop Recording Button */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          status.isRecording && styles.recordButtonActive,
        ]}
        onPress={status.isRecording ? handleStopRecording : handleStartRecording}
        disabled={isStarting || isStopping}
      >
        <Icon
          name={status.isRecording ? 'stop-circle' : 'mic'}
          size={32}
          color="#FFFFFF"
        />
        <Text style={styles.recordButtonText}>
          {isStarting
            ? '시작 중...'
            : isStopping
            ? '중지 중...'
            : status.isRecording
            ? '녹음 중지'
            : '녹음 시작'}
        </Text>
      </TouchableOpacity>

      {/* Recent Sessions Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>세션 요약</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sessions')}>
            <Text style={styles.viewAllText}>전체 보기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Icon name="list" size={24} color="#007AFF" />
            <Text style={styles.summaryValue}>{status.totalSessions}</Text>
            <Text style={styles.summaryLabel}>총 세션</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Icon name="time" size={24} color="#007AFF" />
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>최근 7일</Text>
          </View>
        </View>
      </View>

      {/* Sync Status */}
      <View style={styles.syncCard}>
        <View style={styles.syncHeader}>
          <Text style={styles.syncTitle}>동기화 상태</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sync')}>
            <Icon name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
        <View style={styles.syncContent}>
          <View
            style={[
              styles.syncStatusDot,
              { backgroundColor: getSyncStatusColor() },
            ]}
          />
          <Text style={styles.syncStatusText}>{getSyncStatusText()}</Text>
        </View>
        {syncState === 'syncing' && (
          <View style={styles.syncProgressBar}>
            <View
              style={[
                styles.syncProgressFill,
                { width: `${syncProgress}%` },
              ]}
            />
          </View>
        )}
        {queueSize > 0 && syncState !== 'syncing' && (
          <Text style={styles.syncQueueText}>
            {queueSize}개 항목이 동기화 대기 중입니다
          </Text>
        )}
      </View>

      {/* Quick Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          녹음 버튼을 눌러 센서 데이터와 오디오 수집을 시작하세요
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  currentSession: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  sessionLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  recordButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
  },
  recordButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  syncCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  syncContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  syncStatusText: {
    fontSize: 16,
    color: '#000000',
  },
  syncProgressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  syncProgressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  syncQueueText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#E5F1FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
});

export default HomeScreen;
