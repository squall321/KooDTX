# Models

Data models and business logic entities.

## Structure

```
models/
├── SensorData.ts        # Sensor data model
├── RecordingSession.ts  # Recording session model
├── SyncQueue.ts         # Sync queue entry model
├── UserSettings.ts      # User settings model
└── index.ts             # Model exports
```

## Guidelines

- Models represent business entities
- Include validation logic
- Implement transformation methods
- Use TypeScript classes or factory functions
- Keep models independent of UI

## Example

```typescript
// RecordingSession.ts
import type {RecordingSession as IRecordingSession, SensorType} from '@types';

export class RecordingSession implements IRecordingSession {
  id: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  syncedAt?: number;
  deviceId: string;
  sessionId: string;
  startTime: number;
  endTime?: number;
  isActive: boolean;
  enabledSensors: SensorType[];
  sampleRate: number;
  dataCount: number;
  notes?: string;

  constructor(data: Partial<IRecordingSession>) {
    this.id = data.id || generateUUID();
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
    this.syncStatus = data.syncStatus || 'pending';
    this.deviceId = data.deviceId || getDeviceId();
    this.sessionId = data.sessionId || generateSessionId();
    this.startTime = data.startTime || Date.now();
    this.endTime = data.endTime;
    this.isActive = data.isActive ?? true;
    this.enabledSensors = data.enabledSensors || [];
    this.sampleRate = data.sampleRate || 50;
    this.dataCount = data.dataCount || 0;
    this.notes = data.notes;
  }

  /**
   * Get session duration in milliseconds
   */
  getDuration(): number {
    if (!this.endTime) {
      return Date.now() - this.startTime;
    }
    return this.endTime - this.startTime;
  }

  /**
   * Check if session is completed
   */
  isCompleted(): boolean {
    return !this.isActive && this.endTime !== undefined;
  }

  /**
   * Mark session as completed
   */
  complete(): void {
    this.isActive = false;
    this.endTime = Date.now();
    this.updatedAt = Date.now();
  }

  /**
   * Convert to plain JSON object for storage
   */
  toJSON(): IRecordingSession {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      syncStatus: this.syncStatus,
      syncedAt: this.syncedAt,
      deviceId: this.deviceId,
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: this.endTime,
      isActive: this.isActive,
      enabledSensors: this.enabledSensors,
      sampleRate: this.sampleRate,
      dataCount: this.dataCount,
      notes: this.notes,
    };
  }

  /**
   * Create from JSON object
   */
  static fromJSON(json: IRecordingSession): RecordingSession {
    return new RecordingSession(json);
  }
}
```
