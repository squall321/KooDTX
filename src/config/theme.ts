/**
 * Material Design 3 Theme Configuration
 * Customizes React Native Paper theme for KooDTX app
 */

import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';

import type {MD3Theme} from 'react-native-paper';

/**
 * Custom color palette
 */
const colors = {
  primary: '#007AFF',
  primaryContainer: '#D0E4FF',
  secondary: '#5856D6',
  secondaryContainer: '#E8DEF8',
  tertiary: '#34C759',
  tertiaryContainer: '#D7FFE8',
  error: '#FF3B30',
  errorContainer: '#FFD8D8',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceVariant: '#E5E5EA',
  outline: '#8E8E93',
  outlineVariant: '#C7C7CC',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#001D36',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1D192B',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#002106',
  onError: '#FFFFFF',
  onErrorContainer: '#410002',
  onBackground: '#1A1C1E',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#42474E',
  inverseSurface: '#2E3133',
  inverseOnSurface: '#F0F0F3',
  inversePrimary: '#9ECAFF',
  shadow: '#000000',
  scrim: '#000000',
  backdrop: 'rgba(42, 46, 52, 0.4)',
};

const darkColors = {
  primary: '#9ECAFF',
  primaryContainer: '#004A77',
  secondary: '#BDB3FF',
  secondaryContainer: '#4A4458',
  tertiary: '#90FF9C',
  tertiaryContainer: '#005313',
  error: '#FFB4AB',
  errorContainer: '#93000A',
  background: '#1A1C1E',
  surface: '#1A1C1E',
  surfaceVariant: '#42474E',
  outline: '#8C9199',
  outlineVariant: '#42474E',
  onPrimary: '#003258',
  onPrimaryContainer: '#D0E4FF',
  onSecondary: '#322F41',
  onSecondaryContainer: '#E8DEF8',
  onTertiary: '#00390F',
  onTertiaryContainer: '#D7FFE8',
  onError: '#690005',
  onErrorContainer: '#FFD8D8',
  onBackground: '#E2E2E5',
  onSurface: '#E2E2E5',
  onSurfaceVariant: '#C2C7CF',
  inverseSurface: '#E2E2E5',
  inverseOnSurface: '#2E3133',
  inversePrimary: '#006398',
  shadow: '#000000',
  scrim: '#000000',
  backdrop: 'rgba(42, 46, 52, 0.4)',
};

/**
 * Light theme configuration
 */
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
  roundness: 2,
};

/**
 * Dark theme configuration
 */
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  roundness: 2,
};

/**
 * Get theme based on color scheme
 */
export const getTheme = (isDark: boolean): MD3Theme => {
  return isDark ? darkTheme : lightTheme;
};

/**
 * Spacing constants
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border radius constants
 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

/**
 * Font sizes
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * Font weights
 */
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
