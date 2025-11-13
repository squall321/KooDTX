/**
 * AudioVisualizer Component
 * Phase 95: Real-time audio recording visualization
 *
 * Features:
 * - Real-time dB level display
 * - Visual level meter with animation
 * - Recording timer
 * - Peak level indicator
 * - Silence detection indicator
 * - Waveform-style animation
 */

import React, {useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {
  useAudioLevels,
  useAudioSessionDuration,
  useIsAudioRecording,
  useIsAudioPaused,
} from '@store';

interface AudioVisualizerProps {
  /**
   * Show detailed information
   */
  showDetails?: boolean;

  /**
   * Show waveform animation
   */
  showWaveform?: boolean;

  /**
   * Maximum height of the visualizer
   */
  maxHeight?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  showDetails = true,
  showWaveform = true,
  maxHeight = 200,
}) => {
  // Audio state from store
  const audioLevels = useAudioLevels();
  const duration = useAudioSessionDuration();
  const isRecording = useIsAudioRecording();
  const isPaused = useIsAudioPaused();

  // Animation values
  const levelAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveformAnimations = useRef(
    Array.from({length: 20}, () => new Animated.Value(0)),
  ).current;

  // Local state
  const [displayedDb, setDisplayedDb] = useState(audioLevels.currentDbLevel);

  /**
   * Format duration to MM:SS or HH:MM:SS
   */
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  /**
   * Convert dB to percentage (0-100)
   * dB range: -96 to 0
   */
  const dbToPercentage = (db: number): number => {
    const normalized = (db + 96) / 96; // Normalize -96~0 to 0~1
    return Math.max(0, Math.min(100, normalized * 100));
  };

  /**
   * Get color based on dB level
   */
  const getLevelColor = (db: number): string => {
    if (db > -20) return '#FF5722'; // Red - Very loud
    if (db > -40) return '#FF9800'; // Orange - Loud
    if (db > -60) return '#4CAF50'; // Green - Good
    if (db > -80) return '#2196F3'; // Blue - Quiet
    return '#9E9E9E'; // Gray - Very quiet/silence
  };

  /**
   * Animate level meter
   */
  useEffect(() => {
    const percentage = dbToPercentage(audioLevels.currentDbLevel);

    Animated.spring(levelAnimation, {
      toValue: percentage,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();

    // Smooth dB display update
    setDisplayedDb(audioLevels.currentDbLevel);
  }, [audioLevels.currentDbLevel, levelAnimation]);

  /**
   * Pulse animation when recording
   */
  useEffect(() => {
    if (isRecording && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isRecording, isPaused, pulseAnimation]);

  /**
   * Waveform animation
   */
  useEffect(() => {
    if (!showWaveform) return;

    const animations = waveformAnimations.map((anim, index) => {
      const intensity = isRecording && !isPaused ? audioLevels.currentRmsLevel : 0;
      const delay = index * 50;

      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: intensity * (0.5 + Math.random() * 0.5),
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]),
      );
    });

    Animated.parallel(animations).start();
  }, [
    audioLevels.currentRmsLevel,
    isRecording,
    isPaused,
    showWaveform,
    waveformAnimations,
  ]);

  const levelColor = getLevelColor(audioLevels.currentDbLevel);
  const levelPercentage = dbToPercentage(audioLevels.currentDbLevel);
  const peakPercentage = dbToPercentage(audioLevels.peakDbLevel);

  return (
    <View style={styles.container}>
      {/* Recording Timer */}
      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.recordingIndicator,
            {
              transform: [{scale: pulseAnimation}],
              backgroundColor: isPaused ? '#FF9800' : '#FF5722',
            },
          ]}
        />
        <Text style={styles.timerText}>{formatDuration(duration)}</Text>
      </View>

      {/* dB Level Display */}
      <View style={styles.levelDisplay}>
        <Text style={[styles.dbValue, {color: levelColor}]}>
          {displayedDb.toFixed(1)} dB
        </Text>
        {audioLevels.isSilent && (
          <View style={styles.silentBadge}>
            <Text style={styles.silentText}>🔇 무음</Text>
          </View>
        )}
      </View>

      {/* Visual Level Meter */}
      <View style={[styles.meterContainer, {height: maxHeight}]}>
        {/* Background */}
        <View style={styles.meterBackground}>
          {/* Peak indicator */}
          <View
            style={[
              styles.peakIndicator,
              {
                bottom: `${peakPercentage}%`,
              },
            ]}
          />

          {/* Animated level bar */}
          <Animated.View
            style={[
              styles.meterBar,
              {
                height: levelAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: levelColor,
              },
            ]}
          />
        </View>

        {/* dB scale markers */}
        <View style={styles.scaleContainer}>
          <Text style={styles.scaleLabel}>0</Text>
          <Text style={styles.scaleLabel}>-20</Text>
          <Text style={styles.scaleLabel}>-40</Text>
          <Text style={styles.scaleLabel}>-60</Text>
          <Text style={styles.scaleLabel}>-80</Text>
        </View>
      </View>

      {/* Waveform Animation */}
      {showWaveform && (
        <View style={styles.waveformContainer}>
          {waveformAnimations.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['20%', '100%'],
                  }),
                  backgroundColor: levelColor,
                  opacity: 0.6,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Detailed Information */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>현재 레벨</Text>
            <Text style={[styles.detailValue, {color: levelColor}]}>
              {displayedDb.toFixed(1)} dB
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>최고 레벨</Text>
            <Text style={styles.detailValue}>
              {audioLevels.peakDbLevel.toFixed(1)} dB
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>RMS</Text>
            <Text style={styles.detailValue}>
              {audioLevels.currentRmsLevel.toFixed(3)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    fontVariant: ['tabular-nums'],
  },
  levelDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dbValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  silentBadge: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  silentText: {
    fontSize: 14,
    color: '#666666',
  },
  meterContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 16,
  },
  meterBackground: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  meterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 8,
  },
  peakIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF5722',
    zIndex: 10,
  },
  scaleContainer: {
    marginLeft: 8,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  scaleLabel: {
    fontSize: 10,
    color: '#999999',
    fontVariant: ['tabular-nums'],
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    marginBottom: 16,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
    alignSelf: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    fontVariant: ['tabular-nums'],
  },
  detailDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
});
