/**
 * Sentry Configuration
 * Phase 174: Error tracking with Sentry
 *
 * Features:
 * - Error tracking
 * - Performance monitoring
 * - Breadcrumbs
 * - User context
 * - Custom tags
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const SENTRY_DSN = 'YOUR_SENTRY_DSN_HERE'; // Replace with your actual DSN

/**
 * Initialize Sentry
 */
export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    enabled: !__DEV__, // Only enable in production
    tracesSampleRate: 1.0, // 100% of transactions for performance monitoring
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,

    // Integrations
    integrations: [
      new Sentry.ReactNativeTracing({
        tracingOrigins: ['localhost', 'api.example.com', /^\//],
        routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
      }),
    ],

    // Before send callback
    beforeSend(event, hint) {
      // Filter out unwanted errors
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          // Filter specific errors
          if ((error as Error).message.includes('Network request failed')) {
            // Don't send network errors to Sentry
            return null;
          }
        }
      }

      // Add device info
      event.contexts = {
        ...event.contexts,
        device: {
          name: DeviceInfo.getDeviceId(),
          model: DeviceInfo.getModel(),
          os: Platform.OS,
          os_version: Platform.Version.toString(),
        },
      };

      return event;
    },
  });

  // Set initial context
  setDeviceContext();
};

/**
 * Set device context
 */
const setDeviceContext = async () => {
  const deviceInfo = {
    deviceId: DeviceInfo.getDeviceId(),
    model: DeviceInfo.getModel(),
    brand: DeviceInfo.getBrand(),
    systemVersion: DeviceInfo.getSystemVersion(),
    appVersion: DeviceInfo.getVersion(),
    buildNumber: DeviceInfo.getBuildNumber(),
  };

  Sentry.setContext('device', deviceInfo);
};

/**
 * Set user context
 */
export const setSentryUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Capture exception
 */
export const captureException = (
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: Sentry.SeverityLevel;
  }
) => {
  if (context?.tags) {
    Sentry.setTags(context.tags);
  }

  if (context?.extra) {
    Sentry.setExtras(context.extra);
  }

  Sentry.captureException(error, {
    level: context?.level || 'error',
  });
};

/**
 * Capture message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
) => {
  if (context?.tags) {
    Sentry.setTags(context.tags);
  }

  if (context?.extra) {
    Sentry.setExtras(context.extra);
  }

  Sentry.captureMessage(message, level);
};

/**
 * Start transaction (for performance monitoring)
 */
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Set tag
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Set tags
 */
export const setTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);
};

/**
 * Set context
 */
export const setContext = (name: string, context: Record<string, any>) => {
  Sentry.setContext(name, context);
};

export default {
  initSentry,
  setSentryUser,
  clearSentryUser,
  addBreadcrumb,
  captureException,
  captureMessage,
  startTransaction,
  setTag,
  setTags,
  setContext,
};
