/**
 * SensorDataService test suite
 */

import {SensorType, type SensorData} from '@types/sensor.types';
import {
  SensorDataService,
  getSensorDataService,
  resetSensorDataService,
} from '../SensorDataService';

// Mock dependencies
jest.mock('@database/repositories', () => ({
  getSensorDataRepository: () => ({
    createBatch: jest.fn().mockResolvedValue([]),
  }),
  getRecordingSessionRepository: () => ({
    incrementDataCount: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Helper to create mock sensor data
const createMockData = (
  sensorType: SensorType,
  sessionId: string = 'test-session',
  timestamp: number = Date.now(),
): SensorData => ({
  id: `test-${Date.now()}-${Math.random()}`,
  sensorType,
  timestamp,
  sessionId,
  isUploaded: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  x: 1,
  y: 2,
  z: 3,
});

describe('SensorDataService', () => {
  let service: SensorDataService;

  beforeEach(() => {
    resetSensorDataService();
    service = new SensorDataService({
      bufferSize: 10,
      flushInterval: 100,
      retryAttempts: 2,
    });
  });

  afterEach(async () => {
    await service.stop();
    resetSensorDataService();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const defaultService = new SensorDataService();
      expect(defaultService).toBeDefined();
    });

    it('should initialize with custom config', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Start/Stop', () => {
    it('should start service', () => {
      service.start();
      // Service should be started (no error thrown)
      expect(service).toBeDefined();
    });

    it('should stop service', async () => {
      service.start();
      await service.stop();
      // Service should be stopped (no error thrown)
      expect(service).toBeDefined();
    });
  });

  describe('Add Data', () => {
    it('should add single data', () => {
      service.start();
      const data = createMockData(SensorType.ACCELEROMETER);
      service.addData(data);

      const stats = service.getBufferStats();
      expect(stats.totalReceived).toBeGreaterThanOrEqual(1);
    });

    it('should add batch data', () => {
      service.start();
      const batch = [
        createMockData(SensorType.ACCELEROMETER),
        createMockData(SensorType.GYROSCOPE),
        createMockData(SensorType.MAGNETOMETER),
      ];
      service.addBatch(batch);

      const stats = service.getBufferStats();
      expect(stats.totalReceived).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Statistics', () => {
    it('should get buffer statistics', () => {
      service.start();
      const stats = service.getBufferStats();
      expect(stats).toHaveProperty('totalReceived');
      expect(stats).toHaveProperty('totalFlushed');
      expect(stats).toHaveProperty('currentSize');
    });

    it('should get saver statistics', () => {
      const stats = service.getSaverStats();
      expect(stats).toHaveProperty('totalBatches');
      expect(stats).toHaveProperty('totalSaved');
      expect(stats).toHaveProperty('totalFailed');
    });

    it('should get failed batches count', () => {
      const count = service.getFailedBatchesCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Manual Flush', () => {
    it('should manually flush buffer', async () => {
      service.start();
      const data = createMockData(SensorType.ACCELEROMETER);
      service.addData(data);

      await service.flush();

      // Buffer should be flushed (currentSize should be 0)
      const stats = service.getBufferStats();
      expect(stats.currentSize).toBe(0);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance with getSensorDataService', () => {
      const instance1 = getSensorDataService();
      const instance2 = getSensorDataService();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = getSensorDataService();
      resetSensorDataService();
      const instance2 = getSensorDataService();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Error Handling', () => {
    it('should call error callback on error', done => {
      const errorCallback = jest.fn((error: Error) => {
        expect(error).toBeInstanceOf(Error);
        done();
      });

      const serviceWithError = new SensorDataService({
        onError: errorCallback,
      });

      serviceWithError.setErrorCallback(errorCallback);
      // Error will be triggered if database operations fail
    });

    it('should set and clear error callback', () => {
      const callback = jest.fn();
      service.setErrorCallback(callback);
      service.clearErrorCallback();
      // No error should be thrown
      expect(service).toBeDefined();
    });
  });
});
