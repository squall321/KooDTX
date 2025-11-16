/**
 * Analytics Events
 *
 * Centralized definitions for all analytics events in KooDTX.
 *
 * Usage:
 *   import { AnalyticsEvents } from '@/events/analyticsEvents';
 *   import { analyticsService } from '@/utils/analytics';
 *
 *   // Log app open
 *   AnalyticsEvents.logAppOpened();
 *
 *   // Log recording started
 *   AnalyticsEvents.logRecordingStarted({ duration: 60 });
 */

import { analyticsService } from '@/utils/analytics';

/**
 * Analytics Events
 *
 * All event logging methods are defined here to ensure consistency.
 */
export class AnalyticsEvents {
  // ========================================
  // App Lifecycle Events
  // ========================================

  /**
   * App opened
   *
   * Logged when user opens the app.
   *
   * @param isFirstOpen - Whether this is the first time user opens the app
   */
  static async logAppOpened(params?: { isFirstOpen?: boolean }): Promise<void> {
    await analyticsService.logEvent('app_opened', {
      is_first_open: params?.isFirstOpen || false,
      timestamp: Date.now(),
    });
  }

  /**
   * App backgrounded
   *
   * Logged when user puts app in background.
   */
  static async logAppBackgrounded(): Promise<void> {
    await analyticsService.logEvent('app_backgrounded', {
      timestamp: Date.now(),
    });
  }

  /**
   * App foregrounded
   *
   * Logged when user brings app back to foreground.
   */
  static async logAppForegrounded(): Promise<void> {
    await analyticsService.logEvent('app_foregrounded', {
      timestamp: Date.now(),
    });
  }

  // ========================================
  // Recording Events
  // ========================================

  /**
   * Recording started
   *
   * @param sessionId - Unique session ID
   */
  static async logRecordingStarted(params: {
    sessionId: string;
    sensorCount?: number;
  }): Promise<void> {
    await analyticsService.logEvent('recording_started', {
      session_id: params.sessionId,
      sensor_count: params.sensorCount || 0,
      timestamp: Date.now(),
    });
  }

  /**
   * Recording stopped
   *
   * @param sessionId - Unique session ID
   * @param duration - Recording duration in seconds
   * @param dataPointsCollected - Number of data points collected
   */
  static async logRecordingStopped(params: {
    sessionId: string;
    duration: number;
    dataPointsCollected?: number;
  }): Promise<void> {
    await analyticsService.logEvent('recording_stopped', {
      session_id: params.sessionId,
      duration: params.duration,
      data_points_collected: params.dataPointsCollected || 0,
      timestamp: Date.now(),
    });
  }

