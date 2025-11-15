/**
 * LoadingIndicator Component
 * Phase 147: Loading indicator component
 *
 * Features:
 * - ActivityIndicator
 * - Overlay background
 * - Loading message
 * - Multiple sizes (small, medium, large)
 * - Customizable colors
 * - Modal or inline display
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ViewStyle,
} from 'react-native';

export type LoadingSize = 'small' | 'medium' | 'large';

interface LoadingIndicatorProps {
  /**
   * Whether to show loading indicator
   * @default false
   */
  visible?: boolean;

  /**
   * Loading message to display
   */
  message?: string;

  /**
   * Size of the loading indicator
   * @default 'medium'
   */
  size?: LoadingSize;

  /**
   * Color of the loading indicator
   * @default '#007AFF'
   */
  color?: string;

  /**
   * Whether to show as modal overlay
   * @default true
   */
  overlay?: boolean;

  /**
   * Background color of overlay
   * @default 'rgba(0, 0, 0, 0.5)'
   */
  overlayColor?: string;

  /**
   * Custom container style
   */
  style?: ViewStyle;
}

/**
 * Get ActivityIndicator size based on LoadingSize
 */
const getActivityIndicatorSize = (size: LoadingSize): 'small' | 'large' => {
  if (size === 'small') return 'small';
  return 'large';
};

/**
 * LoadingIndicator Component
 * Phase 147: Display loading state with indicator and message
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  visible = false,
  message,
  size = 'medium',
  color = '#007AFF',
  overlay = true,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  style,
}) => {
  // Don't render if not visible
  if (!visible) {
    return null;
  }

  const content = (
    <View
      style={[
        styles.container,
        overlay && styles.overlayContainer,
        overlay && { backgroundColor: overlayColor },
        style,
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator
          size={getActivityIndicatorSize(size)}
          color={color}
          style={[
            styles.indicator,
            size === 'small' && styles.indicatorSmall,
            size === 'large' && styles.indicatorLarge,
          ]}
        />
        {message ? (
          <Text style={[styles.message, overlay && styles.messageOverlay]}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );

  // Render as modal overlay
  if (overlay) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
      >
        {content}
      </Modal>
    );
  }

  // Render inline
  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  indicator: {
    marginBottom: 12,
  },
  indicatorSmall: {
    transform: [{ scale: 0.8 }],
  },
  indicatorLarge: {
    transform: [{ scale: 1.2 }],
  },
  message: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
  },
  messageOverlay: {
    color: '#000000',
  },
});

export default LoadingIndicator;

/**
 * Preset loading indicators for common use cases
 */
export const LoadingPresets = {
  /**
   * Small inline loading indicator
   */
  Small: (props: Partial<LoadingIndicatorProps>) => (
    <LoadingIndicator size="small" overlay={false} {...props} />
  ),

  /**
   * Medium overlay loading indicator (default)
   */
  Medium: (props: Partial<LoadingIndicatorProps>) => (
    <LoadingIndicator size="medium" overlay={true} {...props} />
  ),

  /**
   * Large overlay loading indicator
   */
  Large: (props: Partial<LoadingIndicatorProps>) => (
    <LoadingIndicator size="large" overlay={true} {...props} />
  ),

  /**
   * Fullscreen loading overlay
   */
  Fullscreen: (props: Partial<LoadingIndicatorProps>) => (
    <LoadingIndicator
      size="large"
      overlay={true}
      overlayColor="rgba(0, 0, 0, 0.7)"
      {...props}
    />
  ),
};
