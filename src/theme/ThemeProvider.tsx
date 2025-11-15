/**
 * ThemeProvider Component
 * Phase 153: Theme provider for app-wide theme management
 *
 * Features:
 * - Initialize theme on app start
 * - Provide theme context
 * - Handle system theme changes
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider Component
 * Phase 153: Initialize and provide theme to app
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { initializeTheme, activeTheme } = useThemeStore();
  const [isReady, setIsReady] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const init = async () => {
      await initializeTheme();
      setIsReady(true);
    };

    init();
  }, [initializeTheme]);

  // Don't render children until theme is initialized
  if (!isReady) {
    return null;
  }

  return (
    <>
      <StatusBar
        barStyle={activeTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={activeTheme === 'dark' ? '#1C1C1E' : '#F2F2F7'}
      />
      {children}
    </>
  );
};

export default ThemeProvider;
