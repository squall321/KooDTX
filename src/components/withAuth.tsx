/**
 * withAuth Higher-Order Component
 * Phase 145: HOC to protect screens with authentication
 *
 * Features:
 * - Wrap any component with authentication check
 * - Automatic redirect to login if not authenticated
 * - Type-safe HOC implementation
 * - Easy to use with React Navigation screens
 */

import React, { ComponentType } from 'react';
import AuthGuard from './AuthGuard';

interface WithAuthOptions {
  /**
   * Whether to show loading indicator while checking auth
   * @default true
   */
  showLoader?: boolean;

  /**
   * Callback when user is not authenticated
   */
  onUnauthenticated?: () => void;

  /**
   * Custom fallback component to show if not authenticated
   */
  fallback?: React.ReactNode;
}

/**
 * Higher-Order Component to protect screens with authentication
 * Phase 145: Wrap components with AuthGuard
 *
 * @param Component - Component to protect
 * @param options - Configuration options
 * @returns Protected component
 *
 * @example
 * ```tsx
 * const ProtectedScreen = withAuth(HomeScreen);
 * ```
 *
 * @example
 * ```tsx
 * const ProtectedScreen = withAuth(HomeScreen, {
 *   showLoader: true,
 *   onUnauthenticated: () => {
 *     console.log('User not authenticated');
 *   },
 * });
 * ```
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
): ComponentType<P> {
  const {
    showLoader = true,
    onUnauthenticated,
    fallback,
  } = options;

  const WithAuthComponent: React.FC<P> = (props) => {
    return (
      <AuthGuard
        showLoader={showLoader}
        onUnauthenticated={onUnauthenticated}
        fallback={fallback}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };

  // Preserve component name for debugging
  const componentName = Component.displayName || Component.name || 'Component';
  WithAuthComponent.displayName = `withAuth(${componentName})`;

  return WithAuthComponent;
}

export default withAuth;
