/**
 * Timestamp Utility
 * Phase 82: High-precision timestamp utilities for sensor data collection
 *
 * Provides:
 * - UTC epoch timestamps (milliseconds)
 * - High-precision elapsed time (performance.now())
 * - Timezone information
 * - Server time synchronization support
 * - NTP client support (optional)
 */

/**
 * Timestamp types
 */
export interface Timestamp {
  /**
   * UTC timestamp in milliseconds since epoch
   */
  utc: number;

  /**
   * High-precision monotonic timestamp in milliseconds
   * Uses performance.now() for sub-millisecond precision
   */
  elapsed: number;

  /**
   * System boot time timestamp (Android)
   * Useful for sensor timestamp conversion
   */
  bootTime?: number;

  /**
   * Timezone offset in minutes
   */
  timezoneOffset: number;

  /**
   * Timezone name (e.g., "Asia/Seoul")
   */
  timezoneName: string;
}

/**
 * Time sync result
 */
export interface TimeSyncResult {
  /**
   * Server time in milliseconds
   */
  serverTime: number;

  /**
   * Local time in milliseconds
   */
  localTime: number;

  /**
   * Time offset (serverTime - localTime)
   */
  offset: number;

  /**
   * Round-trip time in milliseconds
   */
  rtt: number;

  /**
   * Sync accuracy/confidence
   */
  accuracy: number;

  /**
   * Timestamp when sync was performed
   */
  syncedAt: number;
}

/**
 * NTP response
 */
export interface NTPResponse {
  /**
   * Server time in milliseconds
   */
  time: number;

  /**
   * Round-trip time
   */
  rtt: number;

  /**
   * Stratum level (0-16)
   */
  stratum?: number;

  /**
   * Precision
   */
  precision?: number;
}

/**
 * Timestamp Manager
 * Manages high-precision timestamps and time synchronization
 */
class TimestampManager {
  private static instance: TimestampManager;

  // Performance.now() reference point
  private performanceStartTime: number;
  private performanceStartDate: number;

  // Time sync state
  private timeSyncOffset: number = 0;
  private lastSyncResult: TimeSyncResult | null = null;

  // Boot time (Android)
  private bootTime: number | null = null;

  private constructor() {
    // Initialize performance reference
    this.performanceStartDate = Date.now();
    this.performanceStartTime = this.getPerformanceNow();

    // Calculate boot time (approximate)
    this.bootTime = this.performanceStartDate - this.performanceStartTime;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TimestampManager {
    if (!TimestampManager.instance) {
      TimestampManager.instance = new TimestampManager();
    }
    return TimestampManager.instance;
  }

  /**
   * Get current timestamp with all information
   */
  now(): Timestamp {
    const utc = Date.now() + this.timeSyncOffset;
    const elapsed = this.getElapsedTime();

    return {
      utc,
      elapsed,
      bootTime: this.bootTime || undefined,
      timezoneOffset: this.getTimezoneOffset(),
      timezoneName: this.getTimezoneName(),
    };
  }

  /**
   * Get UTC timestamp in milliseconds
   */
  getUTC(): number {
    return Date.now() + this.timeSyncOffset;
  }

  /**
   * Get high-precision elapsed time since app start
   * Uses performance.now() for sub-millisecond precision
   */
  getElapsedTime(): number {
    return this.getPerformanceNow() - this.performanceStartTime;
  }

  /**
   * Get performance.now() value
   * Cross-platform support
   */
  private getPerformanceNow(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }

    // Fallback to Date.now()
    return Date.now() - this.performanceStartDate;
  }

  /**
   * Convert elapsed time to UTC timestamp
   */
  elapsedToUTC(elapsed: number): number {
    const elapsedSinceStart = elapsed - this.performanceStartTime;
    return this.performanceStartDate + elapsedSinceStart + this.timeSyncOffset;
  }

  /**
   * Convert UTC timestamp to elapsed time
   */
  utcToElapsed(utc: number): number {
    const timeSinceStart = utc - this.performanceStartDate - this.timeSyncOffset;
    return this.performanceStartTime + timeSinceStart;
  }

  /**
   * Convert Android sensor timestamp (nanoseconds since boot) to UTC
   */
  sensorTimestampToUTC(sensorTimestampNanos: number): number {
    if (!this.bootTime) {
      // Fallback: use current time
      return Date.now() + this.timeSyncOffset;
    }

    // Convert nanoseconds to milliseconds
    const sensorTimestampMs = sensorTimestampNanos / 1_000_000;

    // Add boot time to get UTC
    return this.bootTime + sensorTimestampMs + this.timeSyncOffset;
  }

