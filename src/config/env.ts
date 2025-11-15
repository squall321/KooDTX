/**
 * Environment Configuration
 * Centralized environment variable management
 *
 * This file manages all environment-specific configurations
 * for the KooDTX application.
 *
 * Priority:
 * 1. Environment variables from .env file (if react-native-config is installed)
 * 2. process.env (build-time variables)
 * 3. Default values (development/fallback)
 *
 * Note: For production, you should set environment variables at build time
 * or install react-native-config package.
 */

// Try to import react-native-config if available
let Config: any = {};
try {
  Config = require('react-native-config').default;
} catch (e) {
  // react-native-config not installed, will use process.env
  Config = {};
}

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Environment configuration interface
 */
export interface EnvConfig {
  // Environment
  NODE_ENV: Environment;
  IS_DEV: boolean;
  IS_PROD: boolean;

  // API Configuration
  API_BASE_URL: string;
  API_TIMEOUT: number;
  API_RETRY_ATTEMPTS: number;

  // Sentry Configuration
  SENTRY_DSN: string;
  ENABLE_CRASH_REPORTING: boolean;

  // Logging Configuration
  ENABLE_LOGGING: boolean;
  LOG_LEVEL: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  REMOTE_LOGGING_URL?: string;

  // Feature Flags
  ENABLE_ANALYTICS: boolean;
  ENABLE_DEBUG_MODE: boolean;

  // App Info
  APP_VERSION: string;
  BUILD_NUMBER: string;
}

/**
 * Get environment variable as string
 */
const getEnvString = (key: string, defaultValue: string = ''): string => {
  return Config[key] || process.env[key] || defaultValue;
};

/**
 * Get environment variable as number
 */
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = Config[key] || process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

/**
 * Get environment variable as boolean
 */
const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = Config[key] || process.env[key];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value === 'true' || value === '1' || value === 'yes';
};

/**
 * Determine current environment
 */
const getCurrentEnvironment = (): Environment => {
  const nodeEnv = getEnvString('NODE_ENV', 'development');
  if (nodeEnv === 'production') return 'production';
  if (nodeEnv === 'staging') return 'staging';
  return 'development';
};

/**
 * Environment configuration
 */
const env = getCurrentEnvironment();
const isDev = __DEV__ || env === 'development';
const isProd = env === 'production';

/**
 * Default API Base URL based on environment
 */
const getDefaultApiBaseUrl = (): string => {
  switch (env) {
    case 'production':
      return 'https://api.koodtx.com'; // TODO: Update with your production URL
    case 'staging':
      return 'https://api-staging.koodtx.com'; // TODO: Update with your staging URL
    case 'development':
    default:
      return 'http://localhost:3000/api'; // Development server
  }
};

/**
 * Export environment configuration
 */
export const envConfig: EnvConfig = {
  // Environment
  NODE_ENV: env,
  IS_DEV: isDev,
  IS_PROD: isProd,

  // API Configuration
  API_BASE_URL: getEnvString('API_BASE_URL', getDefaultApiBaseUrl()),
  API_TIMEOUT: getEnvNumber('API_TIMEOUT', 30000),
  API_RETRY_ATTEMPTS: getEnvNumber('API_RETRY_ATTEMPTS', 3),

  // Sentry Configuration
  SENTRY_DSN: getEnvString('SENTRY_DSN', ''),
  ENABLE_CRASH_REPORTING: getEnvBoolean('ENABLE_CRASH_REPORTING', isProd),

  // Logging Configuration
  ENABLE_LOGGING: getEnvBoolean('ENABLE_LOGGING', true),
  LOG_LEVEL: (getEnvString('LOG_LEVEL', isDev ? 'DEBUG' : 'INFO') as EnvConfig['LOG_LEVEL']),
  REMOTE_LOGGING_URL: getEnvString('REMOTE_LOGGING_URL'),

  // Feature Flags
  ENABLE_ANALYTICS: getEnvBoolean('ENABLE_ANALYTICS', isProd),
  ENABLE_DEBUG_MODE: getEnvBoolean('ENABLE_DEBUG_MODE', isDev),

  // App Info
  APP_VERSION: getEnvString('APP_VERSION', '0.1.0'),
  BUILD_NUMBER: getEnvString('BUILD_NUMBER', '1'),
};

/**
 * Validate required environment variables
 */
export const validateEnvConfig = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  // Check required production variables
  if (isProd) {
    if (!envConfig.API_BASE_URL || envConfig.API_BASE_URL.includes('localhost')) {
      missing.push('API_BASE_URL (production URL required)');
    }

    if (!envConfig.SENTRY_DSN && envConfig.ENABLE_CRASH_REPORTING) {
      missing.push('SENTRY_DSN (required when crash reporting is enabled)');
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Log environment configuration (development only)
 */
export const logEnvConfig = (): void => {
  if (!isDev) return;

  console.log('🔧 Environment Configuration:');
  console.log('  Environment:', envConfig.NODE_ENV);
  console.log('  API Base URL:', envConfig.API_BASE_URL);
  console.log('  API Timeout:', envConfig.API_TIMEOUT);
  console.log('  Crash Reporting:', envConfig.ENABLE_CRASH_REPORTING ? 'Enabled' : 'Disabled');
  console.log('  Analytics:', envConfig.ENABLE_ANALYTICS ? 'Enabled' : 'Disabled');
  console.log('  App Version:', envConfig.APP_VERSION);
  console.log('  Build Number:', envConfig.BUILD_NUMBER);

  // Validate configuration
  const validation = validateEnvConfig();
  if (!validation.valid) {
    console.warn('⚠️  Missing environment variables:', validation.missing);
  }
};

/**
 * Export commonly used values
 */
export const {
  API_BASE_URL,
  API_TIMEOUT,
  API_RETRY_ATTEMPTS,
  SENTRY_DSN,
  ENABLE_CRASH_REPORTING,
  ENABLE_LOGGING,
  LOG_LEVEL,
  REMOTE_LOGGING_URL,
  ENABLE_ANALYTICS,
  ENABLE_DEBUG_MODE,
  APP_VERSION,
  BUILD_NUMBER,
  IS_DEV,
  IS_PROD,
} = envConfig;

/**
 * Default export
 */
export default envConfig;
