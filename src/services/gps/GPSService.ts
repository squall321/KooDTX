/**
 * GPS Service
 * Phase 84: Comprehensive GPS location tracking service
 *
 * Features:
 * - Current position query (getCurrentPosition)
 * - Continuous position tracking (watchPosition)
 * - Configurable accuracy settings
 * - Battery optimization (distanceFilter)
 * - Location data storage
 * - Error handling
 * - Statistics tracking
 */

import Geolocation from '@react-native-community/geolocation';
import type {
  GeolocationResponse,
  GeolocationError,
  GeolocationConfiguration,
} from '@react-native-community/geolocation';
import {getUTC} from '@utils/timestamp';

/**
 * GPS accuracy mode
 */
export enum GPSAccuracyMode {
  HIGH = 'high',       // Best accuracy, high battery usage
  BALANCED = 'balanced', // Balanced accuracy and battery
  LOW = 'low',         // Lower accuracy, low battery usage
}

/**
 * GPS position data
 */
export interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

/**
 * GPS tracking options
 */
export interface GPSTrackingOptions {
  /**
   * Accuracy mode
   */
  accuracyMode?: GPSAccuracyMode;

  /**
   * Minimum distance (meters) for position updates
   * Higher value = better battery life
   */
  distanceFilter?: number;

  /**
   * Update interval in milliseconds (Android only)
   */
  interval?: number;

  /**
   * Fastest update interval in milliseconds (Android only)
   */
  fastestInterval?: number;

  /**
   * Maximum age of cached position in milliseconds
   */
  maximumAge?: number;

  /**
   * Timeout for position request in milliseconds
   */
  timeout?: number;
}

/**
 * GPS position listener
 */
export type GPSPositionListener = (position: GPSPosition) => void;

/**
 * GPS error listener
 */
export type GPSErrorListener = (error: Error) => void;

/**
 * GPS statistics
 */
export interface GPSStatistics {
  totalPositions: number;
  totalErrors: number;
  lastPosition: GPSPosition | null;
  lastError: Error | null;
  lastUpdateTime: number | null;
  averageAccuracy: number;
  isTracking: boolean;
}

/**
 * GPS Service
 * Manages GPS location tracking with configurable options
 */
class GPSServiceClass {
  private static instance: GPSServiceClass;

  // Tracking state
  private watchId: number | null = null;
  private isTracking: boolean = false;

  // Listeners
  private positionListeners: Set<GPSPositionListener> = new Set();
  private errorListeners: Set<GPSErrorListener> = new Set();

  // Options
  private currentOptions: GPSTrackingOptions = {};

  // Statistics
  private stats: GPSStatistics = {
    totalPositions: 0,
    totalErrors: 0,
    lastPosition: null,
    lastError: null,
    lastUpdateTime: null,
    averageAccuracy: 0,
    isTracking: false,
  };

  // Accuracy sum for average calculation
  private accuracySum: number = 0;

  private constructor() {
    // Configure Geolocation
    this.configureGeolocation();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GPSServiceClass {
    if (!GPSServiceClass.instance) {
      GPSServiceClass.instance = new GPSServiceClass();
    }
    return GPSServiceClass.instance;
  }

  /**
   * Configure Geolocation library
   */
  private configureGeolocation(): void {
    const config: GeolocationConfiguration = {
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
    };

    Geolocation.setRNConfiguration(config);
  }

  /**
   * Get current position (one-time query)
   */
  async getCurrentPosition(
    options?: GPSTrackingOptions,
  ): Promise<GPSPosition> {
    return new Promise((resolve, reject) => {
      const geoOptions = this.buildGeolocationOptions(
        options || {accuracyMode: GPSAccuracyMode.HIGH},
      );

      Geolocation.getCurrentPosition(
        (position: GeolocationResponse) => {
          const gpsPosition = this.convertPosition(position);
          this.updateStatistics(gpsPosition);
          resolve(gpsPosition);
        },
        (error: GeolocationError) => {
          const err = this.convertError(error);
          this.handleError(err);
          reject(err);
        },
        geoOptions,
      );
    });
  }

  /**
   * Start continuous position tracking
   */
  startTracking(options?: GPSTrackingOptions): void {
    if (this.isTracking) {
      console.warn('GPS tracking is already active');
      return;
    }

    this.currentOptions = options || {accuracyMode: GPSAccuracyMode.BALANCED};
    const geoOptions = this.buildGeolocationOptions(this.currentOptions);

    this.watchId = Geolocation.watchPosition(
      (position: GeolocationResponse) => {
        const gpsPosition = this.convertPosition(position);
        this.updateStatistics(gpsPosition);
        this.notifyPositionListeners(gpsPosition);
      },
      (error: GeolocationError) => {
        const err = this.convertError(error);
        this.handleError(err);
        this.notifyErrorListeners(err);
      },
      geoOptions,
    );

    this.isTracking = true;
    this.stats.isTracking = true;

    console.log('GPS tracking started', {
      accuracyMode: this.currentOptions.accuracyMode,
      distanceFilter: this.currentOptions.distanceFilter,
    });
  }

  /**
   * Stop position tracking
   */
  stopTracking(): void {
    if (!this.isTracking) {
      return;
    }

    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;
    this.stats.isTracking = false;

    console.log('GPS tracking stopped');
  }

  /**
   * Check if tracking is active
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Add position listener
   */
  addPositionListener(listener: GPSPositionListener): () => void {
    this.positionListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.positionListeners.delete(listener);
    };
  }

  /**
   * Add error listener
   */
  addErrorListener(listener: GPSErrorListener): () => void {
    this.errorListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.positionListeners.clear();
    this.errorListeners.clear();
  }

