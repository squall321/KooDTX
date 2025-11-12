/**
 * Navigation types for React Navigation
 * Note: React Navigation will be installed in a later phase
 */

import type {RecordingSession, SensorType} from './sensor.types';

/**
 * Navigator screen params type (placeholder until React Navigation is installed)
 */
export type NavigatorScreenParams<T> = T extends Record<string, unknown>
  ? {screen?: keyof T; params?: T[keyof T]}
  : never;

/**
 * Root Stack Navigator Params
 */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  RecordingDetail: {
    sessionId: string;
  };
  SensorSettings: {
    sensorType: SensorType;
  };
  ServerSettings: undefined;
  About: undefined;
};

/**
 * Main Tab Navigator Params
 */
export type MainTabParamList = {
  Home: undefined;
  Recording: undefined;
  History: undefined;
  Settings: undefined;
};

/**
 * Home Stack Navigator Params
 */
export type HomeStackParamList = {
  Dashboard: undefined;
  Statistics: undefined;
};

/**
 * Recording Stack Navigator Params
 */
export type RecordingStackParamList = {
  RecordingMain: undefined;
  ActiveRecording: {
    sessionId: string;
  };
  RecordingPreview: {
    session: RecordingSession;
  };
};

/**
 * History Stack Navigator Params
 */
export type HistoryStackParamList = {
  HistoryList: undefined;
  HistoryDetail: {
    sessionId: string;
  };
  HistoryFilter: undefined;
};

/**
 * Settings Stack Navigator Params
 */
export type SettingsStackParamList = {
  SettingsMain: undefined;
  SensorConfig: undefined;
  SyncSettings: undefined;
  GeneralSettings: undefined;
  DeviceInfo: undefined;
};

/**
 * Navigation prop types for specific screens
 */
export type NavigationProp<T extends keyof RootStackParamList> = {
  navigate: (
    screen: T,
    params?: RootStackParamList[T],
  ) => void;
  goBack: () => void;
  reset: (state: unknown) => void;
};

/**
 * Route prop types for specific screens
 */
export type RouteProp<T extends keyof RootStackParamList> = {
  params: RootStackParamList[T];
  key: string;
  name: T;
};
