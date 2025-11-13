/**
 * SensorDataRecord Model
 * Represents sensor data (accelerometer, gyroscope, magnetometer, GPS, proximity, light, pressure, gravity, linear_acceleration, rotation_vector)
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date} from '@nozbe/watermelondb/decorators';
import type {SensorType} from '@app-types/sensor.types';

export class SensorDataRecord extends Model {
  static override table = 'sensor_data';

  @field('sensor_type') sensorType!: SensorType;
  @field('session_id') sessionId!: string;
  @field('timestamp') timestamp!: number;

  // 3-axis data (accelerometer, gyroscope, magnetometer, gravity, linear_acceleration)
  @field('x') x?: number;
  @field('y') y?: number;
  @field('z') z?: number;
  @field('magnitude') magnitude?: number;

  // GPS data
  @field('latitude') latitude?: number;
  @field('longitude') longitude?: number;
  @field('altitude') altitude?: number;
  @field('accuracy') accuracy?: number;
  @field('speed') speed?: number;
  @field('heading') heading?: number;

  // Proximity data
  @field('distance') distance?: number;
  @field('is_near') isNear?: boolean;
  @field('max_range') maxRange?: number;

  // Light data
  @field('lux') lux?: number;
  @field('brightness_level') brightnessLevel?: string;

  // Pressure data
  @field('pressure') pressure?: number;
  @field('calculated_altitude') calculatedAltitude?: number;
  @field('sea_level_pressure') seaLevelPressure?: number;

  // Rotation vector data (quaternion and Euler angles)
  @field('qx') qx?: number;
  @field('qy') qy?: number;
  @field('qz') qz?: number;
  @field('qw') qw?: number;
  @field('pitch') pitch?: number;
  @field('roll') roll?: number;

  // Temperature data
  @field('celsius') celsius?: number;
  @field('fahrenheit') fahrenheit?: number;
  @field('kelvin') kelvin?: number;

  // Humidity data
  @field('humidity') humidity?: number;
  @field('dew_point') dewPoint?: number;

  // Metadata
  @field('is_uploaded') isUploaded!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
