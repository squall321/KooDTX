/**
 * SplashScreen Component
 * Phase 146: Splash screen for app initialization
 *
 * Features:
 * - Display app logo and name
 * - Loading animation
 * - Auto-hide after initialization
 * - Fade out animation
 * - Customizable duration
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface SplashScreenProps {
  /**
   * Callback when splash screen animation completes
   */
  onAnimationEnd?: () => void;

  /**
   * Duration to show splash screen (ms)
   * @default 2000
   */
  duration?: number;

  /**
   * Whether to show splash screen
   * @default true
   */
  visible?: boolean;
}

const { width, height } = Dimensions.get('window');

/**
 * SplashScreen Component
 * Phase 146: Display splash screen during app initialization
 */
const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationEnd,
  duration = 2000,
  visible = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    // Logo scale in animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Rotation animation for loading indicator
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Fade out animation after duration
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onAnimationEnd?.();
      });
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [visible, duration, fadeAnim, scaleAnim, rotateAnim, onAnimationEnd]);

  if (!visible) {
    return null;
  }

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Icon name="mic-circle" size={100} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>KooDTX</Text>
        <Text style={styles.appTagline}>센서 데이터 수집 및 동기화</Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingSpinner,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Icon name="sync-outline" size={32} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0</Text>
        <Text style={styles.copyrightText}>© 2025 KooDTX</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default SplashScreen;
