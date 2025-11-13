/**
 * Sensor Settings Service
 * Phase 88: Sensor configuration management with AsyncStorage persistence
 *
 * Features:
 * - Sensor sampling rate settings
 * - Sensor enable/disable
 * - GPS accuracy mode
 * - Battery saver mode
 * - AsyncStorage persistence
 * - Default settings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {SensorType} from '@app-types/sensor.types';
import {AndroidSensorType} from '@native';
import {GPSAccuracyMode} from '@services/gps/GPSService';

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  SENSOR_SETTINGS: '@koodtx:sensor_settings',
  BATTERY_SAVER: '@koodtx:battery_saver',
  GPS_ACCURACY: '@koodtx:gps_accuracy',
} as const;

/**
 * Battery saver mode
 */
export enum BatterySaverMode {
  OFF = 'off',           // Normal operation
  BALANCED = 'balanced', // Balanced battery usage
  AGGRESSIVE = 'aggressive', // Aggressive battery saving
}

/**
 * Individual sensor configuration
 */
export interface SensorConfiguration {
  enabled: boolean;
  sampleRate: number; // Hz
  androidSensorType?: AndroidSensorType;
}

/**
 * Complete sensor settings
 */
export interface SensorSettings {
  accelerometer: SensorConfiguration;
  gyroscope: SensorConfiguration;
  magnetometer: SensorConfiguration;
  gravity: SensorConfiguration;
  linearAcceleration: SensorConfiguration;
  rotationVector: SensorConfiguration;
  stepDetector: SensorConfiguration;
  stepCounter: SensorConfiguration;
  significantMotion: SensorConfiguration;
  proximity: SensorConfiguration;
  light: SensorConfiguration;
  pressure: SensorConfiguration;
  temperature: SensorConfiguration;
  humidity: SensorConfiguration;
  gps: SensorConfiguration;
}

/**
 * GPS settings
 */
export interface GPSSettings {
  enabled: boolean;
  accuracyMode: GPSAccuracyMode;
  updateInterval: number; // seconds
  distanceFilter: number; // meters
}

/**
 * Battery saver settings
 */
export interface BatterySaverSettings {
  mode: BatterySaverMode;
  reducedSampleRate: number; // Hz
  disableBackgroundGPS: boolean;
  minUpdateInterval: number; // seconds
}

/**
 * Complete app settings
 */
export interface AppSettings {
  sensors: SensorSettings;
  gps: GPSSettings;
  batterySaver: BatterySaverSettings;
}

/**
 * Default sensor configuration
 */
const DEFAULT_SENSOR_CONFIG: SensorConfiguration = {
  enabled: false,
  sampleRate: 50, // 50 Hz default
};

/**
 * Default sensor settings
 */
const DEFAULT_SENSOR_SETTINGS: SensorSettings = {
  accelerometer: {
    ...DEFAULT_SENSOR_CONFIG,
    enabled: true,
    sampleRate: 100,
    androidSensorType: AndroidSensorType.ACCELEROMETER,
  },
  gyroscope: {
    ...DEFAULT_SENSOR_CONFIG,
    enabled: true,
    sampleRate: 100,
    androidSensorType: AndroidSensorType.GYROSCOPE,
  },
  magnetometer: {
    ...DEFAULT_SENSOR_CONFIG,
    enabled: true,
    sampleRate: 50,
    androidSensorType: AndroidSensorType.MAGNETIC_FIELD,
  },
  gravity: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 50,
    androidSensorType: AndroidSensorType.GRAVITY,
  },
  linearAcceleration: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 100,
    androidSensorType: AndroidSensorType.LINEAR_ACCELERATION,
  },
  rotationVector: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 50,
    androidSensorType: AndroidSensorType.ROTATION_VECTOR,
  },
  stepDetector: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 0, // Event-based
    androidSensorType: AndroidSensorType.STEP_DETECTOR,
  },
  stepCounter: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 1,
    androidSensorType: AndroidSensorType.STEP_COUNTER,
  },
  significantMotion: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 0, // Event-based
    androidSensorType: AndroidSensorType.SIGNIFICANT_MOTION,
  },
  proximity: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 5,
    androidSensorType: AndroidSensorType.PROXIMITY,
  },
  light: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 5,
    androidSensorType: AndroidSensorType.LIGHT,
  },
  pressure: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 10,
    androidSensorType: AndroidSensorType.PRESSURE,
  },
  temperature: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 1,
    androidSensorType: AndroidSensorType.AMBIENT_TEMPERATURE,
  },
  humidity: {
    ...DEFAULT_SENSOR_CONFIG,
    sampleRate: 1,
    androidSensorType: AndroidSensorType.RELATIVE_HUMIDITY,
  },
  gps: {
    ...DEFAULT_SENSOR_CONFIG,
    enabled: true,
    sampleRate: 1, // 1 Hz for GPS
  },
};

