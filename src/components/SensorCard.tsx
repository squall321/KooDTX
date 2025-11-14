import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export type SensorType = 'accelerometer' | 'gyroscope' | 'magnetometer' | 'gps' | 'audio';

export interface SensorData {
  x?: number;
  y?: number;
  z?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  decibel?: number;
  timestamp: number;
}

export interface SensorCardProps {
  sensorType: SensorType;
  data?: SensorData;
  isActive?: boolean;
  showGraph?: boolean;
  style?: ViewStyle;
}

interface SensorConfig {
  icon: string;
  label: string;
  color: string;
  unit: string;
}

const SENSOR_CONFIGS: Record<SensorType, SensorConfig> = {
  accelerometer: {
    icon: 'speedometer',
    label: '가속도계',
    color: '#007AFF',
    unit: 'm/s²',
  },
  gyroscope: {
    icon: 'sync',
    label: '자이로스코프',
    color: '#34C759',
    unit: 'rad/s',
  },
  magnetometer: {
    icon: 'magnet',
    label: '자기계',
    color: '#FF9500',
    unit: 'μT',
  },
  gps: {
    icon: 'navigate',
    label: 'GPS',
    color: '#FF3B30',
    unit: '°',
  },
  audio: {
    icon: 'mic',
    label: '오디오',
    color: '#AF52DE',
    unit: 'dB',
  },
};

export const SensorCard: React.FC<SensorCardProps> = ({
  sensorType,
  data,
  isActive = false,
  showGraph = false,
  style,
}) => {
  const config = SENSOR_CONFIGS[sensorType];
  const animatedValue = useMemo(() => new Animated.Value(isActive ? 1 : 0), []);

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isActive, animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#F8F9FA'],
  });

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E5EA', config.color],
  });

  const renderXYZValues = () => {
    if (!data || (!('x' in data) || data.x === undefined)) {
      return (
        <View style={styles.valuesContainer}>
          <Text style={styles.noDataText}>데이터 없음</Text>
        </View>
      );
    }

    return (
      <View style={styles.valuesContainer}>
        <View style={styles.valueItem}>
          <Text style={styles.valueLabel}>X</Text>
          <Text style={[styles.valueText, { color: config.color }]}>
            {data.x.toFixed(3)}
          </Text>
          <Text style={styles.unitText}>{config.unit}</Text>
        </View>
        <View style={styles.valueItem}>
          <Text style={styles.valueLabel}>Y</Text>
          <Text style={[styles.valueText, { color: config.color }]}>
            {data.y?.toFixed(3) ?? 'N/A'}
          </Text>
          <Text style={styles.unitText}>{config.unit}</Text>
        </View>
        <View style={styles.valueItem}>
          <Text style={styles.valueLabel}>Z</Text>
          <Text style={[styles.valueText, { color: config.color }]}>
            {data.z?.toFixed(3) ?? 'N/A'}
          </Text>
          <Text style={styles.unitText}>{config.unit}</Text>
        </View>
      </View>
    );
  };

  const renderGPSValues = () => {
    if (!data || !('latitude' in data) || data.latitude === undefined) {
      return (
        <View style={styles.valuesContainer}>
          <Text style={styles.noDataText}>데이터 없음</Text>
        </View>
      );
    }

    return (
      <View style={styles.valuesContainer}>
        <View style={styles.gpsItem}>
          <Text style={styles.valueLabel}>위도</Text>
          <Text style={[styles.valueText, { color: config.color }]}>
            {data.latitude.toFixed(6)}°
          </Text>
        </View>
        <View style={styles.gpsItem}>
          <Text style={styles.valueLabel}>경도</Text>
          <Text style={[styles.valueText, { color: config.color }]}>
            {data.longitude?.toFixed(6) ?? 'N/A'}°
          </Text>
        </View>
        {data.altitude !== undefined && (
          <View style={styles.gpsItem}>
            <Text style={styles.valueLabel}>고도</Text>
            <Text style={[styles.valueText, { color: config.color }]}>
              {data.altitude.toFixed(1)}m
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderAudioValues = () => {
    if (!data || !('decibel' in data) || data.decibel === undefined) {
      return (
        <View style={styles.valuesContainer}>
          <Text style={styles.noDataText}>데이터 없음</Text>
        </View>
      );
    }

    const decibelLevel = Math.min(100, Math.max(0, data.decibel));

    return (
      <View style={styles.valuesContainer}>
        <View style={styles.audioContainer}>
          <Text style={[styles.decibelText, { color: config.color }]}>
            {data.decibel.toFixed(1)} dB
          </Text>
          <View style={styles.audioLevelContainer}>
            <View
              style={[
                styles.audioLevelBar,
                {
                  width: `${decibelLevel}%`,
                  backgroundColor: config.color,
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderValues = () => {
    switch (sensorType) {
      case 'gps':
        return renderGPSValues();
      case 'audio':
        return renderAudioValues();
      default:
        return renderXYZValues();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Icon name={config.icon} size={24} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.sensorLabel}>{config.label}</Text>
          <Text style={styles.sensorType}>{sensorType.toUpperCase()}</Text>
        </View>
        {isActive && (
          <View style={[styles.activeIndicator, { backgroundColor: config.color }]} />
        )}
      </View>

      {/* Values */}
      {renderValues()}

      {/* Graph placeholder */}
      {showGraph && (
        <View style={styles.graphContainer}>
          <Text style={styles.graphPlaceholder}>그래프 (준비 중)</Text>
        </View>
      )}

      {/* Timestamp */}
      {data && (
        <Text style={styles.timestamp}>
          {new Date(data.timestamp).toLocaleTimeString('ko-KR')}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  sensorLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  sensorType: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  valuesContainer: {
    marginBottom: 12,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    width: 20,
    marginRight: 8,
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 4,
  },
  unitText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  noDataText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  gpsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  audioContainer: {
    alignItems: 'center',
  },
  decibelText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  audioLevelContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  audioLevelBar: {
    height: '100%',
    borderRadius: 4,
  },
  graphContainer: {
    height: 100,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  graphPlaceholder: {
    fontSize: 12,
    color: '#8E8E93',
  },
  timestamp: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'right',
  },
});

export default SensorCard;
