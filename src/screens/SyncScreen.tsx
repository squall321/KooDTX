/**
 * SyncScreen
 * Phase 137: Sync screen basic UI
 *
 * Features:
 * - Sync status display
 * - Sync progress
 * - Manual sync button
 * - Sync queue list
 * - Sync log
 * - Statistics display
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSyncStore } from '../store/syncStore';

interface SyncStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
}

interface SyncQueueItem {
  id: string;
  type: 'session' | 'sensor_data' | 'audio';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  sessionName: string;
  timestamp: Date;
}

const SyncScreen: React.FC = () => {
  const {
    isSyncing,
    lastSyncTime,
    pendingSessions,
    pendingSensorData,
    pendingAudioFiles,
  } = useSyncStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
  });
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);

  // Load sync stats and queue
  useEffect(() => {
    loadSyncData();
    const interval = setInterval(loadSyncData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadSyncData = async () => {
    try {
      // Calculate sync stats
      const total = pendingSessions + (pendingSensorData > 0 ? 1 : 0) + (pendingAudioFiles > 0 ? 1 : 0);
      setSyncStats({
        totalTasks: total,
        completedTasks: 0,
        failedTasks: 0,
        inProgressTasks: isSyncing ? 1 : 0,
        pendingTasks: total,
      });

      // Mock sync queue data
      // In real implementation, fetch from sync service
      setSyncQueue([]);
    } catch (error) {
      console.error('Failed to load sync data:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadSyncData();
    setIsRefreshing(false);
  }, []);

  const handleManualSync = async () => {
    try {
      // TODO: Implement manual sync
      console.log('Manual sync triggered');
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  };

  const handleRetryFailed = () => {
    // TODO: Retry failed sync tasks
    console.log('Retry failed tasks');
  };

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return '동기화 기록 없음';

    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  const renderSectionHeader = (title: string, icon: string) => {
    return (
      <View style={styles.sectionHeader}>
        <Icon name={icon} size={24} color="#007AFF" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  };

  const progressPercentage =
    syncStats.totalTasks > 0
      ? syncStats.completedTasks / syncStats.totalTasks
      : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Sync Status Section */}
      <View style={styles.section}>
        {renderSectionHeader('동기화 상태', 'sync')}

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.label}>상태</Text>
            <View style={styles.statusBadge}>
              {isSyncing ? (
                <>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                    동기화 중
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="checkmark-circle" size={16} color="#8E8E93" />
                  <Text style={[styles.statusText, { color: '#8E8E93' }]}>
                    대기 중
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.label}>마지막 동기화</Text>
            <Text style={styles.value}>{formatLastSyncTime()}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.syncButton,
              isSyncing && styles.syncButtonDisabled,
            ]}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            <Icon
              name="sync"
              size={20}
              color={isSyncing ? '#8E8E93' : '#FFFFFF'}
            />
            <Text style={[
              styles.syncButtonText,
              isSyncing && styles.syncButtonTextDisabled,
            ]}>
              {isSyncing ? '동기화 중...' : '지금 동기화'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Data Section */}
      <View style={styles.section}>
        {renderSectionHeader('대기 중인 데이터', 'cloud-upload-outline')}

        <View style={styles.card}>
          <View style={styles.dataRow}>
            <View style={styles.dataInfo}>
              <Icon name="folder-outline" size={20} color="#007AFF" />
              <Text style={styles.dataLabel}>세션</Text>
            </View>
            <Text style={styles.dataValue}>{pendingSessions}개</Text>
          </View>

          <View style={styles.dataRow}>
            <View style={styles.dataInfo}>
              <Icon name="analytics-outline" size={20} color="#007AFF" />
              <Text style={styles.dataLabel}>센서 데이터</Text>
            </View>
            <Text style={styles.dataValue}>
              {pendingSensorData.toLocaleString()}개
            </Text>
          </View>

          <View style={styles.dataRow}>
            <View style={styles.dataInfo}>
              <Icon name="musical-notes-outline" size={20} color="#007AFF" />
              <Text style={styles.dataLabel}>오디오 파일</Text>
            </View>
            <Text style={styles.dataValue}>{pendingAudioFiles}개</Text>
          </View>
        </View>
      </View>

      {/* Upload Progress Section */}
      <View style={styles.section}>
        {renderSectionHeader('업로드 진행 상태', 'bar-chart-outline')}

        <View style={styles.card}>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage * 100}%` },
              ]}
            />
          </View>

          {/* Progress Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{syncStats.totalTasks}</Text>
              <Text style={styles.statLabel}>전체</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {syncStats.completedTasks}
              </Text>
              <Text style={styles.statLabel}>완료</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF3B30' }]}>
                {syncStats.failedTasks}
              </Text>
              <Text style={styles.statLabel}>실패</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#007AFF' }]}>
                {syncStats.inProgressTasks}
              </Text>
              <Text style={styles.statLabel}>진행 중</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#8E8E93' }]}>
                {syncStats.pendingTasks}
              </Text>
              <Text style={styles.statLabel}>대기</Text>
            </View>
          </View>

          {/* Retry Failed Button */}
          {syncStats.failedTasks > 0 && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetryFailed}
            >
              <Icon name="reload" size={20} color="#FF3B30" />
              <Text style={styles.retryButtonText}>실패한 작업 재시도</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sync Queue/Log Section */}
      <View style={styles.section}>
        {renderSectionHeader('동기화 로그', 'list-outline')}

        <View style={styles.card}>
          {syncQueue.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="checkmark-done-circle-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>
                동기화할 항목이 없습니다
              </Text>
            </View>
          ) : (
            syncQueue.map((item) => (
              <View key={item.id} style={styles.queueItem}>
                <View style={styles.queueItemHeader}>
                  <Icon
                    name={
                      item.type === 'session'
                        ? 'folder-outline'
                        : item.type === 'sensor_data'
                        ? 'analytics-outline'
                        : 'musical-notes-outline'
                    }
                    size={20}
                    color="#007AFF"
                  />
                  <Text style={styles.queueItemName}>{item.sessionName}</Text>
                </View>
                <View
                  style={[
                    styles.queueItemStatus,
                    item.status === 'completed' && styles.statusCompleted,
                    item.status === 'failed' && styles.statusFailed,
                    item.status === 'in_progress' && styles.statusInProgress,
                  ]}
                >
                  <Text style={styles.queueItemStatusText}>
                    {item.status === 'pending' && '대기'}
                    {item.status === 'in_progress' && '진행 중'}
                    {item.status === 'completed' && '완료'}
                    {item.status === 'failed' && '실패'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#8E8E93',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#F2F2F7',
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  syncButtonTextDisabled: {
    color: '#8E8E93',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dataInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dataLabel: {
    fontSize: 16,
    color: '#000000',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    gap: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  queueItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  queueItemName: {
    fontSize: 14,
    color: '#000000',
  },
  queueItemStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusFailed: {
    backgroundColor: '#FFEBEE',
  },
  statusInProgress: {
    backgroundColor: '#E3F2FD',
  },
  queueItemStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  bottomPadding: {
    height: 40,
  },
});

export default SyncScreen;
