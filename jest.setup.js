/**
 * Jest setup file
 * This file runs before each test suite
 */

// Suppress React Native warnings in tests
import {LogBox} from 'react-native';

LogBox.ignoreAllLogs(true);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
  // Keep console.warn and console.error for debugging
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Mock React Native modules that need special handling
// Note: Add AsyncStorage mock when the package is installed
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Set test timeout
jest.setTimeout(10000);

// Global test setup
beforeAll(() => {
  // Setup runs once before all tests
});

afterAll(() => {
  // Cleanup runs once after all tests
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
