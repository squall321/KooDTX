# Services

Business logic, API calls, and external service integrations.

## Structure

```
services/
├── api/             # Backend API service
├── sensors/         # Sensor data collection services
│   ├── accelerometer.ts
│   ├── gyroscope.ts
│   ├── gps.ts
│   └── audio.ts
├── sync/            # Data synchronization service
├── database/        # Database service (WatermelonDB)
├── storage/         # Local storage service
└── permissions/     # Permissions handling service
```

## Guidelines

- Services should be stateless and testable
- Use async/await for asynchronous operations
- Implement proper error handling
- Use dependency injection where possible
- Services should not directly manipulate UI

## Example

```typescript
// api/sensorApi.ts
import type {SensorData, ApiResponse} from '@types';

export const sensorApi = {
  uploadSensorData: async (
    data: SensorData[],
  ): Promise<ApiResponse<{uploaded: number}>> => {
    try {
      const response = await fetch('/api/sensor-data', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      throw new Error('Failed to upload sensor data');
    }
  },
};
```
