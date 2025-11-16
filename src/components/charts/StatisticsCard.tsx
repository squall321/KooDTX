/**
 * StatisticsCard Component
 * Phase 251: Data visualization improvements
 *
 * Displays statistical summary of sensor data
 */

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text, DataTable} from 'react-native-paper';
import type {Statistics} from '@utils/statistics';
import {formatNumber} from '@utils/statistics';

interface StatisticsCardProps {
  statistics: Statistics;
  title?: string;
  unit?: string;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  statistics,
  title = '통계 정보',
  unit = '',
}) => {
  const formatValue = (value: number) => {
    return `${formatNumber(value)}${unit}`;
  };

  return (
    <Card style={styles.card}>
      <Card.Title title={title} titleStyle={styles.title} />
      <Card.Content>
        <DataTable>
          <DataTable.Row>
            <DataTable.Cell>평균</DataTable.Cell>
            <DataTable.Cell numeric>{formatValue(statistics.mean)}</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>중앙값</DataTable.Cell>
            <DataTable.Cell numeric>{formatValue(statistics.median)}</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>표준편차</DataTable.Cell>
            <DataTable.Cell numeric>{formatValue(statistics.stdDev)}</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>최소값</DataTable.Cell>
            <DataTable.Cell numeric>{formatValue(statistics.min)}</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>최대값</DataTable.Cell>
            <DataTable.Cell numeric>{formatValue(statistics.max)}</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>범위</DataTable.Cell>
            <DataTable.Cell numeric>{formatValue(statistics.range)}</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>개수</DataTable.Cell>
            <DataTable.Cell numeric>{statistics.count}</DataTable.Cell>
          </DataTable.Row>
        </DataTable>

        <View style={styles.quartileSection}>
          <Text variant="titleSmall" style={styles.quartileTitle}>
            사분위수
          </Text>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Q1 (25%)</DataTable.Cell>
              <DataTable.Cell numeric>
                {formatValue(statistics.quartiles.q1)}
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Q2 (50%)</DataTable.Cell>
              <DataTable.Cell numeric>
                {formatValue(statistics.quartiles.q2)}
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Q3 (75%)</DataTable.Cell>
              <DataTable.Cell numeric>
                {formatValue(statistics.quartiles.q3)}
              </DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>IQR</DataTable.Cell>
              <DataTable.Cell numeric>
                {formatValue(statistics.iqr)}
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quartileSection: {
    marginTop: 16,
  },
  quartileTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
});
