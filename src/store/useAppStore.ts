/**
 * Main application store
 * Manages global app state including network status, loading states, and errors
 */

import {create} from 'zustand';

interface AppState {
  // Network status
  isOnline: boolean;
  isConnectedToServer: boolean;

  // Loading states
  isInitializing: boolean;
  isLoading: boolean;

  // Error handling
  error: string | null;
  lastError: {message: string; timestamp: number} | null;

  // App version and config
  appVersion: string;
  environment: 'development' | 'staging' | 'production';

  // Actions
  setOnline: (isOnline: boolean) => void;
  setConnectedToServer: (isConnected: boolean) => void;
  setInitializing: (isInitializing: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  isOnline: true,
  isConnectedToServer: false,
  isInitializing: true,
  isLoading: false,
  error: null,
  lastError: null,
  appVersion: '0.1.0',
  environment: 'development' as const,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  // Network actions
  setOnline: isOnline => {
    set({isOnline});
    if (!isOnline) {
      set({isConnectedToServer: false});
    }
  },

  setConnectedToServer: isConnected => {
    set({isConnectedToServer: isConnected});
  },

  // Loading actions
  setInitializing: isInitializing => {
    set({isInitializing});
  },

  setLoading: isLoading => {
    set({isLoading});
  },

  // Error actions
  setError: error => {
    set({
      error,
      lastError: error ? {message: error, timestamp: Date.now()} : null,
    });
  },

  clearError: () => {
    set({error: null});
  },

  // Initialize app
  initialize: async () => {
    set({isInitializing: true});

    try {
      // Perform initialization tasks here
      // - Check network connectivity
      // - Load user settings
      // - Initialize database
      // - Check server connection

      // Simulate initialization
      await new Promise(resolve => setTimeout(resolve, 1000));

      set({
        isInitializing: false,
        error: null,
      });
    } catch (error) {
      set({
        isInitializing: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      });
    }
  },

  // Reset state
  reset: () => {
    set(initialState);
  },
}));
