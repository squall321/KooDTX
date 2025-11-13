/**
 * WatermelonDB Schema
 * Defines database tables and columns
 */

import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 8,
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

    // Sensor Data (Accelerometer, Gyroscope, Magnetometer, GPS, Proximity, Light, Pressure, Gravity, Linear Accel, Rotation Vector)
    tableSchema({
      name: 'sensor_data',
      columns: [
        {name: 'sensor_type', type: 'string', isIndexed: true},
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'timestamp', type: 'number', isIndexed: true},
        // 3-axis data (accelerometer, gyroscope, magnetometer, gravity, linear_acceleration)
        {name: 'x', type: 'number', isOptional: true},
        {name: 'y', type: 'number', isOptional: true},
        {name: 'z', type: 'number', isOptional: true},
        {name: 'magnitude', type: 'number', isOptional: true},
        // GPS data
        {name: 'latitude', type: 'number', isOptional: true},
        {name: 'longitude', type: 'number', isOptional: true},
        {name: 'altitude', type: 'number', isOptional: true},
        {name: 'accuracy', type: 'number', isOptional: true},
        {name: 'speed', type: 'number', isOptional: true},
        {name: 'heading', type: 'number', isOptional: true},
        // Proximity data
        {name: 'distance', type: 'number', isOptional: true},
        {name: 'is_near', type: 'boolean', isOptional: true},
        {name: 'max_range', type: 'number', isOptional: true},
        // Light data
        {name: 'lux', type: 'number', isOptional: true},
        {name: 'brightness_level', type: 'string', isOptional: true},
        // Pressure data
        {name: 'pressure', type: 'number', isOptional: true},
        {name: 'calculated_altitude', type: 'number', isOptional: true},
        {name: 'sea_level_pressure', type: 'number', isOptional: true},
        // Rotation vector data (quaternion)
        {name: 'qx', type: 'number', isOptional: true},
        {name: 'qy', type: 'number', isOptional: true},
        {name: 'qz', type: 'number', isOptional: true},
        {name: 'qw', type: 'number', isOptional: true},
        {name: 'pitch', type: 'number', isOptional: true},
        {name: 'roll', type: 'number', isOptional: true},
        // Temperature data
        {name: 'celsius', type: 'number', isOptional: true},
        {name: 'fahrenheit', type: 'number', isOptional: true},
        {name: 'kelvin', type: 'number', isOptional: true},
        // Humidity data
        {name: 'humidity', type: 'number', isOptional: true},
        {name: 'dew_point', type: 'number', isOptional: true},
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

    // Sync Queue (for managing data synchronization with server)
    tableSchema({
      name: 'sync_queue',
      columns: [
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'item_type', type: 'string', isIndexed: true}, // 'session', 'sensor_data', 'audio', 'step_event', 'step_count'
        {name: 'item_id', type: 'string', isIndexed: true}, // ID of the item to sync
        {name: 'status', type: 'string', isIndexed: true}, // 'pending', 'in_progress', 'completed', 'failed'
        {name: 'retry_count', type: 'number'}, // Number of retry attempts
        {name: 'max_retries', type: 'number'}, // Maximum retry attempts
        {name: 'priority', type: 'number', isIndexed: true}, // Higher number = higher priority
        {name: 'error_message', type: 'string', isOptional: true},
        {name: 'last_attempt_at', type: 'number', isOptional: true},
        {name: 'next_retry_at', type: 'number', isOptional: true},
        {name: 'completed_at', type: 'number', isOptional: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Files (for tracking all file-based data like audio, exports, etc.)
    tableSchema({
      name: 'files',
      columns: [
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'file_type', type: 'string', isIndexed: true}, // 'audio', 'export', 'backup'
        {name: 'file_path', type: 'string'},
        {name: 'file_name', type: 'string'},
        {name: 'file_size', type: 'number'},
        {name: 'mime_type', type: 'string'},
        {name: 'checksum', type: 'string', isOptional: true}, // MD5 or SHA256 hash
        {name: 'is_uploaded', type: 'boolean'},
        {name: 'uploaded_url', type: 'string', isOptional: true},
        {name: 'uploaded_at', type: 'number', isOptional: true},
        {name: 'metadata', type: 'string', isOptional: true}, // JSON string for additional metadata
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
  ],
});
