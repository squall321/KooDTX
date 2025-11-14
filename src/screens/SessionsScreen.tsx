import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

interface Session {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration: number;
  sensorCount: number;
  audioFile?: string;
  isSynced?: boolean;
}

type RootStackParamList = {
  SessionDetail: { sessionId: string };
  Sessions: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sessions'>;

type SortOption = 'date-desc' | 'date-asc' | 'duration-desc' | 'duration-asc' | 'name-asc' | 'name-desc';

export const SessionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Phase 127: Filter/Sort/Search features
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [showSortModal, setShowSortModal] = useState(false);
  const [filterSynced, setFilterSynced] = useState<'all' | 'synced' | 'unsynced'>('all');

  const loadSessions = async () => {
    // TODO: Load sessions from database
    // This will be implemented when integrating with DatabaseService
    setSessions([]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...sessions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((session) =>
        session.name.toLowerCase().includes(query)
      );
    }

    // Sync status filter
    if (filterSynced === 'synced') {
      result = result.filter((session) => session.isSynced);
    } else if (filterSynced === 'unsynced') {
      result = result.filter((session) => !session.isSynced);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return b.startTime - a.startTime;
        case 'date-asc':
          return a.startTime - b.startTime;
        case 'duration-desc':
          return b.duration - a.duration;
        case 'duration-asc':
          return a.duration - b.duration;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredSessions(result);
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

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionName}>{item.name}</Text>
        <View style={styles.sessionHeaderRight}>
          {/* Sync status icon */}
          <Icon
            name={item.isSynced ? 'cloud-done' : 'cloud-offline'}
            size={20}
            color={item.isSynced ? '#34C759' : '#FF9500'}
            style={styles.syncIcon}
          />
          <Text style={styles.sessionDuration}>{formatDuration(item.duration)}</Text>
        </View>
      </View>
      <Text style={styles.sessionDate}>{formatDate(item.startTime)}</Text>
      <View style={styles.sessionStats}>
        <Text style={styles.statText}>센서 데이터: {item.sensorCount}건</Text>
        {item.audioFile && <Text style={styles.statText}>오디오 포함</Text>}
      </View>
    </TouchableOpacity>
  );

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
  sessionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
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
  sessionDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
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
});

export default SessionsScreen;
