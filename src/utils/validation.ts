/**
 * Validation utility functions
 */

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns True if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number (basic international format)
 * @param phone - Phone number to validate
 * @returns True if phone is valid
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validates if value is not empty
 * @param value - Value to check
 * @returns True if value is not empty
 */
export const isNotEmpty = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

/**
 * Validates if number is in range
 * @param value - Number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is in range
 */
export const isInRange = (
  value: number,
  min: number,
  max: number,
): boolean => {
  return value >= min && value <= max;
};

/**
 * Validates if string meets minimum length
 * @param value - String to check
 * @param minLength - Minimum length
 * @returns True if string meets minimum length
 */
export const meetsMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Validates if string meets maximum length
 * @param value - String to check
 * @param maxLength - Maximum length
 * @returns True if string meets maximum length
 */
export const meetsMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with validation result and requirements
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
} => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid:
      hasMinLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  };
};

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
