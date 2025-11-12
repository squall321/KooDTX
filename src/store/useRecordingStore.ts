/**
 * Recording session store
 * Manages recording session state and controls
 */

import {create} from 'zustand';

import type {RecordingSession, SensorType} from '@app-types';

interface RecordingState {
  // Current session
  currentSession: RecordingSession | null;
  isRecording: boolean;
  isPaused: boolean;

  // Recording configuration
  enabledSensors: SensorType[];
  sampleRate: number;

  // Recording statistics
  dataCount: number;
  duration: number;

  // Actions
  startRecording: (sensors: SensorType[], sampleRate: number) => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  updateDataCount: (count: number) => void;
  updateDuration: (duration: number) => void;
  setEnabledSensors: (sensors: SensorType[]) => void;
  setSampleRate: (rate: number) => void;
  reset: () => void;
}

const initialState = {
  currentSession: null,
  isRecording: false,
  isPaused: false,
  enabledSensors: [] as SensorType[],
  sampleRate: 50,
  dataCount: 0,
  duration: 0,
};

export const useRecordingStore = create<RecordingState>(set => ({
  ...initialState,

  startRecording: (sensors, sampleRate) => {
    const session: RecordingSession = {
      id: `session-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      startTime: Date.now(),
      isActive: true,
      enabledSensors: sensors,
      sampleRate,
      dataCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending',
      deviceId: 'device-123', // TODO: Get actual device ID
    };

    set({
      currentSession: session,
      isRecording: true,
      isPaused: false,
      enabledSensors: sensors,
      sampleRate,
      dataCount: 0,
      duration: 0,
    });
  },

  stopRecording: () => {
    set(state => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            endTime: Date.now(),
            isActive: false,
            updatedAt: Date.now(),
          }
        : null,
      isRecording: false,
      isPaused: false,
    }));
  },

  pauseRecording: () => {
    set({isPaused: true});
  },

  resumeRecording: () => {
    set({isPaused: false});
  },

  updateDataCount: count => {
    set(state => ({
      dataCount: count,
      currentSession: state.currentSession
        ? {...state.currentSession, dataCount: count, updatedAt: Date.now()}
        : null,
    }));
  },

  updateDuration: duration => {
    set({duration});
  },

  setEnabledSensors: sensors => {
    set({enabledSensors: sensors});
  },

  setSampleRate: rate => {
    set({sampleRate: rate});
  },

  reset: () => {
    set(initialState);
  },
}));
