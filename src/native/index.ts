/**
 * Native Module Exports
 * Central export point for all native bridges
 */

export {
  default as NativeSensorBridge,
  NativeSensorBridgeInstance,
  AndroidSensorType,
  SensorSamplingRate,
  startAccelerometer,
  startGyroscope,
  startMagnetometer,
  startGravity,
  startLinearAcceleration,
  startRotationVector,
  startStepDetector,
  startStepCounter,
  startLight,
  startPressure,
  startProximity,
  startTemperature,
  startHumidity,
  stopSensor,
  stopAllSensors,
} from './NativeSensorBridge';

export type {
  SensorInfo,
  SensorDataSample,
  SensorDataBatch,
  SensorErrorEvent,
  SensorDataListener,
  SensorErrorListener,
} from './NativeSensorBridge';

export {
  default as NativeAudioRecorderBridge,
  NativeAudioRecorderBridgeInstance,
} from './NativeAudioRecorderBridge';

export type {
  AudioConfiguration,
  AudioAvailability,
  RecordingState,
  AudioDataEvent,
  AudioErrorEvent,
  AudioDataListener,
  AudioErrorListener,
} from './NativeAudioRecorderBridge';
