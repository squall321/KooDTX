/**
 * Battery Monitor Service
 * Phase 98: Dynamic sampling rate adjustment based on battery level
 *
 * Features:
 * - Battery level detection
 * - Low power mode detection
 * - Automatic sampling rate adjustment (200Hz -> 50Hz)
 * - User settings respect
 * - Status notifications
 */

import {NativeModules, NativeEventEmitter, Platform} from 'react-native';

/**
 * Battery state
 */
export enum BatteryState {
  UNKNOWN = 'unknown',
  CHARGING = 'charging',
  DISCHARGING = 'discharging',
  FULL = 'full',
  LOW = 'low',
  CRITICAL = 'critical',
}

/**
 * Power mode
 */
export enum PowerMode {
  NORMAL = 'normal',
  LOW_POWER = 'low_power',
  ULTRA_LOW_POWER = 'ultra_low_power',
}

/**
 * Battery info
 */
export interface BatteryInfo {
  level: number; // 0-100
  state: BatteryState;
  powerMode: PowerMode;
  isCharging: boolean;
  isLowPowerMode: boolean;
  timestamp: number;
}

/**
 * Battery threshold configuration
 */
export interface BatteryThresholds {
  low: number; // Battery level threshold for low state (default: 20)
  critical: number; // Battery level threshold for critical state (default: 10)
  enableAutoAdjust: boolean; // Enable automatic sampling rate adjustment (default: true)
  respectUserSettings: boolean; // Respect user manual settings (default: true)
}

/**
 * Battery event
 */
export interface BatteryEvent {
  type: 'level_change' | 'state_change' | 'power_mode_change';
  batteryInfo: BatteryInfo;
  timestamp: number;
}

/**
 * Battery event listener
 */
export type BatteryEventListener = (event: BatteryEvent) => void;

/**
 * Battery Monitor Service
 * Monitors battery level and adjusts sensor sampling rates
 */
export class BatteryMonitorService {
  private static instance: BatteryMonitorService;

  // Current battery info
  private batteryInfo: BatteryInfo = {
    level: 100,
    state: BatteryState.UNKNOWN,
    powerMode: PowerMode.NORMAL,
    isCharging: false,
    isLowPowerMode: false,
    timestamp: Date.now(),
  };

  // Configuration
  private thresholds: BatteryThresholds = {
    low: 20,
    critical: 10,
    enableAutoAdjust: true,
    respectUserSettings: true,
  };

  // Event listeners
  private eventListeners: Set<BatteryEventListener> = new Set();

  // Monitoring state
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private monitoringIntervalMs: number = 30000; // 30 seconds

