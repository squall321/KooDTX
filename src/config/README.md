# Config

Application configuration files and environment settings.

## Structure

```
config/
├── index.ts         # Main config exports
├── env.ts           # Environment variables
├── api.ts           # API configuration
├── sensors.ts       # Default sensor configurations
├── database.ts      # Database configuration
└── theme.ts         # Theme configuration (colors, spacing, etc.)
```

## Guidelines

- Use environment variables for sensitive data
- Provide defaults for all configurations
- Type all configuration objects
- Document all configuration options
- Never commit secrets to repository

## Example

```typescript
// env.ts
export const ENV = {
  API_URL: process.env.API_URL || 'http://localhost:5000',
  API_TIMEOUT: 30000,
  ENABLE_LOGGING: __DEV__,
};

// sensors.ts
import type {SensorSettings} from '@types';

export const DEFAULT_SENSOR_CONFIG: SensorSettings = {
  accelerometer: {
    enabled: true,
    sampleRate: 50, // Hz
    sensitivity: 1.0,
  },
  gyroscope: {
    enabled: true,
    sampleRate: 50,
    sensitivity: 1.0,
  },
  magnetometer: {
    enabled: false,
    sampleRate: 10,
  },
  gps: {
    enabled: true,
    sampleRate: 1, // Updates per second
  },
  audio: {
    enabled: true,
    sampleRate: 44100,
    format: 'wav',
    bitrate: 128000,
    channels: 1,
  },
};

// theme.ts
export const THEME = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};
```
