/**
 * DataPreview Component
 * Phase 185: CSV 데이터 미리보기
 * Phase 201-203: React.memo optimization
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card, Button, Chip, ActivityIndicator} from 'react-native-paper';
import type {SensorDataRecord} from '@database/models';

interface DataPreviewProps {
  data: SensorDataRecord[];
  maxRows?: number;
}

// Phase 201-203: Memoized component to prevent unnecessary re-renders
const DataPreviewComponent = ({data, maxRows = 100}: DataPreviewProps) => {
  const [preview, setPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    generatePreview();
  }, [data, showAll]);

  const generatePreview = () => {
    setIsLoading(true);
    try {
      // Generate CSV preview
      const headers = [
        'timestamp',
        'sensorType',
        'x',
        'y',
        'z',
        'latitude',
        'longitude',
        'altitude',
      ];

      const displayData = showAll ? data : data.slice(0, maxRows);

      const csvLines = [
        headers.join(','),
        ...displayData.map(record => [
          record.timestamp,
          record.sensorType,
          record.x || '',
          record.y || '',
          record.z || '',
          record.latitude || '',
          record.longitude || '',
          record.altitude || '',
        ].join(',')),
      ];

      setPreview(csvLines.join('\n'));
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreview('데이터 미리보기 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
        <Text variant="bodySmall" style={styles.loadingText}>
          미리보기 생성 중...
        </Text>
      </View>
    );
  }

  const totalRows = data.length;
  const displayedRows = showAll ? totalRows : Math.min(maxRows, totalRows);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">CSV 미리보기</Text>
          <Chip mode="outlined" compact>
            {displayedRows} / {totalRows} 행
          </Chip>
        </View>

        <ScrollView
          horizontal
          style={styles.scrollContainer}
          showsHorizontalScrollIndicator={true}
        >
          <ScrollView
            style={styles.previewContainer}
            showsVerticalScrollIndicator={true}
          >
            <Text
              variant="bodySmall"
              style={styles.previewText}
              selectable
            >
              {preview}
            </Text>
          </ScrollView>
        </ScrollView>

        {!showAll && totalRows > maxRows && (
          <Button
            mode="outlined"
            onPress={() => setShowAll(true)}
            style={styles.showAllButton}
            compact
          >
            전체 {totalRows}행 표시
          </Button>
        )}

        {showAll && totalRows > maxRows && (
          <Button
            mode="outlined"
            onPress={() => setShowAll(false)}
            style={styles.showAllButton}
            compact
          >
            처음 {maxRows}행만 표시
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  scrollContainer: {
    maxHeight: 300,
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
    color: '#333',
  },
  showAllButton: {
    marginTop: 12,
  },
});

// Phase 201-203: Export memoized component
export const DataPreview = React.memo(DataPreviewComponent);
export default DataPreview;
