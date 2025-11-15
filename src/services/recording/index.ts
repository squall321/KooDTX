/**
 * Recording Service Exports
 * Phase 96: Integrated sensor + audio recording
 * Phase 97: Wake lock management
 */

export {
  RecordingService,
  recordingService,
  RecordingMode,
  IntegratedRecordingState,
  type RecordingSessionInfo,
  type RecordingConfig,
  type IntegratedRecordingStats,
  type RecordingEvent,
  type RecordingEventListener,
  type IntegratedSensorDataHandler,
} from '../RecordingService';

// Wake lock exports
export {
  wakeLockService,
  WakeLockState,
  type WakeLockOptions,
  type WakeLockStats,
} from '../power';

export default recordingService;
