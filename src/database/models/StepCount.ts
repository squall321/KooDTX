/**
 * StepCount Model
 * Represents cumulative step count samples
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date} from '@nozbe/watermelondb/decorators';

export class StepCount extends Model {
  static override table = 'step_counts';

  @field('session_id') sessionId!: string;
  @field('timestamp') timestamp!: number;
  @field('elapsed_realtime_nanos') elapsedRealtimeNanos!: number;
  @field('count') count!: number;
  @field('delta') delta!: number;

  // Metadata
  @field('is_uploaded') isUploaded!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
