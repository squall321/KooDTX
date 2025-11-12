/**
 * SyncStatusScreen
 *
 * 동기화 상태 화면
 * - 동기화 상태 (진행 중, 마지막 동기화 시간)
 * - 대기 중인 데이터 수 (세션, 센서 데이터, 오디오 파일)
 * - 업로드 진행 상태 (전체, 완료, 실패, 진행 중, 대기)
 * - 실패한 작업 재시도
 * - 완료된 작업 삭제
 */

import React, {useState, useEffect, useCallback} from 'react';
import {View, ScrollView, StyleSheet, RefreshControl} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  ProgressBar,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import {getSyncManager} from '@services/sync';
import {getUploadQueue} from '@services/sync';
import type {SyncStatus, UploadProgress} from '@services/sync';
import {formatTimestamp} from '@utils/date';

export function SyncStatusScreen() {
  const syncManager = getSyncManager();
  const uploadQueue = getUploadQueue();

  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 상태 로드
  const loadStatus = useCallback(async () => {
    try {
      const status = await syncManager.getStatus();
      setSyncStatus(status);

      const progress = uploadQueue.getProgress();
      setUploadProgress(progress);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }, [syncManager, uploadQueue]);

  // 초기 로드
  useEffect(() => {
    loadStatus();

    // 업로드 진행 상태 구독
    uploadQueue.setOnProgressCallback((progress) => {
      setUploadProgress(progress);
    });

    // 1초마다 상태 갱신
    const interval = setInterval(loadStatus, 1000);

    return () => {
      clearInterval(interval);
      uploadQueue.setOnProgressCallback(undefined);
    };
  }, [loadStatus, uploadQueue]);

  // 새로고침
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadStatus();
    setIsRefreshing(false);
  }, [loadStatus]);

  // 수동 동기화
  const handleSync = useCallback(async () => {
    try {
      await syncManager.sync();
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  }, [syncManager]);

  // 실패한 작업 재시도
  const handleRetryFailed = useCallback(() => {
    uploadQueue.retryFailed();
  }, [uploadQueue]);

  // 완료된 작업 삭제
  const handleClearCompleted = useCallback(() => {
    uploadQueue.clearCompleted();
    loadStatus();
  }, [uploadQueue, loadStatus]);

  if (!syncStatus || !uploadProgress) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          상태 로딩 중...
        </Text>
      </View>
    );
  }

  const progressPercentage =
    uploadProgress.totalTasks > 0
      ? uploadProgress.completedTasks / uploadProgress.totalTasks
      : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }>
      {/* 동기화 상태 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">동기화 상태</Text>
          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyMedium">상태:</Text>
            <Chip
              mode="flat"
              style={syncStatus.isSyncing ? styles.syncingChip : styles.idleChip}>
              {syncStatus.isSyncing ? '동기화 중' : '대기 중'}
            </Chip>
          </View>

          {syncStatus.lastSyncTime && (
            <View style={styles.row}>
              <Text variant="bodyMedium">마지막 동기화:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {formatTimestamp(syncStatus.lastSyncTime)}
              </Text>
            </View>
          )}

          <Button
            mode="contained"
            icon="sync"
            onPress={handleSync}
            disabled={syncStatus.isSyncing}
            style={styles.button}>
            {syncStatus.isSyncing ? '동기화 중...' : '지금 동기화'}
          </Button>
        </Card.Content>
      </Card>

      {/* 대기 중인 데이터 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">대기 중인 데이터</Text>
          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyMedium">세션:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {syncStatus.pendingSessions}개
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyMedium">센서 데이터:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {syncStatus.pendingSensorData.toLocaleString()}개
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyMedium">오디오 파일:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {syncStatus.pendingAudioFiles}개
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* 업로드 진행 상태 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">업로드 진행 상태</Text>
          <Divider style={styles.divider} />

          <ProgressBar
            progress={progressPercentage}
            style={styles.progressBar}
          />

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text variant="titleSmall">전체</Text>
              <Text variant="bodyLarge">{uploadProgress.totalTasks}</Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="titleSmall">완료</Text>
              <Text variant="bodyLarge" style={styles.completedText}>
                {uploadProgress.completedTasks}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="titleSmall">실패</Text>
              <Text variant="bodyLarge" style={styles.failedText}>
                {uploadProgress.failedTasks}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="titleSmall">진행 중</Text>
              <Text variant="bodyLarge" style={styles.inProgressText}>
                {uploadProgress.inProgressTasks}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="titleSmall">대기</Text>
              <Text variant="bodyLarge">{uploadProgress.pendingTasks}</Text>
            </View>
          </View>

          {uploadProgress.failedTasks > 0 && (
            <Button
              mode="contained"
              icon="replay"
              onPress={handleRetryFailed}
              style={styles.button}>
              실패한 작업 재시도
            </Button>
          )}

          {uploadProgress.completedTasks > 0 && (
            <Button
              mode="outlined"
              icon="delete-sweep"
              onPress={handleClearCompleted}
              style={styles.button}>
              완료된 작업 삭제
            </Button>
          )}
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
  divider: {
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  value: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 12,
  },
  syncingChip: {
    backgroundColor: '#4caf50',
  },
  idleChip: {
    backgroundColor: '#9e9e9e',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  completedText: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  failedText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  inProgressText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
});
