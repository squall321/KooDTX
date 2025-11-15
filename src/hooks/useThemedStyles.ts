/**
 * useThemedStyles Hook
 * Phase 153: Hook for creating theme-aware styles
 *
 * Features:
 * - Type-safe themed styles
 * - Automatic re-render on theme change
 * - Easy style creation
 */

import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

/**
 * useThemedStyles Hook
 * Phase 153: Create styles that respond to theme changes
 *
 * @param styleCreator Function that creates styles based on colors
 * @returns StyleSheet styles
 *
 * @example
 * ```tsx
 * const styles = useThemedStyles((colors) => ({
 *   container: {
 *     backgroundColor: colors.background,
 *   },
 *   text: {
 *     color: colors.text,
 *   },
 * }));
 * ```
 */
export const useThemedStyles = <T extends NamedStyles<T>>(
  styleCreator: (colors: ReturnType<typeof useThemeStore>['colors']) => T
): T => {
  const colors = useThemeStore((state) => state.colors);

  const styles = useMemo(() => {
    return StyleSheet.create(styleCreator(colors));
  }, [colors, styleCreator]);

  return styles;
};

export default useThemedStyles;