/**
 * Default GPS settings
 */
const DEFAULT_GPS_SETTINGS: GPSSettings = {
  enabled: true,
  accuracyMode: GPSAccuracyMode.BALANCED,
  updateInterval: 5, // 5 seconds
  distanceFilter: 10, // 10 meters
};

/**
 * Default battery saver settings
 */
const DEFAULT_BATTERY_SAVER_SETTINGS: BatterySaverSettings = {
  mode: BatterySaverMode.OFF,
  reducedSampleRate: 25, // 25 Hz when battery saver is on
  disableBackgroundGPS: false,
  minUpdateInterval: 10, // 10 seconds minimum update interval
};

/**
 * Default app settings
 */
const DEFAULT_APP_SETTINGS: AppSettings = {
  sensors: DEFAULT_SENSOR_SETTINGS,
  gps: DEFAULT_GPS_SETTINGS,
  batterySaver: DEFAULT_BATTERY_SAVER_SETTINGS,
};

/**
 * Sensor Settings Service
 * Manages sensor configuration with AsyncStorage persistence
 */
class SensorSettingsServiceClass {
  private static instance: SensorSettingsServiceClass;
  private settings: AppSettings | null = null;
  private initialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SensorSettingsServiceClass {
    if (!SensorSettingsServiceClass.instance) {
      SensorSettingsServiceClass.instance = new SensorSettingsServiceClass();
    }
    return SensorSettingsServiceClass.instance;
  }

