/**
 * Tests for ID generation utilities
 */

import {
  generateUUID,
  generateSessionId,
  generateDeviceId,
  generateShortId,
  generateNumericId,
  generateRecordingId,
  generateDataPointId,
  isValidUUID,
} from '../id';

describe('ID generation utilities', () => {
  describe('generateUUID', () => {
    it('should generate valid UUID', () => {
      const uuid = generateUUID();
      expect(isValidUUID(uuid)).toBe(true);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateSessionId', () => {
    it('should generate session ID with correct format', () => {
      const sessionId = generateSessionId();
      expect(sessionId).toMatch(/^session-\d+-[a-f0-9]+$/);
    });

    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateDeviceId', () => {
    it('should generate device ID with correct format', () => {
      const deviceId = generateDeviceId();
      expect(deviceId).toMatch(/^device-[a-f0-9-]+$/);
    });
  });

  describe('generateShortId', () => {
    it('should generate 8 character ID', () => {
      const shortId = generateShortId();
      expect(shortId).toHaveLength(8);
    });
  });

  describe('generateNumericId', () => {
    it('should generate numeric ID', () => {
      const numericId = generateNumericId();
      expect(typeof numericId).toBe('number');
      expect(numericId).toBeGreaterThan(0);
    });
  });

  describe('generateRecordingId', () => {
    it('should generate recording ID with correct format', () => {
      const recordingId = generateRecordingId();
      expect(recordingId).toMatch(/^rec-\d+-[a-f0-9]+$/);
    });
  });

  describe('generateDataPointId', () => {
    it('should generate data point ID with sensor type', () => {
      const dataPointId = generateDataPointId('accelerometer');
      expect(dataPointId).toMatch(/^accelerometer-\d+-[a-z0-9]+$/);
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUID', () => {
      const uuid = generateUUID();
      expect(isValidUUID(uuid)).toBe(true);
    });

    it('should reject invalid UUID', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('12345')).toBe(false);
    });
  });
});
