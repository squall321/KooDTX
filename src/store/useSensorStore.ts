/**
 * Sensor Store
 * Phase 86: Global state management for sensor data collection
 *
 * Features:
 * - Recording state management
 * - Sensor activation state
 * - Real-time sensor values
 * - Session information
 * - Error state
 * - Actions for controlling sensors
 */

import {create} from 'zustand';
import type {AndroidSensorType} from '@native';
import type {GPSPosition} from '@services/gps';

/**
 * Recording state
 */
export enum RecordingState {
  IDLE = 'idle',
  STARTING = 'starting',
  RECORDING = 'recording',
  PAUSING = 'pausing',
  PAUSED = 'paused',
  RESUMING = 'resuming',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
}

/**
 * Sensor configuration
 */
export interface SensorConfig {
  sensorType: AndroidSensorType;
  enabled: boolean;
  samplingRate?: number;
  label?: string;
}

/**
 * Real-time sensor data
 */
export interface SensorRealtimeData {
  sensorType: AndroidSensorType;
  values: number[];
  timestamp: number;
  accuracy?: number;
}

/**
 * GPS real-time data
 */
export interface GPSRealtimeData {
  position: GPSPosition;
  timestamp: number;
}

/**
 * Recording session info
 */
export interface RecordingSessionInfo {
  sessionId: string;
  startTime: number;
  endTime: number | null;
  duration: number; // milliseconds
  enabledSensors: AndroidSensorType[];
  sampleCount: number;
}

/**
 * Recording statistics
 */
export interface RecordingStatistics {
  totalSamples: number;
  droppedSamples: number;
  sensorStats: Record<AndroidSensorType, {
    sampleCount: number;
    lastValue: number[];
    lastTimestamp: number;
  }>;
}

/**
 * Sensor store state
 */
export interface SensorStoreState {
  // Recording state
  recordingState: RecordingState;

  // Sensor configuration
  sensorConfigs: SensorConfig[];

  // Real-time data
  realtimeData: Record<AndroidSensorType, SensorRealtimeData>;
  gpsRealtimeData: GPSRealtimeData | null;

  // Session info
  currentSession: RecordingSessionInfo | null;

  // Statistics
  statistics: RecordingStatistics;

  // Error state
  error: Error | null;

  // Actions
  setRecordingState: (state: RecordingState) => void;

  // Sensor configuration actions
  setSensorConfigs: (configs: SensorConfig[]) => void;
  enableSensor: (sensorType: AndroidSensorType) => void;
  disableSensor: (sensorType: AndroidSensorType) => void;
  toggleSensor: (sensorType: AndroidSensorType) => void;
  updateSensorConfig: (sensorType: AndroidSensorType, config: Partial<SensorConfig>) => void;

  // Real-time data actions
  updateRealtimeData: (data: SensorRealtimeData) => void;
  updateGPSRealtimeData: (data: GPSRealtimeData) => void;
  clearRealtimeData: () => void;

  // Session actions
  startSession: (sessionId: string, enabledSensors: AndroidSensorType[]) => void;
  updateSession: (updates: Partial<RecordingSessionInfo>) => void;
  endSession: () => void;
  incrementSampleCount: (count?: number) => void;

  // Statistics actions
  updateStatistics: (stats: Partial<RecordingStatistics>) => void;
  updateSensorStats: (sensorType: AndroidSensorType, values: number[], timestamp: number) => void;
  resetStatistics: () => void;

  // Error actions
  setError: (error: Error | null) => void;
  clearError: () => void;

  // Reset
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  recordingState: RecordingState.IDLE,
  sensorConfigs: [],
  realtimeData: {},
  gpsRealtimeData: null,
  currentSession: null,
  statistics: {
    totalSamples: 0,
    droppedSamples: 0,
    sensorStats: {},
  },
  error: null,
};

/**
 * Create sensor store
 */
