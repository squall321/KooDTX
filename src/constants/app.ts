/**
 * App Constants
 * Phase 156: Application-wide constants
 *
 * Features:
 * - App metadata
 * - Version information
 * - Bundle IDs
 */

/**
 * App metadata
 */
export const APP_NAME = 'KooDTX';
export const APP_DISPLAY_NAME = 'KooDTX';
export const APP_DESCRIPTION = '센서 데이터 수집 및 동기화';
export const APP_VERSION = '1.0.0';
export const APP_BUILD_NUMBER = '1';

/**
 * Bundle identifiers
 */
export const BUNDLE_ID = {
  android: 'com.koodtx.app',
  ios: 'com.koodtx.app',
};

/**
 * App URLs
 */
export const APP_URLS = {
  website: 'https://koodtx.com',
  support: 'https://koodtx.com/support',
  privacy: 'https://koodtx.com/privacy',
  terms: 'https://koodtx.com/terms',
  github: 'https://github.com/koodtx/koodtx',
};

/**
 * Store URLs
 */
export const STORE_URLS = {
  android: 'https://play.google.com/store/apps/details?id=com.koodtx.app',
  ios: 'https://apps.apple.com/app/idXXXXXXXXXX',
};

/**
 * Company information
 */
export const COMPANY = {
  name: 'KooDTX Team',
  email: 'support@koodtx.com',
  copyright: '© 2025 KooDTX. All rights reserved.',
};

/**
 * Social media
 */
export const SOCIAL_MEDIA = {
  twitter: 'https://twitter.com/koodtx',
  facebook: 'https://facebook.com/koodtx',
  instagram: 'https://instagram.com/koodtx',
};

/**
 * Feature flags
 */
export const FEATURES = {
  darkMode: true,
  i18n: true,
  analytics: false,
  crashReporting: false,
  betaFeatures: __DEV__,
};

/**
 * Environment
 */
export const ENV = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};

export default {
  APP_NAME,
  APP_DISPLAY_NAME,
  APP_DESCRIPTION,
  APP_VERSION,
  APP_BUILD_NUMBER,
  BUNDLE_ID,
  APP_URLS,
  STORE_URLS,
  COMPANY,
  SOCIAL_MEDIA,
  FEATURES,
  ENV,
};
