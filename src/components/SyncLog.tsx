/**
 * SyncLog Component
 * Phase 139: Sync log display
 *
 * Features:
 * - Log list with timestamps
 * - Status indicators (success/failure)
 * - Error messages
 * - Filtering by status
 * - Auto-scroll to bottom
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface SyncLogEntry {
  id: string;
  timestamp: Date;
  type: 'session' | 'sensor_data' | 'audio';
  sessionName: string;
  status: 'success' | 'failure' | 'in_progress';
  errorMessage?: string;
  itemsCount?: number;
}

export interface SyncLogProps {
  logs: SyncLogEntry[];
  maxHeight?: number;
  autoScroll?: boolean;
}

type FilterType = 'all' | 'success' | 'failure' | 'in_progress';

const SyncLog: React.FC<SyncLogProps> = ({
  logs,
  maxHeight = 400,
  autoScroll = true,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (autoScroll && logs.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [logs.length, autoScroll]);

  // Filter logs based on selected filter
  const filteredLogs =
    filter === 'all'
      ? logs
      : logs.filter((log) => log.status === filter);

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return `${seconds}초 전`;
    } else if (minutes < 60) {
      return `${minutes}분 전`;
    } else if (hours < 24) {
      return `${hours}시간 전`;
    } else {
      return date.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Get icon for log type
  const getTypeIcon = (type: SyncLogEntry['type']): string => {
    switch (type) {
      case 'session':
        return 'folder-outline';
      case 'sensor_data':
        return 'analytics-outline';
      case 'audio':
        return 'musical-notes-outline';
    }
  };

  // Get status color
  const getStatusColor = (status: SyncLogEntry['status']): string => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'failure':
        return '#FF3B30';
      case 'in_progress':
        return '#007AFF';
    }
  };

  // Get status icon
  const getStatusIcon = (status: SyncLogEntry['status']): string => {
    switch (status) {
      case 'success':
        return 'checkmark-circle';
      case 'failure':
        return 'close-circle';
      case 'in_progress':
        return 'sync';
    }
  };

  // Get status text
  const getStatusText = (status: SyncLogEntry['status']): string => {
    switch (status) {
      case 'success':
        return '성공';
      case 'failure':
        return '실패';
      case 'in_progress':
        return '진행 중';
    }
  };

  // Render filter button
  const renderFilterButton = (
    filterType: FilterType,
    label: string,
    icon: string
  ) => {
    const isActive = filter === filterType;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && styles.filterButtonActive,
        ]}
        onPress={() => setFilter(filterType)}
      >
        <Icon
          name={icon}
          size={16}
          color={isActive ? '#007AFF' : '#8E8E93'}
        />
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.filterButtonTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render log item
  const renderLogItem = ({ item }: { item: SyncLogEntry }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.logItem}>
        {/* Left: Type Icon */}
        <View style={styles.logIcon}>
          <Icon name={getTypeIcon(item.type)} size={20} color="#007AFF" />
        </View>

        {/* Center: Content */}
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <Text style={styles.logSessionName} numberOfLines={1}>
              {item.sessionName}
            </Text>
            <Text style={styles.logTimestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>

          {item.itemsCount !== undefined && (
            <Text style={styles.logItemsCount}>
              {item.itemsCount.toLocaleString()}개 항목
            </Text>
          )}

          {item.errorMessage && (
            <Text style={styles.logError} numberOfLines={2}>
              {item.errorMessage}
            </Text>
          )}
        </View>

        {/* Right: Status Icon */}
        <View style={styles.logStatus}>
          <Icon
            name={getStatusIcon(item.status)}
            size={24}
            color={statusColor}
          />
        </View>
      </View>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="file-tray-outline" size={48} color="#8E8E93" />
      <Text style={styles.emptyStateText}>
        {filter === 'all'
          ? '동기화 로그가 없습니다'
          : `${getStatusText(filter as any)} 로그가 없습니다`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', '전체', 'list-outline')}
        {renderFilterButton('success', '성공', 'checkmark-circle-outline')}
        {renderFilterButton('failure', '실패', 'close-circle-outline')}
        {renderFilterButton('in_progress', '진행 중', 'sync-outline')}
      </View>

      {/* Log Count */}
      <View style={styles.logCountContainer}>
        <Text style={styles.logCount}>
          {filteredLogs.length}개의 로그
        </Text>
      </View>

      {/* Log List */}
      <FlatList
        ref={flatListRef}
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderLogItem}
        ListEmptyComponent={renderEmptyState}
        style={[styles.logList, { maxHeight }]}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={
          filteredLogs.length === 0 && styles.emptyListContent
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#007AFF',
  },
  logCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9F9F9',
  },
  logCount: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  logList: {
    backgroundColor: '#FFFFFF',
  },
  emptyListContent: {
    flexGrow: 1,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    gap: 12,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logContent: {
    flex: 1,
    gap: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  logSessionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  logItemsCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  logError: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 2,
  },
  logStatus: {
    width: 30,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
  },
});

export default SyncLog;