  /**
   * Get timezone offset in minutes
   */
  getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
  }

  /**
   * Get timezone name
   */
  getTimezoneName(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      // Fallback
      return 'UTC';
    }
  }

  /**
   * Get boot time (Android)
   */
  getBootTime(): number | null {
    return this.bootTime;
  }

  /**
   * Set boot time manually (if available from native module)
   */
  setBootTime(bootTime: number): void {
    this.bootTime = bootTime;
  }

  /**
   * Synchronize time with server
   */
  async syncWithServer(serverUrl: string): Promise<TimeSyncResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(serverUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const endTime = Date.now();
      const rtt = endTime - startTime;

      // Get server time from response header
      const serverDateHeader = response.headers.get('Date');
      if (!serverDateHeader) {
        throw new Error('Server did not return Date header');
      }

      const serverTime = new Date(serverDateHeader).getTime();
      const localTime = startTime + rtt / 2; // Compensate for RTT

      const offset = serverTime - localTime;

      const syncResult: TimeSyncResult = {
        serverTime,
        localTime,
        offset,
        rtt,
        accuracy: Math.abs(rtt / 2),
        syncedAt: Date.now(),
      };

      // Apply offset
      this.timeSyncOffset = offset;
      this.lastSyncResult = syncResult;

      console.log('Time synced with server:', {
        offset: `${offset}ms`,
        rtt: `${rtt}ms`,
        accuracy: `±${syncResult.accuracy}ms`,
      });

      return syncResult;
    } catch (error) {
      console.error('Failed to sync with server:', error);
      throw error;
    }
  }

  /**
   * Synchronize time with NTP server
   * Note: This is a simplified implementation
   * For production, consider using a proper NTP library
   */
  async syncWithNTP(ntpServer: string = 'pool.ntp.org'): Promise<NTPResponse> {
    // Note: NTP uses UDP port 123, which is not directly accessible from React Native
    // This is a placeholder for future implementation
    // You would need a native module or HTTP-based NTP service

    console.warn('NTP sync not implemented. Use syncWithServer() instead.');

    throw new Error('NTP sync requires native module implementation');
  }

  /**
   * Get last sync result
   */
  getLastSyncResult(): TimeSyncResult | null {
    return this.lastSyncResult;
  }

  /**
   * Get current time sync offset
   */
  getTimeSyncOffset(): number {
    return this.timeSyncOffset;
  }

  /**
   * Check if time is synced
   */
  isSynced(): boolean {
    return this.lastSyncResult !== null;
  }

  /**
   * Get sync age in milliseconds
   */
  getSyncAge(): number | null {
    if (!this.lastSyncResult) {
      return null;
    }

    return Date.now() - this.lastSyncResult.syncedAt;
  }

  /**
   * Reset time sync
   */
  resetSync(): void {
    this.timeSyncOffset = 0;
    this.lastSyncResult = null;
  }
}

/**
 * Singleton instance
 */
export const timestampManager = TimestampManager.getInstance();

/**
 * Convenience functions
 */

/**
 * Get current timestamp
 */
export function now(): Timestamp {
  return timestampManager.now();
}

/**
 * Get UTC timestamp in milliseconds
 */
export function getUTC(): number {
  return timestampManager.getUTC();
}

/**
 * Get high-precision elapsed time
 */
export function getElapsedTime(): number {
  return timestampManager.getElapsedTime();
}

/**
 * Convert elapsed time to UTC
 */
export function elapsedToUTC(elapsed: number): number {
  return timestampManager.elapsedToUTC(elapsed);
}

/**
 * Convert UTC to elapsed time
 */
export function utcToElapsed(utc: number): number {
  return timestampManager.utcToElapsed(utc);
}

/**
 * Convert Android sensor timestamp to UTC
 */
export function sensorTimestampToUTC(sensorTimestampNanos: number): number {
  return timestampManager.sensorTimestampToUTC(sensorTimestampNanos);
}

/**
 * Get timezone offset
 */
export function getTimezoneOffset(): number {
  return timestampManager.getTimezoneOffset();
}

/**
 * Get timezone name
 */
export function getTimezoneName(): string {
  return timestampManager.getTimezoneName();
}

/**
 * Sync with server
 */
export function syncWithServer(serverUrl: string): Promise<TimeSyncResult> {
  return timestampManager.syncWithServer(serverUrl);
}

/**
 * Get last sync result
 */
export function getLastSyncResult(): TimeSyncResult | null {
  return timestampManager.getLastSyncResult();
}

/**
 * Check if synced
 */
export function isSynced(): boolean {
  return timestampManager.isSynced();
}

/**
 * Formatting utilities
 */

/**
 * Format UTC timestamp to ISO string
 */
export function formatISO(utc: number): string {
  return new Date(utc).toISOString();
}

/**
 * Format UTC timestamp to local string
 */
export function formatLocal(utc: number): string {
  return new Date(utc).toLocaleString();
}

/**
 * Format elapsed time as duration string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format milliseconds with precision
 */
export function formatMilliseconds(ms: number, precision: number = 3): string {
  return ms.toFixed(precision) + 'ms';
}

/**
 * Parse ISO string to UTC timestamp
 */
export function parseISO(isoString: string): number {
  return new Date(isoString).getTime();
}

/**
 * Validation utilities
 */

/**
 * Check if timestamp is valid
 */
export function isValidTimestamp(timestamp: number): boolean {
  return (
    typeof timestamp === 'number' &&
    !isNaN(timestamp) &&
    timestamp > 0 &&
    timestamp < Date.now() + 365 * 24 * 60 * 60 * 1000 // Not more than 1 year in future
  );
}

/**
 * Check if timestamps are synchronized (within threshold)
 */
export function areSynchronized(
  timestamp1: number,
  timestamp2: number,
  thresholdMs: number = 100,
): boolean {
  return Math.abs(timestamp1 - timestamp2) <= thresholdMs;
}

/**
 * Constants
 */
export const MILLISECONDS_PER_SECOND = 1000;
export const MILLISECONDS_PER_MINUTE = 60 * 1000;
export const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
export const NANOSECONDS_PER_MILLISECOND = 1_000_000;

/**
 * Export default
 */
export default timestampManager;
