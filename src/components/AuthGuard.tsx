/**
 * AuthGuard Component
 * Phase 145: Protected route component
 *
 * Features:
 * - Check authentication status
 * - Redirect to login if not authenticated
 * - Auto-login check on mount
 * - Loading state while checking auth
 * - Render children only if authenticated
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthenticated?: () => void;
  showLoader?: boolean;
}

/**
 * AuthGuard Component
 * Phase 145: Protect routes from unauthenticated access
 *
 * @param children - Components to render if authenticated
 * @param fallback - Component to render if not authenticated (optional)
 * @param onUnauthenticated - Callback when user is not authenticated
 * @param showLoader - Show loading indicator while checking auth
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  onUnauthenticated,
  showLoader = true,
}) => {
  const {
    isAuthenticated,
    isInitializing,
    checkAuth,
  } = useAuthStore();

  const [isChecking, setIsChecking] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const performAuthCheck = async () => {
      setIsChecking(true);
      await checkAuth();
      setIsChecking(false);
    };

    performAuthCheck();
  }, [checkAuth]);

  // Handle unauthenticated state
  useEffect(() => {
    if (!isChecking && !isInitializing && !isAuthenticated) {
      onUnauthenticated?.();
    }
  }, [isChecking, isInitializing, isAuthenticated, onUnauthenticated]);

  // Show loading state
  if (isChecking || isInitializing) {
    if (!showLoader) {
      return null;
    }

    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loaderText}>인증 확인 중...</Text>
      </View>
    );
  }

  // Show fallback or null if not authenticated
  if (!isAuthenticated) {
    return <>{fallback || null}</>;
  }

  // Render children if authenticated
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default AuthGuard;
