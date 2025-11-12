/**
 * ID generation utilities
 */

import {v4 as uuidv4} from 'uuid';

/**
 * Generates a random UUID v4
 * @returns UUID string
 */
export const generateUUID = (): string => {
  return uuidv4();
};

/**
 * Generates a session ID with timestamp prefix
 * @returns Session ID string
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // Take first segment
  return `session-${timestamp}-${uuid}`;
};

/**
 * Generates a device ID (should be stored and reused)
 * @returns Device ID string
 */
export const generateDeviceId = (): string => {
  const uuid = uuidv4();
  return `device-${uuid}`;
};

/**
 * Generates a short random ID (8 characters)
 * @returns Short ID string
 */
export const generateShortId = (): string => {
  return uuidv4().split('-')[0];
};

/**
 * Generates a numeric ID from timestamp
 * @returns Numeric ID
 */
export const generateNumericId = (): number => {
  return Date.now();
};

/**
 * Generates a recording ID
 * @returns Recording ID string
 */
export const generateRecordingId = (): string => {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  return `rec-${timestamp}-${uuid}`;
};

/**
 * Generates a data point ID
 * @param sensorType - Type of sensor
 * @returns Data point ID string
 */
export const generateDataPointId = (sensorType: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${sensorType}-${timestamp}-${random}`;
};

/**
 * Validates UUID format
 * @param uuid - UUID string to validate
 * @returns True if valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
