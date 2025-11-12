# Constants

Application-wide constants and enums.

## Structure

```
constants/
├── index.ts         # Main constants exports
├── app.ts           # App-level constants
├── sensors.ts       # Sensor-related constants
├── database.ts      # Database constants
├── errors.ts        # Error messages and codes
└── routes.ts        # Navigation route names
```

## Guidelines

- Use UPPER_SNAKE_CASE for constants
- Group related constants together
- Document the purpose of each constant
- Use TypeScript const assertions
- Export constants as const objects

## Example

```typescript
// app.ts
export const APP_NAME = 'KooDTX' as const;
export const APP_VERSION = '0.1.0' as const;

export const STORAGE_KEYS = {
  USER_SETTINGS: '@koodtx:user_settings',
  SESSION_CACHE: '@koodtx:session_cache',
  SYNC_QUEUE: '@koodtx:sync_queue',
} as const;

export const LIMITS = {
  MAX_RECORDING_DURATION: 3600000, // 1 hour in ms
  MAX_UPLOAD_SIZE: 10485760, // 10MB in bytes
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// sensors.ts
export const SENSOR_TYPES = {
  ACCELEROMETER: 'accelerometer',
  GYROSCOPE: 'gyroscope',
  MAGNETOMETER: 'magnetometer',
  GPS: 'gps',
  AUDIO: 'audio',
} as const;

export const SAMPLE_RATES = {
  LOW: 10,
  MEDIUM: 50,
  HIGH: 100,
} as const;

// errors.ts
export const ERROR_CODES = {
  PERMISSION_DENIED: 'E001',
  SENSOR_NOT_AVAILABLE: 'E002',
  UPLOAD_FAILED: 'E003',
  DATABASE_ERROR: 'E004',
  NETWORK_ERROR: 'E005',
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.PERMISSION_DENIED]:
    'Permission denied. Please grant the required permissions.',
  [ERROR_CODES.SENSOR_NOT_AVAILABLE]:
    'Sensor not available on this device.',
  [ERROR_CODES.UPLOAD_FAILED]: 'Failed to upload data. Please try again.',
  [ERROR_CODES.DATABASE_ERROR]: 'Database operation failed.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error.',
} as const;

// routes.ts
export const ROUTES = {
  HOME: 'Home',
  RECORDING: 'Recording',
  HISTORY: 'History',
  SETTINGS: 'Settings',
  RECORDING_DETAIL: 'RecordingDetail',
  SENSOR_SETTINGS: 'SensorSettings',
} as const;
```
