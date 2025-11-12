/**
 * Proximity sensor service
 * Detects nearby objects using proximity sensor
 *
 * Note: React Native Sensors library doesn't support proximity sensor.
 * This service requires a native module implementation.
 * On devices without proximity sensor, isAvailable() returns false.
 */

import {SensorType, type ProximityData} from '@app-types/sensor.types';
import {SensorService, type SensorDataCallback, type SensorErrorCallback} from './SensorService';

/**
 * Proximity sensor configuration
 */
interface ProximityConfig {
  // Sample interval in milliseconds (when sensor changes)
  sampleInterval: number;
  // Near threshold in centimeters
  nearThreshold: number;
  // Wake screen on proximity detection
  wakeOnProximity: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ProximityConfig = {
  sampleInterval: 100, // 100ms
  nearThreshold: 5, // 5cm
  wakeOnProximity: false,
};

export class ProximityService extends SensorService<ProximityData> {
  private config: ProximityConfig = DEFAULT_CONFIG;
  private sampleTimer: NodeJS.Timeout | null = null;

  // Mock state for testing (will be replaced by native module)
  private mockDistance: number = 100; // Far away
  private mockMaxRange: number = 5; // Typical proximity sensor range

  constructor() {
    super();
  }

  getSensorType(): SensorType {
    return SensorType.PROXIMITY;
  }

  /**
   * Configure proximity sensor parameters
   */
  configure(config: Partial<ProximityConfig>): void {
    this.config = {...this.config, ...config};
  }

  /**
   * Check if proximity sensor is available
   *
   * Note: Currently returns false as native module is not implemented.
   * Override this in native implementation.
   */
  async isAvailable(): Promise<boolean> {
    // TODO: Implement native module check
    // For now, return false to indicate sensor is not available
    console.warn(
      'ProximityService: Proximity sensor requires native module implementation. ' +
      'Sensor is not available in current React Native Sensors library.'
    );
    return false;
  }

  async start(
    sessionId: string,
    onData: SensorDataCallback<ProximityData>,
    onError?: SensorErrorCallback,
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Proximity service is already running');
    }

    const available = await this.isAvailable();
    if (!available) {
      const error = new Error(
        'Proximity sensor is not available on this device. ' +
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

    // TODO: Replace with native module proximity sensor listener
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
        // Simulate random proximity changes
        this.mockDistance = Math.random() * this.mockMaxRange;
        const isNear = this.mockDistance < this.config.nearThreshold;

        const proximityData: ProximityData = {
          id: `prox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sensorType: SensorType.PROXIMITY,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          distance: this.mockDistance,
          isNear,
          maxRange: this.mockMaxRange,
          isUploaded: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        this.dataCallback(proximityData);
      }
    }, this.config.sampleInterval);
  }

  /**
   * Get current proximity status
   */
  getStatus(): {
    isAvailable: boolean;
    currentDistance: number;
    maxRange: number;
    isNear: boolean;
  } {
    return {
      isAvailable: false, // Will be true when native module is implemented
      currentDistance: this.mockDistance,
      maxRange: this.mockMaxRange,
      isNear: this.mockDistance < this.config.nearThreshold,
    };
  }
}

/**
 * Native Module Interface (for future implementation)
 *
 * Android:
 * - Sensor.TYPE_PROXIMITY
 * - Returns distance in centimeters
 * - Binary mode: 0 (near) or maxRange (far)
 *
 * iOS:
 * - UIDevice.proximityState
 * - Binary only: true (near) or false (far)
 * - No distance measurement
 *
 * Implementation guide:
 *
 * 1. Create native module:
 *    - Android: ProximityModule.java
 *    - iOS: ProximityModule.m
 *
 * 2. Expose methods:
 *    - isAvailable(): Promise<boolean>
 *    - startProximityUpdates(callback)
 *    - stopProximityUpdates()
 *    - getMaxRange(): number
 *
 * 3. Event emission:
 *    - Emit 'ProximityChanged' events
 *    - Include: distance, timestamp, isNear
 *
 * 4. Replace mock implementation with:
 *    import { NativeModules, NativeEventEmitter } from 'react-native';
 *    const { ProximityModule } = NativeModules;
 *    const proximityEmitter = new NativeEventEmitter(ProximityModule);
 */
