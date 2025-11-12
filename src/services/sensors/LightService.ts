/**
 * Light sensor service
 * Measures ambient light illuminance in lux
 *
 * Note: React Native Sensors library doesn't support light sensor.
 * This service requires a native module implementation.
 * On devices without light sensor, isAvailable() returns false.
 */

import {SensorType, type LightData} from '@app-types/sensor.types';
import {SensorService, type SensorDataCallback, type SensorErrorCallback} from './SensorService';

/**
 * Brightness level thresholds (in lux)
 */
interface BrightnessThresholds {
  dark: number; // < dark: very dark
  dim: number; // < dim: dim
  normal: number; // < normal: normal indoor lighting
  bright: number; // < bright: bright indoor/cloudy outdoor
  // >= bright: very bright (direct sunlight)
}

/**
 * Default brightness thresholds
 */
const DEFAULT_THRESHOLDS: BrightnessThresholds = {
  dark: 10, // < 10 lux: very dark
  dim: 50, // < 50 lux: dim
  normal: 500, // < 500 lux: normal
  bright: 10000, // < 10000 lux: bright
  // >= 10000 lux: very bright (direct sunlight is ~100,000 lux)
};

/**
 * Light sensor configuration
 */
interface LightConfig {
  // Sample interval in milliseconds
  sampleInterval: number;
  // Enable automatic brightness adjustment
  autoBrightness: boolean;
  // Brightness level thresholds
  brightnessThresholds: BrightnessThresholds;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: LightConfig = {
  sampleInterval: 1000, // 1 second
  autoBrightness: false,
  brightnessThresholds: DEFAULT_THRESHOLDS,
};

export class LightService extends SensorService<LightData> {
  private config: LightConfig = DEFAULT_CONFIG;
  private sampleTimer: NodeJS.Timeout | null = null;

  // Mock state for testing (will be replaced by native module)
  private mockLux: number = 500; // Normal indoor lighting

  constructor() {
    super();
  }

  getSensorType(): SensorType {
    return SensorType.LIGHT;
  }

  /**
   * Configure light sensor parameters
   */
  configure(config: Partial<LightConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      brightnessThresholds: {
        ...this.config.brightnessThresholds,
        ...(config.brightnessThresholds || {}),
      },
    };
  }

  /**
   * Check if light sensor is available
   *
   * Note: Currently returns false as native module is not implemented.
   * Override this in native implementation.
   */
  async isAvailable(): Promise<boolean> {
    // TODO: Implement native module check
    // For now, return false to indicate sensor is not available
    console.warn(
      'LightService: Light sensor requires native module implementation. ' +
      'Sensor is not available in current React Native Sensors library.'
    );
    return false;
  }

  async start(
    sessionId: string,
    onData: SensorDataCallback<LightData>,
    onError?: SensorErrorCallback,
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Light service is already running');
    }

    const available = await this.isAvailable();
    if (!available) {
      const error = new Error(
        'Light sensor is not available on this device. ' +
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

    // TODO: Replace with native module light sensor listener
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
        // Simulate light level changes (e.g., day/night cycle)
        this.mockLux = 100 + Math.random() * 1000;

        const brightnessLevel = this.categorizeBrightness(this.mockLux);

        const lightData: LightData = {
          id: `light-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sensorType: SensorType.LIGHT,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          lux: this.mockLux,
          brightnessLevel,
          isUploaded: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        this.dataCallback(lightData);
      }
    }, this.config.sampleInterval);
  }

  /**
   * Categorize brightness level based on lux value
   */
  private categorizeBrightness(
    lux: number,
  ): 'dark' | 'dim' | 'normal' | 'bright' | 'very_bright' {
    const t = this.config.brightnessThresholds;

    if (lux < t.dark) {
      return 'dark';
    } else if (lux < t.dim) {
      return 'dim';
    } else if (lux < t.normal) {
      return 'normal';
    } else if (lux < t.bright) {
      return 'bright';
    } else {
      return 'very_bright';
    }
  }

  /**
   * Get current light status
   */
  getStatus(): {
    isAvailable: boolean;
    currentLux: number;
    brightnessLevel: string;
  } {
    return {
      isAvailable: false, // Will be true when native module is implemented
      currentLux: this.mockLux,
      brightnessLevel: this.categorizeBrightness(this.mockLux),
    };
  }

  /**
   * Get suggested screen brightness (0-1) based on ambient light
   */
  getSuggestedScreenBrightness(lux: number): number {
    // Simple logarithmic mapping
    // 0 lux -> 0.1 brightness (min)
    // 1 lux -> ~0.2
    // 10 lux -> ~0.3
    // 100 lux -> ~0.5
    // 1000 lux -> ~0.7
    // 10000+ lux -> 1.0 (max)

    if (lux <= 0) {
      return 0.1;
    }

    const brightness = 0.1 + (Math.log10(lux) / 5) * 0.9;
    return Math.max(0.1, Math.min(1.0, brightness));
  }
}

/**
 * Native Module Interface (for future implementation)
 *
 * Android:
 * - Sensor.TYPE_LIGHT
 * - Returns illuminance in lux (SI unit)
 * - Range: 0 to sensor maximum (typically 10,000+ lux)
 *
 * iOS:
 * - No public API for ambient light sensor
 * - Alternative: UIScreen.brightness (current screen brightness)
 * - Workaround: Use camera to estimate ambient light
 *
 * Implementation guide:
 *
 * 1. Create native module:
 *    - Android: LightModule.java
 *    - iOS: LightModule.m (with workaround)
 *
 * 2. Expose methods:
 *    - isAvailable(): Promise<boolean>
 *    - startLightUpdates(callback)
 *    - stopLightUpdates()
 *    - getCurrentLux(): Promise<number>
 *
 * 3. Event emission:
 *    - Emit 'LightChanged' events
 *    - Include: lux, timestamp
 *
 * 4. Replace mock implementation with:
 *    import { NativeModules, NativeEventEmitter } from 'react-native';
 *    const { LightModule } = NativeModules;
 *    const lightEmitter = new NativeEventEmitter(LightModule);
 */
