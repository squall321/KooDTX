/**
 * UploadQueue Tests
 */

import {
  UploadQueue,
  UploadTaskType,
  UploadTaskStatus,
  getUploadQueue,
} from '../UploadQueue';
import type {UploadHandler} from '../UploadQueue';

describe('UploadQueue', () => {
  let uploadQueue: UploadQueue;
  let mockHandler: jest.MockedFunction<UploadHandler>;

  beforeEach(() => {
    jest.clearAllMocks();
    uploadQueue = getUploadQueue();

    // Clear any existing tasks
    uploadQueue['queue'] = [];
    uploadQueue['isProcessing'] = false;

    // Create mock handler
    mockHandler = jest.fn().mockResolvedValue(undefined);
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = getUploadQueue();
      const instance2 = getUploadQueue();
      expect(instance1).toBe(instance2);
    });
  });

  describe('registerHandler()', () => {
    it('should register upload handler', () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      // Handler should be registered (internal state, can't directly test)
      expect(() =>
        uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler),
      ).not.toThrow();
    });

    it('should allow multiple handler registrations', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      uploadQueue.registerHandler(UploadTaskType.SESSION, handler1);
      uploadQueue.registerHandler(UploadTaskType.SENSOR_DATA, handler2);

      // Should not throw
      expect(() =>
        uploadQueue.registerHandler(UploadTaskType.AUDIO_FILE, jest.fn()),
      ).not.toThrow();
    });
  });

  describe('addTask()', () => {
    it('should add task to queue', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      const taskData = {sessionId: '123', name: 'Test Session'};
      const taskId = await uploadQueue.addTask(
        UploadTaskType.SESSION,
        taskData,
      );

      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe('string');
    });

    it('should start processing when task is added', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      const taskData = {sessionId: '123'};
      await uploadQueue.addTask(UploadTaskType.SESSION, taskData);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should assign default maxRetries', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      const taskId = await uploadQueue.addTask(UploadTaskType.SESSION, {});

      const tasks = uploadQueue.getAllTasks();
      const task = tasks.find((t) => t.id === taskId);

      expect(task?.maxRetries).toBe(3);
    });

    it('should use custom maxRetries', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      const taskId = await uploadQueue.addTask(
        UploadTaskType.SESSION,
        {},
        5,
      );

      const tasks = uploadQueue.getAllTasks();
      const task = tasks.find((t) => t.id === taskId);

      expect(task?.maxRetries).toBe(5);
    });
  });

  describe('Task Processing', () => {
    it('should process tasks successfully', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'});

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHandler).toHaveBeenCalledWith({id: '1'});

      const tasks = uploadQueue.getAllTasks();
      const completedTask = tasks.find((t) => t.status === UploadTaskStatus.COMPLETED);
      expect(completedTask).toBeDefined();
    });

    it('should retry failed tasks', async () => {
      const failingHandler = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce(undefined); // Third attempt succeeds

      uploadQueue.registerHandler(UploadTaskType.SESSION, failingHandler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'}, 3);

      // Wait for retries
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(failingHandler).toHaveBeenCalledTimes(3);
    });

    it('should mark task as failed after max retries', async () => {
      const alwaysFailingHandler = jest
        .fn()
        .mockRejectedValue(new Error('Always fails'));

      uploadQueue.registerHandler(UploadTaskType.SESSION, alwaysFailingHandler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'}, 2);

      // Wait for all retries
      await new Promise((resolve) => setTimeout(resolve, 500));

      const tasks = uploadQueue.getAllTasks();
      const failedTask = tasks.find((t) => t.status === UploadTaskStatus.FAILED);
      expect(failedTask).toBeDefined();
      expect(failedTask?.retryCount).toBe(2);
    });
  });

  describe('getAllTasks()', () => {
    it('should return all tasks', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);
      uploadQueue.registerHandler(UploadTaskType.SENSOR_DATA, mockHandler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'});
      await uploadQueue.addTask(UploadTaskType.SENSOR_DATA, {id: '2'});

      const tasks = uploadQueue.getAllTasks();

      expect(tasks.length).toBe(2);
    });

    it('should return empty array when no tasks', () => {
      const tasks = uploadQueue.getAllTasks();
      expect(tasks).toEqual([]);
    });
  });

  describe('getPendingTasks()', () => {
    it('should return only pending tasks', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'});

      // Get tasks immediately (should be pending)
      const pendingTasks = uploadQueue.getPendingTasks();

      expect(pendingTasks.length).toBeGreaterThan(0);
      pendingTasks.forEach((task) => {
        expect([UploadTaskStatus.PENDING, UploadTaskStatus.PROCESSING]).toContain(
          task.status,
        );
      });
    });
  });

  describe('getCompletedTasks()', () => {
    it('should return only completed tasks', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'});

      // Wait for completion
      await new Promise((resolve) => setTimeout(resolve, 100));

      const completedTasks = uploadQueue.getCompletedTasks();

      completedTasks.forEach((task) => {
        expect(task.status).toBe(UploadTaskStatus.COMPLETED);
      });
    });
  });

  describe('getFailedTasks()', () => {
    it('should return only failed tasks', async () => {
      const failingHandler = jest
        .fn()
        .mockRejectedValue(new Error('Always fails'));

      uploadQueue.registerHandler(UploadTaskType.SESSION, failingHandler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'}, 1);

      // Wait for failure
      await new Promise((resolve) => setTimeout(resolve, 200));

      const failedTasks = uploadQueue.getFailedTasks();

      expect(failedTasks.length).toBeGreaterThan(0);
      failedTasks.forEach((task) => {
        expect(task.status).toBe(UploadTaskStatus.FAILED);
      });
    });
  });

  describe('retryFailedTasks()', () => {
    it('should retry all failed tasks', async () => {
      const handler = jest
        .fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValue(undefined);

      uploadQueue.registerHandler(UploadTaskType.SESSION, handler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'}, 1);

      // Wait for failure
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Retry failed tasks
      await uploadQueue.retryFailedTasks();

      // Wait for retry processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(handler).toHaveBeenCalledTimes(2); // Initial + retry
    });
  });

  describe('clearCompletedTasks()', () => {
    it('should remove completed tasks', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'});

      // Wait for completion
      await new Promise((resolve) => setTimeout(resolve, 100));

      const beforeCount = uploadQueue.getAllTasks().length;
      uploadQueue.clearCompletedTasks();
      const afterCount = uploadQueue.getAllTasks().length;

      expect(afterCount).toBeLessThan(beforeCount);
    });
  });

  describe('clearAllTasks()', () => {
    it('should remove all tasks', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'});
      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '2'});

      uploadQueue.clearAllTasks();

      const tasks = uploadQueue.getAllTasks();
      expect(tasks.length).toBe(0);
    });
  });

  describe('Progress Tracking', () => {
    it('should call progress callback', async () => {
      uploadQueue.registerHandler(UploadTaskType.SESSION, mockHandler);

      const progressCallback = jest.fn();
      uploadQueue.setOnProgressCallback(progressCallback);

      await uploadQueue.addTask(UploadTaskType.SESSION, {id: '1'});

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(progressCallback).toHaveBeenCalled();
    });

    it('should clear progress callback', () => {
      const progressCallback = jest.fn();
      uploadQueue.setOnProgressCallback(progressCallback);
      uploadQueue.setOnProgressCallback(undefined);

      // Should not throw
      expect(() =>
        uploadQueue.setOnProgressCallback(undefined),
      ).not.toThrow();
    });
  });
});
