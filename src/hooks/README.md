# Hooks

Custom React hooks for shared logic across components.

## Structure

```
hooks/
├── useSensor.ts         # Sensor data collection hook
├── useRecording.ts      # Recording session management hook
├── useSync.ts           # Data synchronization hook
├── useDatabase.ts       # Database operations hook
├── usePermissions.ts    # Permission management hook
└── useDebounce.ts       # Debounce utility hook
```

## Guidelines

- Follow React hooks rules
- Prefix all custom hooks with 'use'
- Keep hooks focused on a single responsibility
- Document hook parameters and return values
- Write tests for complex hooks

## Example

```typescript
// useSensor.ts
import {useState, useEffect} from 'react';
import type {AccelerometerData} from '@types';

interface UseSensorOptions {
  enabled: boolean;
  sampleRate: number;
}

export const useAccelerometer = ({
  enabled,
  sampleRate,
}: UseSensorOptions) => {
  const [data, setData] = useState<AccelerometerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Setup accelerometer listener
    const subscription = Accelerometer.addListener(newData => {
      setData({
        x: newData.x,
        y: newData.y,
        z: newData.z,
        timestamp: Date.now(),
      });
    });

    Accelerometer.setUpdateInterval(1000 / sampleRate);

    return () => {
      subscription.remove();
    };
  }, [enabled, sampleRate]);

  return {data, error};
};
```
