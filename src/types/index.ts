/**
 * Central export for all type definitions
 */

// Common types
export type {
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  SyncStatus,
  SyncableRecord,
  LoadingState,
  Coordinates,
  DateRange,
  Environment,
} from './common.types';

// Sensor types
export {SensorType} from './sensor.types';
export type {
  BaseSensorData,
  AccelerometerData,
  GyroscopeData,
  MagnetometerData,
  GPSData,
  AudioData,
  SensorData,
  RecordingSession,
  SensorConfig,
  SensorSettings,
} from './sensor.types';

// Database types
export {TableName} from './database.types';
export type {
  BaseModel,
  SyncQueueEntry,
  UserSettings,
  MigrationVersion,
  DatabaseStats,
  QueryFilter,
} from './database.types';

// Navigation types
export type {
  RootStackParamList,
  MainTabParamList,
  HomeStackParamList,
  RecordingStackParamList,
  HistoryStackParamList,
  SettingsStackParamList,
  NavigationProp,
  RouteProp,
} from './navigation.types';
