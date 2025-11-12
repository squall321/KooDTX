/**
 * WatermelonDB Schema
 * Defines database tables and columns
 */

import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 3,
  tables: [
    // Recording Sessions
    tableSchema({
      name: 'recording_sessions',
      columns: [
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'start_time', type: 'number', isIndexed: true},
        {name: 'end_time', type: 'number', isOptional: true},
        {name: 'is_active', type: 'boolean'},
        {name: 'enabled_sensors', type: 'string'}, // JSON array
        {name: 'sample_rate', type: 'number'},
        {name: 'data_count', type: 'number'},
        {name: 'notes', type: 'string', isOptional: true},
        {name: 'is_uploaded', type: 'boolean'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Sensor Data (Accelerometer, Gyroscope, Magnetometer, GPS)
    tableSchema({
      name: 'sensor_data',
      columns: [
        {name: 'sensor_type', type: 'string', isIndexed: true},
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'timestamp', type: 'number', isIndexed: true},
        // 3-axis data (accelerometer, gyroscope, magnetometer)
        {name: 'x', type: 'number', isOptional: true},
        {name: 'y', type: 'number', isOptional: true},
        {name: 'z', type: 'number', isOptional: true},
        // GPS data
        {name: 'latitude', type: 'number', isOptional: true},
        {name: 'longitude', type: 'number', isOptional: true},
        {name: 'altitude', type: 'number', isOptional: true},
        {name: 'accuracy', type: 'number', isOptional: true},
        {name: 'speed', type: 'number', isOptional: true},
        {name: 'heading', type: 'number', isOptional: true},
        // Metadata
        {name: 'is_uploaded', type: 'boolean'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Audio Recordings
    tableSchema({
      name: 'audio_recordings',
      columns: [
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'timestamp', type: 'number', isIndexed: true},
        {name: 'file_path', type: 'string'},
        {name: 'file_size', type: 'number'},
        {name: 'duration', type: 'number'},
        {name: 'sample_rate', type: 'number'},
        {name: 'channels', type: 'number'},
        {name: 'format', type: 'string'},
        {name: 'is_uploaded', type: 'boolean'},
        {name: 'uploaded_url', type: 'string', isOptional: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Step Events (Step Detector)
    tableSchema({
      name: 'step_events',
      columns: [
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'timestamp', type: 'number', isIndexed: true},
        {name: 'elapsed_realtime_nanos', type: 'number'},
        {name: 'utc_epoch_ms', type: 'number'},
        {name: 'activity_type', type: 'string', isIndexed: true}, // walking, running, unknown
        {name: 'confidence', type: 'number', isOptional: true},
        {name: 'is_uploaded', type: 'boolean'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Step Counts (Step Counter)
    tableSchema({
      name: 'step_counts',
      columns: [
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'timestamp', type: 'number', isIndexed: true},
        {name: 'elapsed_realtime_nanos', type: 'number'},
        {name: 'count', type: 'number'}, // Cumulative count since boot
        {name: 'delta', type: 'number'}, // Steps since last sample
        {name: 'is_uploaded', type: 'boolean'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
  ],
});
