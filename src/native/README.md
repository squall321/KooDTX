# Native Modules

Native bridge implementations for accessing platform-specific features.

## NativeSensorBridge

TypeScript bridge for Android SensorModule providing high-frequency sensor data collection.

### Features

- ✅ High-frequency sensor data (up to 400Hz)
- ✅ Batch processing for efficiency
- ✅ Support for 13+ sensor types
- ✅ TypeScript type safety
- ✅ Event-based data streaming
- ✅ Configurable sampling rates

### Supported Sensors

| Sensor | Type | Description |
|--------|------|-------------|
| Accelerometer | `ACCELEROMETER` | 3-axis acceleration (m/s²) |
| Gyroscope | `GYROSCOPE` | 3-axis angular velocity (rad/s) |
| Magnetometer | `MAGNETIC_FIELD` | 3-axis magnetic field (μT) |
| Gravity | `GRAVITY` | 3-axis gravity vector (m/s²) |
| Linear Acceleration | `LINEAR_ACCELERATION` | Acceleration without gravity (m/s²) |
| Rotation Vector | `ROTATION_VECTOR` | Device orientation (quaternion) |
| Step Detector | `STEP_DETECTOR` | Step detection events |
| Step Counter | `STEP_COUNTER` | Cumulative step count |
| Light | `LIGHT` | Ambient light (lux) |
| Pressure | `PRESSURE` | Atmospheric pressure (hPa) |
| Proximity | `PROXIMITY` | Proximity (cm) |
| Temperature | `AMBIENT_TEMPERATURE` | Ambient temperature (°C) |
| Humidity | `RELATIVE_HUMIDITY` | Relative humidity (%) |

### Usage

#### Basic Usage

```typescript
import {
  NativeSensorBridge,
  AndroidSensorType,
  SensorSamplingRate,
} from '@native';

// Get available sensors
const sensors = await NativeSensorBridge.getAvailableSensors();
console.log('Available sensors:', sensors);

// Check if accelerometer is available
const hasAccel = await NativeSensorBridge.isSensorAvailable(
  AndroidSensorType.ACCELEROMETER
);

// Add data listener
const unsubscribe = NativeSensorBridge.addDataListener(
  AndroidSensorType.ACCELEROMETER,
  (batch) => {
    console.log(`Received ${batch.count} samples`);
    batch.data.forEach(sample => {
      const [x, y, z] = sample.values;
      console.log(`Accel: x=${x}, y=${y}, z=${z}`);
    });
  }
);

// Start sensor
await NativeSensorBridge.startSensor(
  AndroidSensorType.ACCELEROMETER,
  SensorSamplingRate.FASTEST, // ~200Hz
  50 // batch size
);

// Stop sensor
await NativeSensorBridge.stopSensor(AndroidSensorType.ACCELEROMETER);

// Cleanup
unsubscribe();
```

#### Convenience Functions

```typescript
import {
  startAccelerometer,
  startGyroscope,
  startMagnetometer,
  stopSensor,
  stopAllSensors,
  SensorSamplingRate,
} from '@native';

// Start accelerometer (simplified)
await startAccelerometer(SensorSamplingRate.GAME, 50);

// Start gyroscope
await startGyroscope(SensorSamplingRate.FASTEST, 50);

// Stop specific sensor
await stopSensor(AndroidSensorType.ACCELEROMETER);

// Stop all sensors
await stopAllSensors();
```

#### Error Handling

```typescript
// Add error listener
const unsubscribeError = NativeSensorBridge.addErrorListener((error) => {
  console.error('Sensor error:', error.message);
});

// Cleanup
unsubscribeError();
```

### Sampling Rates

| Rate | Frequency | Use Case |
|------|-----------|----------|
| `FASTEST` | ~200Hz | High-precision motion tracking |
| `GAME` | ~50Hz | Games and AR applications |
| `UI` | ~16Hz | UI updates |
| `NORMAL` | ~5Hz | Background monitoring |

### Data Format

#### SensorDataSample

```typescript
interface SensorDataSample {
  sensorType: number;         // Android sensor type constant
  sensorName: string;         // Human-readable sensor name
  timestamp: number;          // Sensor timestamp (nanoseconds)
  systemTime: number;         // System time (milliseconds)
  values: number[];           // Sensor values [x, y, z] or [value]
  accuracy: number;           // Sensor accuracy (0-3)
}
```

#### SensorDataBatch

```typescript
interface SensorDataBatch {
  sensorType: number;         // Sensor type
  count: number;              // Number of samples in batch
  data: SensorDataSample[];   // Array of samples
}
```

### Best Practices

1. **Always check sensor availability** before starting
2. **Use appropriate sampling rates** for your use case
3. **Configure batch sizes** based on frequency:
   - High frequency (FASTEST): 50-100 samples
   - Medium frequency (GAME): 20-50 samples
   - Low frequency (NORMAL): 5-10 samples
4. **Stop sensors when not needed** to save battery
5. **Add error listeners** for robust error handling
6. **Cleanup listeners** when component unmounts

### Example: Complete Sensor Collection

```typescript
import {useEffect, useRef} from 'react';
import {
  NativeSensorBridge,
  AndroidSensorType,
  SensorSamplingRate,
  SensorDataBatch,
} from '@native';

function useSensorCollection() {
  const unsubscribers = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Setup
    const startSensors = async () => {
      // Add listeners
      const unsubAccel = NativeSensorBridge.addDataListener(
        AndroidSensorType.ACCELEROMETER,
        handleAccelData
      );

      const unsubGyro = NativeSensorBridge.addDataListener(
        AndroidSensorType.GYROSCOPE,
        handleGyroData
      );

      unsubscribers.current = [unsubAccel, unsubGyro];

      // Start sensors
      await NativeSensorBridge.startSensor(
        AndroidSensorType.ACCELEROMETER,
        SensorSamplingRate.FASTEST,
        50
      );

      await NativeSensorBridge.startSensor(
        AndroidSensorType.GYROSCOPE,
        SensorSamplingRate.FASTEST,
        50
      );
    };

    startSensors();

    // Cleanup
    return () => {
      NativeSensorBridge.stopAllSensors();
      unsubscribers.current.forEach(unsub => unsub());
    };
  }, []);

  const handleAccelData = (batch: SensorDataBatch) => {
    // Process accelerometer data
    console.log(`Accel: ${batch.count} samples`);
  };

  const handleGyroData = (batch: SensorDataBatch) => {
    // Process gyroscope data
    console.log(`Gyro: ${batch.count} samples`);
  };

  return {
    // Your hook API
  };
}
```

### Performance Tips

1. **Batch processing**: Use larger batch sizes for high-frequency sensors
2. **Worker threads**: Consider processing data in background threads
3. **Throttling**: Use lower sampling rates when precision isn't critical
4. **Memory management**: Clear old data regularly to prevent memory leaks
5. **Battery optimization**: Stop sensors when app is in background

### Troubleshooting

**Sensor not available**:
- Check if running on physical device (not emulator)
- Verify sensor exists on device hardware
- Check Android permissions

**Low data rate**:
- Increase sampling rate
- Reduce batch size
- Check device performance

**High battery usage**:
- Use lower sampling rates
- Stop sensors when not needed
- Increase batch sizes

**Data loss**:
- Process data immediately or queue it
- Don't block the event listener
- Use appropriate batch sizes
