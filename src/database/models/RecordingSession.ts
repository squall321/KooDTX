/**
 * RecordingSession Model
 * Represents a sensor data recording session
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date, json} from '@nozbe/watermelondb/decorators';
import type {SensorType} from '@app-types/sensor.types';

export class RecordingSession extends Model {
  static override table = 'recording_sessions';

  @field('session_id') sessionId!: string;
  @field('start_time') startTime!: number;
  @field('end_time') endTime?: number;
  @field('is_active') isActive!: boolean;
  @json('enabled_sensors', (json: SensorType[]) => json) enabledSensors!: SensorType[];
  @field('sample_rate') sampleRate!: number;
  @field('data_count') dataCount!: number;
  @field('notes') notes?: string;
  @field('is_uploaded') isUploaded!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
