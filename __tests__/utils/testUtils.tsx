/**
 * Test utilities for React Native Testing Library
 */

import type {ReactElement} from 'react';
import {render, RenderOptions} from '@testing-library/react-native';

/**
 * Custom render function that includes providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  // Add providers here as they are implemented
  // Example: const Wrapper = ({children}: {children: React.ReactNode}) => (
  //   <Provider store={store}>
  //     <NavigationContainer>{children}</NavigationContainer>
  //   </Provider>
  // );

  return render(ui, {...options});
};

/**
 * Wait for a condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
): Promise<void> => {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

/**
 * Create mock navigation object
 */
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
});

/**
 * Create mock route object
 */
export const createMockRoute = <T,>(params?: T) => ({
  key: 'test-route',
  name: 'TestScreen' as const,
  params,
});

/**
 * Mock sensor data generator
 */
export const generateMockSensorData = (type: string, count = 10) => {
  return Array.from({length: count}, (_, i) => ({
    id: `${type}-${i}`,
    sensorType: type,
    timestamp: Date.now() + i * 1000,
    sessionId: 'test-session-123',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    syncStatus: 'pending' as const,
    deviceId: 'test-device',
    x: Math.random() * 10,
    y: Math.random() * 10,
    z: Math.random() * 10,
  }));
};

/**
 * Mock recording session generator
 */
export const generateMockRecordingSession = (overrides = {}) => ({
  id: 'test-session-123',
  sessionId: 'session-123',
  startTime: Date.now() - 60000,
  endTime: Date.now(),
  isActive: false,
  enabledSensors: ['accelerometer', 'gyroscope'],
  sampleRate: 50,
  dataCount: 100,
  createdAt: Date.now() - 60000,
  updatedAt: Date.now(),
  syncStatus: 'pending' as const,
  deviceId: 'test-device',
  ...overrides,
});

/**
 * Delay utility for async tests
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Mock fetch responses
 */
export const mockFetchSuccess = (data: unknown) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
      status: 200,
      statusText: 'OK',
    } as Response),
  );
};

export const mockFetchError = (error = 'Network error') => {
  global.fetch = jest.fn(() => Promise.reject(new Error(error)));
};

// Re-export testing library utilities
export * from '@testing-library/react-native';
