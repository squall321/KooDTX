/**
 * SensorDataRecord Model
 * Represents sensor data (accelerometer, gyroscope, magnetometer, GPS)
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date} from '@nozbe/watermelondb/decorators';
import type {SensorType} from '@app-types/sensor.types';

export class SensorDataRecord extends Model {
  static override table = 'sensor_data';

  @field('sensor_type') sensorType!: SensorType;
  @field('session_id') sessionId!: string;
  @field('timestamp') timestamp!: number;

  // 3-axis data (accelerometer, gyroscope, magnetometer)
  @field('x') x?: number;
  @field('y') y?: number;
  @field('z') z?: number;

  // GPS data
  @field('latitude') latitude?: number;
  @field('longitude') longitude?: number;
  @field('altitude') altitude?: number;
  @field('accuracy') accuracy?: number;
  @field('speed') speed?: number;
  @field('heading') heading?: number;

  // Metadata
  @field('is_uploaded') isUploaded!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
