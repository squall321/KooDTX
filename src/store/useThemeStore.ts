/**
 * Theme Store
 * Phase 153: Theme state management using Zustand
 *
 * Features:
 * - Light/Dark theme switching
 * - System theme detection
 * - Theme persistence
 * - Type-safe theme access
 */

import { create } from 'zustand';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, commonColors } from '../theme/colors';

const THEME_STORAGE_KEY = '@koodtx_theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

/**
 * Theme state interface
 */
interface ThemeState {
  // Current theme mode
  mode: ThemeMode;

  // Active theme (resolved from mode)
  activeTheme: ActiveTheme;

  // Colors based on active theme
  colors: typeof lightColors & typeof commonColors;

  // Actions
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  initializeTheme: () => Promise<void>;
  getSystemTheme: () => ActiveTheme;
}

/**
 * Get system theme preference
 */
const getSystemTheme = (): ActiveTheme => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

/**
 * Resolve active theme from mode
 */
const resolveActiveTheme = (mode: ThemeMode): ActiveTheme => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};

/**
 * Get colors for theme
 */
const getColors = (theme: ActiveTheme) => {
  return theme === 'dark'
    ? { ...darkColors, ...commonColors }
    : { ...lightColors, ...commonColors };
};

/**
 * Theme Store
 * Phase 153: Zustand-based theme management
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  activeTheme: getSystemTheme(),
  colors: getColors(getSystemTheme()),

  /**
   * Set theme mode
   */
  setTheme: async (mode: ThemeMode) => {
    try {
      // Save to storage
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);

      // Resolve active theme
      const activeTheme = resolveActiveTheme(mode);

      // Update state
      set({
        mode,
        activeTheme,
        colors: getColors(activeTheme),
      });

      console.log(`Theme set to: ${mode} (active: ${activeTheme})`);
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  },

  /**
   * Toggle between light and dark
   */
  toggleTheme: async () => {
    const currentMode = get().mode;

    // If system mode, toggle to opposite of current system theme
    if (currentMode === 'system') {
      const systemTheme = getSystemTheme();
      const newMode: ThemeMode = systemTheme === 'dark' ? 'light' : 'dark';
      await get().setTheme(newMode);
    } else {
      // Toggle between light and dark
      const newMode: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
      await get().setTheme(newMode);
    }
  },

  /**
   * Initialize theme from storage and system
   */
  initializeTheme: async () => {
    try {
      // Load saved theme
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const mode: ThemeMode = (savedTheme as ThemeMode) || 'system';

      // Resolve active theme
      const activeTheme = resolveActiveTheme(mode);

      // Update state
      set({
        mode,
        activeTheme,
        colors: getColors(activeTheme),
      });

      // Listen to system theme changes
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        const currentMode = get().mode;

        // Only update if in system mode
        if (currentMode === 'system') {
          const newActiveTheme: ActiveTheme = colorScheme === 'dark' ? 'dark' : 'light';
          set({
            activeTheme: newActiveTheme,
            colors: getColors(newActiveTheme),
          });
          console.log(`System theme changed to: ${newActiveTheme}`);
        }
      });

      // Cleanup subscription on store unmount (if needed)
      // Note: Zustand doesn't have unmount, handle this in component if needed

      console.log(`Theme initialized: ${mode} (active: ${activeTheme})`);
    } catch (error) {
      console.error('Failed to initialize theme:', error);
    }
  },

  /**
   * Get current system theme
   */
  getSystemTheme,
}));

/**
 * Export selectors
 */
export const selectThemeMode = (state: ThemeState) => state.mode;
export const selectActiveTheme = (state: ThemeState) => state.activeTheme;
export const selectColors = (state: ThemeState) => state.colors;

export default useThemeStore;
