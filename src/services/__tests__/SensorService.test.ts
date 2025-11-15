/**
 * Sensor Service Tests
 * Phase 166: Testing sensor service functionality
 *
 * Tests:
 * - Native module mocking
 * - Sensor start/stop
 * - Data buffering
 * - File saving
 * - Error handling
 */

import { NativeModules, NativeEventEmitter } from 'react-native';
import { SensorService } from '../SensorService';

// Mock native modules
jest.mock('react-native', () => ({
  NativeModules: {
    SensorModule: {
      startSensor: jest.fn(),
      stopSensor: jest.fn(),
      getSensorData: jest.fn(),
      getSensorStatus: jest.fn(),
    },
  },
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

describe('SensorService', () => {
  let sensorService: SensorService;
  let mockEventEmitter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    sensorService = new SensorService();
    mockEventEmitter = new NativeEventEmitter();
  });

  afterEach(() => {
    sensorService.cleanup();
  });

  describe('Sensor Start/Stop', () => {
    it('should start sensor successfully', async () => {
      const mockSensorId = 'sensor-123';
      NativeModules.SensorModule.startSensor.mockResolvedValue({
        success: true,
        sensorId: mockSensorId,
      });

      const result = await sensorService.startSensor(mockSensorId);

      expect(NativeModules.SensorModule.startSensor).toHaveBeenCalledWith(mockSensorId);
      expect(result.success).toBe(true);
      expect(result.sensorId).toBe(mockSensorId);
    });

    it('should stop sensor successfully', async () => {
      const mockSensorId = 'sensor-123';
      NativeModules.SensorModule.stopSensor.mockResolvedValue({
        success: true,
        sensorId: mockSensorId,
      });

      const result = await sensorService.stopSensor(mockSensorId);

      expect(NativeModules.SensorModule.stopSensor).toHaveBeenCalledWith(mockSensorId);
      expect(result.success).toBe(true);
    });

    it('should handle start sensor failure', async () => {
      const mockSensorId = 'sensor-123';
      const mockError = new Error('Sensor not found');
      NativeModules.SensorModule.startSensor.mockRejectedValue(mockError);

      await expect(sensorService.startSensor(mockSensorId)).rejects.toThrow('Sensor not found');
    });

    it('should prevent starting already running sensor', async () => {
      const mockSensorId = 'sensor-123';
      NativeModules.SensorModule.startSensor.mockResolvedValue({
        success: true,
        sensorId: mockSensorId,
      });

      await sensorService.startSensor(mockSensorId);

      // Try to start again
      await expect(sensorService.startSensor(mockSensorId)).rejects.toThrow('Sensor already running');
    });

    it('should stop all sensors', async () => {
      const mockSensorIds = ['sensor-1', 'sensor-2', 'sensor-3'];

      NativeModules.SensorModule.startSensor.mockResolvedValue({ success: true });
      NativeModules.SensorModule.stopSensor.mockResolvedValue({ success: true });

      // Start all sensors
      for (const id of mockSensorIds) {
        await sensorService.startSensor(id);
      }

      // Stop all sensors
      await sensorService.stopAllSensors();

      expect(NativeModules.SensorModule.stopSensor).toHaveBeenCalledTimes(3);
    });
  });

  describe('Data Buffering', () => {
    it('should buffer sensor data', async () => {
      const mockData = {
        sensorId: 'sensor-123',
        value: 25.5,
        timestamp: Date.now(),
        unit: '°C',
      };

      sensorService.bufferData(mockData);

      const bufferedData = sensorService.getBufferedData('sensor-123');
      expect(bufferedData).toHaveLength(1);
      expect(bufferedData[0]).toEqual(mockData);
    });

    it('should maintain buffer size limit', async () => {
      const mockSensorId = 'sensor-123';
      const bufferLimit = 100;

      // Add more data than buffer limit
      for (let i = 0; i < 150; i++) {
        sensorService.bufferData({
          sensorId: mockSensorId,
          value: i,
          timestamp: Date.now() + i,
          unit: 'unit',
        });
      }

      const bufferedData = sensorService.getBufferedData(mockSensorId);
      expect(bufferedData).toHaveLength(bufferLimit);

      // Check that oldest data was removed (FIFO)
      expect(bufferedData[0].value).toBe(50); // First 50 were removed
    });

    it('should clear buffer for specific sensor', () => {
      const mockSensorId1 = 'sensor-1';
      const mockSensorId2 = 'sensor-2';

      sensorService.bufferData({
        sensorId: mockSensorId1,
        value: 10,
        timestamp: Date.now(),
        unit: 'unit',
      });

      sensorService.bufferData({
        sensorId: mockSensorId2,
        value: 20,
        timestamp: Date.now(),
        unit: 'unit',
      });

      sensorService.clearBuffer(mockSensorId1);

      expect(sensorService.getBufferedData(mockSensorId1)).toHaveLength(0);
      expect(sensorService.getBufferedData(mockSensorId2)).toHaveLength(1);
    });

    it('should get data in time range', () => {
      const mockSensorId = 'sensor-123';
      const baseTime = Date.now();

      // Add data at different times
      for (let i = 0; i < 10; i++) {
        sensorService.bufferData({
          sensorId: mockSensorId,
          value: i,
          timestamp: baseTime + i * 1000,
          unit: 'unit',
        });
      }

      const startTime = baseTime + 3000;
      const endTime = baseTime + 7000;

      const filteredData = sensorService.getDataInRange(mockSensorId, startTime, endTime);

      expect(filteredData).toHaveLength(5); // Data from 3 to 7 inclusive
      expect(filteredData[0].value).toBe(3);
      expect(filteredData[4].value).toBe(7);
    });
  });

  describe('File Saving', () => {
    it('should save sensor data to file', async () => {
      const mockSensorId = 'sensor-123';
      const mockData = [
        { sensorId: mockSensorId, value: 10, timestamp: Date.now(), unit: '°C' },
        { sensorId: mockSensorId, value: 20, timestamp: Date.now() + 1000, unit: '°C' },
      ];

      mockData.forEach((data) => sensorService.bufferData(data));

      const filePath = await sensorService.saveToFile(mockSensorId, 'csv');

      expect(filePath).toBeTruthy();
      expect(filePath).toContain('.csv');
    });

    it('should save data in JSON format', async () => {
      const mockSensorId = 'sensor-123';
      const mockData = [
        { sensorId: mockSensorId, value: 10, timestamp: Date.now(), unit: '°C' },
      ];

      mockData.forEach((data) => sensorService.bufferData(data));

      const filePath = await sensorService.saveToFile(mockSensorId, 'json');

      expect(filePath).toContain('.json');
    });

    it('should handle empty data when saving', async () => {
      const mockSensorId = 'sensor-123';

      await expect(sensorService.saveToFile(mockSensorId, 'csv')).rejects.toThrow(
        'No data to save'
      );
    });

    it('should generate unique file names', async () => {
      const mockSensorId = 'sensor-123';
      sensorService.bufferData({
        sensorId: mockSensorId,
        value: 10,
        timestamp: Date.now(),
        unit: 'unit',
      });

      const filePath1 = await sensorService.saveToFile(mockSensorId, 'csv');
      const filePath2 = await sensorService.saveToFile(mockSensorId, 'csv');

      expect(filePath1).not.toBe(filePath2);
    });
  });

  describe('Error Handling', () => {
    it('should handle native module unavailable', () => {
      // Mock native module as undefined
      (NativeModules as any).SensorModule = undefined;

      expect(() => new SensorService()).toThrow('Sensor module not available');
    });

    it('should handle sensor timeout', async () => {
      const mockSensorId = 'sensor-123';

      NativeModules.SensorModule.startSensor.mockImplementation(
        () =>
          new Promise((resolve) => {
            // Never resolve to simulate timeout
          })
      );

      await expect(
        sensorService.startSensor(mockSensorId, { timeout: 1000 })
      ).rejects.toThrow('Sensor start timeout');
    });

    it('should handle invalid sensor data', () => {
      const invalidData: any = {
        sensorId: null,
        value: 'invalid',
        timestamp: 'not a number',
      };

      expect(() => sensorService.bufferData(invalidData)).toThrow('Invalid sensor data');
    });

    it('should emit error events', (done) => {
      const mockError = new Error('Sensor error');

      sensorService.on('error', (error) => {
        expect(error).toEqual(mockError);
        done();
      });

      sensorService.emitError(mockError);
    });

    it('should handle multiple errors gracefully', async () => {
      const mockSensorId = 'sensor-123';
      const errors: Error[] = [];

      sensorService.on('error', (error) => {
        errors.push(error);
      });

      // Trigger multiple errors
      NativeModules.SensorModule.startSensor.mockRejectedValue(new Error('Error 1'));
      await sensorService.startSensor(mockSensorId).catch(() => {});

      NativeModules.SensorModule.getSensorData.mockRejectedValue(new Error('Error 2'));
      await sensorService.getSensorData(mockSensorId).catch(() => {});

      expect(errors).toHaveLength(2);
    });

    it('should cleanup resources on error', async () => {
      const mockSensorId = 'sensor-123';

      NativeModules.SensorModule.startSensor.mockResolvedValue({ success: true });
      await sensorService.startSensor(mockSensorId);

      // Simulate error
      const mockError = new Error('Critical error');
      sensorService.emitError(mockError);

      // Cleanup should be called
      expect(sensorService.isRunning(mockSensorId)).toBe(false);
    });
  });

  describe('Event Handling', () => {
    it('should listen to sensor data events', (done) => {
      const mockData = {
        sensorId: 'sensor-123',
        value: 25.5,
        timestamp: Date.now(),
        unit: '°C',
      };

      sensorService.on('data', (data) => {
        expect(data).toEqual(mockData);
        done();
      });

      sensorService.emitData(mockData);
    });

    it('should remove event listeners', () => {
      const mockListener = jest.fn();

      sensorService.on('data', mockListener);
      sensorService.off('data', mockListener);

      sensorService.emitData({ sensorId: '123', value: 10, timestamp: Date.now() });

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should handle status change events', (done) => {
      const mockStatus = {
        sensorId: 'sensor-123',
        status: 'active',
        timestamp: Date.now(),
      };

      sensorService.on('statusChange', (status) => {
        expect(status).toEqual(mockStatus);
        done();
      });

      sensorService.emitStatusChange(mockStatus);
    });
  });

  describe('Sensor Status', () => {
    it('should get sensor status', async () => {
      const mockSensorId = 'sensor-123';
      const mockStatus = {
        isRunning: true,
        startTime: Date.now(),
        dataCount: 150,
      };

      NativeModules.SensorModule.getSensorStatus.mockResolvedValue(mockStatus);

      const status = await sensorService.getSensorStatus(mockSensorId);

      expect(status).toEqual(mockStatus);
    });

    it('should track multiple sensor statuses', async () => {
      const sensors = ['sensor-1', 'sensor-2', 'sensor-3'];

      NativeModules.SensorModule.startSensor.mockResolvedValue({ success: true });

      for (const sensorId of sensors) {
        await sensorService.startSensor(sensorId);
      }

      const statuses = await sensorService.getAllStatuses();

      expect(Object.keys(statuses)).toHaveLength(3);
      sensors.forEach((sensorId) => {
        expect(statuses[sensorId].isRunning).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('should handle high-frequency data', () => {
      const mockSensorId = 'sensor-123';
      const dataCount = 1000;

      const startTime = Date.now();

      for (let i = 0; i < dataCount; i++) {
        sensorService.bufferData({
          sensorId: mockSensorId,
          value: Math.random() * 100,
          timestamp: Date.now() + i,
          unit: 'unit',
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should process 1000 data points in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should not leak memory', () => {
      const mockSensorId = 'sensor-123';

      // Add and remove data multiple times
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
          sensorService.bufferData({
            sensorId: mockSensorId,
            value: j,
            timestamp: Date.now(),
            unit: 'unit',
          });
        }
        sensorService.clearBuffer(mockSensorId);
      }

      // Buffer should be empty
      expect(sensorService.getBufferedData(mockSensorId)).toHaveLength(0);
    });
  });
});
