import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Session {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration: number;
  sensorCount: number;
  audioFile?: string;
}

type RootStackParamList = {
  SessionDetail: { sessionId: string };
  Sessions: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sessions'>;

export const SessionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionName}>{item.name}</Text>
        <Text style={styles.sessionDuration}>{formatDuration(item.duration)}</Text>
      </View>
      <Text style={styles.sessionDate}>{formatDate(item.startTime)}</Text>
      <View style={styles.sessionStats}>
        <Text style={styles.statText}>센서 데이터: {item.sensorCount}건</Text>
        {item.audioFile && <Text style={styles.statText}>오디오 포함</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>녹음 세션</Text>
        <Text style={styles.subtitle}>총 {sessions.length}개의 세션</Text>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>녹음된 세션이 없습니다</Text>
          <Text style={styles.emptySubtext}>
            홈 화면에서 녹음을 시작해보세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: '#fff',
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
    color: '#333',
    flex: 1,
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#999',
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
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default SessionsScreen;
