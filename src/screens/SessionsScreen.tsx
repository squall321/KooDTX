import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';
import { useSessions, sortSessions, filterSessions, type SortOption, type UploadStatus } from '../hooks';

type RootStackParamList = {
  SessionDetail: { sessionId: string };
  Sessions: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sessions'>;

export const SessionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Phase 128: WatermelonDB integration with real-time updates
  const { sessions, isLoading, error, refresh, deleteSession } = useSessions({
    includeActive: true,
  });

  // Phase 127: Filter/Sort/Search features
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [showSortModal, setShowSortModal] = useState(false);
  const [filterSynced, setFilterSynced] = useState<'all' | 'synced' | 'unsynced'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Apply filters and sorting with useMemo for performance
  const filteredSessions = useMemo(() => {
    // First apply filters
    const filtered = filterSessions(sessions, searchQuery, filterSynced);

    // Then apply sorting
    return sortSessions(filtered, sortOption);
  }, [sessions, searchQuery, sortOption, filterSynced]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getUploadStatusIcon = (status: UploadStatus): { name: string; color: string } => {
    switch (status) {
      case 'completed':
        return { name: 'cloud-done', color: '#34C759' };
      case 'in_progress':
        return { name: 'cloud-upload', color: '#007AFF' };
      case 'failed':
        return { name: 'cloud-offline', color: '#FF3B30' };
      case 'pending':
      default:
        return { name: 'cloud-outline', color: '#FF9500' };
    }
  };

  const getSortLabel = (): string => {
    switch (sortOption) {
      case 'date-desc': return '최신순';
      case 'date-asc': return '오래된순';
      case 'duration-desc': return '긴 시간순';
      case 'duration-asc': return '짧은 시간순';
      case 'name-asc': return '이름 오름차순';
      case 'name-desc': return '이름 내림차순';
      default: return '정렬';
    }
  };

  const handleDeleteSession = (session: Session) => {
    Alert.alert(
      '세션 삭제',
      `"${session.name}" 세션을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(session.id);
            } catch (err) {
              Alert.alert('오류', '세션 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (item: Session, progress: Animated.AnimatedInterpolation<number>) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });

    return (
      <Animated.View style={[styles.swipeActionContainer, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSession(item)}
        >
          <Icon name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSession = ({ item }: { item: Session }) => {
    const uploadIcon = getUploadStatusIcon(item.uploadStatus);

    return (
      <Swipeable
        renderRightActions={(progress) => renderRightActions(item, progress)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={styles.sessionCard}
          onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}
        >
          <View style={styles.sessionHeader}>
            <View style={styles.sessionTitleContainer}>
              <Text style={styles.sessionName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.sessionId}>ID: {item.sessionId.slice(0, 8)}...</Text>
            </View>
            <View style={styles.sessionHeaderRight}>
              {/* Upload status icon */}
              <Icon
                name={uploadIcon.name}
                size={20}
                color={uploadIcon.color}
                style={styles.syncIcon}
              />
              <Text style={styles.sessionDuration}>{formatDuration(item.duration)}</Text>
            </View>
          </View>

          <View style={styles.sessionDateRow}>
            <Icon name="time-outline" size={14} color="#8E8E93" />
            <Text style={styles.sessionDate}>{formatDate(item.startTime)}</Text>
            {item.endTime && (
              <Text style={styles.sessionDateEnd}> ~ {new Date(item.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</Text>
            )}
          </View>

          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <Icon name="stats-chart-outline" size={14} color="#8E8E93" />
              <Text style={styles.statText}>{item.sensorCount.toLocaleString()}건</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="folder-outline" size={14} color="#8E8E93" />
              <Text style={styles.statText}>{item.fileCount}개 파일</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="save-outline" size={14} color="#8E8E93" />
              <Text style={styles.statText}>{formatSize(item.totalSize)}</Text>
            </View>
            {item.audioFile && (
              <View style={styles.statItem}>
                <Icon name="musical-note-outline" size={14} color="#8E8E93" />
                <Text style={styles.statText}>오디오</Text>
              </View>
            )}
          </View>

          {/* Upload progress bar (if in progress) */}
          {item.uploadStatus === 'in_progress' && item.uploadProgress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{item.uploadProgress}%</Text>
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>정렬 기준</Text>
          {[
            { value: 'date-desc', label: '최신순' },
            { value: 'date-asc', label: '오래된순' },
            { value: 'duration-desc', label: '긴 시간순' },
            { value: 'duration-asc', label: '짧은 시간순' },
            { value: 'name-asc', label: '이름 오름차순' },
            { value: 'name-desc', label: '이름 내림차순' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.modalOption,
                sortOption === option.value && styles.modalOptionActive,
              ]}
              onPress={() => {
                setSortOption(option.value as SortOption);
                setShowSortModal(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  sortOption === option.value && styles.modalOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {sortOption === option.value && (
                <Icon name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Loading state
  if (isLoading && sessions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>녹음 세션</Text>
          <Text style={styles.subtitle}>로딩 중...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>세션을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && sessions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>녹음 세션</Text>
          <Text style={styles.subtitle}>오류 발생</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.emptyText}>세션을 불러올 수 없습니다</Text>
          <Text style={styles.emptySubtext}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>녹음 세션</Text>
        <Text style={styles.subtitle}>총 {sessions.length}개의 세션</Text>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterBar}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="세션 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterButtons}>
          {/* Sort button */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowSortModal(true)}
          >
            <Icon name="swap-vertical" size={18} color="#007AFF" />
            <Text style={styles.filterButtonText}>{getSortLabel()}</Text>
          </TouchableOpacity>

          {/* Sync filter button */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterSynced !== 'all' && styles.filterButtonActive,
            ]}
            onPress={() => {
              const options: Array<'all' | 'synced' | 'unsynced'> = ['all', 'synced', 'unsynced'];
              const currentIndex = options.indexOf(filterSynced);
              const nextIndex = (currentIndex + 1) % options.length;
              setFilterSynced(options[nextIndex]);
            }}
          >
            <Icon
              name={
                filterSynced === 'synced'
                  ? 'cloud-done'
                  : filterSynced === 'unsynced'
                  ? 'cloud-offline'
                  : 'filter'
              }
              size={18}
              color={filterSynced !== 'all' ? '#FFFFFF' : '#007AFF'}
            />
            <Text
              style={[
                styles.filterButtonText,
                filterSynced !== 'all' && styles.filterButtonTextActive,
              ]}
            >
              {filterSynced === 'synced'
                ? '동기화됨'
                : filterSynced === 'unsynced'
                ? '미동기화'
                : '전체'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredSessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="folder-open-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyText}>
            {searchQuery || filterSynced !== 'all'
              ? '검색 결과가 없습니다'
              : '녹음된 세션이 없습니다'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || filterSynced !== 'all'
              ? '다른 조건으로 검색해보세요'
              : '홈 화면에서 녹음을 시작해보세요'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {renderSortModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  searchFilterBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000000',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
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
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  sessionId: {
    fontSize: 11,
    color: '#8E8E93',
    fontFamily: 'Courier',
  },
  sessionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncIcon: {
    marginLeft: 4,
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  sessionDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  sessionDateEnd: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  sessionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  swipeActionContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionActive: {
    backgroundColor: '#F2F2F7',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  modalOptionTextActive: {
    fontWeight: '600',
    color: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SessionsScreen;
