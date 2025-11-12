/**
 * AudioRecording Model
 * Represents an audio recording file metadata
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date} from '@nozbe/watermelondb/decorators';

export class AudioRecording extends Model {
  static table = 'audio_recordings';

  @field('session_id') sessionId!: string;
  @field('timestamp') timestamp!: number;
  @field('file_path') filePath!: string;
  @field('file_size') fileSize!: number;
  @field('duration') duration!: number;
  @field('sample_rate') sampleRate!: number;
  @field('channels') channels!: number;
  @field('format') format!: string;
  @field('is_uploaded') isUploaded!: boolean;
  @field('uploaded_url') uploadedUrl?: string;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
