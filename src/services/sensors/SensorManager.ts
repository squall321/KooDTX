/**
 * Sensor Manager
 * Manages all sensor services and coordinates data collection
 */

import {SensorType, type SensorData, type SensorConfig} from '@app-types/sensor.types';
import {AccelerometerService} from './AccelerometerService';
import {GyroscopeService} from './GyroscopeService';
import {MagnetometerService} from './MagnetometerService';
import {GPSService} from './GPSService';
import type {SensorService, SensorDataCallback, SensorErrorCallback} from './SensorService';

/**
 * Sensor manager options
 */
export interface SensorManagerOptions {
  onData?: SensorDataCallback;
  onError?: SensorErrorCallback;
  sensors?: Partial<Record<SensorType, SensorConfig>>;
}

/**
 * Sensor availability status
 */
export interface SensorAvailability {
  [SensorType.ACCELEROMETER]: boolean;
  [SensorType.GYROSCOPE]: boolean;
  [SensorType.MAGNETOMETER]: boolean;
  [SensorType.GPS]: boolean;
}

/**
 * SensorManager class
 * Central manager for all sensor services
 */
export class SensorManager {
  private services: Map<SensorType, SensorService>;
  private dataCallback: SensorDataCallback | null = null;
  private errorCallback: SensorErrorCallback | null = null;
  private isRunning: boolean = false;
  private sessionId: string | null = null;

  constructor() {
    this.services = new Map();
    this.initializeServices();
  }

  /**
   * Initialize all sensor services
   */
  private initializeServices(): void {
    this.services.set(SensorType.ACCELEROMETER, new AccelerometerService());
    this.services.set(SensorType.GYROSCOPE, new GyroscopeService());
    this.services.set(SensorType.MAGNETOMETER, new MagnetometerService());
    this.services.set(SensorType.GPS, new GPSService());
  }

  /**
   * Check availability of all sensors
   */
  async checkAvailability(): Promise<SensorAvailability> {
    const availability: Partial<SensorAvailability> = {};

    const sensorTypes = [
      SensorType.ACCELEROMETER,
      SensorType.GYROSCOPE,
      SensorType.MAGNETOMETER,
      SensorType.GPS,
    ];

    await Promise.all(
      sensorTypes.map(async type => {
        const service = this.services.get(type);
        if (service) {
          availability[type] = await service.isAvailable();
        }
      }),
    );

    return availability as SensorAvailability;
  }

  /**
   * Start data collection for specified sensors
   */
  async startCollection(
    sessionId: string,
    enabledSensors: SensorType[],
    options?: SensorManagerOptions,
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Sensor collection is already running');
    }

    this.sessionId = sessionId;
    this.dataCallback = options?.onData || null;
    this.errorCallback = options?.onError || null;

    // Configure sensors
    if (options?.sensors) {
      Object.entries(options.sensors).forEach(([type, config]) => {
        const service = this.services.get(type as SensorType);
        if (service && config) {
          service.setSampleRate(config.sampleRate);
        }
      });
    }

    // Start enabled sensors
    const startPromises = enabledSensors.map(async type => {
      const service = this.services.get(type);
      if (!service) {
        throw new Error(`Sensor service not found: ${type}`);
      }

      const isAvailable = await service.isAvailable();
      if (!isAvailable) {
        throw new Error(`Sensor not available: ${type}`);
      }

      return service.start(
        sessionId,
        data => {
          if (this.dataCallback) {
            this.dataCallback(data);
          }
        },
        error => {
          if (this.errorCallback) {
            this.errorCallback(error);
          }
        },
      );
    });

    await Promise.all(startPromises);
    this.isRunning = true;
  }

  /**
   * Stop data collection for all sensors
   */
  async stopCollection(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    const stopPromises = Array.from(this.services.values()).map(service => {
      if (service.getIsRunning()) {
        return service.stop();
      }
      return Promise.resolve();
    });

    await Promise.all(stopPromises);

    this.isRunning = false;
    this.sessionId = null;
    this.dataCallback = null;
    this.errorCallback = null;
  }

  /**
   * Get running status
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get running sensors
   */
  getRunningSensors(): SensorType[] {
    const running: SensorType[] = [];
    this.services.forEach((service, type) => {
      if (service.getIsRunning()) {
        running.push(type);
      }
    });
    return running;
  }

  /**
   * Get sensor service instance
   */
  getService(type: SensorType): SensorService | undefined {
    return this.services.get(type);
  }

  /**
   * Set sample rate for a specific sensor
   */
  setSampleRate(sensorType: SensorType, rate: number): void {
    const service = this.services.get(sensorType);
    if (service) {
      service.setSampleRate(rate);
    } else {
      throw new Error(`Sensor service not found: ${sensorType}`);
    }
  }

  /**
   * Get sample rate for a specific sensor
   */
  getSampleRate(sensorType: SensorType): number {
    const service = this.services.get(sensorType);
    if (service) {
      return service.getSampleRate();
    }
    throw new Error(`Sensor service not found: ${sensorType}`);
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    this.services.forEach(service => {
      if (service.getIsRunning()) {
        service.stop().catch(() => {
          // Ignore errors during cleanup
        });
      }
      service.cleanup();
    });

    this.dataCallback = null;
    this.errorCallback = null;
    this.sessionId = null;
    this.isRunning = false;
  }
}

// Singleton instance
let sensorManagerInstance: SensorManager | null = null;

/**
 * Get singleton instance of SensorManager
 */
export function getSensorManager(): SensorManager {
  if (!sensorManagerInstance) {
    sensorManagerInstance = new SensorManager();
  }
  return sensorManagerInstance;
}

/**
 * Reset singleton instance (mainly for testing)
 */
export function resetSensorManager(): void {
  if (sensorManagerInstance) {
    sensorManagerInstance.cleanup();
    sensorManagerInstance = null;
  }
}
