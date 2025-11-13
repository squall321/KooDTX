/**
 * File Model
 * Tracks all file-based data (audio, exports, backups, etc.)
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date, relation, json} from '@nozbe/watermelondb/decorators';
import type {Associations} from '@nozbe/watermelondb/Model';
import type {RecordingSession} from './RecordingSession';

export type FileType = 'audio' | 'export' | 'backup';

export interface FileMetadata {
  duration?: number;
  sampleRate?: number;
  channels?: number;
  format?: string;
  compression?: string;
  recordCount?: number;
  [key: string]: any;
}

export class File extends Model {
  static override table = 'files';

  static override associations: Associations = {
    recording_sessions: {type: 'belongs_to', key: 'session_id'},
  };

  @field('session_id') sessionId!: string;
  @field('file_type') fileType!: FileType;
  @field('file_path') filePath!: string;
  @field('file_name') fileName!: string;
  @field('file_size') fileSize!: number;
  @field('mime_type') mimeType!: string;
  @field('checksum') checksum?: string;
  @field('is_uploaded') isUploaded!: boolean;
  @field('uploaded_url') uploadedUrl?: string;
  @field('uploaded_at') uploadedAt?: number;
  @json('metadata', (json: FileMetadata) => json) metadata?: FileMetadata;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('recording_sessions', 'session_id') session!: RecordingSession;

  /**
   * Get human-readable file size
   */
  getFormattedSize(): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.fileSize === 0) return '0 Bytes';
    const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
    return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Check if file exists locally
   */
  async exists(): Promise<boolean> {
    const RNFS = require('react-native-fs');
    return await RNFS.exists(this.filePath);
  }

  /**
   * Check if file is ready to upload (exists and not already uploaded)
   */
  async isReadyToUpload(): Promise<boolean> {
    if (this.isUploaded) {
      return false;
    }
    return await this.exists();
  }

  /**
   * Get file extension
   */
  getExtension(): string {
    return this.fileName.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Check if file is an audio file
   */
  isAudio(): boolean {
    return this.fileType === 'audio' || this.mimeType.startsWith('audio/');
  }

  /**
   * Check if file is compressed
   */
  isCompressed(): boolean {
    const compressedExtensions = ['zip', 'gz', 'tar', 'bz2', '7z'];
    return compressedExtensions.includes(this.getExtension());
  }
}
