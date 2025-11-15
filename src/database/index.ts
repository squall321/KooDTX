/**
 * WatermelonDB Database Configuration
 * Sets up the database adapter and connection
 */

import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {schema} from './schema';
import {migrations} from './migrations';
import {
  RecordingSession,
  SensorDataRecord,
  AudioRecording,
  StepEvent,
  StepCount,
  SyncQueue,
  File,
} from './models';
import {logger} from '../utils/logger';

// Database adapter configuration
const adapter = new SQLiteAdapter({
  schema,
  migrations, // Enable schema migrations
  jsi: false, // Use JSI (JavaScript Interface) - set to true for better performance on newer RN versions
  onSetUpError: error => {
    // Error handling
    logger.error('Database setup error:', error);
  },
});

// Create database instance
export const database = new Database({
  adapter,
  modelClasses: [
    RecordingSession,
    SensorDataRecord,
    AudioRecording,
    StepEvent,
    StepCount,
    SyncQueue,
    File,
  ],
});

// Export models for convenience
export {
  RecordingSession,
  SensorDataRecord,
  AudioRecording,
  StepEvent,
  StepCount,
  SyncQueue,
  File,
};

// Export schema and migrations
export {schema};
export {migrations} from './migrations';

// Export migration helpers
export {
  validateMigrations,
  getCurrentSchemaVersion,
  getMigrationHistory,
  isTableInMigrations,
} from './migrations';
