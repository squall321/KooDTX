/**
 * Token Storage
 * Phase 102: JWT token storage using AsyncStorage
 * Phase 143: Enhanced with Keychain for better security
 *
 * Features:
 * - Store access and refresh tokens
 * - Retrieve tokens
 * - Clear tokens
 * - Secure storage with Keychain (Phase 143)
 * - Fallback to AsyncStorage for compatibility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {TokenStorage} from '../interceptors/authInterceptor';
import {keychainTokenStorage} from './keychainTokenStorage';

/**
 * Storage keys (for AsyncStorage fallback)
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@koodtx_access_token',
  REFRESH_TOKEN: '@koodtx_refresh_token',
};

/**
 * Token Storage Implementation
 * Phase 102: AsyncStorage-based token storage
 * Phase 143: Now using Keychain for enhanced security
 */
export class HybridTokenStorage implements TokenStorage {
  private useKeychain: boolean = true;

  /**
   * Get access token
   * Phase 143: Use Keychain, fallback to AsyncStorage
   *
   * @returns Access token or null
   */
  public async getAccessToken(): Promise<string | null> {
    try {
      if (this.useKeychain) {
        const token = await keychainTokenStorage.getAccessToken();
        if (token) return token;
      }

      // Fallback to AsyncStorage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   * Phase 143: Use Keychain, fallback to AsyncStorage
   *
   * @returns Refresh token or null
   */
  public async getRefreshToken(): Promise<string | null> {
    try {
      if (this.useKeychain) {
        const token = await keychainTokenStorage.getRefreshToken();
        if (token) return token;
      }

      // Fallback to AsyncStorage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      return token;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Set tokens
   * Phase 143: Store in both Keychain and AsyncStorage
   *
   * @param accessToken Access token
   * @param refreshToken Refresh token
   */
  public async setTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      if (this.useKeychain) {
        // Primary: Store in Keychain
        await keychainTokenStorage.setTokens(accessToken, refreshToken);
      }

      // Backup: Also store in AsyncStorage for compatibility
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);

      if (__DEV__) {
        console.log('Tokens stored successfully (Keychain + AsyncStorage)');
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw error;
    }
  }

  /**
   * Clear tokens
   * Phase 143: Clear from both Keychain and AsyncStorage
   */
  public async clearTokens(): Promise<void> {
    try {
      if (this.useKeychain) {
        // Clear from Keychain
        await keychainTokenStorage.clearTokens();
      }

      // Clear from AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);

      console.log('Tokens cleared from all storage');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      throw error;
    }
  }

  /**
   * Check if tokens exist
   * Phase 143: Check Keychain first, then AsyncStorage
   *
   * @returns True if both tokens exist
   */
  public async hasTokens(): Promise<boolean> {
    try {
      if (this.useKeychain) {
        const hasInKeychain = await keychainTokenStorage.hasTokens();
        if (hasInKeychain) return true;
      }

      // Fallback: Check AsyncStorage
      const [accessToken, refreshToken] = await AsyncStorage.multiGet([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);

      return !!(accessToken[1] && refreshToken[1]);
    } catch (error) {
      console.error('Failed to check tokens:', error);
      return false;
    }
  }

  /**
   * Disable Keychain (for testing or compatibility)
   * Phase 143: Allow disabling Keychain storage
   */
  public disableKeychain(): void {
    this.useKeychain = false;
  }

  /**
   * Enable Keychain (default)
   * Phase 143: Re-enable Keychain storage
   */
  public enableKeychain(): void {
    this.useKeychain = true;
  }
}

/**
 * Default token storage instance
 * Phase 143: Now using Hybrid storage (Keychain + AsyncStorage)
 */
export const tokenStorage = new HybridTokenStorage();

/**
 * Export keychain storage for direct access
 * Phase 143: Allow direct access to Keychain features
 */
export {keychainTokenStorage};

/**
 * Export default
 */
export default tokenStorage;
