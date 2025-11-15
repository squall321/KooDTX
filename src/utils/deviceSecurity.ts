/**
 * Device Security Utilities
 * Phase 172: Root/Jailbreak Detection
 *
 * Features:
 * - Root detection (Android)
 * - Jailbreak detection (iOS)
 * - Emulator detection
 * - Debugger detection
 * - Security warnings
 */

import { Platform } from 'react-native';
import JailMonkey from 'jail-monkey';

export interface SecurityCheckResult {
  isCompromised: boolean;
  checks: {
    isJailBroken: boolean;
    canMockLocation: boolean;
    isOnExternalStorage: boolean;
    isDebuggedMode: boolean;
    hookDetected: boolean;
  };
  warnings: string[];
  recommendations: string[];
}

/**
 * Check if device is rooted or jailbroken
 */
export const isDeviceCompromised = (): boolean => {
  return JailMonkey.isJailBroken();
};

/**
 * Check if app can mock location (Android)
 */
export const canMockLocation = (): boolean => {
  if (Platform.OS === 'android') {
    return JailMonkey.canMockLocation();
  }
  return false;
};

/**
 * Check if app is on external storage (Android)
 */
export const isOnExternalStorage = (): boolean => {
  if (Platform.OS === 'android') {
    return JailMonkey.isOnExternalStorage();
  }
  return false;
};

/**
 * Check if app is being debugged
 */
export const isDebuggedMode = (): boolean => {
  return JailMonkey.isDebuggedMode();
};

/**
 * Check if device has hooks installed
 */
export const hookDetected = (): boolean => {
  return JailMonkey.hookDetected();
};

/**
 * Comprehensive security check
 */
export const performSecurityCheck = (): SecurityCheckResult => {
  const checks = {
    isJailBroken: isDeviceCompromised(),
    canMockLocation: canMockLocation(),
    isOnExternalStorage: isOnExternalStorage(),
    isDebuggedMode: isDebuggedMode(),
    hookDetected: hookDetected(),
  };

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check for jailbreak/root
  if (checks.isJailBroken) {
    warnings.push(
      Platform.OS === 'ios'
        ? 'Device appears to be jailbroken'
        : 'Device appears to be rooted'
    );
    recommendations.push('Use device in its original state for better security');
  }

  // Check for mock location
  if (checks.canMockLocation) {
    warnings.push('Mock location is enabled');
    recommendations.push('Disable mock location for accurate data');
  }

  // Check for external storage
  if (checks.isOnExternalStorage) {
    warnings.push('App is installed on external storage');
    recommendations.push('Install app on internal storage for better security');
  }

  // Check for debugging
  if (checks.isDebuggedMode) {
    warnings.push('App is running in debug mode');
    recommendations.push('Use release build for production');
  }

  // Check for hooks
  if (checks.hookDetected) {
    warnings.push('Suspicious hooks detected');
    recommendations.push('Device may be compromised');
  }

  return {
    isCompromised: Object.values(checks).some((check) => check === true),
    checks,
    warnings,
    recommendations,
  };
};

/**
 * Get security level
 */
export const getSecurityLevel = (): 'secure' | 'warning' | 'compromised' => {
  const result = performSecurityCheck();

  if (result.checks.isJailBroken || result.checks.hookDetected) {
    return 'compromised';
  }

  if (
    result.checks.canMockLocation ||
    result.checks.isOnExternalStorage ||
    result.checks.isDebuggedMode
  ) {
    return 'warning';
  }

  return 'secure';
};

/**
 * Check if specific feature should be restricted
 */
export const shouldRestrictFeature = (feature: 'sensitive_data' | 'payments' | 'all'): boolean => {
  const result = performSecurityCheck();

  switch (feature) {
    case 'sensitive_data':
      // Restrict if device is jailbroken/rooted
      return result.checks.isJailBroken;

    case 'payments':
      // Restrict if device is compromised or has hooks
      return result.checks.isJailBroken || result.checks.hookDetected;

    case 'all':
      // Restrict if any security issue detected
      return result.isCompromised;

    default:
      return false;
  }
};

/**
 * Get security warning message
 */
export const getSecurityWarningMessage = (): string | null => {
  const result = performSecurityCheck();

  if (!result.isCompromised) {
    return null;
  }

  if (result.checks.isJailBroken) {
    return Platform.OS === 'ios'
      ? 'This device appears to be jailbroken. Some features may be restricted for your security.'
      : 'This device appears to be rooted. Some features may be restricted for your security.';
  }

  if (result.checks.hookDetected) {
    return 'Suspicious activity detected. For your security, some features are restricted.';
  }

  if (result.warnings.length > 0) {
    return result.warnings[0];
  }

  return null;
};

/**
 * Log security check for monitoring
 */
export const logSecurityCheck = (result: SecurityCheckResult): void => {
  console.log('[Security Check]', {
    isCompromised: result.isCompromised,
    platform: Platform.OS,
    checks: result.checks,
    warnings: result.warnings,
  });

  // Send to analytics/monitoring
  // Analytics.logEvent('security_check', {
  //   is_compromised: result.isCompromised,
  //   platform: Platform.OS,
  //   ...result.checks,
  // });
};

/**
 * Get trust score (0-100)
 */
export const getTrustScore = (): number => {
  const result = performSecurityCheck();
  let score = 100;

  // Deduct points for each security issue
  if (result.checks.isJailBroken) score -= 50; // Critical
  if (result.checks.hookDetected) score -= 30; // High
  if (result.checks.canMockLocation) score -= 10; // Medium
  if (result.checks.isOnExternalStorage) score -= 5; // Low
  if (result.checks.isDebuggedMode) score -= 5; // Low

  return Math.max(0, score);
};

export default {
  isDeviceCompromised,
  canMockLocation,
  isOnExternalStorage,
  isDebuggedMode,
  hookDetected,
  performSecurityCheck,
  getSecurityLevel,
  shouldRestrictFeature,
  getSecurityWarningMessage,
  logSecurityCheck,
  getTrustScore,
};