export const useSensorStore = create<SensorStoreState>((set, get) => ({
  ...initialState,

  // Recording state
  setRecordingState: (state: RecordingState) => {
    set({recordingState: state});

    // Clear error when starting recording
    if (state === RecordingState.STARTING) {
      set({error: null});
    }
  },

  // Sensor configuration
  setSensorConfigs: (configs: SensorConfig[]) => {
    set({sensorConfigs: configs});
  },

  enableSensor: (sensorType: AndroidSensorType) => {
    set((state) => ({
      sensorConfigs: state.sensorConfigs.map((config) =>
        config.sensorType === sensorType
          ? {...config, enabled: true}
          : config
      ),
    }));
  },

  disableSensor: (sensorType: AndroidSensorType) => {
    set((state) => ({
      sensorConfigs: state.sensorConfigs.map((config) =>
        config.sensorType === sensorType
          ? {...config, enabled: false}
          : config
      ),
    }));
  },

  toggleSensor: (sensorType: AndroidSensorType) => {
    set((state) => ({
      sensorConfigs: state.sensorConfigs.map((config) =>
        config.sensorType === sensorType
          ? {...config, enabled: !config.enabled}
          : config
      ),
    }));
  },

  updateSensorConfig: (sensorType: AndroidSensorType, configUpdate: Partial<SensorConfig>) => {
    set((state) => ({
      sensorConfigs: state.sensorConfigs.map((config) =>
        config.sensorType === sensorType
          ? {...config, ...configUpdate}
          : config
      ),
    }));
  },

  // Real-time data
  updateRealtimeData: (data: SensorRealtimeData) => {
    set((state) => ({
      realtimeData: {
        ...state.realtimeData,
        [data.sensorType]: data,
      },
    }));

    // Update sensor stats
    get().updateSensorStats(data.sensorType, data.values, data.timestamp);
  },

  updateGPSRealtimeData: (data: GPSRealtimeData) => {
    set({gpsRealtimeData: data});
  },

  clearRealtimeData: () => {
    set({realtimeData: {}, gpsRealtimeData: null});
  },

  // Session
  startSession: (sessionId: string, enabledSensors: AndroidSensorType[]) => {
    const startTime = Date.now();

    set({
      currentSession: {
        sessionId,
        startTime,
        endTime: null,
        duration: 0,
        enabledSensors,
        sampleCount: 0,
      },
    });

    // Reset statistics
    get().resetStatistics();
  },

  updateSession: (updates: Partial<RecordingSessionInfo>) => {
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            ...updates,
            duration: updates.endTime
              ? updates.endTime - state.currentSession.startTime
              : Date.now() - state.currentSession.startTime,
          }
        : null,
    }));
  },

  endSession: () => {
    const session = get().currentSession;

    if (session) {
      const endTime = Date.now();
      set({
        currentSession: {
          ...session,
          endTime,
          duration: endTime - session.startTime,
        },
      });
    }
  },

  incrementSampleCount: (count: number = 1) => {
    set((state) => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            sampleCount: state.currentSession.sampleCount + count,
          }
        : null,
      statistics: {
        ...state.statistics,
        totalSamples: state.statistics.totalSamples + count,
      },
    }));
  },

  // Statistics
  updateStatistics: (stats: Partial<RecordingStatistics>) => {
    set((state) => ({
      statistics: {
        ...state.statistics,
        ...stats,
      },
    }));
  },

  updateSensorStats: (sensorType: AndroidSensorType, values: number[], timestamp: number) => {
    set((state) => {
      const currentStats = state.statistics.sensorStats[sensorType] || {
        sampleCount: 0,
        lastValue: [],
        lastTimestamp: 0,
      };

      return {
        statistics: {
          ...state.statistics,
          sensorStats: {
            ...state.statistics.sensorStats,
            [sensorType]: {
              sampleCount: currentStats.sampleCount + 1,
              lastValue: values,
              lastTimestamp: timestamp,
            },
          },
        },
      };
    });
  },

  resetStatistics: () => {
    set({
      statistics: {
        totalSamples: 0,
        droppedSamples: 0,
        sensorStats: {},
      },
    });
  },

  // Error
  setError: (error: Error | null) => {
    set({error});

    if (error) {
      set({recordingState: RecordingState.ERROR});
    }
  },

  clearError: () => {
    set({error: null});
  },

  // Reset
  reset: () => {
    set(initialState);
  },
}));

/**
 * Selector hooks for convenient access
 */

/**
 * Get recording state
 */
export const useRecordingState = () => useSensorStore((state) => state.recordingState);

/**
 * Check if recording
 */
export const useIsRecording = () => useSensorStore((state) =>
  state.recordingState === RecordingState.RECORDING
);

/**
 * Check if paused
 */
export const useIsPaused = () => useSensorStore((state) =>
  state.recordingState === RecordingState.PAUSED
);

/**
 * Get sensor configs
 */
export const useSensorConfigs = () => useSensorStore((state) => state.sensorConfigs);

/**
 * Get enabled sensors
 */
export const useEnabledSensors = () => useSensorStore((state) =>
  state.sensorConfigs.filter((config) => config.enabled)
);

/**
 * Get enabled sensor types
 */
export const useEnabledSensorTypes = () => useSensorStore((state) =>
  state.sensorConfigs
    .filter((config) => config.enabled)
    .map((config) => config.sensorType)
);

/**
 * Get real-time data
 */
export const useRealtimeData = () => useSensorStore((state) => state.realtimeData);

/**
 * Get specific sensor real-time data
 */
export const useSensorRealtimeData = (sensorType: AndroidSensorType) =>
  useSensorStore((state) => state.realtimeData[sensorType]);

/**
 * Get GPS real-time data
 */
export const useGPSRealtimeData = () => useSensorStore((state) => state.gpsRealtimeData);

/**
 * Get current session
 */
export const useCurrentSession = () => useSensorStore((state) => state.currentSession);

/**
 * Get session duration
 */
export const useSessionDuration = () => useSensorStore((state) => {
  const session = state.currentSession;
  if (!session) return 0;

  if (session.endTime) {
    return session.endTime - session.startTime;
  }

  return Date.now() - session.startTime;
});

/**
 * Get statistics
 */
export const useStatistics = () => useSensorStore((state) => state.statistics);

/**
 * Get specific sensor statistics
 */
export const useSensorStatistics = (sensorType: AndroidSensorType) =>
  useSensorStore((state) => state.statistics.sensorStats[sensorType]);

/**
 * Get error
 */
export const useRecordingError = () => useSensorStore((state) => state.error);

/**
 * Get sensor actions
 */
export const useSensorActions = () => useSensorStore((state) => ({
  setRecordingState: state.setRecordingState,
  setSensorConfigs: state.setSensorConfigs,
  enableSensor: state.enableSensor,
  disableSensor: state.disableSensor,
  toggleSensor: state.toggleSensor,
  updateSensorConfig: state.updateSensorConfig,
  updateRealtimeData: state.updateRealtimeData,
  updateGPSRealtimeData: state.updateGPSRealtimeData,
  clearRealtimeData: state.clearRealtimeData,
  startSession: state.startSession,
  updateSession: state.updateSession,
  endSession: state.endSession,
  incrementSampleCount: state.incrementSampleCount,
  updateStatistics: state.updateStatistics,
  updateSensorStats: state.updateSensorStats,
  resetStatistics: state.resetStatistics,
  setError: state.setError,
  clearError: state.clearError,
  reset: state.reset,
}));

/**
 * Export default
 */
export default useSensorStore;
