/**
 * Gyroscope sensor service
 * Collects 3-axis rotation rate data
 */

import {gyroscope, setUpdateIntervalForType, SensorTypes} from 'react-native-sensors';
import type {Subscription} from 'rxjs';
import {SensorType, type GyroscopeData} from '@types/sensor.types';
import {SensorService, type SensorDataCallback, type SensorErrorCallback} from './SensorService';

export class GyroscopeService extends SensorService<GyroscopeData> {
  private subscription: Subscription | null = null;

  getSensorType(): SensorType {
    return SensorType.GYROSCOPE;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const testSubscription = gyroscope.subscribe(
        () => {
          testSubscription.unsubscribe();
        },
        () => {
          testSubscription.unsubscribe();
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async start(
    sessionId: string,
    onData: SensorDataCallback<GyroscopeData>,
    onError?: SensorErrorCallback,
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('Gyroscope service is already running');
    }

    // Set update interval (convert Hz to ms)
    const updateInterval = Math.floor(1000 / this.sampleRate);
    setUpdateIntervalForType(SensorTypes.gyroscope, updateInterval);

    this.sessionId = sessionId;
    this.dataCallback = onData;
    this.errorCallback = onError || null;

    return new Promise((resolve, reject) => {
      try {
        this.subscription = gyroscope.subscribe(
          ({x, y, z, timestamp}) => {
            if (this.dataCallback && this.sessionId) {
              const data: GyroscopeData = {
                id: `gyro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sensorType: SensorType.GYROSCOPE,
                timestamp: timestamp || Date.now(),
                sessionId: this.sessionId,
                x,
                y,
                z,
                isUploaded: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              this.dataCallback(data);
            }
          },
          error => {
            this.isRunning = false;
            if (this.errorCallback) {
              this.errorCallback(
                error instanceof Error ? error : new Error(String(error)),
              );
            }
            reject(error);
          },
        );

        this.isRunning = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.cleanup();
  }
}
