/**
 * Accessibility Utilities
 * Phase 155: Accessibility helpers and constants
 *
 * Features:
 * - Accessibility labels
 * - Accessibility hints
 * - Screen reader support
 * - Focus management
 */

import { AccessibilityRole, AccessibilityState } from 'react-native';

/**
 * Accessibility roles
 */
export const A11yRoles = {
  BUTTON: 'button' as AccessibilityRole,
  HEADER: 'header' as AccessibilityRole,
  LINK: 'link' as AccessibilityRole,
  IMAGE: 'image' as AccessibilityRole,
  TEXT: 'text' as AccessibilityRole,
  SEARCH: 'search' as AccessibilityRole,
  CHECKBOX: 'checkbox' as AccessibilityRole,
  RADIO: 'radio' as AccessibilityRole,
  SWITCH: 'switch' as AccessibilityRole,
  TAB: 'tab' as AccessibilityRole,
  MENU: 'menu' as AccessibilityRole,
  MENUITEM: 'menuitem' as AccessibilityRole,
  ALERT: 'alert' as AccessibilityRole,
};

/**
 * Create accessibility props for a button
 */
export const createButtonA11y = (label: string, hint?: string) => ({
  accessible: true,
  accessibilityRole: A11yRoles.BUTTON,
  accessibilityLabel: label,
  ...(hint && { accessibilityHint: hint }),
});

/**
 * Create accessibility props for a header
 */
export const createHeaderA11y = (label: string, level: number = 1) => ({
  accessible: true,
  accessibilityRole: A11yRoles.HEADER,
  accessibilityLabel: label,
  accessibilityLevel: level,
});

/**
 * Create accessibility props for a link
 */
export const createLinkA11y = (label: string, hint?: string) => ({
  accessible: true,
  accessibilityRole: A11yRoles.LINK,
  accessibilityLabel: label,
  ...(hint && { accessibilityHint: hint }),
});

/**
 * Create accessibility props for an image
 */
export const createImageA11y = (label: string, decorative: boolean = false) => {
  if (decorative) {
    return {
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants' as const,
    };
  }

  return {
    accessible: true,
    accessibilityRole: A11yRoles.IMAGE,
    accessibilityLabel: label,
  };
};

/**
 * Create accessibility props for a checkbox
 */
export const createCheckboxA11y = (
  label: string,
  checked: boolean,
  hint?: string
) => ({
  accessible: true,
  accessibilityRole: A11yRoles.CHECKBOX,
  accessibilityLabel: label,
  accessibilityState: { checked },
  ...(hint && { accessibilityHint: hint }),
});

/**
 * Create accessibility props for a switch
 */
export const createSwitchA11y = (
  label: string,
  checked: boolean,
  hint?: string
) => ({
  accessible: true,
  accessibilityRole: A11yRoles.SWITCH,
  accessibilityLabel: label,
  accessibilityState: { checked },
  ...(hint && { accessibilityHint: hint }),
});

/**
 * Create accessibility props for disabled element
 */
export const createDisabledA11y = (label: string, role: AccessibilityRole) => ({
  accessible: true,
  accessibilityRole: role,
  accessibilityLabel: label,
  accessibilityState: { disabled: true },
});

/**
 * Create accessibility props for selected element
 */
export const createSelectedA11y = (
  label: string,
  role: AccessibilityRole,
  selected: boolean
) => ({
  accessible: true,
  accessibilityRole: role,
  accessibilityLabel: label,
  accessibilityState: { selected },
});

/**
 * Accessibility announcement
 */
export const announceForAccessibility = (message: string) => {
  // Import AccessibilityInfo only when needed
  const { AccessibilityInfo } = require('react-native');
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  const { AccessibilityInfo } = require('react-native');
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.error('Failed to check screen reader status:', error);
    return false;
  }
};

/**
 * Accessibility guidelines
 */
export const A11yGuidelines = {
  /**
   * Minimum touch target size (44x44 points)
   */
  MINIMUM_TOUCH_SIZE: 44,

  /**
   * Recommended touch target size (48x48 points)
   */
  RECOMMENDED_TOUCH_SIZE: 48,

  /**
   * Minimum font size for body text
   */
  MINIMUM_FONT_SIZE: 14,

  /**
   * Minimum contrast ratio for normal text
   */
  MINIMUM_CONTRAST_NORMAL: 4.5,

  /**
   * Minimum contrast ratio for large text
   */
  MINIMUM_CONTRAST_LARGE: 3,
};

/**
 * Accessibility labels for common elements
 */
export const CommonA11yLabels = {
  // Navigation
  HOME_TAB: '홈 탭',
  RECORDING_TAB: '녹화 탭',
  SESSIONS_TAB: '세션 탭',
  SETTINGS_TAB: '설정 탭',
  BACK_BUTTON: '뒤로 가기',
  CLOSE_BUTTON: '닫기',
  MENU_BUTTON: '메뉴',

  // Actions
  SAVE_BUTTON: '저장',
  DELETE_BUTTON: '삭제',
  EDIT_BUTTON: '편집',
  CANCEL_BUTTON: '취소',
  CONFIRM_BUTTON: '확인',
  RETRY_BUTTON: '다시 시도',

  // Recording
  START_RECORDING: '녹화 시작',
  STOP_RECORDING: '녹화 중지',
  PAUSE_RECORDING: '녹화 일시정지',
  RESUME_RECORDING: '녹화 재개',

  // Common
  LOADING: '로딩 중',
  SEARCH: '검색',
  FILTER: '필터',
  SORT: '정렬',
};

/**
 * Accessibility hints for common actions
 */
export const CommonA11yHints = {
  BUTTON_TAP: '두 번 탭하여 활성화',
  BUTTON_NAVIGATE: '두 번 탭하여 이동',
  BUTTON_OPEN: '두 번 탭하여 열기',
  BUTTON_CLOSE: '두 번 탭하여 닫기',
  SWITCH_TOGGLE: '두 번 탭하여 전환',
  CHECKBOX_TOGGLE: '두 번 탭하여 선택/해제',
  INPUT_EDIT: '두 번 탭하여 편집',
};

export default {
  A11yRoles,
  createButtonA11y,
  createHeaderA11y,
  createLinkA11y,
  createImageA11y,
  createCheckboxA11y,
  createSwitchA11y,
  createDisabledA11y,
  createSelectedA11y,
  announceForAccessibility,
  isScreenReaderEnabled,
  A11yGuidelines,
  CommonA11yLabels,
  CommonA11yHints,
};
