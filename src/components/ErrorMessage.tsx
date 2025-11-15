/**
 * ErrorMessage Component
 * Phase 148: Error message display component
 *
 * Features:
 * - Error message display
 * - Retry button
 * - Close button
 * - Different error types (error, warning, info)
 * - Inline or card display
 * - Icon support
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export type ErrorType = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  /**
   * Error message to display
   */
  message: string;

  /**
   * Error title (optional)
   */
  title?: string;

  /**
   * Type of error
   * @default 'error'
   */
  type?: ErrorType;

  /**
   * Whether to show the component
   * @default true
   */
  visible?: boolean;

  /**
   * Show retry button
   * @default false
   */
  showRetry?: boolean;

  /**
   * Retry button text
   * @default '다시 시도'
   */
  retryText?: string;

  /**
   * Show close button
   * @default true
   */
  showClose?: boolean;

  /**
   * Callback when retry button is pressed
   */
  onRetry?: () => void;

  /**
   * Callback when close button is pressed
   */
  onClose?: () => void;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Whether to show as card (with shadow)
   * @default true
   */
  card?: boolean;
}

/**
 * Get icon name based on error type
 */
const getIconName = (type: ErrorType): string => {
  switch (type) {
    case 'error':
      return 'alert-circle';
    case 'warning':
      return 'warning';
    case 'info':
      return 'information-circle';
    default:
      return 'alert-circle';
  }
};

/**
 * Get color based on error type
 */
const getColor = (type: ErrorType): string => {
  switch (type) {
    case 'error':
      return '#FF3B30';
    case 'warning':
      return '#FF9500';
    case 'info':
      return '#007AFF';
    default:
      return '#FF3B30';
  }
};

/**
 * Get background color based on error type
 */
const getBackgroundColor = (type: ErrorType): string => {
  switch (type) {
    case 'error':
      return '#FFF5F5';
    case 'warning':
      return '#FFF9F0';
    case 'info':
      return '#F0F8FF';
    default:
      return '#FFF5F5';
  }
};

/**
 * ErrorMessage Component
 * Phase 148: Display error messages with retry and close options
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
  type = 'error',
  visible = true,
  showRetry = false,
  retryText = '다시 시도',
  showClose = true,
  onRetry,
  onClose,
  style,
  card = true,
}) => {
  // Don't render if not visible or no message
  if (!visible || !message) {
    return null;
  }

  const iconName = getIconName(type);
  const color = getColor(type);
  const backgroundColor = getBackgroundColor(type);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        card && styles.card,
        style,
      ]}
    >
      {/* Icon and Content */}
      <View style={styles.content}>
        <Icon name={iconName} size={24} color={color} style={styles.icon} />

        <View style={styles.textContainer}>
          {title ? (
            <Text style={[styles.title, { color }]}>{title}</Text>
          ) : null}
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* Close Button */}
        {showClose && onClose ? (
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={20} color={color} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Retry Button */}
      {showRetry && onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retryButton, { borderColor: color }]}
        >
          <Icon name="refresh" size={16} color={color} style={styles.retryIcon} />
          <Text style={[styles.retryText, { color }]}>{retryText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  retryIcon: {
    marginRight: 6,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorMessage;

/**
 * Preset error messages for common use cases
 */
export const ErrorPresets = {
  /**
   * Network error
   */
  Network: (props: Partial<ErrorMessageProps>) => (
    <ErrorMessage
      type="error"
      title="네트워크 오류"
      message="인터넷 연결을 확인해주세요."
      showRetry={true}
      {...props}
    />
  ),

  /**
   * Server error
   */
  Server: (props: Partial<ErrorMessageProps>) => (
    <ErrorMessage
      type="error"
      title="서버 오류"
      message="서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      showRetry={true}
      {...props}
    />
  ),

  /**
   * Not found error
   */
  NotFound: (props: Partial<ErrorMessageProps>) => (
    <ErrorMessage
      type="warning"
      title="찾을 수 없음"
      message="요청하신 데이터를 찾을 수 없습니다."
      {...props}
    />
  ),

  /**
   * Permission error
   */
  Permission: (props: Partial<ErrorMessageProps>) => (
    <ErrorMessage
      type="warning"
      title="권한 필요"
      message="이 기능을 사용하려면 권한이 필요합니다."
      {...props}
    />
  ),

  /**
   * Generic error
   */
  Generic: (props: Partial<ErrorMessageProps>) => (
    <ErrorMessage
      type="error"
      title="오류"
      message="오류가 발생했습니다."
      showRetry={true}
      {...props}
    />
  ),
};
