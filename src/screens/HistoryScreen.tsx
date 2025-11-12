/**
 * HistoryScreen
 * Displays list of recorded sessions
 */

import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, FlatList, RefreshControl} from 'react-native';
import {
  Text,
  Card,
  FAB,
  Chip,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import type {RecordingSession} from '@database/models';
import {getRecordingSessionRepository} from '@database/repositories';
import {formatTimestamp, calculateDuration, formatDuration} from '@utils/date';

export function HistoryScreen() {
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sessionRepo = getRecordingSessionRepository();

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const allSessions = await sessionRepo.findAll();
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [sessionRepo]);

  // Initial load
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadSessions();
  }, [loadSessions]);

  // Render session item
  const renderSessionItem = useCallback(({item}: {item: RecordingSession}) => {
    const duration = item.endTime
      ? formatDuration(calculateDuration(item.startTime, item.endTime))
      : '진행 중';

    return (
      <Card style={styles.sessionCard}>
        <Card.Content>
          <View style={styles.sessionHeader}>
            <Text variant="titleMedium">세션 {item.sessionId.slice(-8)}</Text>
            {item.isActive && (
              <Chip mode="flat" style={styles.activeChip}>
                🔴 녹음 중
              </Chip>
            )}
          </View>

          <Text variant="bodyMedium" style={styles.dateText}>
            {formatTimestamp(item.startTime)}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                소요 시간
              </Text>
              <Text variant="bodyMedium">{duration}</Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                데이터 수
              </Text>
              <Text variant="bodyMedium">{item.dataCount.toLocaleString()}</Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="bodySmall" style={styles.statLabel}>
                샘플 레이트
              </Text>
              <Text variant="bodyMedium">{item.sampleRate} Hz</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.sensorsContainer}>
            <Text variant="bodySmall" style={styles.sensorsLabel}>
              센서:
            </Text>
            {item.enabledSensors.map(sensor => (
              <Chip key={sensor} mode="outlined" compact style={styles.sensorChip}>
                {sensor}
              </Chip>
            ))}
          </View>

          {item.notes && (
            <>
              <Divider style={styles.divider} />
              <Text variant="bodySmall" style={styles.notesLabel}>
                메모:
              </Text>
              <Text variant="bodyMedium">{item.notes}</Text>
            </>
          )}

          {item.isUploaded && (
            <Chip
              mode="flat"
              icon="cloud-check"
              style={styles.uploadedChip}
              compact
            >
              업로드 완료
            </Chip>
          )}
        </Card.Content>
      </Card>
    );
  }, []);

  // Empty list
  const renderEmptyList = useCallback(() => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="titleLarge" style={styles.emptyTitle}>
          녹음된 세션이 없습니다
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          새로운 센서 데이터 녹음을 시작하세요
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            세션 로딩 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSessionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={handleRefresh}
        label="새로고침"
      />
    </View>
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
    marginTop: 12,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  sessionCard: {
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: '#ffebee',
  },
  dateText: {
    color: '#666',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#999',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
  },
  sensorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  sensorsLabel: {
    color: '#666',
    marginRight: 8,
  },
  sensorChip: {
    marginRight: 4,
    marginVertical: 2,
  },
  notesLabel: {
    color: '#666',
    marginBottom: 4,
  },
  uploadedChip: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#e8f5e9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
