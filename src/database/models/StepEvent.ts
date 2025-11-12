/**
 * StepEvent Model
 * Represents step detection events with activity classification
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date} from '@nozbe/watermelondb/decorators';
import type {StepActivityType} from '@app-types/sensor.types';

export class StepEvent extends Model {
  static override table = 'step_events';

  @field('session_id') sessionId!: string;
  @field('timestamp') timestamp!: number;
  @field('elapsed_realtime_nanos') elapsedRealtimeNanos!: number;
  @field('utc_epoch_ms') utcEpochMs!: number;
  @field('activity_type') activityType!: StepActivityType;
  @field('confidence') confidence?: number;

  // Metadata
  @field('is_uploaded') isUploaded!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
