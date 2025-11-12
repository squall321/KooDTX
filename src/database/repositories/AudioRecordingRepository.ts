/**
 * AudioRecordingRepository
 *
 * Repository for managing audio recording metadata
 */

import {Q} from '@nozbe/watermelondb';
import {database} from '../index';
import {AudioRecording} from '../models/AudioRecording';

export interface CreateAudioRecordingInput {
  sessionId: string;
  timestamp: number;
  filePath: string;
  fileSize: number;
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
}

export interface UpdateAudioRecordingInput {
  isUploaded?: boolean;
  uploadedUrl?: string;
}

export class AudioRecordingRepository {
  private static instance: AudioRecordingRepository;

  private constructor() {}

  static getInstance(): AudioRecordingRepository {
    if (!AudioRecordingRepository.instance) {
      AudioRecordingRepository.instance = new AudioRecordingRepository();
    }
    return AudioRecordingRepository.instance;
  }

  /**
   * Create a new audio recording record
   */
  async create(input: CreateAudioRecordingInput): Promise<AudioRecording> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    const audioRecording = await database.write(async () => {
      return await audioRecordingsCollection.create(recording => {
        recording.sessionId = input.sessionId;
        recording.timestamp = input.timestamp;
        recording.filePath = input.filePath;
        recording.fileSize = input.fileSize;
        recording.duration = input.duration;
        recording.sampleRate = input.sampleRate;
        recording.channels = input.channels;
        recording.format = input.format;
        recording.isUploaded = false;
      });
    });

    return audioRecording;
  }

  /**
   * Find audio recording by ID
   */
  async findById(id: string): Promise<AudioRecording | null> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    try {
      const audioRecording = await audioRecordingsCollection.find(id);
      return audioRecording;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find audio recordings by session ID
   */
  async findBySession(sessionId: string): Promise<AudioRecording[]> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    const audioRecordings = await audioRecordingsCollection
      .query(Q.where('session_id', sessionId), Q.sortBy('timestamp', Q.asc))
      .fetch();

    return audioRecordings;
  }

  /**
   * Find all audio recordings
   */
  async findAll(): Promise<AudioRecording[]> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    const audioRecordings = await audioRecordingsCollection
      .query(Q.sortBy('timestamp', Q.desc))
      .fetch();

    return audioRecordings;
  }

  /**
   * Find audio recordings that need to be uploaded
   */
  async findNotUploaded(): Promise<AudioRecording[]> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    const audioRecordings = await audioRecordingsCollection
      .query(Q.where('is_uploaded', false), Q.sortBy('timestamp', Q.asc))
      .fetch();

    return audioRecordings;
  }

  /**
   * Update audio recording
   */
  async update(
    id: string,
    input: UpdateAudioRecordingInput,
  ): Promise<AudioRecording> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    const audioRecording = await audioRecordingsCollection.find(id);

    const updated = await database.write(async () => {
      return await audioRecording.update(recording => {
        if (input.isUploaded !== undefined) {
          recording.isUploaded = input.isUploaded;
        }
        if (input.uploadedUrl !== undefined) {
          recording.uploadedUrl = input.uploadedUrl;
        }
      });
    });

    return updated;
  }

  /**
   * Mark audio recordings as uploaded
   */
  async markAsUploaded(ids: string[]): Promise<void> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    await database.write(async () => {
      const updatePromises = ids.map(async id => {
        try {
          const audioRecording = await audioRecordingsCollection.find(id);
          return await audioRecording.update(recording => {
            recording.isUploaded = true;
          });
        } catch (error) {
          console.error(`Failed to update audio recording ${id}:`, error);
          return null;
        }
      });

      await Promise.all(updatePromises);
    });
  }

  /**
   * Delete audio recording by ID
   */
  async delete(id: string): Promise<void> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    const audioRecording = await audioRecordingsCollection.find(id);

    await database.write(async () => {
      await audioRecording.markAsDeleted();
    });
  }

  /**
   * Delete all audio recordings for a session
   */
  async deleteBySession(sessionId: string): Promise<void> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    const audioRecordings = await audioRecordingsCollection
      .query(Q.where('session_id', sessionId))
      .fetch();

    await database.write(async () => {
      const deletePromises = audioRecordings.map(recording =>
        recording.markAsDeleted(),
      );
      await Promise.all(deletePromises);
    });
  }

  /**
   * Get total count of audio recordings
   */
  async count(): Promise<number> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    return await audioRecordingsCollection.query().fetchCount();
  }

  /**
   * Get count of audio recordings by session
   */
  async countBySession(sessionId: string): Promise<number> {
    const audioRecordingsCollection = database.get<AudioRecording>(
      'audio_recordings',
    );

    return await audioRecordingsCollection
      .query(Q.where('session_id', sessionId))
      .fetchCount();
  }
}

export const getAudioRecordingRepository = (): AudioRecordingRepository => {
  return AudioRecordingRepository.getInstance();
};
