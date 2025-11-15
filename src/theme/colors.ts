/**
 * Theme Colors
 * Phase 153: Color definitions for light and dark themes
 *
 * Features:
 * - Light theme colors
 * - Dark theme colors
 * - Semantic color names
 * - Type-safe color access
 */

/**
 * Light theme colors
 */
export const lightColors = {
  // Primary colors
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D5',

  // Secondary colors
  secondary: '#5856D6',
  secondaryLight: '#AF52DE',
  secondaryDark: '#3A3799',

  // Success, Warning, Error
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#E5E5EA',

  // Surface colors
  surface: '#FFFFFF',
  surfaceSecondary: '#F9F9F9',
  surfaceTertiary: '#F2F2F7',

  // Text colors
  text: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#8E8E93',
  textDisabled: '#C7C7CC',

  // Border colors
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  borderDark: '#D1D1D6',

  // Card colors
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.1)',

  // Status bar
  statusBar: '#F2F2F7',

  // Tab bar
  tabBar: '#FFFFFF',
  tabBarActive: '#007AFF',
  tabBarInactive: '#8E8E93',

  // Input colors
  inputBackground: '#FFFFFF',
  inputBorder: '#E5E5EA',
  inputPlaceholder: '#8E8E93',
  inputText: '#000000',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Dark theme colors
 */
export const darkColors = {
  // Primary colors
  primary: '#0A84FF',
  primaryLight: '#64D2FF',
  primaryDark: '#0056B3',

  // Secondary colors
  secondary: '#5E5CE6',
  secondaryLight: '#BF5AF2',
  secondaryDark: '#4A48A0',

  // Success, Warning, Error
  success: '#32D74B',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',

  // Background colors
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundTertiary: '#2C2C2E',

  // Surface colors
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  surfaceTertiary: '#3A3A3C',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#8E8E93',
  textDisabled: '#48484A',

  // Border colors
  border: '#38383A',
  borderLight: '#48484A',
  borderDark: '#2C2C2E',

  // Card colors
  card: '#1C1C1E',
  cardShadow: 'rgba(0, 0, 0, 0.3)',

  // Status bar
  statusBar: '#1C1C1E',

  // Tab bar
  tabBar: '#1C1C1E',
  tabBarActive: '#0A84FF',
  tabBarInactive: '#8E8E93',

  // Input colors
  inputBackground: '#1C1C1E',
  inputBorder: '#38383A',
  inputPlaceholder: '#8E8E93',
  inputText: '#FFFFFF',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',
};

/**
 * Common colors (used in both themes)
 */
export const commonColors = {
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',

  // Grays
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Additional utility colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',
};

/**
 * Color types
 */
export type LightColors = typeof lightColors;
export type DarkColors = typeof darkColors;
export type CommonColors = typeof commonColors;
export type Colors = LightColors & CommonColors;

export default {
  light: { ...lightColors, ...commonColors },
  dark: { ...darkColors, ...commonColors },
  common: commonColors,
};
