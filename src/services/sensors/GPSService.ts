/**
 * GPS sensor service
 * Collects location data
 */

import Geolocation from '@react-native-community/geolocation';
import type {GeolocationResponse} from '@react-native-community/geolocation';
import {SensorType, type GPSData} from '@types/sensor.types';
import {SensorService, type SensorDataCallback, type SensorErrorCallback} from './SensorService';

export class GPSService extends SensorService<GPSData> {
  private watchId: number | null = null;

  getSensorType(): SensorType {
    return SensorType.GPS;
  }

  async isAvailable(): Promise<boolean> {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        {timeout: 5000, maximumAge: 0},
      );
    });
  }

  async start(
    sessionId: string,
    onData: SensorDataCallback<GPSData>,
    onError?: SensorErrorCallback,
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error('GPS service is already running');
    }

    this.sessionId = sessionId;
    this.dataCallback = onData;
    this.errorCallback = onError || null;

    return new Promise((resolve, reject) => {
      try {
        // Convert sample rate to distance filter (meters)
        // Lower sample rate = higher distance filter for battery efficiency
        const distanceFilter = Math.max(1, Math.floor(100 / this.sampleRate));

        this.watchId = Geolocation.watchPosition(
          (position: GeolocationResponse) => {
            if (this.dataCallback && this.sessionId) {
              const {coords, timestamp} = position;
              const data: GPSData = {
                id: `gps-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sensorType: SensorType.GPS,
                timestamp: timestamp || Date.now(),
                sessionId: this.sessionId,
                latitude: coords.latitude,
                longitude: coords.longitude,
                altitude: coords.altitude ?? undefined,
                accuracy: coords.accuracy,
                speed: coords.speed ?? undefined,
                heading: coords.heading ?? undefined,
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
                new Error(`GPS error: ${error.message} (code: ${error.code})`),
              );
            }
            reject(error);
          },
          {
            enableHighAccuracy: true,
            distanceFilter,
            interval: Math.floor(1000 / this.sampleRate),
            fastestInterval: Math.floor(500 / this.sampleRate),
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

    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.cleanup();
  }
}