  /**
   * Recording completed successfully
   *
   * @param sessionId - Unique session ID
   * @param duration - Recording duration in seconds
   */
  static async logRecordingCompleted(params: {
    sessionId: string;
    duration: number;
  }): Promise<void> {
    await analyticsService.logEvent('recording_completed', {
      session_id: params.sessionId,
      duration: params.duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Recording paused
   */
  static async logRecordingPaused(params: { sessionId: string }): Promise<void> {
    await analyticsService.logEvent('recording_paused', {
      session_id: params.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Recording resumed
   */
  static async logRecordingResumed(params: { sessionId: string }): Promise<void> {
    await analyticsService.logEvent('recording_resumed', {
      session_id: params.sessionId,
      timestamp: Date.now(),
    });
  }

  // ========================================
  // Export Events
  // ========================================

  /**
   * Export started
   *
   * @param sessionId - Session being exported
   * @param format - Export format (csv, json)
   */
  static async logExportStarted(params: {
    sessionId: string;
    format: 'csv' | 'json';
  }): Promise<void> {
    await analyticsService.logEvent('export_started', {
      session_id: params.sessionId,
      format: params.format,
      timestamp: Date.now(),
    });
  }

  /**
   * Export completed successfully
   *
   * @param sessionId - Session exported
   * @param format - Export format
   * @param fileSizeBytes - Size of exported file in bytes
   */
  static async logExportSuccess(params: {
    sessionId: string;
    format: 'csv' | 'json';
    fileSizeBytes?: number;
  }): Promise<void> {
    await analyticsService.logEvent('export_success', {
      session_id: params.sessionId,
      format: params.format,
      file_size_bytes: params.fileSizeBytes || 0,
      timestamp: Date.now(),
    });
  }

  /**
   * Export failed
   *
   * @param sessionId - Session export attempted
   * @param format - Export format
   * @param errorMessage - Error message
   */
  static async logExportFailed(params: {
    sessionId: string;
    format: 'csv' | 'json';
    errorMessage: string;
  }): Promise<void> {
    await analyticsService.logEvent('export_failed', {
      session_id: params.sessionId,
      format: params.format,
      error_message: params.errorMessage.substring(0, 100), // Limit to 100 chars
      timestamp: Date.now(),
    });
  }

  // ========================================
  // Sync Events
  // ========================================

  /**
   * Sync started
   *
   * @param sessionId - Session being synced
   */
  static async logSyncStarted(params: { sessionId: string }): Promise<void> {
    await analyticsService.logEvent('sync_started', {
      session_id: params.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Sync completed successfully
   *
   * @param sessionId - Session synced
   * @param durationMs - Sync duration in milliseconds
   * @param dataSizeBytes - Amount of data synced in bytes
   */
  static async logSyncCompleted(params: {
    sessionId: string;
    durationMs: number;
    dataSizeBytes?: number;
  }): Promise<void> {
    await analyticsService.logEvent('sync_completed', {
      session_id: params.sessionId,
      duration_ms: params.durationMs,
      data_size_bytes: params.dataSizeBytes || 0,
      timestamp: Date.now(),
    });
  }

  /**
   * Sync failed
   *
   * @param sessionId - Session sync attempted
   * @param errorMessage - Error message
   */
  static async logSyncFailed(params: {
    sessionId: string;
    errorMessage: string;
  }): Promise<void> {
    await analyticsService.logEvent('sync_failed', {
      session_id: params.sessionId,
      error_message: params.errorMessage.substring(0, 100),
      timestamp: Date.now(),
    });
  }

  // ========================================
  // Session Management Events
  // ========================================

  /**
   * Session viewed
   *
   * User opened session details.
   */
  static async logSessionViewed(params: { sessionId: string }): Promise<void> {
    await analyticsService.logEvent('session_viewed', {
      session_id: params.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Session deleted
   */
  static async logSessionDeleted(params: {
    sessionId: string;
    duration?: number;
  }): Promise<void> {
    await analyticsService.logEvent('session_deleted', {
      session_id: params.sessionId,
      duration: params.duration || 0,
      timestamp: Date.now(),
    });
  }

  // ========================================
  // Settings Events
  // ========================================

  /**
   * Settings changed
   *
   * @param settingName - Name of setting changed
   * @param newValue - New value (as string)
   */
  static async logSettingChanged(params: {
    settingName: string;
    newValue: string;
  }): Promise<void> {
    await analyticsService.logEvent('setting_changed', {
      setting_name: params.settingName,
      new_value: params.newValue.substring(0, 36), // Limit to 36 chars
      timestamp: Date.now(),
    });
  }

  /**
   * Sensor toggled
   *
   * @param sensorType - Type of sensor (gps, accelerometer, etc.)
   * @param enabled - Whether sensor was enabled or disabled
   */
  static async logSensorToggled(params: {
    sensorType: string;
    enabled: boolean;
  }): Promise<void> {
    await analyticsService.logEvent('sensor_toggled', {
      sensor_type: params.sensorType,
      enabled: params.enabled,
      timestamp: Date.now(),
    });
  }

  // ========================================
  // Error Events
  // ========================================

  /**
   * Error occurred
   *
   * Generic error logging (for non-critical errors).
   *
   * Note: Critical crashes are automatically sent to Sentry.
   *
   * @param errorType - Type of error (e.g., 'permission_denied', 'network_error')
   * @param errorMessage - Error message
   */
  static async logError(params: {
    errorType: string;
    errorMessage: string;
  }): Promise<void> {
    await analyticsService.logEvent('error_occurred', {
      error_type: params.errorType,
      error_message: params.errorMessage.substring(0, 100),
      timestamp: Date.now(),
    });
  }

  /**
   * Permission denied
   *
   * @param permissionType - Type of permission (location, storage, etc.)
   */
  static async logPermissionDenied(params: {
    permissionType: string;
  }): Promise<void> {
    await analyticsService.logEvent('permission_denied', {
      permission_type: params.permissionType,
      timestamp: Date.now(),
    });
  }

  /**
   * Permission granted
   *
   * @param permissionType - Type of permission
   */
  static async logPermissionGranted(params: {
    permissionType: string;
  }): Promise<void> {
    await analyticsService.logEvent('permission_granted', {
      permission_type: params.permissionType,
      timestamp: Date.now(),
    });
  }

  // ========================================
  // Feedback Events
  // ========================================

  /**
   * Feedback submitted
   *
   * @param feedbackType - Type of feedback (bug, feature, general)
   * @param hasEmail - Whether user provided email
   */
  static async logFeedbackSubmitted(params: {
    feedbackType: 'bug' | 'feature' | 'general';
    hasEmail: boolean;
  }): Promise<void> {
    await analyticsService.logEvent('feedback_submitted', {
      feedback_type: params.feedbackType,
      has_email: params.hasEmail,
      timestamp: Date.now(),
    });
  }

  // ========================================
  // User Engagement Events
  // ========================================

  /**
   * Tutorial completed
   *
   * @param stepNumber - Which tutorial step was completed
   */
  static async logTutorialCompleted(params: { stepNumber: number }): Promise<void> {
    await analyticsService.logEvent('tutorial_completed', {
      step_number: params.stepNumber,
      timestamp: Date.now(),
    });
  }

  /**
   * Share action
   *
   * User shared the app or a session.
   *
   * @param contentType - What was shared (app, session)
   */
  static async logShare(params: { contentType: string }): Promise<void> {
    await analyticsService.logEvent('share', {
      content_type: params.contentType,
      timestamp: Date.now(),
    });
  }
}

/**
 * User Properties
 *
 * Set user properties for segmentation.
 */
export class AnalyticsUserProperties {
  /**
   * Set device type
   *
   * @param deviceBrand - Device brand (e.g., 'Samsung', 'Google')
   * @param deviceModel - Device model (e.g., 'Galaxy S23')
   */
  static async setDeviceInfo(params: {
    deviceBrand: string;
    deviceModel: string;
  }): Promise<void> {
    await analyticsService.setUserProperty('device_brand', params.deviceBrand.substring(0, 36));
    await analyticsService.setUserProperty('device_model', params.deviceModel.substring(0, 36));
  }

  /**
   * Set app version
   */
  static async setAppVersion(version: string): Promise<void> {
    await analyticsService.setUserProperty('app_version', version.substring(0, 36));
  }

  /**
   * Set user type
   *
   * @param userType - User type (e.g., 'researcher', 'student', 'general')
   */
  static async setUserType(userType: string): Promise<void> {
    await analyticsService.setUserProperty('user_type', userType.substring(0, 36));
  }

  /**
   * Set total recording count
   *
   * @param count - Total number of recordings user has made
   */
  static async setTotalRecordingCount(count: number): Promise<void> {
    await analyticsService.setUserProperty('total_recordings', count.toString().substring(0, 36));
  }

  /**
   * Set sync enabled status
   */
  static async setSyncEnabled(enabled: boolean): Promise<void> {
    await analyticsService.setUserProperty('sync_enabled', enabled.toString());
  }
}
