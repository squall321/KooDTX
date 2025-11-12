/**
 * WatermelonDB Database Configuration
 * Sets up the database adapter and connection
 */

import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {schema} from './schema';
import {RecordingSession, SensorDataRecord, AudioRecording} from './models';

// Database adapter configuration
const adapter = new SQLiteAdapter({
  schema,
  // Optional: migrations for schema updates
  // migrations,
  jsi: false, // Use JSI (JavaScript Interface) - set to true for better performance on newer RN versions
  onSetUpError: error => {
    // Error handling
    console.error('Database setup error:', error);
  },
});

// Create database instance
export const database = new Database({
  adapter,
  modelClasses: [RecordingSession, SensorDataRecord, AudioRecording],
});

// Export models for convenience
export {RecordingSession, SensorDataRecord, AudioRecording};
export {schema};
