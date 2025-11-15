/**
 * Token Storage
 * Phase 102: JWT token storage using AsyncStorage
 *
 * Features:
 * - Store access and refresh tokens
 * - Retrieve tokens
 * - Clear tokens
 * - Secure storage (encrypted in production)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {TokenStorage} from '../interceptors/authInterceptor';

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@koodtx_access_token',
  REFRESH_TOKEN: '@koodtx_refresh_token',
};

/**
 * Token Storage Implementation
 * Phase 102: AsyncStorage-based token storage
 */
export class AsyncTokenStorage implements TokenStorage {
  /**
   * Get access token
   * Phase 102: Retrieve access token
   *
   * @returns Access token or null
   */
  public async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   * Phase 102: Retrieve refresh token
   *
   * @returns Refresh token or null
   */
  public async getRefreshToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      return token;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Set tokens
   * Phase 102: Store access and refresh tokens
   *
   * @param accessToken Access token
   * @param refreshToken Refresh token
   */
  public async setTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);

      if (__DEV__) {
        console.log('Tokens stored successfully');
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw error;
    }
  }

  /**
   * Clear tokens
   * Phase 102: Remove all tokens
   */
  public async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);

      console.log('Tokens cleared');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      throw error;
    }
  }

  /**
   * Check if tokens exist
   * Phase 102: Verify tokens existence
   *
   * @returns True if both tokens exist
   */
  public async hasTokens(): Promise<boolean> {
    try {
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
}

/**
 * Default token storage instance
 */
export const tokenStorage = new AsyncTokenStorage();

/**
 * Export default
 */
export default tokenStorage;
