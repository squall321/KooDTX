/**
 * TemperatureService
 * Handles ambient temperature sensor data collection
 *
 * Measures ambient air temperature around the device.
 * Note: This is NOT device internal temperature (battery/CPU).
 *
 * Key characteristics:
 * - Measures ambient temperature in Celsius (°C)
 * - Can convert to Fahrenheit (°F) and Kelvin (K)
 * - Typical range: -40°C to 85°C
 * - Useful for: weather monitoring, environmental data, comfort analysis
 */

import type {TemperatureData, SensorType} from '@app-types/sensor.types';
import {getSensorDataRepository} from '@database/repositories/SensorDataRepository';

/**
 * Temperature sensor configuration
 */
interface TemperatureConfig {
  sampleInterval: number; // Sample interval in milliseconds (default: 5000ms = 5s)
  unit: 'celsius' | 'fahrenheit' | 'kelvin'; // Primary unit (default: celsius)
  calculateAllUnits: boolean; // Calculate all temperature units (default: false)
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: TemperatureConfig = {
  sampleInterval: 5000, // 5 seconds (temperature changes slowly)
  unit: 'celsius',
  calculateAllUnits: false,
};

/**
 * TemperatureService class
 */
export class TemperatureService {
  private subscription: any = null;
  private isRunning: boolean = false;
  private config: TemperatureConfig = DEFAULT_CONFIG;
  private repository = getSensorDataRepository();

  /**
   * Check if ambient temperature sensor is available
   *
   * Note: Ambient temperature sensor is rare on smartphones.
   * Most devices only have internal temperature sensors (battery, CPU).
   * React Native Sensors library does not provide temperature sensor.
   */
  async isAvailable(): Promise<boolean> {
    console.warn(
      'TemperatureService: Ambient temperature sensor is rare on smartphones. ' +
      'Most devices only measure internal temperature (battery/CPU). ' +
      'React Native Sensors library does not provide this sensor. ' +
      'Native module implementation required.'
    );
    return false;
  }

  /**
   * Configure sensor settings
   */
  configure(config: Partial<TemperatureConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Start collecting temperature data
   */
  async start(
    sessionId: string,
    onData: (data: TemperatureData) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const available = await this.isAvailable();
    if (!available) {
      const error = new Error(
        'Ambient temperature sensor is not available on this device. ' +
        'This sensor is rare on smartphones. Most devices only have ' +
        'internal temperature sensors for battery/CPU monitoring.'
      );
      if (onError) {
        onError(error);
      }
      throw error;
    }

    if (this.isRunning) {
      console.warn('TemperatureService: Already running');
      return;
    }

    this.isRunning = true;
    console.log('TemperatureService: Started with config:', this.config);
  }

  /**
   * Stop collecting data
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('TemperatureService: Not running');
      return;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.isRunning = false;
    console.log('TemperatureService: Stopped');
  }

  /**
   * Convert Celsius to Fahrenheit
   * Formula: F = C × 9/5 + 32
   */
  celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  /**
   * Convert Celsius to Kelvin
   * Formula: K = C + 273.15
   */
  celsiusToKelvin(celsius: number): number {
    return celsius + 273.15;
  }

  /**
   * Convert Fahrenheit to Celsius
   * Formula: C = (F - 32) × 5/9
   */
  fahrenheitToCelsius(fahrenheit: number): number {
    return ((fahrenheit - 32) * 5) / 9;
  }

  /**
   * Convert Kelvin to Celsius
   * Formula: C = K - 273.15
   */
  kelvinToCelsius(kelvin: number): number {
    return kelvin - 273.15;
  }

  /**
   * Categorize temperature for comfort analysis
   *
   * @param celsius - Temperature in Celsius
   * @returns Temperature category
   */
  categorizeTemperature(celsius: number):
    'freezing' | 'very_cold' | 'cold' | 'cool' | 'comfortable' | 'warm' | 'hot' | 'very_hot' {

    if (celsius < -10) return 'freezing';      // < -10°C
    if (celsius < 0) return 'very_cold';       // 0°C to -10°C
    if (celsius < 10) return 'cold';           // 0°C to 10°C
    if (celsius < 18) return 'cool';           // 10°C to 18°C
    if (celsius < 26) return 'comfortable';    // 18°C to 26°C (ideal indoor)
    if (celsius < 32) return 'warm';           // 26°C to 32°C
    if (celsius < 40) return 'hot';            // 32°C to 40°C
    return 'very_hot';                         // > 40°C
  }

  /**
   * Calculate heat index (feels like temperature)
   * Combines temperature and humidity to estimate perceived temperature
   *
   * @param celsius - Temperature in Celsius
   * @param humidity - Relative humidity (0-100%)
   * @returns Heat index in Celsius
   *
   * Note: Accurate for T ≥ 27°C and RH ≥ 40%
   */
  calculateHeatIndex(celsius: number, humidity: number): number {
    // Convert to Fahrenheit for calculation (original formula uses °F)
    const fahrenheit = this.celsiusToFahrenheit(celsius);

    // Simplified heat index formula
    const T = fahrenheit;
    const R = humidity;

    let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094));

    // If result > 80°F, use full Rothfusz regression
    if (HI >= 80) {
      HI =
        -42.379 +
        2.04901523 * T +
        10.14333127 * R -
        0.22475541 * T * R -
        0.00683783 * T * T -
        0.05481717 * R * R +
        0.00122874 * T * T * R +
        0.00085282 * T * R * R -
        0.00000199 * T * T * R * R;

      // Adjustments for low/high humidity
      if (R < 13 && T >= 80 && T <= 112) {
        HI -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      } else if (R > 85 && T >= 80 && T <= 87) {
        HI += ((R - 85) / 10) * ((87 - T) / 5);
      }
    }

