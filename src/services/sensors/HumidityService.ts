/**
 * HumidityService
 * Handles relative humidity sensor data collection
 *
 * Measures relative humidity (% of moisture in air).
 * Often used together with temperature sensor for comfort analysis.
 *
 * Key characteristics:
 * - Measures relative humidity (0-100%)
 * - Can calculate dew point when combined with temperature
 * - Typical accuracy: ±3-5%
 * - Useful for: weather monitoring, comfort analysis, mold prevention
 */

import type {HumidityData, SensorType} from '@app-types/sensor.types';
import {getSensorDataRepository} from '@database/repositories/SensorDataRepository';

/**
 * Humidity sensor configuration
 */
interface HumidityConfig {
  sampleInterval: number; // Sample interval in milliseconds (default: 5000ms = 5s)
  calculateDewPoint: boolean; // Calculate dew point temperature (requires temperature)
  requiresTemperature: boolean; // Whether temperature is required for dew point
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: HumidityConfig = {
  sampleInterval: 5000, // 5 seconds
  calculateDewPoint: true,
  requiresTemperature: true,
};

/**
 * HumidityService class
 */
export class HumidityService {
  private subscription: any = null;
  private isRunning: boolean = false;
  private config: HumidityConfig = DEFAULT_CONFIG;
  private repository = getSensorDataRepository();

  // Store latest temperature for dew point calculation
  private latestTemperature?: number;

  /**
   * Check if humidity sensor is available
   *
   * Note: Humidity sensor is rare on smartphones.
   * React Native Sensors library does not provide humidity sensor.
   */
  async isAvailable(): Promise<boolean> {
    console.warn(
      'HumidityService: Humidity sensor is rare on smartphones. ' +
      'React Native Sensors library does not provide this sensor. ' +
      'Native module implementation required.'
    );
    return false;
  }

