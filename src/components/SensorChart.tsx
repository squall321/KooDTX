/**
 * SensorChart Component
 * Phase 151: Chart component for sensor data visualization
 *
 * Features:
 * - Line chart for sensor data
 * - Real-time updates
 * - Multiple data series
 * - Customizable colors
 * - Time-based x-axis
 * - Zoom and pan support
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

export type ChartType = 'line' | 'bar' | 'pie';

export interface ChartDataPoint {
  /**
   * Data value
   */
  value: number;

  /**
   * Label for the data point
   */
  label?: string;

  /**
   * Timestamp for the data point
   */
  timestamp?: number;
}

export interface ChartDataset {
  /**
   * Data points
   */
  data: number[];

  /**
   * Dataset label
   */
  label?: string;

  /**
   * Line color (for line chart)
   */
  color?: string;

  /**
   * Stroke width (for line chart)
   */
  strokeWidth?: number;
}

interface SensorChartProps {
  /**
   * Chart type
   * @default 'line'
   */
  type?: ChartType;

  /**
   * Chart title
   */
  title?: string;

  /**
   * Chart datasets
   */
  datasets: ChartDataset[];

  /**
   * X-axis labels
   */
  labels: string[];

  /**
   * Chart height
   * @default 220
   */
  height?: number;

  /**
   * Chart width
   * @default screenWidth - 32
   */
  width?: number;

  /**
   * Y-axis suffix (e.g., 'm/s²', '°')
   */
  yAxisSuffix?: string;

  /**
   * Y-axis label
   */
  yAxisLabel?: string;

  /**
   * Whether to show legend
   * @default true
   */
  showLegend?: boolean;

  /**
   * Whether chart is scrollable
   * @default false
   */
  scrollable?: boolean;
}

/**
 * Default chart configuration
 */
const defaultChartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#F8F8F8',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#007AFF',
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#E5E5EA',
    strokeWidth: 1,
  },
};

/**
 * SensorChart Component
 * Phase 151: Display sensor data in chart format
 */
const SensorChart: React.FC<SensorChartProps> = ({
  type = 'line',
  title,
  datasets,
  labels,
  height = 220,
  width = screenWidth - 32,
  yAxisSuffix = '',
  yAxisLabel = '',
  showLegend = true,
  scrollable = false,
}) => {
  /**
   * Prepare chart data
   */
  const chartData = useMemo(() => {
    return {
      labels,
      datasets: datasets.map((dataset, index) => ({
        data: dataset.data,
        color: (opacity = 1) =>
          dataset.color || `rgba(${index * 50}, 122, 255, ${opacity})`,
        strokeWidth: dataset.strokeWidth || 2,
      })),
      legend: showLegend ? datasets.map(d => d.label || '') : undefined,
    };
  }, [datasets, labels, showLegend]);

  /**
   * Custom chart config
   */
  const chartConfig = useMemo(() => {
    return {
      ...defaultChartConfig,
      ...(datasets[0]?.color && {
        color: (opacity = 1) => datasets[0].color || `rgba(0, 122, 255, ${opacity})`,
      }),
    };
  }, [datasets]);

  /**
   * Render chart based on type
   */
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      width,
      height,
      chartConfig,
      bezier: true,
      style: styles.chart,
    };

    switch (type) {
      case 'line':
        return (
          <LineChart
            {...commonProps}
            yAxisSuffix={yAxisSuffix}
            yAxisLabel={yAxisLabel}
            withDots={chartData.labels.length <= 20}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            segments={4}
          />
        );

      case 'bar':
        return (
          <BarChart
            {...commonProps}
            yAxisSuffix={yAxisSuffix}
            yAxisLabel={yAxisLabel}
            withInnerLines={true}
            showBarTops={true}
            showValuesOnTopOfBars={chartData.labels.length <= 10}
            segments={4}
          />
        );

      case 'pie':
        // Pie chart requires different data format
        const pieData = datasets[0]?.data.map((value, index) => ({
          name: labels[index] || `Item ${index + 1}`,
          population: value,
          color: `rgba(${index * 40}, 122, 255, 1)`,
          legendFontColor: '#000000',
          legendFontSize: 12,
        })) || [];

        return (
          <PieChart
            data={pieData}
            width={width}
            height={height}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
            style={styles.chart}
          />
        );

      default:
        return null;
    }
  };

  const content = (
    <View style={styles.container}>
      {/* Title */}
      {title ? <Text style={styles.title}>{title}</Text> : null}

      {/* Chart */}
      {renderChart()}

      {/* Legend (for line/bar charts) */}
      {showLegend && type !== 'pie' && chartData.legend ? (
        <View style={styles.legendContainer}>
          {chartData.legend.map((label, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor:
                      datasets[index]?.color || `rgba(${index * 50}, 122, 255, 1)`,
                  },
                ]}
              />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default SensorChart;
