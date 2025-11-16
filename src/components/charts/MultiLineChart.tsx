/**
 * MultiLineChart Component
 *
 * Multi-line chart component for visualizing multiple sensor data streams.
 *
 * NOTE: This requires victory-native to be installed:
 *   npm install victory-native react-native-svg
 *
 * Usage:
 *   <MultiLineChart
 *     datasets={[
 *       { data: accelerometerData, label: 'Accelerometer X', color: '#FF6384' },
 *       { data: gyroscopeData, label: 'Gyroscope X', color: '#36A2EB' },
 *     ]}
 *     width={350}
 *     height={250}
 *   />
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TODO: Uncomment when victory-native is installed
// import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryLegend } from 'victory-native';

export interface DataPoint {
  x: number; // timestamp or index
  y: number; // value
}

export interface Dataset {
  data: DataPoint[];
  label: string;
  color: string;
}

export interface MultiLineChartProps {
  datasets: Dataset[];
  width?: number;
  height?: number;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  datasets,
  width = 350,
  height = 250,
  title,
  xAxisLabel,
  yAxisLabel,
}) => {
  // Placeholder implementation
  // TODO: Replace with actual Victory Native implementation

  return (
    <View style={[styles.container, { width, height }]}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Multi-Line Chart</Text>
        <Text style={styles.note}>
          Install victory-native to see charts:{'\n'}
          npm install victory-native react-native-svg
        </Text>

        {datasets.map((dataset, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: dataset.color }]} />
            <Text style={styles.legendText}>{dataset.label}</Text>
            <Text style={styles.dataCount}>({dataset.data.length} points)</Text>
          </View>
        ))}
      </View>
    </View>
  );

  /*
  // Actual implementation (uncomment when victory-native is installed):

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <VictoryChart
        width={width}
        height={height}
        theme={VictoryTheme.material}
        padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
      >
        <VictoryAxis
          label={xAxisLabel}
          style={{
            axisLabel: { fontSize: 12, padding: 30 },
          }}
        />
        <VictoryAxis
          dependentAxis
          label={yAxisLabel}
          style={{
            axisLabel: { fontSize: 12, padding: 35 },
          }}
        />

        {datasets.map((dataset, index) => (
          <VictoryLine
            key={index}
            data={dataset.data}
            style={{
              data: {
                stroke: dataset.color,
                strokeWidth: 2,
              },
            }}
            animate={{
              duration: 500,
              onLoad: { duration: 200 },
            }}
          />
        ))}

        <VictoryLegend
          x={10}
          y={10}
          orientation="horizontal"
          gutter={20}
          data={datasets.map(dataset => ({
            name: dataset.label,
            symbol: { fill: dataset.color },
          }))}
        />
      </VictoryChart>
    </View>
  );
  */
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dataCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

// Export types for use in other components
export type { DataPoint, Dataset, MultiLineChartProps };
