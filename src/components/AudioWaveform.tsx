/**
 * AudioWaveform Component
 * Phase 185: 오디오 파형 시각화
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Text, Card, ActivityIndicator} from 'react-native-paper';
import Svg, {Line} from 'react-native-svg';

interface AudioWaveformProps {
  filePath: string;
  duration: number;
  sampleCount?: number;
}

export function AudioWaveform({
  filePath,
  duration,
  sampleCount = 100,
}: AudioWaveformProps) {
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateWaveform();
  }, [filePath]);

  const generateWaveform = async () => {
    setIsLoading(true);
    try {
      // Simulated waveform data
      // In production, you would read the actual audio file and extract PCM data
      const simulatedData: number[] = [];
      for (let i = 0; i < sampleCount; i++) {
        // Generate pseudo-random waveform
        const amplitude = Math.sin(i / 10) * 0.5 + Math.random() * 0.5;
        simulatedData.push(amplitude);
      }
      setWaveformData(simulatedData);
    } catch (error) {
      console.error('Failed to generate waveform:', error);
      // Generate fallback data
      setWaveformData(new Array(sampleCount).fill(0.5));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" />
            <Text variant="bodySmall" style={styles.loadingText}>
              파형 생성 중...
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  const width = Dimensions.get('window').width - 48; // Card padding
  const height = 100;
  const barWidth = width / sampleCount;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleSmall">오디오 파형</Text>
          <Text variant="bodySmall" style={styles.durationText}>
            {Math.floor(duration / 1000)}초
          </Text>
        </View>

        <View style={styles.waveformContainer}>
          <Svg width={width} height={height}>
            {waveformData.map((amplitude, index) => {
              const x = index * barWidth;
              const barHeight = amplitude * height * 0.8;
              const y1 = (height - barHeight) / 2;
              const y2 = y1 + barHeight;

              return (
                <Line
                  key={index}
                  x1={x}
                  y1={y1}
                  x2={x}
                  y2={y2}
                  stroke="#2196F3"
                  strokeWidth={Math.max(1, barWidth * 0.8)}
                  strokeLinecap="round"
                />
              );
            })}
          </Svg>
        </View>

        <View style={styles.timeline}>
          <Text variant="bodySmall" style={styles.timelineText}>
            0s
          </Text>
          <Text variant="bodySmall" style={styles.timelineText}>
            {(duration / 2000).toFixed(1)}s
          </Text>
          <Text variant="bodySmall" style={styles.timelineText}>
            {(duration / 1000).toFixed(1)}s
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationText: {
    color: '#666',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  waveformContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  timelineText: {
    color: '#999',
    fontSize: 10,
  },
});

export default AudioWaveform;
