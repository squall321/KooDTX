/**
 * Audio Store
 * Phase 94: Global state management for audio recording
 *
 * Features:
 * - Recording state management
 * - Real-time dB level monitoring
 * - Recording time tracking
 * - Audio configuration
 * - Error state
 * - Actions for controlling audio recording
 */

import {create} from 'zustand';
import {
  audioService,
  AudioRecordingState,
  type AudioStatistics,
  type AudioRecordingOptions,
  type AudioChunkMetadata,
  type AudioFormat,
} from '@services/audio';

/**
 * Audio session info
 */
export interface AudioSessionInfo {
  sessionId: string;
  startTime: number;
  endTime: number | null;
  duration: number; // milliseconds
  totalChunks: number;
  totalSamples: number;
}

/**
 * Real-time audio levels
 */
export interface AudioLevels {
  currentDbLevel: number;
  currentRmsLevel: number;
  peakDbLevel: number;
  isSilent: boolean;
  timestamp: number;
}

/**
 * Audio store state
 */
export interface AudioStoreState {
  // Recording state
  recordingState: AudioRecordingState;

  // Audio configuration
  audioConfig: AudioRecordingOptions;

  // Audio format
  audioFormat: AudioFormat | null;

  // Real-time audio levels
  audioLevels: AudioLevels;

  // Session info
  currentSession: AudioSessionInfo | null;

  // Statistics
  statistics: AudioStatistics | null;

  // Recent chunks
  recentChunks: AudioChunkMetadata[];

  // Error state
  error: Error | null;

  // Actions

  // Recording control
  startRecording: (sessionId: string, options?: AudioRecordingOptions) => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;

  // Configuration
  setAudioConfig: (config: AudioRecordingOptions) => void;
  updateAudioConfig: (updates: Partial<AudioRecordingOptions>) => void;

  // Real-time updates
  updateAudioLevels: (dbLevel: number, rmsLevel: number) => void;
  updateStatistics: (stats: AudioStatistics) => void;
  addChunk: (chunk: AudioChunkMetadata) => void;

  // Session management
  updateSessionDuration: () => void;

  // Error handling
  setError: (error: Error | null) => void;
  clearError: () => void;

  // Reset
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  recordingState: AudioRecordingState.IDLE,
  audioConfig: {
    sampleRate: 44100,
    channels: 1 as 1 | 2,
    bitsPerSample: 16 as 8 | 16,
  },
  audioFormat: null,
  audioLevels: {
    currentDbLevel: -96,
    currentRmsLevel: 0,
    peakDbLevel: -96,
    isSilent: true,
    timestamp: 0,
  },
  currentSession: null,
  statistics: null,
  recentChunks: [],
  error: null,
};

/**
 * Create audio store
 */
export const useAudioStore = create<AudioStoreState>((set, get) => ({
  ...initialState,

  // Start recording
  startRecording: async (sessionId: string, options?: AudioRecordingOptions) => {
    try {
      // Clear previous error
      set({error: null});

      // Update state to initializing
      set({recordingState: AudioRecordingState.INITIALIZING});

      // Merge options with current config
      const config = {...get().audioConfig, ...options};
      set({audioConfig: config});

      // Setup listeners before starting
      const removeLevelListener = audioService.addLevelListener(
        (dbLevel: number, rmsLevel: number) => {
          get().updateAudioLevels(dbLevel, rmsLevel);
        },
      );

      const removeChunkListener = audioService.addChunkListener(
        (chunk: AudioChunkMetadata) => {
          get().addChunk(chunk);
        },
      );

      const removeErrorListener = audioService.addErrorListener(
        (error: Error) => {
          get().setError(error);
        },
      );

      // Store listener removers for cleanup
      (get() as any)._removeListeners = () => {
        removeLevelListener();
        removeChunkListener();
        removeErrorListener();
      };

      // Start audio service
      await audioService.startRecording(sessionId, config);

      // Get audio format
      const format = audioService.getFormat();

      // Create session info
      const startTime = Date.now();
      set({
        recordingState: AudioRecordingState.RECORDING,
        audioFormat: format,
        currentSession: {
          sessionId,
          startTime,
          endTime: null,
          duration: 0,
          totalChunks: 0,
          totalSamples: 0,
        },
        recentChunks: [],
      });

      console.log('Audio recording started in store:', sessionId);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      set({
        recordingState: AudioRecordingState.ERROR,
        error: err,
      });
      throw err;
    }
  },

  // Stop recording
  stopRecording: async () => {
    try {
      set({recordingState: AudioRecordingState.STOPPING});

      // Stop audio service
      await audioService.stopRecording();

      // Get final statistics
      const stats = audioService.getStatistics();
      set({statistics: stats});

      // Update session
      const session = get().currentSession;
      if (session) {
        const endTime = Date.now();
        set({
          currentSession: {
            ...session,
            endTime,
            duration: endTime - session.startTime,
          },
        });
      }

      // Remove listeners
      if ((get() as any)._removeListeners) {
        (get() as any)._removeListeners();
        (get() as any)._removeListeners = null;
      }

      set({recordingState: AudioRecordingState.IDLE});

      console.log('Audio recording stopped in store');

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      set({
        recordingState: AudioRecordingState.ERROR,
        error: err,
      });
      throw err;
    }
  },

  // Pause recording
  pauseRecording: async () => {
    try {
      await audioService.pauseRecording();
      set({recordingState: AudioRecordingState.PAUSED});

      console.log('Audio recording paused in store');

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      set({error: err});
      throw err;
    }
  },

  // Resume recording
  resumeRecording: async () => {
    try {
      await audioService.resumeRecording();
      set({recordingState: AudioRecordingState.RECORDING});

      console.log('Audio recording resumed in store');

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      set({error: err});
      throw err;
    }
  },

  // Set audio configuration
  setAudioConfig: (config: AudioRecordingOptions) => {
    set({audioConfig: config});
  },

  // Update audio configuration
  updateAudioConfig: (updates: Partial<AudioRecordingOptions>) => {
    set((state) => ({
      audioConfig: {
        ...state.audioConfig,
        ...updates,
      },
    }));
  },

  // Update audio levels
  updateAudioLevels: (dbLevel: number, rmsLevel: number) => {
    set((state) => {
      const newPeakDb = Math.max(state.audioLevels.peakDbLevel, dbLevel);
      const isSilent = dbLevel < -50; // -50dB threshold

      return {
        audioLevels: {
          currentDbLevel: dbLevel,
          currentRmsLevel: rmsLevel,
          peakDbLevel: newPeakDb,
          isSilent,
          timestamp: Date.now(),
        },
      };
    });

    // Update session duration
    get().updateSessionDuration();
  },

  // Update statistics
  updateStatistics: (stats: AudioStatistics) => {
    set({statistics: stats});

    // Update session sample count
    set((state) => {
      if (!state.currentSession) return state;

      return {
        currentSession: {
          ...state.currentSession,
          totalSamples: stats.totalSamples,
          totalChunks: stats.totalChunks,
        },
      };
    });
  },

  // Add audio chunk
  addChunk: (chunk: AudioChunkMetadata) => {
    set((state) => {
      // Keep last 10 chunks
      const recentChunks = [...state.recentChunks, chunk].slice(-10);

      return {
        recentChunks,
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              totalChunks: state.currentSession.totalChunks + 1,
            }
          : null,
      };
    });

    console.log('Audio chunk added to store:', chunk.chunkId);
  },

  // Update session duration
  updateSessionDuration: () => {
    set((state) => {
      if (!state.currentSession || state.currentSession.endTime) {
        return state;
      }

      const duration = Date.now() - state.currentSession.startTime;

      return {
        currentSession: {
          ...state.currentSession,
          duration,
        },
      };
    });
  },

  // Set error
  setError: (error: Error | null) => {
    set({error});

    if (error) {
      set({recordingState: AudioRecordingState.ERROR});
      console.error('Audio recording error:', error);
    }
  },

  // Clear error
  clearError: () => {
    set({error: null});
  },

  // Reset store
  reset: () => {
    // Remove listeners if any
    if ((get() as any)._removeListeners) {
      (get() as any)._removeListeners();
      (get() as any)._removeListeners = null;
    }

    set(initialState);
  },
}));

