/**
 * SensorDataBatchSaver test suite
 */

import {SensorType, type SensorData} from '@types/sensor.types';
import {SensorDataBatchSaver} from '../SensorDataBatchSaver';

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

describe('SensorDataBatchSaver', () => {
  let saver: SensorDataBatchSaver;

  beforeEach(() => {
    saver = new SensorDataBatchSaver();
  });

  describe('Save Batch', () => {
    it('should save batch successfully with custom handler', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      saver = new SensorDataBatchSaver({onSave});

      const batch = [
        createMockData(SensorType.ACCELEROMETER),
        createMockData(SensorType.GYROSCOPE),
      ];

      const result = await saver.saveBatch(batch);

      expect(result.success).toBe(true);
      expect(result.savedCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(onSave).toHaveBeenCalledWith(batch);
    });

    it('should handle empty batch', async () => {
      const result = await saver.saveBatch([]);
      expect(result.success).toBe(true);
      expect(result.savedCount).toBe(0);
    });

    it('should handle save error', async () => {
      const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      const onError = jest.fn();
      saver = new SensorDataBatchSaver({onSave, onError});

      const batch = [createMockData(SensorType.ACCELEROMETER)];
      const result = await saver.saveBatch(batch);

      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should track statistics', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      saver = new SensorDataBatchSaver({onSave});

      const batch = [createMockData(SensorType.ACCELEROMETER)];
      await saver.saveBatch(batch);

      const stats = saver.getStats();
      expect(stats.totalBatches).toBe(1);
      expect(stats.totalSaved).toBe(1);
      expect(stats.totalFailed).toBe(0);
    });

    it('should reset statistics', () => {
      saver.resetStats();
      const stats = saver.getStats();
      expect(stats.totalBatches).toBe(0);
      expect(stats.totalSaved).toBe(0);
    });
  });

  describe('Failed Batches', () => {
    it('should track failed batches', async () => {
      const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      saver = new SensorDataBatchSaver({onSave});

      const batch = [createMockData(SensorType.ACCELEROMETER)];
      await saver.saveBatch(batch);

      expect(saver.getFailedBatchesCount()).toBe(1);
      expect(saver.getFailedItemsCount()).toBe(1);
    });

    it('should clear failed batches', async () => {
      const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      saver = new SensorDataBatchSaver({onSave});

      const batch = [createMockData(SensorType.ACCELEROMETER)];
      await saver.saveBatch(batch);

      saver.clearFailedBatches();
      expect(saver.getFailedBatchesCount()).toBe(0);
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed batches', async () => {
      let callCount = 0;
      const onSave = jest.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First attempt failed');
        }
      });

      saver = new SensorDataBatchSaver({onSave, retryDelay: 10});

      const batch = [createMockData(SensorType.ACCELEROMETER)];
      await saver.saveBatch(batch);
      expect(saver.getFailedBatchesCount()).toBe(1);

      const retryResult = await saver.retryFailedBatches();
      expect(retryResult.savedCount).toBe(1);
      expect(saver.getFailedBatchesCount()).toBe(0);
    });

    it('should stop retrying after max attempts', async () => {
      const onSave = jest.fn().mockRejectedValue(new Error('Always fails'));
      saver = new SensorDataBatchSaver({onSave, retryAttempts: 1, retryDelay: 10});

      const batch = [createMockData(SensorType.ACCELEROMETER)];
      await saver.saveBatch(batch);
      expect(saver.getFailedBatchesCount()).toBe(1);

      // Attempt 1 (retry with attempts = 0, fails, becomes attempts = 1)
      await saver.retryFailedBatches();
      expect(saver.getFailedBatchesCount()).toBe(1);

      // Attempt 2 (attempts = 1 >= retryAttempts = 1, so skip and mark as failed)
      const result = await saver.retryFailedBatches();
      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(saver.getFailedBatchesCount()).toBe(0); // Cleared after max attempts
    });
  });

  describe('Static Methods', () => {
    it('should group by sensor type', () => {
      const batch = [
        createMockData(SensorType.ACCELEROMETER),
        createMockData(SensorType.GYROSCOPE),
        createMockData(SensorType.ACCELEROMETER),
      ];

      const grouped = SensorDataBatchSaver.groupBySensorType(batch);
      expect(grouped[SensorType.ACCELEROMETER].length).toBe(2);
      expect(grouped[SensorType.GYROSCOPE].length).toBe(1);
    });

    it('should sort by timestamp', () => {
      const now = Date.now();
      const batch = [
        createMockData(SensorType.ACCELEROMETER, now + 1000),
        createMockData(SensorType.ACCELEROMETER, now),
        createMockData(SensorType.ACCELEROMETER, now + 500),
      ];

      const sorted = SensorDataBatchSaver.sortByTimestamp(batch);
      expect(sorted[0].timestamp).toBe(now);
      expect(sorted[1].timestamp).toBe(now + 500);
      expect(sorted[2].timestamp).toBe(now + 1000);
    });

    it('should filter by time range', () => {
      const now = Date.now();
      const batch = [
        createMockData(SensorType.ACCELEROMETER, now - 1000),
        createMockData(SensorType.ACCELEROMETER, now),
        createMockData(SensorType.ACCELEROMETER, now + 1000),
      ];

      const filtered = SensorDataBatchSaver.filterByTimeRange(
        batch,
        now - 500,
        now + 500,
      );
      expect(filtered.length).toBe(1);
    });
  });

  describe('Callbacks', () => {
    it('should set save callback', async () => {
      const newCallback = jest.fn().mockResolvedValue(undefined);
      saver.setSaveCallback(newCallback);

      const batch = [createMockData(SensorType.ACCELEROMETER)];
      await saver.saveBatch(batch);

      expect(newCallback).toHaveBeenCalled();
    });

    it('should set error callback', async () => {
      const onSave = jest.fn().mockRejectedValue(new Error('Error'));
      const errorCallback = jest.fn();

      saver.setSaveCallback(onSave);
      saver.setErrorCallback(errorCallback);

      const batch = [createMockData(SensorType.ACCELEROMETER)];
      await saver.saveBatch(batch);

      expect(errorCallback).toHaveBeenCalled();
    });
  });
});
