/**
 * AccelerometerService test suite
 */

// Mock react-native-sensors
const mockSubscribe = jest.fn();
const mockSetUpdateIntervalForType = jest.fn();

jest.mock('react-native-sensors', () => ({
  accelerometer: {
    get subscribe() {
      return mockSubscribe;
    },
  },
  get setUpdateIntervalForType() {
    return mockSetUpdateIntervalForType;
  },
  SensorTypes: {
    accelerometer: 'accelerometer',
  },
}));

import {SensorType} from '@app-types/sensor.types';
import {AccelerometerService} from '../AccelerometerService';

describe('AccelerometerService', () => {
  let service: AccelerometerService;

  beforeEach(() => {
    service = new AccelerometerService();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await service.stop();
  });

  describe('Initialization', () => {
    it('should initialize with default sample rate', () => {
      expect(service.getSampleRate()).toBe(100);
      expect(service.getIsRunning()).toBe(false);
      expect(service.getSessionId()).toBeNull();
    });

    it('should initialize with custom sample rate', () => {
      const customService = new AccelerometerService(50);
      expect(customService.getSampleRate()).toBe(50);
    });
  });

  describe('Sensor Type', () => {
    it('should return correct sensor type', () => {
      expect(service.getSensorType()).toBe(SensorType.ACCELEROMETER);
    });
  });

  describe('Sample Rate', () => {
    it('should set sample rate', () => {
      service.setSampleRate(200);
      expect(service.getSampleRate()).toBe(200);
    });

    it('should throw error for negative sample rate', () => {
      expect(() => {
        service.setSampleRate(-10);
      }).toThrow('Sample rate must be positive');
    });

    it('should throw error for zero sample rate', () => {
      expect(() => {
        service.setSampleRate(0);
      }).toThrow('Sample rate must be positive');
    });
  });

  describe('Start/Stop', () => {
    it('should throw error when starting already running service', async () => {
      // Mock successful subscription
      const mockUnsubscribe = jest.fn();
      mockSubscribe.mockImplementation((onSuccess: any) => {
        // Simulate successful subscription
        setTimeout(() => onSuccess({x: 0, y: 0, z: 0, timestamp: Date.now()}), 0);
        return {unsubscribe: mockUnsubscribe};
      });

      const onData = jest.fn();
      await service.start('session-1', onData);

      await expect(service.start('session-2', onData)).rejects.toThrow(
        'Accelerometer service is already running',
      );

      await service.stop();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should not error when stopping non-running service', async () => {
      await expect(service.stop()).resolves.not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup all resources', () => {
      service.cleanup();
      expect(service.getIsRunning()).toBe(false);
      expect(service.getSessionId()).toBeNull();
    });
  });
});
