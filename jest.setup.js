/**
 * Jest setup file
 * This file runs before each test suite
 */

// Suppress React Native warnings in tests
import {LogBox} from 'react-native';

LogBox.ignoreAllLogs(true);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
  // Keep console.warn and console.error for debugging
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Mock React Native modules that need special handling
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() =>
      Promise.resolve({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
      }),
    ),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

// Mock Geolocation
jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn((success) =>
      success({
        coords: {
          latitude: 37.5665,
          longitude: 126.9780,
          altitude: 0,
          accuracy: 10,
          speed: 0,
          heading: 0,
        },
        timestamp: Date.now(),
      }),
    ),
    watchPosition: jest.fn(() => 1),
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
  },
}));

// Mock Audio Recorder Player
jest.mock('react-native-audio-recorder-player', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      startRecorder: jest.fn(() => Promise.resolve('file://path/to/audio.m4a')),
      stopRecorder: jest.fn(() => Promise.resolve('file://path/to/audio.m4a')),
      startPlayer: jest.fn(() => Promise.resolve()),
      stopPlayer: jest.fn(() => Promise.resolve()),
      pausePlayer: jest.fn(() => Promise.resolve()),
      resumePlayer: jest.fn(() => Promise.resolve()),
      addRecordBackListener: jest.fn(() => ({remove: jest.fn()})),
      addPlayBackListener: jest.fn(() => ({remove: jest.fn()})),
      removeRecordBackListener: jest.fn(),
      removePlayBackListener: jest.fn(),
    })),
    AudioEncoderAndroidType: {
      AAC: 'aac',
    },
    AudioSourceAndroidType: {
      MIC: 'mic',
    },
    AVEncoderAudioQualityIOSType: {
      high: 'high',
    },
    AVEncodingOption: {
      aac: 'aac',
    },
  };
});

// Mock React Native Sensors
jest.mock('react-native-sensors', () => ({
  __esModule: true,
  accelerometer: {
    subscribe: jest.fn(() => ({
      unsubscribe: jest.fn(),
    })),
  },
  gyroscope: {
    subscribe: jest.fn(() => ({
      unsubscribe: jest.fn(),
    })),
  },
  magnetometer: {
    subscribe: jest.fn(() => ({
      unsubscribe: jest.fn(),
    })),
  },
  setUpdateIntervalForType: jest.fn(),
  SensorTypes: {
    accelerometer: 'accelerometer',
    gyroscope: 'gyroscope',
    magnetometer: 'magnetometer',
  },
}));

// Mock WatermelonDB
jest.mock('@nozbe/watermelondb', () => ({
  __esModule: true,
  Database: jest.fn(),
  Q: {
    where: jest.fn((field, value) => ({type: 'where', field, value})),
    and: jest.fn((...conditions) => ({type: 'and', conditions})),
    or: jest.fn((...conditions) => ({type: 'or', conditions})),
    sortBy: jest.fn((field, order) => ({type: 'sortBy', field, order})),
    take: jest.fn((count) => ({type: 'take', count})),
    skip: jest.fn((count) => ({type: 'skip', count})),
    asc: 'asc',
    desc: 'desc',
  },
  Model: class MockModel {
    constructor() {
      this.id = 'mock-id';
    }
  },
}));

jest.mock('@nozbe/watermelondb/decorators', () => ({
  __esModule: true,
  field: () => () => {},
  text: () => () => {},
  date: () => () => {},
  readonly: () => () => {},
  json: () => () => {},
  children: () => () => {},
  lazy: () => () => {},
  relation: () => () => {},
}));

jest.mock('@nozbe/watermelondb/adapters/sqlite', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock Axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({data: {}})),
      post: jest.fn(() => Promise.resolve({data: {}})),
      put: jest.fn(() => Promise.resolve({data: {}})),
      delete: jest.fn(() => Promise.resolve({data: {}})),
      interceptors: {
        request: {use: jest.fn(), eject: jest.fn()},
        response: {use: jest.fn(), eject: jest.fn()},
      },
    })),
    get: jest.fn(() => Promise.resolve({data: {}})),
    post: jest.fn(() => Promise.resolve({data: {}})),
    put: jest.fn(() => Promise.resolve({data: {}})),
    delete: jest.fn(() => Promise.resolve({data: {}})),
  },
}));

// Mock React Native FS
jest.mock('react-native-fs', () => ({
  __esModule: true,
  default: {
    DocumentDirectoryPath: '/mock/documents',
    CachesDirectoryPath: '/mock/caches',
    mkdir: jest.fn(() => Promise.resolve()),
    writeFile: jest.fn(() => Promise.resolve()),
    readFile: jest.fn(() => Promise.resolve('')),
    unlink: jest.fn(() => Promise.resolve()),
    exists: jest.fn(() => Promise.resolve(true)),
    stat: jest.fn(() => Promise.resolve({size: 1024})),
  },
}));

// Mock React Native Share
jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {
    open: jest.fn(() => Promise.resolve({success: true})),
  },
}));

// Set test timeout
jest.setTimeout(10000);

// Global test setup
beforeAll(() => {
  // Setup runs once before all tests
});

afterAll(() => {
  // Cleanup runs once after all tests
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
