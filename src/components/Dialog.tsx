/**
 * Dialog Component
 * Phase 150: Dialog/Modal component
 *
 * Features:
 * - Title, content, and buttons
 * - Confirm/Cancel dialogs
 * - Custom actions
 * - Alert style
 * - Action sheet style
 * - Customizable styling
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ViewStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export type DialogType = 'alert' | 'confirm' | 'custom';

export interface DialogButton {
  /**
   * Button text
   */
  text: string;

  /**
   * Button style
   */
  style?: 'default' | 'cancel' | 'destructive';

  /**
   * Button press handler
   */
  onPress?: () => void;
}

interface DialogProps {
  /**
   * Whether to show the dialog
   * @default false
   */
  visible?: boolean;

  /**
   * Dialog type
   * @default 'alert'
   */
  type?: DialogType;

  /**
   * Dialog title
   */
  title?: string;

  /**
   * Dialog message/content
   */
  message?: string;

  /**
   * Custom content component
   */
  content?: React.ReactNode;

  /**
   * Dialog buttons
   */
  buttons?: DialogButton[];

  /**
   * Icon name to display
   */
  icon?: string;

  /**
   * Icon color
   */
  iconColor?: string;

  /**
   * Callback when dialog is dismissed
   */
  onDismiss?: () => void;

  /**
   * Whether to close on backdrop press
   * @default true
   */
  closeOnBackdrop?: boolean;

  /**
   * Custom container style
   */
  style?: ViewStyle;
}

/**
 * Dialog Component
 * Phase 150: Display modal dialogs with customizable content and actions
 */
const Dialog: React.FC<DialogProps> = ({
  visible = false,
  type = 'alert',
  title,
  message,
  content,
  buttons = [],
  icon,
  iconColor = '#007AFF',
  onDismiss,
  closeOnBackdrop = true,
  style,
}) => {
  /**
   * Handle backdrop press
   */
  const handleBackdropPress = () => {
    if (closeOnBackdrop && onDismiss) {
      onDismiss();
    }
  };

  /**
   * Handle button press
   */
  const handleButtonPress = (button: DialogButton) => {
    button.onPress?.();
    if (button.style !== 'cancel' || !onDismiss) {
      // Close dialog unless it's a cancel button and onDismiss exists
    }
  };

  /**
   * Get button style based on button type
   */
  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'cancel':
        return styles.buttonCancel;
      case 'destructive':
        return styles.buttonDestructive;
      default:
        return styles.buttonDefault;
    }
  };

  /**
   * Get button text style based on button type
   */
  const getButtonTextStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'cancel':
        return styles.buttonTextCancel;
      case 'destructive':
        return styles.buttonTextDestructive;
      default:
        return styles.buttonTextDefault;
    }
  };

  // Default buttons if none provided
  const dialogButtons: DialogButton[] =
    buttons.length > 0
      ? buttons
      : [
          {
            text: '확인',
            style: 'default',
            onPress: onDismiss,
          },
        ];

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, style]}>
              {/* Icon */}
              {icon ? (
                <View style={styles.iconContainer}>
                  <Icon name={icon} size={48} color={iconColor} />
                </View>
              ) : null}

              {/* Title */}
              {title ? <Text style={styles.title}>{title}</Text> : null}

              {/* Message */}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              {/* Custom Content */}
              {content ? <View style={styles.content}>{content}</View> : null}

              {/* Buttons */}
              <View
                style={[
                  styles.buttonsContainer,
                  dialogButtons.length > 2 && styles.buttonsContainerVertical,
                ]}
              >
                {dialogButtons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      getButtonStyle(button.style),
                      dialogButtons.length > 2 && styles.buttonVertical,
                      index < dialogButtons.length - 1 &&
                        dialogButtons.length <= 2 &&
                        styles.buttonMarginRight,
                    ]}
                    onPress={() => handleButtonPress(button)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        getButtonTextStyle(button.style),
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  content: {
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonsContainerVertical: {
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonVertical: {
    marginBottom: 8,
  },
  buttonMarginRight: {
    marginRight: 8,
  },
  buttonDefault: {
    backgroundColor: '#007AFF',
  },
  buttonCancel: {
    backgroundColor: '#E5E5EA',
  },
  buttonDestructive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDefault: {
    color: '#FFFFFF',
  },
  buttonTextCancel: {
    color: '#000000',
  },
  buttonTextDestructive: {
    color: '#FFFFFF',
  },
});

export default Dialog;

/**
 * Dialog utility functions
 * Phase 150: Helper functions to show dialogs
 */
export class DialogManager {
  private static currentDialog: {
    show: (props: DialogProps) => void;
    hide: () => void;
  } | null = null;

  /**
   * Register dialog manager
   */
  static register(manager: {
    show: (props: DialogProps) => void;
    hide: () => void;
  }) {
    this.currentDialog = manager;
  }

  /**
   * Show alert dialog
   */
  static alert(
    title: string,
    message: string,
    onConfirm?: () => void
  ): void {
    this.currentDialog?.show({
      type: 'alert',
      title,
      message,
      buttons: [
        {
          text: '확인',
          style: 'default',
          onPress: onConfirm,
        },
      ],
    });
  }

  /**
   * Show confirm dialog
   */
  static confirm(
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ): void {
    this.currentDialog?.show({
      type: 'confirm',
      title,
      message,
      buttons: [
        {
          text: '취소',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: '확인',
          style: 'default',
          onPress: onConfirm,
        },
      ],
    });
  }

  /**
   * Show custom dialog
   */
  static show(props: DialogProps): void {
    this.currentDialog?.show(props);
  }

  /**
   * Hide current dialog
   */
  static hide(): void {
    this.currentDialog?.hide();
  }
}
