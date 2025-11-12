/**
 * SensorDataBuffer test suite
 */

import {SensorType, type SensorData} from '@types/sensor.types';
import {SensorDataBuffer} from '../SensorDataBuffer';

// Helper to create mock sensor data
const createMockData = (
  sensorType: SensorType,
  timestamp: number = Date.now(),
): SensorData => ({
  id: `test-${Date.now()}-${Math.random()}`,
  sensorType,
  timestamp,
  sessionId: 'test-session',
  isUploaded: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  x: 1,
  y: 2,
  z: 3,
});

describe('SensorDataBuffer', () => {
  let buffer: SensorDataBuffer;

  beforeEach(() => {
    buffer = new SensorDataBuffer();
  });

  afterEach(async () => {
    await buffer.stop();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      expect(buffer.getSize()).toBe(0);
      expect(buffer.getIsRunning()).toBe(false);
    });

    it('should initialize with custom config', () => {
      const customBuffer = new SensorDataBuffer({
        maxSize: 50,
        flushInterval: 500,
      });
      expect(customBuffer.getSize()).toBe(0);
    });
  });

  describe('Add Data', () => {
    it('should add data to buffer', () => {
      const data = createMockData(SensorType.ACCELEROMETER);
      buffer.add(data);
      expect(buffer.getSize()).toBe(1);
    });

    it('should add multiple data points', () => {
      const data1 = createMockData(SensorType.ACCELEROMETER);
      const data2 = createMockData(SensorType.GYROSCOPE);
      buffer.add(data1);
      buffer.add(data2);
      expect(buffer.getSize()).toBe(2);
    });

    it('should add batch of data', () => {
      const batch = [
        createMockData(SensorType.ACCELEROMETER),
        createMockData(SensorType.GYROSCOPE),
        createMockData(SensorType.MAGNETOMETER),
      ];
      buffer.addBatch(batch);
      expect(buffer.getSize()).toBe(3);
    });
  });

  describe('Flush', () => {
    it('should flush buffer and return data', async () => {
      const data = createMockData(SensorType.ACCELEROMETER);
      buffer.add(data);
      const flushed = await buffer.flush();
      expect(flushed.length).toBe(1);
      expect(buffer.getSize()).toBe(0);
    });

    it('should call onFlush callback', async () => {
      const onFlush = jest.fn();
      buffer = new SensorDataBuffer({onFlush});
      const data = createMockData(SensorType.ACCELEROMETER);
      buffer.add(data);
      await buffer.flush();
      expect(onFlush).toHaveBeenCalledWith([data]);
    });

    it('should return empty array if buffer is empty', async () => {
      const flushed = await buffer.flush();
      expect(flushed).toEqual([]);
    });
  });

  describe('Clear', () => {
    it('should clear buffer without flushing', () => {
      const data = createMockData(SensorType.ACCELEROMETER);
      buffer.add(data);
      buffer.clear();
      expect(buffer.getSize()).toBe(0);
    });
  });

  describe('Auto Flush', () => {
    it('should auto-flush when buffer is full', () => {
      const onFlush = jest.fn();
      buffer = new SensorDataBuffer({maxSize: 2, onFlush, autoFlush: false});

      buffer.add(createMockData(SensorType.ACCELEROMETER));
      expect(buffer.getSize()).toBe(1);

      buffer.add(createMockData(SensorType.ACCELEROMETER));
      expect(buffer.getSize()).toBe(0); // Auto-flushed
      expect(onFlush).toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should track statistics', async () => {
      const data = createMockData(SensorType.ACCELEROMETER);
      buffer.add(data);
      await buffer.flush();

      const stats = buffer.getStats();
      expect(stats.totalReceived).toBe(1);
      expect(stats.totalFlushed).toBe(1);
      expect(stats.flushCount).toBe(1);
    });

    it('should reset statistics', () => {
      buffer.add(createMockData(SensorType.ACCELEROMETER));
      buffer.resetStats();
      const stats = buffer.getStats();
      expect(stats.totalReceived).toBe(0);
      expect(stats.totalFlushed).toBe(0);
    });
  });

  describe('Filter By Sensor Type', () => {
    it('should filter data by sensor type', () => {
      buffer.add(createMockData(SensorType.ACCELEROMETER));
      buffer.add(createMockData(SensorType.GYROSCOPE));
      buffer.add(createMockData(SensorType.ACCELEROMETER));

      const accData = buffer.getBySensorType(SensorType.ACCELEROMETER);
      expect(accData.length).toBe(2);
    });

    it('should count data by sensor type', () => {
      buffer.add(createMockData(SensorType.ACCELEROMETER));
      buffer.add(createMockData(SensorType.GYROSCOPE));
      buffer.add(createMockData(SensorType.ACCELEROMETER));

      const counts = buffer.getCountBySensorType();
      expect(counts[SensorType.ACCELEROMETER]).toBe(2);
      expect(counts[SensorType.GYROSCOPE]).toBe(1);
    });
  });

  describe('Time Range Filter', () => {
    it('should filter by time range', () => {
      const now = Date.now();
      buffer.add(createMockData(SensorType.ACCELEROMETER, now - 1000));
      buffer.add(createMockData(SensorType.ACCELEROMETER, now));
      buffer.add(createMockData(SensorType.ACCELEROMETER, now + 500));
      buffer.add(createMockData(SensorType.ACCELEROMETER, now + 1000));

      const filtered = buffer.filterByTimeRange(now - 500, now + 600);
      expect(filtered.length).toBe(2); // now and now + 500
    });
  });

  describe('Configuration', () => {
    it('should set max size', () => {
      buffer.setMaxSize(50);
      expect(buffer.getSize()).toBe(0);
    });

    it('should throw error for invalid max size', () => {
      expect(() => buffer.setMaxSize(0)).toThrow('Max size must be positive');
      expect(() => buffer.setMaxSize(-1)).toThrow('Max size must be positive');
    });

    it('should set flush interval', () => {
      buffer.setFlushInterval(500);
      expect(buffer.getSize()).toBe(0);
    });

    it('should throw error for invalid flush interval', () => {
      expect(() => buffer.setFlushInterval(-1)).toThrow(
        'Flush interval must be non-negative',
      );
    });
  });

  describe('Start/Stop', () => {
    it('should start and stop buffer', async () => {
      buffer.start();
      expect(buffer.getIsRunning()).toBe(true);
      await buffer.stop();
      expect(buffer.getIsRunning()).toBe(false);
    });

    it('should flush remaining data on stop', async () => {
      const onFlush = jest.fn();
      buffer = new SensorDataBuffer({onFlush});
      buffer.add(createMockData(SensorType.ACCELEROMETER));
      buffer.start();
      await buffer.stop();
      expect(onFlush).toHaveBeenCalled();
    });
  });
});
