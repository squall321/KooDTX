/**
 * Pressure sensor service (Barometer)
 * Measures atmospheric pressure and estimates altitude
 *
 * Note: React Native Sensors library doesn't support pressure sensor.
 * This service requires a native module implementation.
 * On devices without pressure sensor, isAvailable() returns false.
 */

import {SensorType, type PressureData} from '@app-types/sensor.types';
import {SensorService, type SensorDataCallback, type SensorErrorCallback} from './SensorService';

/**
 * Pressure sensor configuration
 */
interface PressureConfig {
  // Sample interval in milliseconds
  sampleInterval: number;
  // Enable altitude calculation
  altitudeCalculation: boolean;
  // Reference sea level pressure in hPa (for altitude calculation)
  seaLevelPressure: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PressureConfig = {
  sampleInterval: 1000, // 1 second
  altitudeCalculation: true,
  seaLevelPressure: 1013.25, // Standard sea level pressure in hPa
};

export class PressureService extends SensorService<PressureData> {
  private config: PressureConfig = DEFAULT_CONFIG;
  private sampleTimer: NodeJS.Timeout | null = null;

  // Mock state for testing (will be replaced by native module)
  private mockPressure: number = 1013.25; // Standard sea level pressure

  constructor() {
    super();
  }

  getSensorType(): SensorType {
    return SensorType.PRESSURE;
  }

  /**
   * Configure pressure sensor parameters
   */
  configure(config: Partial<PressureConfig>): void {
    this.config = {...this.config, ...config};
  }

  /**
   * Set reference sea level pressure for altitude calculation
   */
  setSeaLevelPressure(pressure: number): void {
    this.config.seaLevelPressure = pressure;
  }

  /**
   * Check if pressure sensor is available
   *
   * Note: Currently returns false as native module is not implemented.
   * Override this in native implementation.
   */
  async isAvailable(): Promise<boolean> {
    // TODO: Implement native module check
    // For now, return false to indicate sensor is not available
    console.warn(
      'PressureService: Pressure sensor requires native module implementation. ' +
      'Sensor is not available in current React Native Sensors library.'
    );
    return false;
  }

  async start(
    sessionId: string,
    onData: SensorDataCallback<PressureData>,
    onError?: SensorErrorCallback,
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Pressure service is already running');
    }

    const available = await this.isAvailable();
    if (!available) {
      const error = new Error(
        'Pressure sensor is not available on this device. ' +
        'A native module implementation is required.'
      );
      if (onError) {
        onError(error);
      }
      throw error;
    }

    this.sessionId = sessionId;
    this.dataCallback = onData;
    this.errorCallback = onError || null;

    // TODO: Replace with native module pressure sensor listener
    // For now, use mock implementation for testing interface
    this.startMockSensor();

    this.isRunning = true;
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
      this.sampleTimer = null;
    }

