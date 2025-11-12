/**
 * Tests for validation utilities
 */

import {
  isValidEmail,
  isValidPhone,
  isNotEmpty,
  isInRange,
  meetsMinLength,
  meetsMaxLength,
  validatePassword,
  isValidUrl,
} from '../validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone number', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1 (123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone number', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('should return true for non-empty string', () => {
      expect(isNotEmpty('hello')).toBe(true);
    });

    it('should return false for empty values', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
      expect(isNotEmpty(null)).toBe(false);
      expect(isNotEmpty(undefined)).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should validate number in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    it('should reject number out of range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('meetsMinLength', () => {
    it('should validate string meeting minimum length', () => {
      expect(meetsMinLength('hello', 5)).toBe(true);
      expect(meetsMinLength('hello', 3)).toBe(true);
    });

    it('should reject string not meeting minimum length', () => {
      expect(meetsMinLength('hi', 5)).toBe(false);
    });
  });

  describe('meetsMaxLength', () => {
    it('should validate string meeting maximum length', () => {
      expect(meetsMaxLength('hello', 5)).toBe(true);
      expect(meetsMaxLength('hello', 10)).toBe(true);
    });

    it('should reject string exceeding maximum length', () => {
      expect(meetsMaxLength('hello world', 5)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('Test123!@#');
      expect(result.isValid).toBe(true);
      expect(result.hasMinLength).toBe(true);
      expect(result.hasUpperCase).toBe(true);
      expect(result.hasLowerCase).toBe(true);
      expect(result.hasNumber).toBe(true);
      expect(result.hasSpecialChar).toBe(true);
    });

    it('should reject weak password', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.hasMinLength).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });
});
