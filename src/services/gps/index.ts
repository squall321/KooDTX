/**
 * GPS service exports
 */

export {
  default as gpsService,
  getCurrentPosition,
  startGPSTracking,
  stopGPSTracking,
  isGPSTrackingActive,
  addGPSPositionListener,
  addGPSErrorListener,
  getGPSStatistics,
  resetGPSStatistics,
  requestGPSAuthorization,
  GPSAccuracyMode,
} from './GPSService';

export type {
  GPSPosition,
  GPSTrackingOptions,
  GPSPositionListener,
  GPSErrorListener,
  GPSStatistics,
} from './GPSService';

export {
  default as gpsDataStorage,
  saveGPSPosition,
  saveGPSPositions,
  flushGPSData,
  getGPSStorageStatistics,
  resetGPSStorageStatistics,
  setGPSFlushInterval,
  getGPSBufferSize,
  cleanupGPSStorage,
} from './GPSDataStorage';

export type {
  GPSDataSample,
  GPSStorageStats,
} from './GPSDataStorage';
