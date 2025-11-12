# Store

Global state management using Zustand.

## Structure

```
store/
├── index.ts             # Store exports
├── useAppStore.ts       # Main app state store
├── useRecordingStore.ts # Recording session state
├── useSensorStore.ts    # Sensor configuration state
├── useSyncStore.ts      # Sync queue state
└── useSettingsStore.ts  # User settings state
```

## Guidelines

- Use Zustand for state management
- Keep stores focused and modular
- Avoid storing derived state
- Use TypeScript for type safety
- Persist important state to AsyncStorage

## Example

```typescript
// useRecordingStore.ts
import {create} from 'zustand';
import type {RecordingSession} from '@types';

interface RecordingState {
  session: RecordingSession | null;
  isRecording: boolean;
  startRecording: (config: RecordingConfig) => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
}

export const useRecordingStore = create<RecordingState>(set => ({
  session: null,
  isRecording: false,

  startRecording: config => {
    const session: RecordingSession = {
      id: generateId(),
      startTime: Date.now(),
      isActive: true,
      enabledSensors: config.sensors,
      sampleRate: config.sampleRate,
    };

    set({session, isRecording: true});
  },

  stopRecording: () => {
    set(state => ({
      session: state.session
        ? {...state.session, endTime: Date.now(), isActive: false}
        : null,
      isRecording: false,
    }));
  },

  pauseRecording: () => {
    set({isRecording: false});
  },

  resumeRecording: () => {
    set({isRecording: true});
  },
}));
```