  /**
   * Get current statistics
   */
  getStatistics(): GPSStatistics {
    return {...this.stats};
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.stats = {
      totalPositions: 0,
      totalErrors: 0,
      lastPosition: null,
      lastError: null,
      lastUpdateTime: null,
      averageAccuracy: 0,
      isTracking: this.isTracking,
    };
    this.accuracySum = 0;
  }

  /**
   * Request location permission
   */
  async requestAuthorization(): Promise<void> {
    return new Promise((resolve, reject) => {
      Geolocation.requestAuthorization(
        () => resolve(),
        (error) => reject(new Error(`Authorization failed: ${error.message}`)),
      );
    });
  }

  /**
   * Build Geolocation options from GPS options
   */
  private buildGeolocationOptions(
    options: GPSTrackingOptions,
  ): {
    enableHighAccuracy: boolean;
    timeout?: number;
    maximumAge?: number;
    distanceFilter?: number;
    interval?: number;
    fastestInterval?: number;
  } {
    const accuracyMode = options.accuracyMode || GPSAccuracyMode.BALANCED;

    // Set defaults based on accuracy mode
    let enableHighAccuracy: boolean;
    let distanceFilter: number;
    let interval: number;
    let fastestInterval: number;

    switch (accuracyMode) {
      case GPSAccuracyMode.HIGH:
        enableHighAccuracy = true;
        distanceFilter = options.distanceFilter ?? 5; // 5 meters
        interval = options.interval ?? 1000; // 1 second
        fastestInterval = options.fastestInterval ?? 500; // 0.5 seconds
        break;

      case GPSAccuracyMode.BALANCED:
        enableHighAccuracy = true;
        distanceFilter = options.distanceFilter ?? 10; // 10 meters
        interval = options.interval ?? 5000; // 5 seconds
        fastestInterval = options.fastestInterval ?? 2000; // 2 seconds
        break;

      case GPSAccuracyMode.LOW:
        enableHighAccuracy = false;
        distanceFilter = options.distanceFilter ?? 50; // 50 meters
        interval = options.interval ?? 30000; // 30 seconds
        fastestInterval = options.fastestInterval ?? 10000; // 10 seconds
        break;
    }

    return {
      enableHighAccuracy,
      timeout: options.timeout ?? 20000, // 20 seconds
      maximumAge: options.maximumAge ?? 1000, // 1 second
      distanceFilter,
      interval,
      fastestInterval,
    };
  }

  /**
   * Convert Geolocation response to GPS position
   */
  private convertPosition(position: GeolocationResponse): GPSPosition {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude,
      accuracy: position.coords.accuracy,
      altitudeAccuracy: position.coords.altitudeAccuracy ?? null,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp || getUTC(),
    };
  }

  /**
   * Convert Geolocation error to Error
   */
  private convertError(error: GeolocationError): Error {
    let message: string;

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        message = 'Location permission denied';
        break;
      case 2: // POSITION_UNAVAILABLE
        message = 'Location position unavailable';
        break;
      case 3: // TIMEOUT
        message = 'Location request timeout';
        break;
      default:
        message = `Location error: ${error.message}`;
    }

    const err = new Error(message);
    (err as any).code = error.code;
    return err;
  }

  /**
   * Update statistics
   */
  private updateStatistics(position: GPSPosition): void {
    this.stats.totalPositions++;
    this.stats.lastPosition = position;
    this.stats.lastUpdateTime = getUTC();

    // Update average accuracy
    this.accuracySum += position.accuracy;
    this.stats.averageAccuracy = this.accuracySum / this.stats.totalPositions;
  }

  /**
   * Handle error
   */
  private handleError(error: Error): void {
    this.stats.totalErrors++;
    this.stats.lastError = error;
    console.error('GPS error:', error.message);
  }

  /**
   * Notify position listeners
   */
  private notifyPositionListeners(position: GPSPosition): void {
    this.positionListeners.forEach((listener) => {
      try {
        listener(position);
      } catch (error) {
        console.error('Position listener error:', error);
      }
    });
  }

  /**
   * Notify error listeners
   */
  private notifyErrorListeners(error: Error): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error listener error:', err);
      }
    });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stopTracking();
    this.removeAllListeners();
    this.resetStatistics();
  }
}

/**
 * Singleton instance
 */
export const gpsService = GPSServiceClass.getInstance();

/**
 * Convenience functions
 */

/**
 * Get current GPS position
 */
export function getCurrentPosition(
  options?: GPSTrackingOptions,
): Promise<GPSPosition> {
  return gpsService.getCurrentPosition(options);
}

/**
 * Start GPS tracking
 */
export function startGPSTracking(options?: GPSTrackingOptions): void {
  gpsService.startTracking(options);
}

/**
 * Stop GPS tracking
 */
export function stopGPSTracking(): void {
  gpsService.stopTracking();
}

/**
 * Check if GPS tracking is active
 */
export function isGPSTrackingActive(): boolean {
  return gpsService.isTrackingActive();
}

/**
 * Add GPS position listener
 */
export function addGPSPositionListener(
  listener: GPSPositionListener,
): () => void {
  return gpsService.addPositionListener(listener);
}

/**
 * Add GPS error listener
 */
export function addGPSErrorListener(listener: GPSErrorListener): () => void {
  return gpsService.addErrorListener(listener);
}

/**
 * Get GPS statistics
 */
export function getGPSStatistics(): GPSStatistics {
  return gpsService.getStatistics();
}

/**
 * Reset GPS statistics
 */
export function resetGPSStatistics(): void {
  gpsService.resetStatistics();
}

/**
 * Request location authorization
 */
export function requestGPSAuthorization(): Promise<void> {
  return gpsService.requestAuthorization();
}

/**
 * Export default
 */
export default gpsService;
