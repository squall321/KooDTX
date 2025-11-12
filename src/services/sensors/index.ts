/**
 * Sensor services barrel export
 */

export {SensorService} from './SensorService';
export type {SensorDataCallback, SensorErrorCallback} from './SensorService';

export {AccelerometerService} from './AccelerometerService';
export {GyroscopeService} from './GyroscopeService';
export {MagnetometerService} from './MagnetometerService';
export {GPSService} from './GPSService';

export {SensorManager, getSensorManager, resetSensorManager} from './SensorManager';
export type {SensorManagerOptions, SensorAvailability} from './SensorManager';
