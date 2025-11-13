/**
 * Foreground Service Manager
 * Phase 99: Background recording optimization
 *
 * Features:
 * - Foreground Service setup (Android)
 * - Notification display (recording status)
 * - Battery optimization exemption request
 * - Background restriction handling
 * - Doze mode support
 */

import {Platform} from 'react-native';

/**
 * Foreground service state
 */
export enum ForegroundServiceState {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  ERROR = 'error',
}

/**
 * Notification configuration
 */
export interface NotificationConfig {
  channelId: string;
  channelName: string;
  title: string;
  text: string;
  icon?: string; // Icon name (Android drawable)
  priority?: 'low' | 'default' | 'high' | 'max';
  ongoing?: boolean; // Non-dismissible notification (default: true)
  showWhen?: boolean; // Show timestamp (default: true)
  actions?: NotificationAction[];
}

/**
 * Notification action
 */
export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
}

/**
 * Foreground service options
 */
export interface ForegroundServiceOptions {
  notification: NotificationConfig;
  enableWakeLock?: boolean; // Enable wake lock (default: false, handled by WakeLockService)
  stopOnTaskRemoved?: boolean; // Stop service when task is removed (default: false)
}

/**
 * Battery optimization status
 */
export interface BatteryOptimizationStatus {
  isIgnoringBatteryOptimizations: boolean;
  canRequestExemption: boolean;
  isDozeMode: boolean;
  platform: string;
}

/**
 * Foreground Service Manager
 * Manages foreground service for background recording
 */
export class ForegroundServiceManager {
  private static instance: ForegroundServiceManager;

  // State
  private state: ForegroundServiceState = ForegroundServiceState.STOPPED;
  private serviceId: string | null = null;

  // Configuration
  private options: ForegroundServiceOptions | null = null;

