/**
 * SensorManager test suite
 */

import {SensorType} from '@types/sensor.types';
import {
  SensorManager,
  getSensorManager,
  resetSensorManager,
} from '../SensorManager';

// Mock react-native-sensors
jest.mock('react-native-sensors', () => ({
  accelerometer: {
    subscribe: jest.fn(),
  },
  gyroscope: {
    subscribe: jest.fn(),
  },
  magnetometer: {
    subscribe: jest.fn(),
  },
  setUpdateIntervalForType: jest.fn(),
  SensorTypes: {
    accelerometer: 'accelerometer',
    gyroscope: 'gyroscope',
    magnetometer: 'magnetometer',
  },
}));

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  default: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
}));

describe('SensorManager', () => {
  let sensorManager: SensorManager;

  beforeEach(() => {
    resetSensorManager();
    sensorManager = new SensorManager();
  });

  afterEach(() => {
    resetSensorManager();
  });

  describe('Initialization', () => {
    it('should initialize with all sensor services', () => {
      expect(sensorManager.getService(SensorType.ACCELEROMETER)).toBeDefined();
      expect(sensorManager.getService(SensorType.GYROSCOPE)).toBeDefined();
      expect(sensorManager.getService(SensorType.MAGNETOMETER)).toBeDefined();
      expect(sensorManager.getService(SensorType.GPS)).toBeDefined();
    });

    it('should not be running initially', () => {
      expect(sensorManager.getIsRunning()).toBe(false);
      expect(sensorManager.getSessionId()).toBeNull();
      expect(sensorManager.getRunningSensors()).toEqual([]);
    });
  });

  describe('Sample Rate Management', () => {
    it('should set sample rate for a sensor', () => {
      sensorManager.setSampleRate(SensorType.ACCELEROMETER, 50);
      expect(sensorManager.getSampleRate(SensorType.ACCELEROMETER)).toBe(50);
    });

    it('should throw error for invalid sensor type', () => {
      expect(() => {
        sensorManager.setSampleRate('invalid' as SensorType, 50);
      }).toThrow('Sensor service not found');
    });

    it('should get sample rate for a sensor', () => {
      const rate = sensorManager.getSampleRate(SensorType.GYROSCOPE);
      expect(typeof rate).toBe('number');
      expect(rate).toBeGreaterThan(0);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance with getSensorManager', () => {
      const instance1 = getSensorManager();
      const instance2 = getSensorManager();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = getSensorManager();
      resetSensorManager();
      const instance2 = getSensorManager();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup all resources', () => {
      sensorManager.cleanup();
      expect(sensorManager.getIsRunning()).toBe(false);
      expect(sensorManager.getSessionId()).toBeNull();
    });
  });

  describe('Service Access', () => {
    it('should return undefined for non-existent sensor', () => {
      expect(sensorManager.getService('nonexistent' as SensorType)).toBeUndefined();
    });

    it('should return service instance for valid sensor', () => {
      const service = sensorManager.getService(SensorType.ACCELEROMETER);
      expect(service).toBeDefined();
      expect(service?.getSensorType()).toBe(SensorType.ACCELEROMETER);
    });
  });
});