/**
 * Selector hooks for convenient access
 */

/**
 * Get recording state
 */
export const useAudioRecordingState = () =>
  useAudioStore((state) => state.recordingState);

/**
 * Check if recording
 */
export const useIsAudioRecording = () =>
  useAudioStore(
    (state) => state.recordingState === AudioRecordingState.RECORDING,
  );

/**
 * Check if paused
 */
export const useIsAudioPaused = () =>
  useAudioStore((state) => state.recordingState === AudioRecordingState.PAUSED);

/**
 * Check if idle
 */
export const useIsAudioIdle = () =>
  useAudioStore((state) => state.recordingState === AudioRecordingState.IDLE);

/**
 * Get audio configuration
 */
export const useAudioConfig = () => useAudioStore((state) => state.audioConfig);

/**
 * Get audio format
 */
export const useAudioFormat = () => useAudioStore((state) => state.audioFormat);

/**
 * Get audio levels
 */
export const useAudioLevels = () => useAudioStore((state) => state.audioLevels);

/**
 * Get current dB level
 */
export const useCurrentDbLevel = () =>
  useAudioStore((state) => state.audioLevels.currentDbLevel);

/**
 * Get peak dB level
 */
export const usePeakDbLevel = () =>
  useAudioStore((state) => state.audioLevels.peakDbLevel);

/**
 * Get current RMS level
 */
export const useCurrentRmsLevel = () =>
  useAudioStore((state) => state.audioLevels.currentRmsLevel);

/**
 * Check if audio is silent
 */
export const useIsAudioSilent = () =>
  useAudioStore((state) => state.audioLevels.isSilent);

/**
 * Get current session
 */
export const useAudioSession = () =>
  useAudioStore((state) => state.currentSession);

/**
 * Get session duration
 */
export const useAudioSessionDuration = () =>
  useAudioStore((state) => state.currentSession?.duration ?? 0);

/**
 * Get audio statistics
 */
export const useAudioStatistics = () =>
  useAudioStore((state) => state.statistics);

/**
 * Get recent audio chunks
 */
export const useRecentAudioChunks = () =>
  useAudioStore((state) => state.recentChunks);

/**
 * Get audio error
 */
export const useAudioError = () => useAudioStore((state) => state.error);

/**
 * Get audio actions
 */
export const useAudioActions = () =>
  useAudioStore((state) => ({
    startRecording: state.startRecording,
    stopRecording: state.stopRecording,
    pauseRecording: state.pauseRecording,
    resumeRecording: state.resumeRecording,
    setAudioConfig: state.setAudioConfig,
    updateAudioConfig: state.updateAudioConfig,
    updateAudioLevels: state.updateAudioLevels,
    updateStatistics: state.updateStatistics,
    addChunk: state.addChunk,
    updateSessionDuration: state.updateSessionDuration,
    setError: state.setError,
    clearError: state.clearError,
    reset: state.reset,
  }));

/**
 * Export default
 */
export default useAudioStore;