    // Convert back to Celsius
    return this.fahrenheitToCelsius(HI);
  }

  /**
   * Calculate wind chill (feels like temperature in cold conditions)
   * Combines temperature and wind speed
   *
   * @param celsius - Temperature in Celsius
   * @param windSpeedKmh - Wind speed in km/h
   * @returns Wind chill in Celsius
   *
   * Note: Accurate for T ≤ 10°C and wind speed ≥ 4.8 km/h
   */
  calculateWindChill(celsius: number, windSpeedKmh: number): number {
    // Wind chill formula (metric)
    // WC = 13.12 + 0.6215*T - 11.37*V^0.16 + 0.3965*T*V^0.16
    const T = celsius;
    const V = windSpeedKmh;

    if (T > 10 || V < 4.8) {
      return celsius; // Wind chill not applicable
    }

    const windChill =
      13.12 +
      0.6215 * T -
      11.37 * Math.pow(V, 0.16) +
      0.3965 * T * Math.pow(V, 0.16);

    return Math.round(windChill * 10) / 10;
  }

  /**
   * Detect temperature trend from history
   *
   * @param history - Array of recent temperature readings
   * @returns Trend direction and rate (°C per hour)
   */
  detectTemperatureTrend(history: Array<{temperature: number; timestamp: number}>): {
    trend: 'rising' | 'falling' | 'stable';
    ratePerHour: number; // °C/hour
  } {
    if (history.length < 2) {
      return { trend: 'stable', ratePerHour: 0 };
    }

    // Linear regression to find trend
    const n = history.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    const baseTime = history[0].timestamp;

    for (const point of history) {
      const x = (point.timestamp - baseTime) / (1000 * 60 * 60); // Hours since start
      const y = point.temperature;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    // Slope of regression line (°C per hour)
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    let trend: 'rising' | 'falling' | 'stable';
    if (Math.abs(slope) < 0.5) {
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
   * Suggest clothing based on temperature
   *
   * @param celsius - Temperature in Celsius
   * @returns Clothing suggestion
   */
  suggestClothing(celsius: number): string {
    if (celsius < -10) return 'Heavy winter coat, gloves, scarf, hat';
    if (celsius < 0) return 'Winter coat, gloves, scarf';
    if (celsius < 10) return 'Jacket or sweater';
    if (celsius < 18) return 'Long sleeves or light jacket';
    if (celsius < 26) return 'T-shirt or light clothing';
    if (celsius < 32) return 'Light, breathable clothing';
    return 'Minimal, very light clothing';
  }

  /**
   * Get current sensor type
   */
  getSensorType(): SensorType {
    return 'temperature' as SensorType;
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
  getConfig(): TemperatureConfig {
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
 * public class TemperatureModule extends ReactContextBaseJavaModule
 *     implements SensorEventListener {
 *
 *   private SensorManager sensorManager;
 *   private Sensor temperatureSensor;
 *
 *   @ReactMethod
 *   public void isAvailable(Promise promise) {
 *     // TYPE_AMBIENT_TEMPERATURE: ambient air temperature (rare on phones)
 *     Sensor sensor = sensorManager.getDefaultSensor(Sensor.TYPE_AMBIENT_TEMPERATURE);
 *     promise.resolve(sensor != null);
 *   }
 *
 *   @ReactMethod
 *   public void start(int sampleInterval) {
 *     temperatureSensor = sensorManager.getDefaultSensor(Sensor.TYPE_AMBIENT_TEMPERATURE);
 *     if (temperatureSensor != null) {
 *       sensorManager.registerListener(
 *         this,
 *         temperatureSensor,
 *         sampleInterval * 1000
 *       );
 *     }
 *   }
 *
 *   @Override
 *   public void onSensorChanged(SensorEvent event) {
 *     if (event.sensor.getType() == Sensor.TYPE_AMBIENT_TEMPERATURE) {
 *       WritableMap data = Arguments.createMap();
 *       data.putDouble("celsius", event.values[0]); // Temperature in °C
 *       data.putDouble("timestamp", System.currentTimeMillis());
 *
 *       sendEvent("TemperatureData", data);
 *     }
 *   }
 * }
 * ```
 *
 * iOS:
 * iOS does NOT provide ambient temperature sensor API.
 * Alternative approaches:
 * 1. Use weather API services (OpenWeatherMap, WeatherKit)
 * 2. Use external Bluetooth temperature sensors
 * 3. Estimate from battery temperature (very inaccurate)
 *
 * Platform differences:
 * - Android: TYPE_AMBIENT_TEMPERATURE (rare, mostly on specialized devices)
 * - iOS: No native API available
 * - Most smartphones: Only internal temperature sensors (battery, CPU, GPU)
 * - Tablets/wearables: More likely to have ambient temperature sensor
 * - External sensors: Bluetooth thermometers can be used on both platforms
 *
 * Important notes:
 * - Ambient temperature sensor measures AIR temperature, not device temperature
 * - Very few consumer smartphones have this sensor
 * - Sensor accuracy: typically ±1-2°C
 * - Response time: 10-30 seconds to ambient changes
 * - Affected by device heat, sunlight, user's hand
 * - For weather apps, use weather API services instead
 */