  /**
   * Configure sensor settings
   */
  configure(config: Partial<HumidityConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Set current temperature for dew point calculation
   */
  setTemperature(celsius: number): void {
    this.latestTemperature = celsius;
  }

  /**
   * Start collecting humidity data
   */
  async start(
    sessionId: string,
    onData: (data: HumidityData) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const available = await this.isAvailable();
    if (!available) {
      const error = new Error(
        'Humidity sensor is not available on this device. ' +
        'This sensor is rare on smartphones.'
      );
      if (onError) {
        onError(error);
      }
      throw error;
    }

    if (this.isRunning) {
      console.warn('HumidityService: Already running');
      return;
    }

    this.isRunning = true;
    console.log('HumidityService: Started with config:', this.config);
  }

  /**
   * Stop collecting data
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('HumidityService: Not running');
      return;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.isRunning = false;
    console.log('HumidityService: Stopped');
  }

  /**
   * Calculate dew point temperature
   * Dew point is the temperature at which air becomes saturated and dew forms
   *
   * @param temperatureCelsius - Air temperature in Celsius
   * @param relativeHumidity - Relative humidity (0-100%)
   * @returns Dew point in Celsius
   *
   * Uses Magnus formula approximation
   */
  calculateDewPoint(temperatureCelsius: number, relativeHumidity: number): number {
    const T = temperatureCelsius;
    const RH = relativeHumidity;

    // Magnus formula constants
    const a = 17.27;
    const b = 237.7;

    // Calculate intermediate value
    const alpha = ((a * T) / (b + T)) + Math.log(RH / 100);

    // Calculate dew point
    const dewPoint = (b * alpha) / (a - alpha);

    return Math.round(dewPoint * 10) / 10;
  }

  /**
   * Categorize humidity level for comfort analysis
   *
   * @param humidity - Relative humidity (0-100%)
   * @returns Humidity category
   */
  categorizeHumidity(humidity: number):
    'very_dry' | 'dry' | 'comfortable' | 'humid' | 'very_humid' {

    if (humidity < 30) return 'very_dry';      // < 30%: too dry, skin/respiratory issues
    if (humidity < 40) return 'dry';           // 30-40%: slightly dry
    if (humidity < 60) return 'comfortable';   // 40-60%: ideal comfort range
    if (humidity < 70) return 'humid';         // 60-70%: slightly humid
    return 'very_humid';                       // > 70%: too humid, mold risk
  }

  /**
   * Assess comfort level combining temperature and humidity
   *
   * @param temperatureCelsius - Temperature in Celsius
   * @param humidity - Relative humidity (0-100%)
   * @returns Comfort assessment
   */
  assessComfort(temperatureCelsius: number, humidity: number): {
    level: 'very_uncomfortable' | 'uncomfortable' | 'comfortable' | 'ideal';
    reason: string;
  } {
    const T = temperatureCelsius;
    const H = humidity;

    // Ideal comfort zone: 18-26°C and 40-60% humidity
    if (T >= 18 && T <= 26 && H >= 40 && H <= 60) {
      return { level: 'ideal', reason: 'Temperature and humidity in optimal range' };
    }

    // Comfortable range: expanded boundaries
    if (T >= 16 && T <= 28 && H >= 30 && H <= 70) {
      return { level: 'comfortable', reason: 'Acceptable temperature and humidity' };
    }

    // Identify specific discomfort
    if (T < 16 && H < 40) {
      return { level: 'uncomfortable', reason: 'Cold and dry' };
    }
    if (T < 16 && H > 70) {
      return { level: 'very_uncomfortable', reason: 'Cold and damp' };
    }
    if (T > 28 && H < 40) {
      return { level: 'uncomfortable', reason: 'Hot and dry' };
    }
    if (T > 28 && H > 70) {
      return { level: 'very_uncomfortable', reason: 'Hot and humid (heat stress risk)' };
    }

    if (T < 16) {
      return { level: 'uncomfortable', reason: 'Too cold' };
    }
    if (T > 28) {
      return { level: 'uncomfortable', reason: 'Too hot' };
    }
    if (H < 30) {
      return { level: 'uncomfortable', reason: 'Too dry (respiratory discomfort)' };
    }
    if (H > 70) {
      return { level: 'uncomfortable', reason: 'Too humid (mold risk)' };
    }

    return { level: 'uncomfortable', reason: 'Suboptimal conditions' };
  }

  /**
   * Calculate absolute humidity (grams of water per cubic meter of air)
   *
   * @param temperatureCelsius - Temperature in Celsius
   * @param relativeHumidity - Relative humidity (0-100%)
   * @returns Absolute humidity in g/m³
   */
  calculateAbsoluteHumidity(temperatureCelsius: number, relativeHumidity: number): number {
    const T = temperatureCelsius;
    const RH = relativeHumidity / 100;

    // Saturation vapor pressure (hPa) - Magnus formula
    const es = 6.112 * Math.exp((17.67 * T) / (T + 243.5));

    // Actual vapor pressure
    const e = RH * es;

    // Absolute humidity (g/m³)
    const absoluteHumidity = (2.16679 * e) / (T + 273.15);

    return Math.round(absoluteHumidity * 10) / 10;
  }

  /**
   * Assess mold growth risk
   *
   * @param temperatureCelsius - Temperature in Celsius
   * @param humidity - Relative humidity (0-100%)
   * @returns Risk level and mitigation advice
   */
  assessMoldRisk(temperatureCelsius: number, humidity: number): {
    risk: 'low' | 'moderate' | 'high' | 'very_high';
    advice: string;
  } {
    const T = temperatureCelsius;
    const H = humidity;

    // Mold grows best at 20-30°C and >70% humidity
    // Risk increases significantly above 80% humidity

    if (H < 60) {
      return { risk: 'low', advice: 'Humidity is low, mold growth unlikely' };
    }

    if (H < 70) {
      if (T > 15 && T < 30) {
        return {
          risk: 'moderate',
          advice: 'Monitor humidity levels, ensure good ventilation',
        };
      }
      return {
        risk: 'low',
        advice: 'Humidity slightly elevated but temperature not ideal for mold',
      };
    }

    if (H < 80) {
      if (T > 15 && T < 30) {
        return {
          risk: 'high',
          advice: 'High risk - increase ventilation, use dehumidifier',
        };
      }
      return {
        risk: 'moderate',
        advice: 'Humidity high - improve air circulation',
      };
    }

    // H >= 80%
    if (T > 15 && T < 30) {
      return {
        risk: 'very_high',
        advice: 'Critical - use dehumidifier immediately, check for water leaks',
      };
    }
    return {
      risk: 'high',
      advice: 'Very high humidity - urgent action needed',
    };
  }

  /**
   * Calculate heat index contribution from humidity
   * (used by TemperatureService for feels-like temperature)
   *
   * @param temperatureCelsius - Temperature in Celsius
   * @param humidity - Relative humidity (0-100%)
   * @returns Apparent temperature increase due to humidity (°C)
   */
  calculateHumidityEffect(temperatureCelsius: number, humidity: number): number {
    // Simplified model: humidity increases perceived temperature
    // More accurate calculation is in TemperatureService.calculateHeatIndex()

    if (temperatureCelsius < 27 || humidity < 40) {
      return 0; // Negligible effect
    }

    // Approximate effect: +0.1°C per 5% humidity above 40%
    const effect = ((humidity - 40) / 5) * 0.1;

    return Math.round(effect * 10) / 10;
  }

  /**
   * Detect humidity trend from history
   *
   * @param history - Array of recent humidity readings
   * @returns Trend direction and rate (% per hour)
   */
  detectHumidityTrend(history: Array<{humidity: number; timestamp: number}>): {
    trend: 'rising' | 'falling' | 'stable';
    ratePerHour: number; // % per hour
  } {
    if (history.length < 2) {
      return { trend: 'stable', ratePerHour: 0 };
    }

    // Linear regression
    const n = history.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    const baseTime = history[0].timestamp;

    for (const point of history) {
      const x = (point.timestamp - baseTime) / (1000 * 60 * 60); // Hours
      const y = point.humidity;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    let trend: 'rising' | 'falling' | 'stable';
    if (Math.abs(slope) < 1) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'rising';
    } else {
      trend = 'falling';
    }

    return {
      trend,
      ratePerHour: Math.round(slope * 100) / 100,
    };
  }

  /**
   * Get current sensor type
   */
  getSensorType(): SensorType {
    return 'humidity' as SensorType;
  }

  /**
   * Check if sensor is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get current configuration
   */
  getConfig(): HumidityConfig {
    return { ...this.config };
  }
}

/**
 * Native Module Implementation Guide
 *
 * Android:
 * ```java
 * import android.hardware.Sensor;
 * import android.hardware.SensorEvent;
 * import android.hardware.SensorEventListener;
 * import android.hardware.SensorManager;
 *
 * public class HumidityModule extends ReactContextBaseJavaModule
 *     implements SensorEventListener {
 *
 *   private SensorManager sensorManager;
 *   private Sensor humiditySensor;
 *
 *   @ReactMethod
 *   public void isAvailable(Promise promise) {
 *     // TYPE_RELATIVE_HUMIDITY: ambient relative humidity (rare on phones)
 *     Sensor sensor = sensorManager.getDefaultSensor(Sensor.TYPE_RELATIVE_HUMIDITY);
 *     promise.resolve(sensor != null);
 *   }
 *
 *   @ReactMethod
 *   public void start(int sampleInterval) {
 *     humiditySensor = sensorManager.getDefaultSensor(Sensor.TYPE_RELATIVE_HUMIDITY);
 *     if (humiditySensor != null) {
 *       sensorManager.registerListener(
 *         this,
 *         humiditySensor,
 *         sampleInterval * 1000
 *       );
 *     }
 *   }
 *
 *   @Override
 *   public void onSensorChanged(SensorEvent event) {
 *     if (event.sensor.getType() == Sensor.TYPE_RELATIVE_HUMIDITY) {
 *       WritableMap data = Arguments.createMap();
 *       data.putDouble("humidity", event.values[0]); // Relative humidity (0-100%)
 *       data.putDouble("timestamp", System.currentTimeMillis());
 *
 *       sendEvent("HumidityData", data);
 *     }
 *   }
 * }
 * ```
 *
 * iOS:
 * iOS does NOT provide humidity sensor API.
 * Alternative approaches:
 * 1. Use weather API services (OpenWeatherMap, WeatherKit)
 * 2. Use external Bluetooth humidity sensors
 * 3. Estimate from other environmental data (very inaccurate)
 *
 * Platform differences:
 * - Android: TYPE_RELATIVE_HUMIDITY (rare, mostly on specialized devices)
 * - iOS: No native API available
 * - Most smartphones: Do not have humidity sensor
 * - Weather stations: Often have humidity sensors
 * - Smart home devices: Humidity sensors common in thermostats
 * - External sensors: Bluetooth hygrometers can be used on both platforms
 *
 * Important notes:
 * - Humidity sensor measures relative humidity (% saturation)
 * - Very few consumer smartphones have this sensor
 * - Sensor accuracy: typically ±3-5%
 * - Response time: 10-60 seconds to ambient changes
 * - Affected by device heat, user's breath
 * - For weather apps, use weather API services instead
 * - Useful for: smart home, HVAC control, mold prevention, comfort monitoring
 *
 * Typical use cases:
 * - Indoor air quality monitoring
 * - HVAC system optimization
 * - Mold prevention in buildings
 * - Agricultural applications
 * - Museum/archive preservation
 * - Industrial process control
 */
