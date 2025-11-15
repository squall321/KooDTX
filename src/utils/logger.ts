/**
 * Logger Utility
 * Centralized logging system for the application
 *
 * Features:
 * - Environment-aware (only logs in development)
 * - Different log levels (log, info, warn, error)
 * - Production-safe (errors still logged in production)
 * - Type-safe
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface Logger {
  log: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

/**
 * Create a logger instance based on environment
 */
const createLogger = (): Logger => {
  // In development, use console methods
  if (__DEV__) {
    return {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    };
  }

  // In production, only log errors
  return {
    log: () => {}, // No-op in production
    info: () => {}, // No-op in production
    warn: () => {}, // No-op in production
    error: console.error.bind(console), // Still log errors in production
    debug: () => {}, // No-op in production
  };
};

/**
 * Global logger instance
 * Usage:
 * ```typescript
 * import { logger } from '../utils/logger';
 *
 * logger.log('Debug message'); // Only in development
 * logger.info('Info message'); // Only in development
 * logger.warn('Warning message'); // Only in development
 * logger.error('Error message'); // Always logged
 * ```
 */
export const logger = createLogger();

/**
 * Create a namespaced logger for specific modules
 *
 * @param namespace - Module name (e.g., 'RecordingScreen', 'SyncService')
 * @returns Logger with namespace prefix
 *
 * @example
 * ```typescript
 * const log = createNamespacedLogger('RecordingScreen');
 * log.info('Recording started'); // [RecordingScreen] Recording started
 * ```
 */
export const createNamespacedLogger = (namespace: string): Logger => {
  const prefix = `[${namespace}]`;

  if (__DEV__) {
    return {
      log: (...args: any[]) => console.log(prefix, ...args),
      info: (...args: any[]) => console.info(prefix, ...args),
      warn: (...args: any[]) => console.warn(prefix, ...args),
      error: (...args: any[]) => console.error(prefix, ...args),
      debug: (...args: any[]) => console.debug(prefix, ...args),
    };
  }

  return {
    log: () => {},
    info: () => {},
    warn: () => {},
    error: (...args: any[]) => console.error(prefix, ...args),
    debug: () => {},
  };
};

/**
 * Log a performance metric
 * Only in development
 *
 * @param name - Metric name
 * @param duration - Duration in milliseconds
 *
 * @example
 * ```typescript
 * const start = Date.now();
 * await someOperation();
 * logPerformance('someOperation', Date.now() - start);
 * ```
 */
export const logPerformance = (name: string, duration: number): void => {
  if (__DEV__) {
    const durationStr = duration.toFixed(2);
    console.log(`⏱️ [Performance] ${name}: ${durationStr}ms`);
  }
};

/**
 * Log an analytics event
 * Can be extended to integrate with analytics services
 *
 * @param event - Event name
 * @param properties - Event properties
 *
 * @example
 * ```typescript
 * logEvent('recording_started', {
 *   duration: 30,
 *   sensors: ['accelerometer', 'gyroscope'],
 * });
 * ```
 */
export const logEvent = (event: string, properties?: Record<string, any>): void => {
  if (__DEV__) {
    console.log(`📊 [Event] ${event}`, properties || '');
  }
  // TODO: Integrate with analytics service (Firebase, Mixpanel, etc.)
  // analytics.track(event, properties);
};

export default logger;
