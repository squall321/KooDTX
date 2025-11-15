/**
 * AuthProvider Component
 * Phase 145: Authentication provider for app initialization
 *
 * Features:
 * - Check authentication on app start
 * - Handle auto-login
 * - Show loading state during initialization
 * - Wrap app with authentication context
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

interface AuthProviderProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

/**
 * AuthProvider Component
 * Phase 145: Initialize authentication on app start
 *
 * @param children - App components to render after auth check
 * @param loadingComponent - Custom loading component (optional)
 */
const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  loadingComponent,
}) => {
  const { checkAuth, isInitializing } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeAuth();
  }, [checkAuth]);

  // Show loading state while checking auth
  if (!isReady || isInitializing) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.appName}>KooDTX</Text>
        <Text style={styles.loaderText}>앱을 시작하는 중...</Text>
      </View>
    );
  }

  // Render app
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 24,
    marginBottom: 8,
  },
  loaderText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
});

export default AuthProvider;
