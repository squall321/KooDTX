/**
 * Tests for useAppStore
 */

import {act, renderHook} from '@testing-library/react-native';

import {useAppStore} from '../useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const {result} = renderHook(() => useAppStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const {result} = renderHook(() => useAppStore());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isConnectedToServer).toBe(false);
      expect(result.current.isInitializing).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.appVersion).toBe('0.1.0');
      expect(result.current.environment).toBe('development');
    });
  });

  describe('network status', () => {
    it('should update online status', () => {
      const {result} = renderHook(() => useAppStore());

      act(() => {
        result.current.setOnline(false);
      });

      expect(result.current.isOnline).toBe(false);
    });

    it('should disconnect from server when going offline', () => {
      const {result} = renderHook(() => useAppStore());

      // First connect
      act(() => {
        result.current.setConnectedToServer(true);
      });

      expect(result.current.isConnectedToServer).toBe(true);

      // Then go offline
      act(() => {
        result.current.setOnline(false);
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isConnectedToServer).toBe(false);
    });

    it('should update server connection status', () => {
      const {result} = renderHook(() => useAppStore());

      act(() => {
        result.current.setConnectedToServer(true);
      });

      expect(result.current.isConnectedToServer).toBe(true);

      act(() => {
        result.current.setConnectedToServer(false);
      });

      expect(result.current.isConnectedToServer).toBe(false);
    });
  });

  describe('loading states', () => {
    it('should update initializing state', () => {
      const {result} = renderHook(() => useAppStore());

      act(() => {
        result.current.setInitializing(false);
      });

      expect(result.current.isInitializing).toBe(false);
    });

    it('should update loading state', () => {
      const {result} = renderHook(() => useAppStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error', () => {
      const {result} = renderHook(() => useAppStore());
      const errorMessage = 'Something went wrong';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.lastError).toEqual({
        message: errorMessage,
        timestamp: expect.any(Number),
      });
    });

    it('should clear error', () => {
      const {result} = renderHook(() => useAppStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should update lastError when setting error', () => {
      const {result} = renderHook(() => useAppStore());
      const beforeTimestamp = Date.now();

      act(() => {
        result.current.setError('Test error');
      });

      const afterTimestamp = Date.now();

      expect(result.current.lastError).toBeTruthy();
      expect(result.current.lastError?.message).toBe('Test error');
      expect(result.current.lastError?.timestamp).toBeGreaterThanOrEqual(
        beforeTimestamp,
      );
      expect(result.current.lastError?.timestamp).toBeLessThanOrEqual(
        afterTimestamp,
      );
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const {result} = renderHook(() => useAppStore());

      expect(result.current.isInitializing).toBe(true);

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.isInitializing).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const {result} = renderHook(() => useAppStore());

      // Change some values
      act(() => {
        result.current.setOnline(false);
        result.current.setLoading(true);
        result.current.setError('Test error');
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe('Test error');

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