  /**
   * Initialize service and load settings from storage
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.loadSettings();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize SensorSettingsService:', error);
      // Use default settings on error
      this.settings = DEFAULT_APP_SETTINGS;
      this.initialized = true;
    }
  }

  /**
   * Load settings from AsyncStorage
   */
  private async loadSettings(): Promise<void> {
    try {
      const settingsJson = await AsyncStorage.getItem(
        STORAGE_KEYS.SENSOR_SETTINGS,
      );

      if (settingsJson) {
        const loadedSettings = JSON.parse(settingsJson) as AppSettings;
        // Merge with defaults to handle new settings
        this.settings = this.mergeWithDefaults(loadedSettings);
      } else {
        // No saved settings, use defaults
        this.settings = DEFAULT_APP_SETTINGS;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = DEFAULT_APP_SETTINGS;
    }
  }

  /**
   * Save settings to AsyncStorage
   */
  private async saveSettings(): Promise<void> {
    if (!this.settings) {
      return;
    }

    try {
      const settingsJson = JSON.stringify(this.settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SENSOR_SETTINGS, settingsJson);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Merge loaded settings with defaults
   */
  private mergeWithDefaults(loaded: AppSettings): AppSettings {
    return {
      sensors: {...DEFAULT_SENSOR_SETTINGS, ...loaded.sensors},
      gps: {...DEFAULT_GPS_SETTINGS, ...loaded.gps},
      batterySaver: {...DEFAULT_BATTERY_SAVER_SETTINGS, ...loaded.batterySaver},
    };
  }

  /**
   * Ensure initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('SensorSettingsService not initialized');
    }
  }

  /**
   * Get all settings
   */
  public getSettings(): AppSettings {
    this.ensureInitialized();
    return this.settings!;
  }

  /**
   * Get sensor settings
   */
  public getSensorSettings(): SensorSettings {
    this.ensureInitialized();
    return this.settings!.sensors;
  }

  /**
   * Get individual sensor configuration
   */
  public getSensorConfig(sensorType: keyof SensorSettings): SensorConfiguration {
    this.ensureInitialized();
    return this.settings!.sensors[sensorType];
  }

  /**
   * Get GPS settings
   */
  public getGPSSettings(): GPSSettings {
    this.ensureInitialized();
    return this.settings!.gps;
  }

  /**
   * Get battery saver settings
   */
  public getBatterySaverSettings(): BatterySaverSettings {
    this.ensureInitialized();
    return this.settings!.batterySaver;
  }

  /**
   * Update sensor configuration
   */
  public async updateSensorConfig(
    sensorType: keyof SensorSettings,
    config: Partial<SensorConfiguration>,
  ): Promise<void> {
    this.ensureInitialized();

    this.settings!.sensors[sensorType] = {
      ...this.settings!.sensors[sensorType],
      ...config,
    };

    await this.saveSettings();
  }

  /**
   * Enable sensor
   */
  public async enableSensor(sensorType: keyof SensorSettings): Promise<void> {
    await this.updateSensorConfig(sensorType, {enabled: true});
  }

  /**
   * Disable sensor
   */
  public async disableSensor(sensorType: keyof SensorSettings): Promise<void> {
    await this.updateSensorConfig(sensorType, {enabled: false});
  }

  /**
   * Toggle sensor
   */
  public async toggleSensor(sensorType: keyof SensorSettings): Promise<void> {
    const config = this.getSensorConfig(sensorType);
    await this.updateSensorConfig(sensorType, {enabled: !config.enabled});
  }

  /**
   * Set sensor sample rate
   */
  public async setSensorSampleRate(
    sensorType: keyof SensorSettings,
    sampleRate: number,
  ): Promise<void> {
    if (sampleRate < 0) {
      throw new Error('Sample rate must be non-negative');
    }
    await this.updateSensorConfig(sensorType, {sampleRate});
  }

  /**
   * Update GPS settings
   */
  public async updateGPSSettings(
    settings: Partial<GPSSettings>,
  ): Promise<void> {
    this.ensureInitialized();

    this.settings!.gps = {
      ...this.settings!.gps,
      ...settings,
    };

    await this.saveSettings();
  }

  /**
   * Set GPS accuracy mode
   */
  public async setGPSAccuracyMode(mode: GPSAccuracyMode): Promise<void> {
    await this.updateGPSSettings({accuracyMode: mode});
  }

  /**
   * Update battery saver settings
   */
  public async updateBatterySaverSettings(
    settings: Partial<BatterySaverSettings>,
  ): Promise<void> {
    this.ensureInitialized();

    this.settings!.batterySaver = {
      ...this.settings!.batterySaver,
      ...settings,
    };

    await this.saveSettings();
  }

  /**
   * Set battery saver mode
   */
  public async setBatterySaverMode(mode: BatterySaverMode): Promise<void> {
    await this.updateBatterySaverSettings({mode});
  }

  /**
   * Get enabled sensors
   */
  public getEnabledSensors(): Array<keyof SensorSettings> {
    this.ensureInitialized();
    const sensors = this.settings!.sensors;
    return (Object.keys(sensors) as Array<keyof SensorSettings>).filter(
      key => sensors[key].enabled,
    );
  }

  /**
   * Get enabled Android sensor types
   */
  public getEnabledAndroidSensorTypes(): AndroidSensorType[] {
    const enabledSensors = this.getEnabledSensors();
    return enabledSensors
      .map(sensor => this.settings!.sensors[sensor].androidSensorType)
      .filter((type): type is AndroidSensorType => type !== undefined);
  }

  /**
   * Apply battery saver adjustments to sensor settings
   */
  public getAdjustedSensorSettings(): SensorSettings {
    this.ensureInitialized();
    const {mode, reducedSampleRate} = this.settings!.batterySaver;
    const sensors = this.settings!.sensors;

    if (mode === BatterySaverMode.OFF) {
      return sensors;
    }

    // Create adjusted settings based on battery saver mode
    const adjusted: SensorSettings = {...sensors};

    // Apply sample rate reduction
    const sensorKeys = Object.keys(adjusted) as Array<keyof SensorSettings>;
    for (const key of sensorKeys) {
      const config = adjusted[key];
      if (config.enabled && config.sampleRate > 0) {
        if (mode === BatterySaverMode.BALANCED) {
          // Reduce sample rate by 50%
          adjusted[key] = {
            ...config,
            sampleRate: Math.max(1, Math.floor(config.sampleRate / 2)),
          };
        } else if (mode === BatterySaverMode.AGGRESSIVE) {
          // Use minimum sample rate
          adjusted[key] = {
            ...config,
            sampleRate: Math.min(reducedSampleRate, config.sampleRate),
          };
        }
      }
    }

    return adjusted;
  }

  /**
   * Reset to default settings
   */
  public async resetToDefaults(): Promise<void> {
    this.settings = DEFAULT_APP_SETTINGS;
    await this.saveSettings();
  }

  /**
   * Export settings as JSON
   */
  public exportSettings(): string {
    this.ensureInitialized();
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  public async importSettings(settingsJson: string): Promise<void> {
    try {
      const imported = JSON.parse(settingsJson) as AppSettings;
      this.settings = this.mergeWithDefaults(imported);
      await this.saveSettings();
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings JSON');
    }
  }

  /**
   * Clear all settings
   */
  public async clearSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SENSOR_SETTINGS);
      this.settings = DEFAULT_APP_SETTINGS;
      this.initialized = false;
    } catch (error) {
      console.error('Failed to clear settings:', error);
      throw error;
    }
  }
}

/**
 * Export singleton instance
 */
export const sensorSettingsService = SensorSettingsServiceClass.getInstance();

/**
 * Export default
 */
export default sensorSettingsService;