  /**
   * Private constructor (Singleton)
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): BatteryMonitorService {
    if (!BatteryMonitorService.instance) {
      BatteryMonitorService.instance = new BatteryMonitorService();
    }
    return BatteryMonitorService.instance;
  }

  /**
   * Configure battery thresholds
   * Phase 98: Configuration
   *
   * @param thresholds Battery thresholds
   */
  public configure(thresholds: Partial<BatteryThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds,
    };
    console.log('BatteryMonitorService configured:', this.thresholds);
  }

  /**
   * Start battery monitoring
   * Phase 98: Battery level detection
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('BatteryMonitorService: Already monitoring');
      return;
    }

    this.isMonitoring = true;

    // Initial battery check
    this.checkBatteryStatus();

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkBatteryStatus();
    }, this.monitoringIntervalMs);

    console.log('BatteryMonitorService: Started monitoring');
  }

  /**
   * Stop battery monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    console.log('BatteryMonitorService: Stopped monitoring');
  }

  /**
   * Check battery status
   * Phase 98: Battery level and power mode detection
   */
  private async checkBatteryStatus(): Promise<void> {
    try {
      // Get battery info
      // Note: This is a placeholder. In Phase 100, we'll use react-native-device-info
      const newBatteryInfo = await this.getBatteryInfo();

      // Check for changes
      const previousInfo = this.batteryInfo;

      // Update battery info
      this.batteryInfo = newBatteryInfo;

      // Emit events
      if (previousInfo.level !== newBatteryInfo.level) {
        this.emitEvent({
          type: 'level_change',
          batteryInfo: newBatteryInfo,
          timestamp: Date.now(),
        });
      }

      if (previousInfo.state !== newBatteryInfo.state) {
        this.emitEvent({
          type: 'state_change',
          batteryInfo: newBatteryInfo,
          timestamp: Date.now(),
        });
      }

      if (previousInfo.powerMode !== newBatteryInfo.powerMode) {
        this.emitEvent({
          type: 'power_mode_change',
          batteryInfo: newBatteryInfo,
          timestamp: Date.now(),
        });
      }

    } catch (error) {
      console.error('Failed to check battery status:', error);
    }
  }

  /**
   * Get battery info
   * Phase 98: Battery info retrieval
   *
   * Note: This is a placeholder implementation.
   * In Phase 100, we'll integrate with react-native-device-info.
   */
  private async getBatteryInfo(): Promise<BatteryInfo> {
    // Placeholder: Return mock battery info
    // TODO: In Phase 100, use react-native-device-info

    // For now, simulate battery info
    const level = Math.max(0, Math.min(100, this.batteryInfo.level - Math.random() * 2));
    const isCharging = false; // Placeholder
    const isLowPowerMode = level < this.thresholds.low; // Simple heuristic

    let state: BatteryState;
    if (isCharging) {
      state = BatteryState.CHARGING;
    } else if (level >= 100) {
      state = BatteryState.FULL;
    } else if (level <= this.thresholds.critical) {
      state = BatteryState.CRITICAL;
    } else if (level <= this.thresholds.low) {
      state = BatteryState.LOW;
    } else {
      state = BatteryState.DISCHARGING;
    }

    let powerMode: PowerMode;
    if (level <= this.thresholds.critical) {
      powerMode = PowerMode.ULTRA_LOW_POWER;
    } else if (isLowPowerMode || level <= this.thresholds.low) {
      powerMode = PowerMode.LOW_POWER;
    } else {
      powerMode = PowerMode.NORMAL;
    }

    return {
      level,
      state,
      powerMode,
      isCharging,
      isLowPowerMode,
      timestamp: Date.now(),
    };
  }

  /**
   * Get current battery info
   */
  public getBatteryInfo(): BatteryInfo {
    return {...this.batteryInfo};
  }

  /**
   * Check if auto-adjustment is enabled
   */
  public isAutoAdjustEnabled(): boolean {
    return this.thresholds.enableAutoAdjust;
  }

  /**
   * Get recommended sampling rate multiplier based on battery state
   * Phase 98: Sampling rate adjustment
   *
   * @returns Multiplier (0.25 = 25%, 0.5 = 50%, 1.0 = 100%)
   */
  public getRecommendedSamplingRateMultiplier(): number {
    if (!this.thresholds.enableAutoAdjust) {
      return 1.0; // No adjustment
    }

    switch (this.batteryInfo.powerMode) {
      case PowerMode.ULTRA_LOW_POWER:
        return 0.25; // 25% of normal rate (e.g., 200Hz -> 50Hz)
      case PowerMode.LOW_POWER:
        return 0.5; // 50% of normal rate (e.g., 200Hz -> 100Hz)
      case PowerMode.NORMAL:
      default:
        return 1.0; // 100% normal rate
    }
  }

  /**
   * Get recommended sampling rate
   * Phase 98: Automatic sampling rate calculation
   *
   * @param normalRate Normal sampling rate (Hz)
   * @returns Recommended sampling rate (Hz)
   */
  public getRecommendedSamplingRate(normalRate: number): number {
    const multiplier = this.getRecommendedSamplingRateMultiplier();
    return Math.round(normalRate * multiplier);
  }

  /**
   * Check if should adjust sampling rate
   * Phase 98: User settings respect
   */
  public shouldAdjustSamplingRate(): boolean {
    if (!this.thresholds.enableAutoAdjust) {
      return false;
    }

    // If user settings should be respected, only adjust in low power modes
    if (this.thresholds.respectUserSettings) {
      return this.batteryInfo.powerMode !== PowerMode.NORMAL;
    }

    return true;
  }

  /**
   * Add event listener
   */
  public addEventListener(listener: BatteryEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Remove all event listeners
   */
  public removeAllEventListeners(): void {
    this.eventListeners.clear();
  }

  /**
   * Emit event
   */
  private emitEvent(event: BatteryEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in battery event listener:', error);
      }
    });
  }

  /**
   * Cleanup service
   */
  public cleanup(): void {
    this.stopMonitoring();
    this.removeAllEventListeners();
  }
}

/**
 * Export singleton instance
 */
export const batteryMonitorService = BatteryMonitorService.getInstance();

/**
 * Export default
 */
export default batteryMonitorService;
