/**
 * Tests for date utility functions
 */

import {
  formatTimestamp,
  calculateDuration,
  formatDuration,
  getCurrentTimestamp,
  isToday,
  getRelativeTime,
} from '../date';

describe('date utilities', () => {
  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const timestamp = new Date('2024-01-15T10:30:45.000Z').getTime();
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toBe('2024-01-15 10:30:45');
    });

    it('should handle zero timestamp', () => {
      const formatted = formatTimestamp(0);
      expect(formatted).toBe('1970-01-01 00:00:00');
    });
  });

  describe('calculateDuration', () => {
    it('should calculate duration correctly', () => {
      const start = new Date('2024-01-15T10:00:00').getTime();
      const end = new Date('2024-01-15T12:35:45').getTime();
      const duration = calculateDuration(start, end);

      expect(duration.hours).toBe(2);
      expect(duration.minutes).toBe(35);
      expect(duration.seconds).toBe(45);
    });

    it('should handle reverse order (end before start)', () => {
      const start = new Date('2024-01-15T12:00:00').getTime();
      const end = new Date('2024-01-15T10:00:00').getTime();
      const duration = calculateDuration(start, end);

      expect(duration.hours).toBe(2);
      expect(duration.minutes).toBe(0);
      expect(duration.seconds).toBe(0);
    });

    it('should handle zero duration', () => {
      const timestamp = Date.now();
      const duration = calculateDuration(timestamp, timestamp);

      expect(duration.hours).toBe(0);
      expect(duration.minutes).toBe(0);
      expect(duration.seconds).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('should format duration with padding', () => {
      const duration = {hours: 1, minutes: 5, seconds: 9};
      expect(formatDuration(duration)).toBe('01:05:09');
    });

    it('should format zero duration', () => {
      const duration = {hours: 0, minutes: 0, seconds: 0};
      expect(formatDuration(duration)).toBe('00:00:00');
    });

    it('should handle large durations', () => {
      const duration = {hours: 24, minutes: 59, seconds: 59};
      expect(formatDuration(duration)).toBe('24:59:59');
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return a valid timestamp', () => {
      const timestamp = getCurrentTimestamp();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    });

    it('should return current time', () => {
      const before = Date.now();
      const timestamp = getCurrentTimestamp();
      const after = Date.now();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('isToday', () => {
    it('should return true for current timestamp', () => {
      const now = Date.now();
      expect(isToday(now)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('getRelativeTime', () => {
    it('should return "Just now" for recent timestamps', () => {
      const recent = Date.now() - 30 * 1000; // 30 seconds ago
      expect(getRelativeTime(recent)).toBe('Just now');
    });

    it('should return minutes for timestamps within an hour', () => {
      const timestamp = Date.now() - 15 * 60 * 1000; // 15 minutes ago
      expect(getRelativeTime(timestamp)).toContain('minute');
    });

    it('should return hours for timestamps within a day', () => {
      const timestamp = Date.now() - 5 * 60 * 60 * 1000; // 5 hours ago
      expect(getRelativeTime(timestamp)).toContain('hour');
    });

    it('should return days for older timestamps', () => {
      const timestamp = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 days ago
      expect(getRelativeTime(timestamp)).toContain('day');
    });

    it('should use plural for multiple units', () => {
      const timestamp = Date.now() - 2 * 60 * 1000; // 2 minutes ago
      expect(getRelativeTime(timestamp)).toContain('minutes');
    });

    it('should use singular for single unit', () => {
      const timestamp = Date.now() - 60 * 1000; // 1 minute ago
      expect(getRelativeTime(timestamp)).toContain('1 minute ago');
    });
  });
});