  /**
   * Private constructor (Singleton)
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ForegroundServiceManager {
    if (!ForegroundServiceManager.instance) {
      ForegroundServiceManager.instance = new ForegroundServiceManager();
    }
    return ForegroundServiceManager.instance;
  }

  /**
   * Start foreground service
   * Phase 99: Foreground service setup
   *
   * @param serviceId Service ID (e.g., session ID)
   * @param options Service options
   */
  public async startForegroundService(
    serviceId: string,
    options: ForegroundServiceOptions,
  ): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('Foreground service is only supported on Android');
      return;
    }

    if (this.state === ForegroundServiceState.RUNNING) {
      console.warn('Foreground service already running');
      return;
    }

    this.state = ForegroundServiceState.STARTING;
    this.serviceId = serviceId;
    this.options = options;

    try {
      // TODO: Call native module to start foreground service
      // This is a placeholder. In production, you would call a native Android module.
      /*
      await NativeForegroundService.start({
        serviceId,
        channelId: options.notification.channelId,
        channelName: options.notification.channelName,
        notificationTitle: options.notification.title,
        notificationText: options.notification.text,
        notificationIcon: options.notification.icon,
        priority: options.notification.priority,
        ongoing: options.notification.ongoing,
        showWhen: options.notification.showWhen,
        actions: options.notification.actions,
        enableWakeLock: options.enableWakeLock,
        stopOnTaskRemoved: options.stopOnTaskRemoved,
      });
      */

      // Placeholder: Simulate successful start
      console.log('Foreground service started:', serviceId);
      console.log('Notification:', options.notification.title, '-', options.notification.text);

      this.state = ForegroundServiceState.RUNNING;

    } catch (error) {
      this.state = ForegroundServiceState.ERROR;
      console.error('Failed to start foreground service:', error);
      throw error;
    }
  }

  /**
   * Stop foreground service
   * Phase 99: Service cleanup
   */
  public async stopForegroundService(): Promise<void> {
    if (this.state !== ForegroundServiceState.RUNNING) {
      console.warn('Foreground service not running');
      return;
    }

    this.state = ForegroundServiceState.STOPPING;

    try {
      // TODO: Call native module to stop foreground service
      /*
      await NativeForegroundService.stop(this.serviceId);
      */

      // Placeholder: Simulate successful stop
      console.log('Foreground service stopped:', this.serviceId);

      this.state = ForegroundServiceState.STOPPED;
      this.serviceId = null;
      this.options = null;

    } catch (error) {
      this.state = ForegroundServiceState.ERROR;
      console.error('Failed to stop foreground service:', error);
      throw error;
    }
  }

  /**
   * Update notification
   * Phase 99: Dynamic notification update
   *
   * @param config Updated notification configuration
   */
  public async updateNotification(config: Partial<NotificationConfig>): Promise<void> {
    if (this.state !== ForegroundServiceState.RUNNING || !this.options) {
      console.warn('Cannot update notification: service not running');
      return;
    }

    try {
      // Merge with existing configuration
      const updatedNotification = {
        ...this.options.notification,
        ...config,
      };

      this.options.notification = updatedNotification;

      // TODO: Call native module to update notification
      /*
      await NativeForegroundService.updateNotification({
        serviceId: this.serviceId,
        ...updatedNotification,
      });
      */

      console.log('Notification updated:', updatedNotification.title, '-', updatedNotification.text);

    } catch (error) {
      console.error('Failed to update notification:', error);
      throw error;
    }
  }

  /**
   * Request battery optimization exemption
   * Phase 99: Battery optimization exemption
   *
   * @returns True if exemption was granted or already granted
   */
  public async requestBatteryOptimizationExemption(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('Battery optimization exemption is only supported on Android');
      return false;
    }

    try {
      // TODO: Call native module to request battery optimization exemption
      /*
      const granted = await NativeForegroundService.requestIgnoreBatteryOptimizations();
      return granted;
      */

      // Placeholder: Simulate permission dialog
      console.log('Requesting battery optimization exemption...');
      console.log('User should see a system dialog to allow this app to ignore battery optimizations');

      // Simulate granted
      return true;

    } catch (error) {
      console.error('Failed to request battery optimization exemption:', error);
      return false;
    }
  }

  /**
   * Check battery optimization status
   * Phase 99: Battery optimization and Doze mode detection
   *
   * @returns Battery optimization status
   */
  public async getBatteryOptimizationStatus(): Promise<BatteryOptimizationStatus> {
    if (Platform.OS !== 'android') {
      return {
        isIgnoringBatteryOptimizations: true, // iOS doesn't have this concept
        canRequestExemption: false,
        isDozeMode: false,
        platform: Platform.OS,
      };
    }

    try {
      // TODO: Call native module to get battery optimization status
      /*
      const status = await NativeForegroundService.getBatteryOptimizationStatus();
      return {
        isIgnoringBatteryOptimizations: status.isIgnoring,
        canRequestExemption: status.canRequest,
        isDozeMode: status.isDozeMode,
        platform: Platform.OS,
      };
      */

      // Placeholder: Return mock status
      return {
        isIgnoringBatteryOptimizations: false, // Assume not ignoring by default
        canRequestExemption: true,
        isDozeMode: false,
        platform: Platform.OS,
      };

    } catch (error) {
      console.error('Failed to get battery optimization status:', error);
      return {
        isIgnoringBatteryOptimizations: false,
        canRequestExemption: false,
        isDozeMode: false,
        platform: Platform.OS,
      };
    }
  }

  /**
   * Get current state
   */
  public getState(): ForegroundServiceState {
    return this.state;
  }

  /**
   * Check if service is running
   */
  public isRunning(): boolean {
    return this.state === ForegroundServiceState.RUNNING;
  }

  /**
   * Get current service ID
   */
  public getServiceId(): string | null {
    return this.serviceId;
  }

  /**
   * Get current options
   */
  public getOptions(): ForegroundServiceOptions | null {
    return this.options;
  }

  /**
   * Cleanup service
   */
  public async cleanup(): Promise<void> {
    if (this.isRunning()) {
      await this.stopForegroundService();
    }
  }
}

/**
 * Export singleton instance
 */
export const foregroundServiceManager = ForegroundServiceManager.getInstance();

/**
 * Export default
 */
export default foregroundServiceManager;
