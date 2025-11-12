/**
 * Tests for useRecordingStore
 */

import {act, renderHook} from '@testing-library/react-native';

import {useRecordingStore} from '../useRecordingStore';

describe('useRecordingStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const {result} = renderHook(() => useRecordingStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const {result} = renderHook(() => useRecordingStore());

      expect(result.current.currentSession).toBeNull();
      expect(result.current.isRecording).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.enabledSensors).toEqual([]);
      expect(result.current.sampleRate).toBe(50);
      expect(result.current.dataCount).toBe(0);
      expect(result.current.duration).toBe(0);
    });
  });

  describe('startRecording', () => {
    it('should start recording with correct configuration', () => {
      const {result} = renderHook(() => useRecordingStore());
      const sensors = ['accelerometer', 'gyroscope'] as const;
      const sampleRate = 100;

      act(() => {
        result.current.startRecording(sensors, sampleRate);
      });

      expect(result.current.isRecording).toBe(true);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.enabledSensors).toEqual(sensors);
      expect(result.current.sampleRate).toBe(sampleRate);
      expect(result.current.currentSession).toBeTruthy();
      expect(result.current.currentSession?.isActive).toBe(true);
      expect(result.current.currentSession?.enabledSensors).toEqual(sensors);
    });

    it('should create session with correct timestamps', () => {
      const {result} = renderHook(() => useRecordingStore());
      const beforeStart = Date.now();

      act(() => {
        result.current.startRecording(['accelerometer'], 50);
      });

      const afterStart = Date.now();

      expect(result.current.currentSession?.startTime).toBeGreaterThanOrEqual(
        beforeStart,
      );
      expect(result.current.currentSession?.startTime).toBeLessThanOrEqual(
        afterStart,
      );
    });
  });

  describe('stopRecording', () => {
    it('should stop recording and update session', () => {
      const {result} = renderHook(() => useRecordingStore());

      // Start recording first
      act(() => {
        result.current.startRecording(['accelerometer'], 50);
      });

      expect(result.current.isRecording).toBe(true);

      // Stop recording
      act(() => {
        result.current.stopRecording();
      });

      expect(result.current.isRecording).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.currentSession?.isActive).toBe(false);
      expect(result.current.currentSession?.endTime).toBeTruthy();
    });

    it('should handle stop without active session', () => {
      const {result} = renderHook(() => useRecordingStore());

      act(() => {
        result.current.stopRecording();
      });

      expect(result.current.isRecording).toBe(false);
      expect(result.current.currentSession).toBeNull();
    });
  });

  describe('pauseRecording and resumeRecording', () => {
    it('should pause recording', () => {
      const {result} = renderHook(() => useRecordingStore());

      act(() => {
        result.current.startRecording(['accelerometer'], 50);
        result.current.pauseRecording();
      });

      expect(result.current.isPaused).toBe(true);
    });

    it('should resume recording', () => {
      const {result} = renderHook(() => useRecordingStore());

      act(() => {
        result.current.startRecording(['accelerometer'], 50);
        result.current.pauseRecording();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.resumeRecording();
      });

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('updateDataCount', () => {
    it('should update data count', () => {
      const {result} = renderHook(() => useRecordingStore());

      act(() => {
        result.current.startRecording(['accelerometer'], 50);
        result.current.updateDataCount(100);
      });

      expect(result.current.dataCount).toBe(100);
      expect(result.current.currentSession?.dataCount).toBe(100);
    });
  });

  describe('updateDuration', () => {
    it('should update duration', () => {
      const {result} = renderHook(() => useRecordingStore());

      act(() => {
        result.current.updateDuration(5000);
      });

      expect(result.current.duration).toBe(5000);
    });
  });

  describe('configuration updates', () => {
    it('should update enabled sensors', () => {
      const {result} = renderHook(() => useRecordingStore());
      const newSensors = ['accelerometer', 'gps'] as const;

      act(() => {
        result.current.setEnabledSensors(newSensors);
      });

      expect(result.current.enabledSensors).toEqual(newSensors);
    });

    it('should update sample rate', () => {
      const {result} = renderHook(() => useRecordingStore());

      act(() => {
        result.current.setSampleRate(100);
      });

      expect(result.current.sampleRate).toBe(100);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const {result} = renderHook(() => useRecordingStore());

      // Start recording and make changes
      act(() => {
        result.current.startRecording(['accelerometer'], 100);
        result.current.updateDataCount(50);
      });

      expect(result.current.isRecording).toBe(true);
      expect(result.current.dataCount).toBe(50);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentSession).toBeNull();
      expect(result.current.isRecording).toBe(false);
      expect(result.current.dataCount).toBe(0);
      expect(result.current.enabledSensors).toEqual([]);
    });
  });
});
