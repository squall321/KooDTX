/**
 * Toast Component
 * Phase 149: Toast notification component
 *
 * Features:
 * - Success/Error/Info/Warning messages
 * - Custom styling
 * - Auto-hide
 * - Swipe to dismiss
 * - Position control (top/bottom)
 * - Icon support
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import ToastMessage, {
  BaseToast,
  ErrorToast,
  InfoToast,
  BaseToastProps,
} from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * Custom Toast configurations
 * Phase 149: iOS-style toast designs
 */
export const toastConfig = {
  /**
   * Success toast
   */
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Icon name="checkmark-circle" size={24} color="#34C759" />
        </View>
      )}
    />
  ),

  /**
   * Error toast
   */
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Icon name="close-circle" size={24} color="#FF3B30" />
        </View>
      )}
    />
  ),

  /**
   * Info toast
   */
  info: (props: BaseToastProps) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Icon name="information-circle" size={24} color="#007AFF" />
        </View>
      )}
    />
  ),

  /**
   * Warning toast
   */
  warning: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={styles.warningToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Icon name="warning" size={24} color="#FF9500" />
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#34C759',
    borderLeftWidth: 6,
    backgroundColor: '#FFFFFF',
    height: 70,
  },
  errorToast: {
    borderLeftColor: '#FF3B30',
    borderLeftWidth: 6,
    backgroundColor: '#FFFFFF',
    height: 70,
  },
  infoToast: {
    borderLeftColor: '#007AFF',
    borderLeftWidth: 6,
    backgroundColor: '#FFFFFF',
    height: 70,
  },
  warningToast: {
    borderLeftColor: '#FF9500',
    borderLeftWidth: 6,
    backgroundColor: '#FFFFFF',
    height: 70,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
  },
  text1: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  text2: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
});

/**
 * Toast Component
 * Phase 149: Wrapper component for toast message
 */
const Toast: React.FC = () => {
  return <ToastMessage config={toastConfig} />;
};

export default Toast;

/**
 * Toast utility functions
 * Phase 149: Helper functions to show toasts
 */
export const toast = {
  /**
   * Show success toast
   */
  success: (message: string, description?: string) => {
    ToastMessage.show({
      type: 'success',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, description?: string) => {
    ToastMessage.show({
      type: 'error',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, description?: string) => {
    ToastMessage.show({
      type: 'info',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
    });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, description?: string) => {
    ToastMessage.show({
      type: 'warning',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 60,
    });
  },

  /**
   * Hide current toast
   */
  hide: () => {
    ToastMessage.hide();
  },
};
