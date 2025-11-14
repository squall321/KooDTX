/**
 * SyncProgress Component
 * Phase 138: Sync progress component
 *
 * Features:
 * - Progress bar visualization
 * - Current/Total items display
 * - Upload speed calculation
 * - Estimated time remaining
 * - Smooth animations
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface SyncProgressProps {
  current: number;
  total: number;
  uploadSpeed?: number; // items per second
  status?: 'idle' | 'syncing' | 'completed' | 'error';
  errorMessage?: string;
}

const SyncProgress: React.FC<SyncProgressProps> = ({
  current,
  total,
  uploadSpeed = 0,
  status = 'idle',
  errorMessage,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculate progress percentage
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;

  // Calculate estimated time remaining (in seconds)
  const estimatedTimeRemaining =
    uploadSpeed > 0 && total > current
      ? Math.ceil((total - current) / uploadSpeed)
      : 0;

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds === 0) return '--';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  // Format upload speed
  const formatUploadSpeed = (speed: number): string => {
    if (speed === 0) return '--';
    if (speed < 1) {
      return `${(speed * 60).toFixed(1)} items/min`;
    }
    return `${speed.toFixed(1)} items/sec`;
  };

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  // Pulse animation when syncing
  useEffect(() => {
    if (status === 'syncing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'syncing':
        return '#007AFF';
      case 'completed':
        return '#4CAF50';
      case 'error':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'syncing':
        return 'sync';
      case 'completed':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'pause-circle';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'syncing':
        return '동기화 중';
      case 'completed':
        return '완료';
      case 'error':
        return '오류';
      default:
        return '대기 중';
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Icon name={getStatusIcon()} size={16} color="#FFFFFF" />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </Animated.View>
        <Text style={styles.percentage}>
          {progressPercentage.toFixed(1)}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getStatusColor(),
            },
          ]}
        />
      </View>

      {/* Progress Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="cloud-upload-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailLabel}>진행 상태</Text>
          <Text style={styles.detailValue}>
            {current.toLocaleString()} / {total.toLocaleString()}
          </Text>
        </View>

        {status === 'syncing' && (
          <>
            <View style={styles.detailRow}>
              <Icon name="speedometer-outline" size={16} color="#8E8E93" />
              <Text style={styles.detailLabel}>업로드 속도</Text>
              <Text style={styles.detailValue}>
                {formatUploadSpeed(uploadSpeed)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="time-outline" size={16} color="#8E8E93" />
              <Text style={styles.detailLabel}>남은 시간</Text>
              <Text style={styles.detailValue}>
                {formatTimeRemaining(estimatedTimeRemaining)}
              </Text>
            </View>
          </>
        )}

        {status === 'error' && errorMessage && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={16} color="#FF3B30" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {status === 'completed' && (
          <View style={styles.completedContainer}>
            <Icon name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.completedText}>
              {total.toLocaleString()}개 항목이 성공적으로 동기화되었습니다
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    flex: 1,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9F0',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  completedText: {
    fontSize: 13,
    color: '#4CAF50',
    flex: 1,
  },
});

export default SyncProgress;
