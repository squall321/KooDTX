/**
 * Analytics Service
 *
 * Firebase Analytics wrapper for KooDTX
 *
 * Usage:
 *   import { analyticsService } from '@/utils/analytics';
 *
 *   // Log event
 *   analyticsService.logEvent('recording_started', { duration: 60 });
 *
 *   // Log screen view
 *   analyticsService.logScreenView('HomeScreen');
 *
 *   // Set user property
 *   analyticsService.setUserProperty('user_type', 'researcher');
 */

import analytics from '@react-native-firebase/analytics';
import { envConfig } from '@/config/env';

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private enabled: boolean;
  private isInitialized: boolean = false;

  constructor() {
    this.enabled = envConfig.ENABLE_ANALYTICS;
    this.initialize();
  }

  /**
   * Initialize analytics
   */
  private async initialize() {
    if (!this.enabled) {
      console.log('[Analytics] Analytics is disabled in environment config');
      return;
    }

    try {
      // Enable analytics collection
      await analytics().setAnalyticsCollectionEnabled(true);
      this.isInitialized = true;
      console.log('[Analytics] Analytics initialized successfully');
    } catch (error) {
      console.error('[Analytics] Failed to initialize:', error);
      this.enabled = false;
    }
  }

  /**
   * Log a custom event
   *
   * @param eventName - Event name (max 40 characters, alphanumeric + underscore)
   * @param params - Event parameters (max 25 parameters, max 100 characters per value)
   */
  async logEvent(eventName: string, params?: EventParams): Promise<void> {
    if (!this.enabled || !this.isInitialized) {
      if (__DEV__) {
        console.log(`[Analytics] (disabled) ${eventName}`, params);
      }
      return;
    }

    try {
      // Validate event name length
      if (eventName.length > 40) {
        console.warn(`[Analytics] Event name too long (max 40): ${eventName}`);
        eventName = eventName.substring(0, 40);
      }

      // Log event to Firebase
      await analytics().logEvent(eventName, params);

      if (__DEV__) {
        console.log(`[Analytics] Event logged: ${eventName}`, params);
      }
    } catch (error) {
      console.error(`[Analytics] Failed to log event: ${eventName}`, error);
    }
  }

  /**
   * Log screen view
   *
   * @param screenName - Screen name (e.g., 'HomeScreen', 'RecordingScreen')
   * @param screenClass - Screen class (optional, defaults to screenName)
   */
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    if (!this.enabled || !this.isInitialized) {
      if (__DEV__) {
        console.log(`[Analytics] (disabled) Screen view: ${screenName}`);
      }
      return;
    }

    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });

      if (__DEV__) {
        console.log(`[Analytics] Screen view logged: ${screenName}`);
      }
    } catch (error) {
      console.error(`[Analytics] Failed to log screen view: ${screenName}`, error);
    }
  }

  /**
   * Set user property
   *
   * User properties are attributes you define to describe segments of your user base.
   *
   * @param name - Property name (max 24 characters)
   * @param value - Property value (max 36 characters)
   */
  async setUserProperty(name: string, value: string | null): Promise<void> {
    if (!this.enabled || !this.isInitialized) {
      if (__DEV__) {
        console.log(`[Analytics] (disabled) User property: ${name} = ${value}`);
      }
      return;
    }

    try {
      await analytics().setUserProperty(name, value);

      if (__DEV__) {
        console.log(`[Analytics] User property set: ${name} = ${value}`);
      }
    } catch (error) {
      console.error(`[Analytics] Failed to set user property: ${name}`, error);
    }
  }

  /**
   * Set user ID
   *
   * @param userId - Unique user ID (can be null to clear)
   */
  async setUserId(userId: string | null): Promise<void> {
    if (!this.enabled || !this.isInitialized) {
      if (__DEV__) {
        console.log(`[Analytics] (disabled) User ID: ${userId}`);
      }
      return;
    }

    try {
      await analytics().setUserId(userId);

      if (__DEV__) {
        console.log(`[Analytics] User ID set: ${userId}`);
      }
    } catch (error) {
      console.error('[Analytics] Failed to set user ID', error);
    }
  }

  /**
   * Reset analytics data
   *
   * Clears all analytics data for the current user.
   * Useful when user logs out.
   */
  async resetAnalyticsData(): Promise<void> {
    if (!this.enabled || !this.isInitialized) {
      return;
    }

    try {
      await analytics().resetAnalyticsData();

      if (__DEV__) {
        console.log('[Analytics] Analytics data reset');
      }
    } catch (error) {
      console.error('[Analytics] Failed to reset analytics data', error);
    }
  }

  /**
   * Enable/disable analytics collection
   *
   * @param enabled - Whether to enable analytics
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;

    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);
      console.log(`[Analytics] Analytics collection ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('[Analytics] Failed to set analytics collection', error);
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.isInitialized;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export types
export type { EventParams };
