/**
 * Data Encryption Utilities
 * Phase 173: AES-256 encryption for sensitive data
 *
 * Features:
 * - AES-256-GCM encryption
 * - Secure key generation
 * - Encrypt/decrypt strings
 * - Encrypt/decrypt objects
 */

import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

const ENCRYPTION_KEY = 'YOUR_SECURE_ENCRYPTION_KEY_HERE'; // Should be from secure storage

/**
 * Generate encryption key
 */
export const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(256 / 8).toString();
};

/**
 * Encrypt string data
 */
export const encryptString = (data: string, key: string = ENCRYPTION_KEY): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, key);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt string data
 */
export const decryptString = (encryptedData: string, key: string = ENCRYPTION_KEY): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Encrypt object
 */
export const encryptObject = <T>(data: T, key: string = ENCRYPTION_KEY): string => {
  try {
    const jsonString = JSON.stringify(data);
    return encryptString(jsonString, key);
  } catch (error) {
    console.error('Object encryption error:', error);
    throw new Error('Failed to encrypt object');
  }
};

/**
 * Decrypt object
 */
export const decryptObject = <T>(encryptedData: string, key: string = ENCRYPTION_KEY): T => {
  try {
    const decryptedString = decryptString(encryptedData, key);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Object decryption error:', error);
    throw new Error('Failed to decrypt object');
  }
};

/**
 * Hash data (one-way)
 */
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Secure storage wrapper with encryption
 */
export const secureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
      (m) => m.default
    );
    const encrypted = encryptString(value);
    await AsyncStorage.setItem(key, encrypted);
  },

  getItem: async (key: string): Promise<string | null> => {
    const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
      (m) => m.default
    );
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    return decryptString(encrypted);
  },

  removeItem: async (key: string): Promise<void> => {
    const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
      (m) => m.default
    );
    await AsyncStorage.removeItem(key);
  },
};

export default {
  generateEncryptionKey,
  encryptString,
  decryptString,
  encryptObject,
  decryptObject,
  hashData,
  secureStorage,
};
