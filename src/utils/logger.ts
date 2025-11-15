/**
 * Custom Logger
 * Phase 175: Structured logging with Sentry integration
 *
 * Features:
 * - Multiple log levels
 * - Sentry integration
 * - Structured logging
 * - Development vs Production behavior
 * - Performance tracking
 */

import { Platform } from 'react-native';
import { captureException, captureMessage, addBreadcrumb } from './sentry';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: Record<string, any>;
  error?: Error;
  stack?: string;
}

class Logger {
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;
  private enableConsoleLogging = __DEV__;
  private enableSentryLogging = !__DEV__;

  /**
   * Debug log
   */
  debug(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info log
   */
  info(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning log
   */
  warn(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, data?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, data, error);

    // Send to Sentry
    if (this.enableSentryLogging && error) {
      captureException(error, {
        tags: { logged: 'true' },
        extra: { message, ...data },
        level: 'error',
      });
    }
  }

  /**
   * Fatal error log
   */
  fatal(message: string, error?: Error, data?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, data, error);

    // Always send fatal errors to Sentry
    if (error) {
      captureException(error, {
        tags: { fatal: 'true' },
        extra: { message, ...data },
        level: 'fatal',
      });
    } else {
      captureMessage(message, 'fatal', {
        extra: data,
      });
    }
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, any>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
      error,
      stack: error?.stack,
    };

    // Add to history
    this.addToHistory(entry);

    // Console logging
    if (this.enableConsoleLogging) {
      this.logToConsole(entry);
    }

    // Add breadcrumb to Sentry
    if (this.enableSentryLogging) {
      addBreadcrumb(message, 'log', this.mapLevelToSentry(level), {
        ...data,
        error: error?.message,
      });
    }
  }

  /**
   * Log to console
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}] [${new Date(entry.timestamp).toISOString()}]`;
    const logData = entry.data ? ` ${JSON.stringify(entry.data)}` : '';

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(`${prefix} ${entry.message}${logData}`);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${entry.message}${logData}`);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${entry.message}${logData}`);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(`${prefix} ${entry.message}${logData}`);
        if (entry.error) {
          console.error(entry.error);
        }
        break;
    }
  }

  /**
   * Add entry to history
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);

    // Keep history size limited
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get log history
   */
  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter((entry) => entry.level === level);
    }
    return this.logHistory;
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Map log level to Sentry severity
   */
  private mapLevelToSentry(level: LogLevel): 'debug' | 'info' | 'warning' | 'error' | 'fatal' {
    switch (level) {
      case LogLevel.DEBUG:
        return 'debug';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warning';
      case LogLevel.ERROR:
        return 'error';
      case LogLevel.FATAL:
        return 'fatal';
    }
  }

  /**
   * Performance measurement
   */
  startTimer(label: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.info(`Timer: ${label}`, { duration: `${duration}ms` });
    };
  }

  /**
   * Track async operation
   */
  async track<T>(label: string, operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.debug(`Starting: ${label}`);

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      this.info(`Completed: ${label}`, { duration: `${duration}ms`, success: true });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(
        `Failed: ${label}`,
        error as Error,
        { duration: `${duration}ms`, success: false }
      );
      throw error;
    }
  }

  /**
   * API request logger
   */
  logApiRequest(
    method: string,
    url: string,
    status?: number,
    duration?: number,
    error?: Error
  ): void {
    if (error) {
      this.error('API Request Failed', error, {
        method,
        url,
        status,
        duration: duration ? `${duration}ms` : undefined,
      });
    } else {
      this.info('API Request', {
        method,
        url,
        status,
        duration: duration ? `${duration}ms` : undefined,
      });
    }
  }

  /**
   * User action logger
   */
  logUserAction(action: string, screen?: string, data?: Record<string, any>): void {
    this.info(`User Action: ${action}`, {
      screen,
      ...data,
    });
  }

  /**
   * Navigation logger
   */
  logNavigation(from: string, to: string): void {
    this.info('Navigation', {
      from,
      to,
    });
  }
}

// Singleton instance
export const logger = new Logger();

export default logger;
