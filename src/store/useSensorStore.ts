/**
 * Sensor configuration store
 * Manages sensor settings and configurations
 */

import {create} from 'zustand';

import type {SensorSettings, SensorType} from '@types';

interface SensorState {
  // Sensor settings
  settings: SensorSettings;

  // Sensor availability
  availableSensors: SensorType[];

  // Actions
  updateSensorConfig: <T extends SensorType>(
    sensorType: T,
    config: Partial<SensorSettings[T]>,
  ) => void;
  toggleSensor: (sensorType: SensorType) => void;
  setAvailableSensors: (sensors: SensorType[]) => void;
  resetToDefaults: () => void;
}

const defaultSettings: SensorSettings = {
  accelerometer: {
    enabled: true,
    sampleRate: 50,
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
    sensitivity: 1.0,
  },
  gps: {
    enabled: true,
    sampleRate: 1,
    sensitivity: 1.0,
  },
  audio: {
    enabled: true,
    sampleRate: 44100,
    sensitivity: 1.0,
    format: 'wav',
    bitrate: 128000,
    channels: 1,
  },
};

export const useSensorStore = create<SensorState>(set => ({
  settings: defaultSettings,
  availableSensors: [],

  updateSensorConfig: (sensorType, config) => {
    set(state => ({
      settings: {
        ...state.settings,
        [sensorType]: {
          ...state.settings[sensorType],
          ...config,
        },
      },
    }));
  },

  toggleSensor: sensorType => {
    set(state => ({
      settings: {
        ...state.settings,
        [sensorType]: {
          ...state.settings[sensorType],
          enabled: !state.settings[sensorType].enabled,
        },
      },
    }));
  },

  setAvailableSensors: sensors => {
    set({availableSensors: sensors});
  },

  resetToDefaults: () => {
    set({settings: defaultSettings});
  },
}));
