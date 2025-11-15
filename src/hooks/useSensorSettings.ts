/**
 * useSensorSettings Hook
 * Phase 88: React Hook for sensor settings management
 *
 * Features:
 * - Access sensor settings
 * - Update sensor configurations
 * - Enable/disable sensors
 * - GPS accuracy mode
 * - Battery saver mode
 * - Settings persistence
 */

import {useState, useEffect, useCallback} from 'react';
import {
  sensorSettingsService,
  type AppSettings,
  type SensorSettings,
  type SensorConfiguration,
  type GPSSettings,
  type BatterySaverSettings,
  BatterySaverMode,
} from '@services/settings/SensorSettingsService';
import {GPSAccuracyMode} from '@services/gps/GPSService';
import type {AndroidSensorType} from '@native';
import {logger} from '../utils/logger';

/**
 * Hook options
 */
export interface UseSensorSettingsOptions {
  /**
   * Auto-initialize on mount
   * @default true
   */
  autoInitialize?: boolean;
}

/**
 * Hook result
 */
export interface UseSensorSettingsResult {
  /**
   * All settings
   */
  settings: AppSettings | null;

  /**
   * Sensor settings
   */
  sensorSettings: SensorSettings | null;

  /**
   * GPS settings
   */
  gpsSettings: GPSSettings | null;

  /**
   * Battery saver settings
   */
  batterySaverSettings: BatterySaverSettings | null;

  /**
   * Initialized state
   */
  isInitialized: boolean;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error state
   */
  error: Error | null;

  /**
   * Initialize service
   */
  initialize: () => Promise<void>;

  /**
   * Get sensor configuration
   */
  getSensorConfig: (sensorType: keyof SensorSettings) => SensorConfiguration | null;

  /**
   * Update sensor configuration
   */
  updateSensorConfig: (
    sensorType: keyof SensorSettings,
    config: Partial<SensorConfiguration>,
  ) => Promise<void>;

  /**
   * Enable sensor
   */
  enableSensor: (sensorType: keyof SensorSettings) => Promise<void>;

  /**
   * Disable sensor
   */
  disableSensor: (sensorType: keyof SensorSettings) => Promise<void>;

  /**
   * Toggle sensor
   */
  toggleSensor: (sensorType: keyof SensorSettings) => Promise<void>;

  /**
   * Set sensor sample rate
   */
  setSensorSampleRate: (
    sensorType: keyof SensorSettings,
    sampleRate: number,
  ) => Promise<void>;

  /**
   * Update GPS settings
   */
  updateGPSSettings: (settings: Partial<GPSSettings>) => Promise<void>;

  /**
   * Set GPS accuracy mode
   */
  setGPSAccuracyMode: (mode: GPSAccuracyMode) => Promise<void>;

  /**
   * Update battery saver settings
   */
  updateBatterySaverSettings: (
    settings: Partial<BatterySaverSettings>,
  ) => Promise<void>;

  /**
   * Set battery saver mode
   */
  setBatterySaverMode: (mode: BatterySaverMode) => Promise<void>;

  /**
   * Get enabled sensors
   */
  getEnabledSensors: () => Array<keyof SensorSettings>;

  /**
   * Get enabled Android sensor types
   */
  getEnabledAndroidSensorTypes: () => AndroidSensorType[];

  /**
   * Get adjusted sensor settings (with battery saver applied)
   */
  getAdjustedSensorSettings: () => SensorSettings | null;

  /**
   * Reset to defaults
   */
  resetToDefaults: () => Promise<void>;

  /**
   * Export settings
   */
  exportSettings: () => string | null;

  /**
   * Import settings
   */
  importSettings: (settingsJson: string) => Promise<void>;

  /**
   * Refresh settings
   */
  refresh: () => void;
}

/**
 * Hook for sensor settings management
 *
 * @example
 * ```tsx
 * function SettingsScreen() {
 *   const settings = useSensorSettings();
 *
 *   if (settings.isLoading) {
 *     return <Text>Loading...</Text>;
 *   }
 *
 *   return (
 *     <View>
 *       <Switch
 *         value={settings.getSensorConfig('accelerometer')?.enabled}
 *         onValueChange={() => settings.toggleSensor('accelerometer')}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */
