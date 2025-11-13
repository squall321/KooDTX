/**
 * Store exports
 * Central export point for all Zustand stores
 */

export {useAppStore} from './useAppStore';
export {useRecordingStore} from './useRecordingStore';
export {
  useSensorStore,
  RecordingState,
  useRecordingState,
  useIsRecording,
  useIsPaused,
  useSensorConfigs,
  useEnabledSensors,
  useEnabledSensorTypes,
  useRealtimeData,
  useSensorRealtimeData,
  useGPSRealtimeData,
  useCurrentSession,
  useSessionDuration,
  useStatistics,
  useSensorStatistics,
  useRecordingError,
  useSensorActions,
} from './useSensorStore';
export type {
  SensorConfig,
  SensorRealtimeData,
  GPSRealtimeData,
  RecordingSessionInfo,
  RecordingStatistics,
  SensorStoreState,
} from './useSensorStore';
export {
  usePermissionsStore,
  useIsPermissionGranted,
  useHasDeniedPermissions,
  useHasBlockedPermissions,
  useGrantedPermissions,
  useDeniedPermissions,
  useBlockedPermissions,
  useAreRequiredPermissionsGranted,
  usePermissionSummary,
  usePermissionsLoading,
  usePermissionsRequesting,
} from './usePermissionsStore';