    this.cleanup();
  }

  /**
   * Mock sensor implementation for testing
   * This should be replaced with native module implementation
   */
  private startMockSensor(): void {
    // This is a mock implementation for testing the interface
    // In production, this will be replaced by native module
    this.sampleTimer = setInterval(() => {
      if (this.dataCallback && this.sessionId) {
        // Simulate pressure changes (±5 hPa variation)
        this.mockPressure = 1013.25 + (Math.random() - 0.5) * 10;

        const altitude = this.config.altitudeCalculation
          ? this.calculateAltitude(this.mockPressure, this.config.seaLevelPressure)
          : undefined;

        const pressureData: PressureData = {
          id: `pressure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sensorType: SensorType.PRESSURE,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          pressure: this.mockPressure,
          altitude,
          seaLevelPressure: this.config.seaLevelPressure,
          isUploaded: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        this.dataCallback(pressureData);
      }
    }, this.config.sampleInterval);
  }

  /**
   * Calculate altitude from pressure using barometric formula
   *
   * Formula: h = 44330 * (1 - (P / P0)^0.1903)
   * where:
   *   h = altitude in meters
   *   P = measured pressure in hPa
   *   P0 = sea level pressure in hPa (reference)
   *
   * @param pressure Current atmospheric pressure in hPa
   * @param seaLevelPressure Reference sea level pressure in hPa
   * @returns Altitude in meters
   */
  private calculateAltitude(pressure: number, seaLevelPressure: number): number {
    // Barometric formula
    const altitude = 44330 * (1 - Math.pow(pressure / seaLevelPressure, 0.1903));
    return Math.round(altitude * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Calculate pressure at given altitude (inverse of calculateAltitude)
   *
   * Formula: P = P0 * (1 - h / 44330)^5.255
   *
   * @param altitude Altitude in meters
   * @param seaLevelPressure Reference sea level pressure in hPa
   * @returns Pressure in hPa
   */
  calculatePressureAtAltitude(altitude: number, seaLevelPressure: number): number {
    const pressure = seaLevelPressure * Math.pow(1 - altitude / 44330, 5.255);
    return Math.round(pressure * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get current pressure status
   */
  getStatus(): {
    isAvailable: boolean;
    currentPressure: number;
    estimatedAltitude: number;
    seaLevelPressure: number;
  } {
    return {
      isAvailable: false, // Will be true when native module is implemented
      currentPressure: this.mockPressure,
      estimatedAltitude: this.calculateAltitude(
        this.mockPressure,
        this.config.seaLevelPressure,
      ),
      seaLevelPressure: this.config.seaLevelPressure,
    };
  }

  /**
   * Detect pressure trend (rising, falling, stable)
   *
   * Useful for weather prediction:
   * - Rising pressure: improving weather
   * - Falling pressure: deteriorating weather
   * - Stable pressure: no significant change
   */
  detectPressureTrend(
    currentPressure: number,
    previousPressure: number,
    threshold: number = 0.5,
  ): 'rising' | 'falling' | 'stable' {
    const diff = currentPressure - previousPressure;

    if (diff > threshold) {
      return 'rising';
    } else if (diff < -threshold) {
      return 'falling';
    } else {
      return 'stable';
    }
  }

  /**
   * Estimate weather condition based on pressure and trend
   */
  estimateWeather(pressure: number, trend: 'rising' | 'falling' | 'stable'): string {
    if (pressure > 1023) {
      return trend === 'rising' ? 'Clear, dry' : 'Clearing';
    } else if (pressure > 1013) {
      return trend === 'rising'
        ? 'Fair'
        : trend === 'falling'
        ? 'Clouding up'
        : 'Partly cloudy';
    } else if (pressure > 1003) {
      return trend === 'falling' ? 'Rain likely' : 'Unsettled';
    } else {
      return trend === 'falling' ? 'Storm warning' : 'Rainy';
    }
  }
}

/**
 * Native Module Interface (for future implementation)
 *
 * Android:
 * - Sensor.TYPE_PRESSURE
 * - Returns pressure in hPa (hectopascals) = mbar (millibars)
 * - Typical range: 300-1100 hPa
 * - Sea level: ~1013.25 hPa
 *
 * iOS:
 * - CMAltimeter.relativeAltitude (requires motion permission)
 * - Returns relative altitude in meters
 * - Can calculate pressure from altitude
 *
 * Implementation guide:
 *
 * 1. Create native module:
 *    - Android: PressureModule.java
 *    - iOS: PressureModule.m
 *
 * 2. Expose methods:
 *    - isAvailable(): Promise<boolean>
 *    - startPressureUpdates(callback)
 *    - stopPressureUpdates()
 *    - getCurrentPressure(): Promise<number>
 *
 * 3. Event emission:
 *    - Emit 'PressureChanged' events
 *    - Include: pressure (hPa), timestamp
 *
 * 4. Replace mock implementation with:
 *    import { NativeModules, NativeEventEmitter } from 'react-native';
 *    const { PressureModule } = NativeModules;
 *    const pressureEmitter = new NativeEventEmitter(PressureModule);
 *
 * Altitude Calculation Notes:
 * - Standard formula: h = 44330 * (1 - (P/P0)^0.1903)
 * - Accuracy: ±10-20 meters typically
 * - Affected by weather: pressure changes due to weather systems
 * - Need calibration: use known altitude or GPS to calibrate P0
 */
