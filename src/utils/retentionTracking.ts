/**
 * Retention Tracking
 *
 * Tracks user retention metrics (D1, D7, D30).
 *
 * Usage:
 *   import { retentionTracker } from '@/utils/retentionTracking';
 *
 *   // Call on app startup
 *   await retentionTracker.trackAppOpen();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from './analytics';

const INSTALL_DATE_KEY = '@koodtx_install_date';
const LAST_OPEN_DATE_KEY = '@koodtx_last_open_date';
const OPEN_COUNT_KEY = '@koodtx_open_count';

class RetentionTracker {
  /**
   * Track app open event
   *
   * This should be called on every app startup.
   * It will automatically:
   * - Record install date (first time only)
   * - Log D1, D7, D30 retention events
   * - Track total app opens
   */
  async trackAppOpen(): Promise<void> {
    const now = Date.now();

    try {
      // Get install date (or set it if first time)
      const installDate = await this.getOrSetInstallDate(now);

      // Get last open date
      const lastOpenDate = await this.getLastOpenDate();

      // Calculate days since install
      const daysSinceInstall = this.calculateDaysSince(installDate, now);

      // Log retention events
      await this.logRetentionEvents(daysSinceInstall);

      // Increment open count
      await this.incrementOpenCount();

      // Update last open date
      await this.setLastOpenDate(now);

      // Log app opened event
      const isFirstOpen = daysSinceInstall === 0;
      await analyticsService.logEvent('app_opened', {
        is_first_open: isFirstOpen,
        days_since_install: daysSinceInstall,
        timestamp: now,
      });
    } catch (error) {
      console.error('[RetentionTracker] Failed to track app open:', error);
    }
  }

  /**
   * Get or set install date
   *
   * If install date doesn't exist, set it to current time.
   *
   * @param now - Current timestamp
   * @returns Install date timestamp
   */
  private async getOrSetInstallDate(now: number): Promise<number> {
    try {
      const installDateStr = await AsyncStorage.getItem(INSTALL_DATE_KEY);

      if (installDateStr) {
        return parseInt(installDateStr, 10);
      } else {
        // First time opening the app - set install date
        await AsyncStorage.setItem(INSTALL_DATE_KEY, now.toString());
        console.log('[RetentionTracker] Install date set:', new Date(now).toISOString());
        return now;
      }
    } catch (error) {
      console.error('[RetentionTracker] Failed to get/set install date:', error);
      return now;
    }
  }

  /**
   * Get last open date
   *
   * @returns Last open date timestamp (or null if never opened before)
   */
  private async getLastOpenDate(): Promise<number | null> {
    try {
      const lastOpenDateStr = await AsyncStorage.getItem(LAST_OPEN_DATE_KEY);
      return lastOpenDateStr ? parseInt(lastOpenDateStr, 10) : null;
    } catch (error) {
      console.error('[RetentionTracker] Failed to get last open date:', error);
      return null;
    }
  }

  /**
   * Set last open date
   *
   * @param timestamp - Timestamp to set
   */
  private async setLastOpenDate(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_OPEN_DATE_KEY, timestamp.toString());
    } catch (error) {
      console.error('[RetentionTracker] Failed to set last open date:', error);
    }
  }

  /**
   * Calculate days since a given timestamp
   *
   * @param since - Start timestamp
   * @param now - Current timestamp
   * @returns Number of days
   */
  private calculateDaysSince(since: number, now: number): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((now - since) / msPerDay);
  }

  /**
   * Log retention events (D1, D7, D30)
   *
   * @param daysSinceInstall - Days since install
   */
  private async logRetentionEvents(daysSinceInstall: number): Promise<void> {
    // D1 Retention (Day 1)
    if (daysSinceInstall === 1) {
      await analyticsService.logEvent('retention_day_1', {
        returned: true,
        timestamp: Date.now(),
      });
      console.log('[RetentionTracker] D1 retention event logged');
    }

    // D7 Retention (Day 7)
    if (daysSinceInstall === 7) {
      await analyticsService.logEvent('retention_day_7', {
        returned: true,
        timestamp: Date.now(),
      });
      console.log('[RetentionTracker] D7 retention event logged');
    }

    // D30 Retention (Day 30)
    if (daysSinceInstall === 30) {
      await analyticsService.logEvent('retention_day_30', {
        returned: true,
        timestamp: Date.now(),
      });
      console.log('[RetentionTracker] D30 retention event logged');
    }
  }

  /**
   * Increment open count
   */
  private async incrementOpenCount(): Promise<void> {
    try {
      const openCountStr = await AsyncStorage.getItem(OPEN_COUNT_KEY);
      const openCount = openCountStr ? parseInt(openCountStr, 10) : 0;
      const newOpenCount = openCount + 1;

      await AsyncStorage.setItem(OPEN_COUNT_KEY, newOpenCount.toString());

      // Set user property for segmentation
      await analyticsService.setUserProperty('app_open_count', newOpenCount.toString());
    } catch (error) {
      console.error('[RetentionTracker] Failed to increment open count:', error);
    }
  }

  /**
   * Get retention stats
   *
   * Returns install date, days since install, and total opens.
   */
  async getRetentionStats(): Promise<{
    installDate: Date | null;
    daysSinceInstall: number;
    totalOpens: number;
  }> {
    try {
      const installDateStr = await AsyncStorage.getItem(INSTALL_DATE_KEY);
      const openCountStr = await AsyncStorage.getItem(OPEN_COUNT_KEY);

      const installDate = installDateStr ? new Date(parseInt(installDateStr, 10)) : null;
      const daysSinceInstall = installDate
        ? this.calculateDaysSince(installDate.getTime(), Date.now())
        : 0;
      const totalOpens = openCountStr ? parseInt(openCountStr, 10) : 0;

      return {
        installDate,
        daysSinceInstall,
        totalOpens,
      };
    } catch (error) {
      console.error('[RetentionTracker] Failed to get retention stats:', error);
      return {
        installDate: null,
        daysSinceInstall: 0,
        totalOpens: 0,
      };
    }
  }

  /**
   * Reset retention data
   *
   * WARNING: This will clear all retention tracking data.
   * Only use for testing or when user explicitly requests data deletion.
   */
  async resetRetentionData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([INSTALL_DATE_KEY, LAST_OPEN_DATE_KEY, OPEN_COUNT_KEY]);
      console.log('[RetentionTracker] Retention data reset');
    } catch (error) {
      console.error('[RetentionTracker] Failed to reset retention data:', error);
    }
  }
}

// Export singleton instance
export const retentionTracker = new RetentionTracker();
