/**
 * Keychain Token Storage
 * Phase 143: Secure token storage using react-native-keychain
 *
 * Features:
 * - Store tokens securely in device keychain
 * - Retrieve tokens from keychain
 * - Clear tokens
 * - Biometric authentication support (optional)
 * - Better security than AsyncStorage
 */

import * as Keychain from 'react-native-keychain';
import { TokenStorage } from '../interceptors/authInterceptor';

/**
 * Keychain service names
 */
const KEYCHAIN_SERVICE = {
  ACCESS_TOKEN: 'koodtx.access_token',
  REFRESH_TOKEN: 'koodtx.refresh_token',
  USER_CREDENTIALS: 'koodtx.user_credentials',
};

/**
 * Keychain security level options
 */
export enum SecurityLevel {
  /** Any biometrics (fingerprint or face) */
  ANY = Keychain.SECURITY_LEVEL.ANY,
  /** Secure hardware */
  SECURE_HARDWARE = Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  /** Secure software */
  SECURE_SOFTWARE = Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
}

/**
 * Keychain Token Storage Implementation
 * Phase 143: Secure keychain-based token storage
 */
export class KeychainTokenStorage implements TokenStorage {
  private securityLevel: SecurityLevel;

  constructor(securityLevel: SecurityLevel = SecurityLevel.ANY) {
    this.securityLevel = securityLevel;
  }

  /**
   * Get access token from keychain
   * Phase 143: Retrieve access token securely
   *
   * @returns Access token or null
   */
  public async getAccessToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE.ACCESS_TOKEN,
      });

      if (credentials && typeof credentials !== 'boolean') {
        return credentials.password;
      }

      return null;
    } catch (error) {
      console.error('Failed to get access token from keychain:', error);
      return null;
    }
  }

  /**
   * Get refresh token from keychain
   * Phase 143: Retrieve refresh token securely
   *
   * @returns Refresh token or null
   */
  public async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE.REFRESH_TOKEN,
      });

      if (credentials && typeof credentials !== 'boolean') {
        return credentials.password;
      }

      return null;
    } catch (error) {
      console.error('Failed to get refresh token from keychain:', error);
      return null;
    }
  }

  /**
   * Set tokens in keychain
   * Phase 143: Store access and refresh tokens securely
   *
   * @param accessToken Access token
   * @param refreshToken Refresh token
   */
  public async setTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      // Store access token
      await Keychain.setGenericPassword('access_token', accessToken, {
        service: KEYCHAIN_SERVICE.ACCESS_TOKEN,
        securityLevel: this.securityLevel,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });

      // Store refresh token
      await Keychain.setGenericPassword('refresh_token', refreshToken, {
        service: KEYCHAIN_SERVICE.REFRESH_TOKEN,
        securityLevel: this.securityLevel,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });

      if (__DEV__) {
        console.log('Tokens stored securely in keychain');
      }
    } catch (error) {
      console.error('Failed to store tokens in keychain:', error);
      throw error;
    }
  }

  /**
   * Clear tokens from keychain
   * Phase 143: Remove all tokens securely
   */
  public async clearTokens(): Promise<void> {
    try {
      // Clear access token
      await Keychain.resetGenericPassword({
        service: KEYCHAIN_SERVICE.ACCESS_TOKEN,
      });

      // Clear refresh token
      await Keychain.resetGenericPassword({
        service: KEYCHAIN_SERVICE.REFRESH_TOKEN,
      });

      console.log('Tokens cleared from keychain');
    } catch (error) {
      console.error('Failed to clear tokens from keychain:', error);
      throw error;
    }
  }

  /**
   * Check if tokens exist in keychain
   * Phase 143: Verify tokens existence
   *
   * @returns True if both tokens exist
   */
  public async hasTokens(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();

      return !!(accessToken && refreshToken);
    } catch (error) {
      console.error('Failed to check tokens in keychain:', error);
      return false;
    }
  }

  /**
   * Store user credentials (optional)
   * Phase 143: Store username and password for auto-login
   *
   * @param username User's email/username
   * @param password User's password
   */
  public async setUserCredentials(
    username: string,
    password: string,
  ): Promise<void> {
    try {
      await Keychain.setGenericPassword(username, password, {
        service: KEYCHAIN_SERVICE.USER_CREDENTIALS,
        securityLevel: this.securityLevel,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });

      if (__DEV__) {
        console.log('User credentials stored securely');
      }
    } catch (error) {
      console.error('Failed to store user credentials:', error);
      throw error;
    }
  }

  /**
   * Get user credentials (optional)
   * Phase 143: Retrieve stored credentials for auto-login
   *
   * @returns User credentials or null
   */
  public async getUserCredentials(): Promise<{
    username: string;
    password: string;
  } | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE.USER_CREDENTIALS,
      });

      if (credentials && typeof credentials !== 'boolean') {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get user credentials:', error);
      return null;
    }
  }

  /**
   * Clear user credentials
   * Phase 143: Remove stored credentials
   */
  public async clearUserCredentials(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({
        service: KEYCHAIN_SERVICE.USER_CREDENTIALS,
      });

      console.log('User credentials cleared');
    } catch (error) {
      console.error('Failed to clear user credentials:', error);
      throw error;
    }
  }

  /**
   * Check keychain capabilities
   * Phase 143: Verify device security features
   *
   * @returns Supported biometry type
   */
  public async getSupportedBiometryType(): Promise<string | null> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType;
    } catch (error) {
      console.error('Failed to get biometry type:', error);
      return null;
    }
  }

  /**
   * Get tokens with biometric authentication
   * Phase 143: Retrieve tokens using biometric auth
   *
   * @returns Access and refresh tokens
   */
  public async getTokensWithBiometrics(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    try {
      // Check if biometrics is available
      const biometryType = await this.getSupportedBiometryType();

      if (!biometryType) {
        // Fallback to normal retrieval
        return {
          accessToken: await this.getAccessToken(),
          refreshToken: await this.getRefreshToken(),
        };
      }

      // Get tokens with biometric prompt
      const accessCreds = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE.ACCESS_TOKEN,
        authenticationPrompt: {
          title: '인증 필요',
          subtitle: '토큰에 접근하려면 인증이 필요합니다',
          cancel: '취소',
        },
      });

      const refreshCreds = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE.REFRESH_TOKEN,
      });

      return {
        accessToken:
          accessCreds && typeof accessCreds !== 'boolean'
            ? accessCreds.password
            : null,
        refreshToken:
          refreshCreds && typeof refreshCreds !== 'boolean'
            ? refreshCreds.password
            : null,
      };
    } catch (error) {
      console.error('Failed to get tokens with biometrics:', error);
      return {
        accessToken: null,
        refreshToken: null,
      };
    }
  }
}

/**
 * Default keychain token storage instance
 * Phase 143: Singleton instance
 */
export const keychainTokenStorage = new KeychainTokenStorage();

/**
 * Export as default token storage
 */
export default keychainTokenStorage;