export function useSensorSettings(
  options: UseSensorSettingsOptions = {},
): UseSensorSettingsResult {
  const {autoInitialize = true} = options;

  // State
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Initialize service
   */
  const initialize = useCallback(async () => {
    if (isInitialized) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sensorSettingsService.initialize();
      const loadedSettings = sensorSettingsService.getSettings();
      setSettings(loadedSettings);
      setIsInitialized(true);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger.error('Failed to initialize sensor settings:', errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  /**
   * Refresh settings from service
   */
  const refresh = useCallback(() => {
    if (!isInitialized) {
      return;
    }

    try {
      const currentSettings = sensorSettingsService.getSettings();
      setSettings(currentSettings);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger.error('Failed to refresh settings:', errorObj);
    }
  }, [isInitialized]);

  /**
   * Get sensor configuration
   */
  const getSensorConfig = useCallback(
    (sensorType: keyof SensorSettings): SensorConfiguration | null => {
      if (!isInitialized) {
        return null;
      }
      return sensorSettingsService.getSensorConfig(sensorType);
    },
    [isInitialized],
  );

  /**
   * Update sensor configuration
   */
  const updateSensorConfig = useCallback(
    async (
      sensorType: keyof SensorSettings,
      config: Partial<SensorConfiguration>,
    ): Promise<void> => {
      try {
        await sensorSettingsService.updateSensorConfig(sensorType, config);
        refresh();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      }
    },
    [refresh],
  );

  /**
   * Enable sensor
   */
  const enableSensor = useCallback(
    async (sensorType: keyof SensorSettings): Promise<void> => {
      await updateSensorConfig(sensorType, {enabled: true});
    },
    [updateSensorConfig],
  );

  /**
   * Disable sensor
   */
  const disableSensor = useCallback(
    async (sensorType: keyof SensorSettings): Promise<void> => {
      await updateSensorConfig(sensorType, {enabled: false});
    },
    [updateSensorConfig],
  );

  /**
   * Toggle sensor
   */
  const toggleSensor = useCallback(
    async (sensorType: keyof SensorSettings): Promise<void> => {
      try {
        await sensorSettingsService.toggleSensor(sensorType);
        refresh();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      }
    },
    [refresh],
  );

  /**
   * Set sensor sample rate
   */
  const setSensorSampleRate = useCallback(
    async (
      sensorType: keyof SensorSettings,
      sampleRate: number,
    ): Promise<void> => {
      await updateSensorConfig(sensorType, {sampleRate});
    },
    [updateSensorConfig],
  );

  /**
   * Update GPS settings
   */
  const updateGPSSettings = useCallback(
    async (gpsSettings: Partial<GPSSettings>): Promise<void> => {
      try {
        await sensorSettingsService.updateGPSSettings(gpsSettings);
        refresh();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      }
    },
    [refresh],
  );

  /**
   * Set GPS accuracy mode
   */
  const setGPSAccuracyMode = useCallback(
    async (mode: GPSAccuracyMode): Promise<void> => {
      await updateGPSSettings({accuracyMode: mode});
    },
    [updateGPSSettings],
  );

  /**
   * Update battery saver settings
   */
  const updateBatterySaverSettings = useCallback(
    async (
      batterySaverSettings: Partial<BatterySaverSettings>,
    ): Promise<void> => {
      try {
        await sensorSettingsService.updateBatterySaverSettings(
          batterySaverSettings,
        );
        refresh();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      }
    },
    [refresh],
  );

  /**
   * Set battery saver mode
   */
  const setBatterySaverMode = useCallback(
    async (mode: BatterySaverMode): Promise<void> => {
      await updateBatterySaverSettings({mode});
    },
    [updateBatterySaverSettings],
  );

  /**
   * Get enabled sensors
   */
  const getEnabledSensors = useCallback((): Array<keyof SensorSettings> => {
    if (!isInitialized) {
      return [];
    }
    return sensorSettingsService.getEnabledSensors();
  }, [isInitialized]);

  /**
   * Get enabled Android sensor types
   */
  const getEnabledAndroidSensorTypes = useCallback((): AndroidSensorType[] => {
    if (!isInitialized) {
      return [];
    }
    return sensorSettingsService.getEnabledAndroidSensorTypes();
  }, [isInitialized]);

  /**
   * Get adjusted sensor settings
   */
  const getAdjustedSensorSettings = useCallback((): SensorSettings | null => {
    if (!isInitialized) {
      return null;
    }
    return sensorSettingsService.getAdjustedSensorSettings();
  }, [isInitialized]);

  /**
   * Reset to defaults
   */
  const resetToDefaults = useCallback(async (): Promise<void> => {
    try {
      await sensorSettingsService.resetToDefaults();
      refresh();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, [refresh]);

  /**
   * Export settings
   */
  const exportSettings = useCallback((): string | null => {
    if (!isInitialized) {
      return null;
    }
    return sensorSettingsService.exportSettings();
  }, [isInitialized]);

  /**
   * Import settings
   */
  const importSettings = useCallback(
    async (settingsJson: string): Promise<void> => {
      try {
        await sensorSettingsService.importSettings(settingsJson);
        refresh();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      }
    },
    [refresh],
  );

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    if (autoInitialize && !isInitialized && !isLoading) {
      initialize();
    }
  }, [autoInitialize, isInitialized, isLoading, initialize]);

  return {
    settings,
    sensorSettings: settings?.sensors ?? null,
    gpsSettings: settings?.gps ?? null,
    batterySaverSettings: settings?.batterySaver ?? null,
    isInitialized,
    isLoading,
    error,
    initialize,
    getSensorConfig,
    updateSensorConfig,
    enableSensor,
    disableSensor,
    toggleSensor,
    setSensorSampleRate,
    updateGPSSettings,
    setGPSAccuracyMode,
    updateBatterySaverSettings,
    setBatterySaverMode,
    getEnabledSensors,
    getEnabledAndroidSensorTypes,
    getAdjustedSensorSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    refresh,
  };
}

/**
 * Export default
 */
export default useSensorSettings;
