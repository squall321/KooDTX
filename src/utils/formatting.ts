/**
 * Formatting utility functions
 */

import {format as dateFnsFormat, parseISO} from 'date-fns';

/**
 * Formats a number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale code (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Formats a number with thousand separators
 * @param value - Number to format
 * @param locale - Locale code (default: en-US)
 * @returns Formatted number string
 */
export const formatNumber = (value: number, locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Formats file size in human-readable format
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Formats percentage
 * @param value - Value (0-1 or 0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @param max - Maximum value (default: 1, use 100 for percentages)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  decimals = 0,
  max = 1,
): string => {
  const percentage = (value / max) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Formats phone number
 * @param phone - Phone number string
 * @param format - Format pattern (default: US format)
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  // US format: (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // International format with country code
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
};

/**
 * Truncates text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix = '...',
): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalizes first letter of string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalize = (text: string): string => {
  if (!text) {
    return text;
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Converts string to title case
 * @param text - Text to convert
 * @returns Title cased text
 */
export const toTitleCase = (text: string): string => {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Formats date string
 * @param date - Date to format (Date object, timestamp, or ISO string)
 * @param formatStr - Format string (default: 'PPP')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | number | string,
  formatStr = 'PPP',
): string => {
  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = parseISO(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  return dateFnsFormat(dateObj, formatStr);
};
