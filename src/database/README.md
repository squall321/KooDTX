# Database

WatermelonDB models, schemas, and database utilities.

## Structure

```
database/
├── index.ts             # Database initialization and exports
├── schema.ts            # Database schema definition
├── models/              # WatermelonDB model classes
│   ├── SensorData.ts
│   ├── RecordingSession.ts
│   ├── SyncQueue.ts
│   └── UserSettings.ts
├── migrations/          # Database migrations
└── hooks/               # Database-specific hooks
```

## Guidelines

- Use WatermelonDB for local-first architecture
- Define schemas with proper indexes
- Implement relations between models
- Write migrations for schema changes
- Use batch operations for performance

## Example

```typescript
// schema.ts
import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'sensor_data',
      columns: [
        {name: 'sensor_type', type: 'string', isIndexed: true},
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'timestamp', type: 'number', isIndexed: true},
        {name: 'data', type: 'string'}, // JSON string
        {name: 'sync_status', type: 'string', isIndexed: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'recording_sessions',
      columns: [
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'start_time', type: 'number', isIndexed: true},
        {name: 'end_time', type: 'number', isOptional: true},
        {name: 'is_active', type: 'boolean'},
        {name: 'enabled_sensors', type: 'string'}, // JSON array
        {name: 'sample_rate', type: 'number'},
        {name: 'data_count', type: 'number'},
        {name: 'sync_status', type: 'string', isIndexed: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
  ],
});

// models/SensorData.ts
import {Model} from '@nozbe/watermelondb';
import {field, readonly, date} from '@nozbe/watermelondb/decorators';
import type {SensorType} from '@types';

export class SensorDataModel extends Model {
  static table = 'sensor_data';

  @field('sensor_type') sensorType!: SensorType;
  @field('session_id') sessionId!: string;
  @field('timestamp') timestamp!: number;
  @field('data') data!: string; // JSON stringified sensor data
  @field('sync_status') syncStatus!: 'pending' | 'syncing' | 'synced' | 'failed';
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  // Parse JSON data
  getParsedData<T>(): T {
    return JSON.parse(this.data);
  }
}

// index.ts
import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {schema} from './schema';
import {SensorDataModel} from './models/SensorData';
import {RecordingSessionModel} from './models/RecordingSession';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'koodtx',
});

export const database = new Database({
  adapter,
  modelClasses: [SensorDataModel, RecordingSessionModel],
});
```
