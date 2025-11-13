/**
 * Device Info Service
 * Phase 100: Device information collection
 *
 * Features:
 * - Device model name
 * - OS version
 * - Battery status
 * - Device metadata for recordings
 * - Privacy-conscious data collection
 */

import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';

/**
 * Device information
 */
export interface DeviceInformation {
  // Device identifiers
  deviceId: string; // Unique device ID
  deviceName: string; // Device name (e.g., "iPhone 12", "Samsung Galaxy S21")
  manufacturer: string; // Manufacturer (e.g., "Apple", "Samsung")
  brand: string; // Brand name
  model: string; // Model number

  // OS information
  systemName: string; // OS name (e.g., "iOS", "Android")
  systemVersion: string; // OS version (e.g., "15.0", "12")
  apiLevel?: number; // Android API level (Android only)

  // App information
  appName: string; // App name
  appVersion: string; // App version
  buildNumber: string; // Build number

  // Hardware information
  totalMemory: number; // Total RAM in bytes
  cpuArchitecture?: string; // CPU architecture (e.g., "arm64")

  // Battery information
  batteryLevel: number; // Battery level (0-1)
  isCharging: boolean; // Is device charging
  lowPowerMode: boolean; // Low power mode enabled

  // Privacy
  isEmulator: boolean; // Is running on emulator
  isTablet: boolean; // Is tablet device

  // Metadata
  timestamp: number; // When this info was collected
}

/**
 * Device metadata (for recordings)
 */
export interface DeviceMetadata {
  deviceId: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  timestamp: number;
}

/**
 * Device Info Service
 * Collects device information for metadata
 */
export class DeviceInfoService {
  private static instance: DeviceInfoService;

  // Cached device info
  private cachedInfo: DeviceInformation | null = null;
  private cacheTimestamp: number = 0;
  private cacheValidityMs: number = 300000; // 5 minutes

  /**
   * Private constructor (Singleton)
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): DeviceInfoService {
    if (!DeviceInfoService.instance) {
      DeviceInfoService.instance = new DeviceInfoService();
    }
    return DeviceInfoService.instance;
  }

  /**
   * Get device information
   * Phase 100: Device info collection
   *
   * @param forceRefresh Force refresh cached info
   * @returns Device information
   */
  public async getDeviceInfo(forceRefresh: boolean = false): Promise<DeviceInformation> {
    // Return cached info if valid
    if (
      !forceRefresh &&
      this.cachedInfo &&
      Date.now() - this.cacheTimestamp < this.cacheValidityMs
    ) {
      return this.cachedInfo;
    }

    try {
      // Collect device information
      const [
        deviceId,
        deviceName,
        manufacturer,
        brand,
        model,
        systemName,
        systemVersion,
        apiLevel,
        appName,
        appVersion,
        buildNumber,
        totalMemory,
        cpuArchitecture,
        batteryLevel,
        isCharging,
        lowPowerMode,
        isEmulator,
        isTablet,
      ] = await Promise.all([
        DeviceInfo.getUniqueId(),
        DeviceInfo.getDeviceName(),
        DeviceInfo.getManufacturer(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemName(),
        DeviceInfo.getSystemVersion(),
        Platform.OS === 'android' ? DeviceInfo.getApiLevel() : Promise.resolve(undefined),
        DeviceInfo.getApplicationName(),
        DeviceInfo.getVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getTotalMemory(),
        DeviceInfo.supportedAbis().then(abis => abis[0]).catch(() => undefined),
        DeviceInfo.getBatteryLevel(),
        DeviceInfo.isBatteryCharging(),
        DeviceInfo.isPowerSaveMode(),
        DeviceInfo.isEmulator(),
        DeviceInfo.isTablet(),
      ]);

      const deviceInfo: DeviceInformation = {
        deviceId,
        deviceName,
        manufacturer,
        brand,
        model,
        systemName,
        systemVersion,
        apiLevel,
        appName,
        appVersion,
        buildNumber,
        totalMemory,
        cpuArchitecture,
        batteryLevel,
        isCharging,
        lowPowerMode,
        isEmulator,
        isTablet,
        timestamp: Date.now(),
      };

      // Cache the info
      this.cachedInfo = deviceInfo;
      this.cacheTimestamp = Date.now();

      return deviceInfo;

    } catch (error) {
      console.error('Failed to get device info:', error);
      throw error;
    }
  }

  /**
   * Get device metadata (lightweight)
   * Phase 100: Metadata for recordings
   *
   * @returns Device metadata
   */
  public async getDeviceMetadata(): Promise<DeviceMetadata> {
    const info = await this.getDeviceInfo();

    return {
      deviceId: info.deviceId,
      deviceModel: `${info.manufacturer} ${info.deviceName}`,
      osVersion: `${info.systemName} ${info.systemVersion}`,
      appVersion: info.appVersion,
      timestamp: Date.now(),
    };
  }

  /**
   * Get battery information
   * Phase 100: Battery info for BatteryMonitorService
   *
   * @returns Battery info
   */
  public async getBatteryInfo() {
    try {
      const [batteryLevel, isCharging, lowPowerMode] = await Promise.all([
        DeviceInfo.getBatteryLevel(),
        DeviceInfo.isBatteryCharging(),
        DeviceInfo.isPowerSaveMode(),
      ]);

      return {
        level: Math.round(batteryLevel * 100), // Convert to 0-100
        isCharging,
        lowPowerMode,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to get battery info:', error);
      throw error;
    }
  }

  /**
   * Get device ID (privacy-safe unique identifier)
   * Phase 100: Privacy-conscious ID
   *
   * @returns Device ID
   */
  public async getDeviceId(): Promise<string> {
    return await DeviceInfo.getUniqueId();
  }

  /**
   * Check if running on emulator
   * Phase 100: Emulator detection
   *
   * @returns True if running on emulator
   */
  public async isEmulator(): Promise<boolean> {
    return await DeviceInfo.isEmulator();
  }

  /**
   * Get system information summary
   * Phase 100: Summary for logging
   *
   * @returns System info summary
   */
  public async getSystemSummary(): Promise<string> {
    const info = await this.getDeviceInfo();

    return [
      `Device: ${info.manufacturer} ${info.deviceName} (${info.model})`,
      `OS: ${info.systemName} ${info.systemVersion}${info.apiLevel ? ` (API ${info.apiLevel})` : ''}`,
      `App: ${info.appName} v${info.appVersion} (${info.buildNumber})`,
      `Memory: ${(info.totalMemory / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      `Battery: ${Math.round(info.batteryLevel * 100)}%${info.isCharging ? ' (Charging)' : ''}`,
      `Emulator: ${info.isEmulator ? 'Yes' : 'No'}`,
    ].join('\n');
  }

  /**
   * Clear cached device info
   */
  public clearCache(): void {
    this.cachedInfo = null;
    this.cacheTimestamp = 0;
  }
}

/**
 * Export singleton instance
 */
export const deviceInfoService = DeviceInfoService.getInstance();

/**
 * Export default
 */
export default deviceInfoService;
