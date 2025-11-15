/**
 * Authentication Interceptor
 * Phase 102: JWT token management
 *
 * Features:
 * - Auto-add JWT token to requests
 * - Handle 401 responses
 * - Token refresh logic
 * - Token expiration detection
 * - Retry logic after token refresh
 * - Error handling
 */

import {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * Token storage interface
 */
export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
}

/**
 * Auth interceptor options
 */
export interface AuthInterceptorOptions {
  tokenStorage: TokenStorage;
  refreshTokenEndpoint?: string; // Default: /auth/refresh
  authHeaderPrefix?: string; // Default: Bearer
  excludeUrls?: string[]; // URLs to exclude from auth
  onTokenRefreshFailed?: () => void; // Callback when refresh fails
  onUnauthorized?: () => void; // Callback on 401
}

/**
 * Refresh token response
 */
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth Interceptor Class
 * Phase 102: JWT token auto-injection and refresh
 */
export class AuthInterceptor {
  private axiosInstance: AxiosInstance;
  private options: Required<AuthInterceptorOptions>;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  /**
   * Constructor
   *
   * @param axiosInstance Axios instance
   * @param options Auth interceptor options
   */
  constructor(
    axiosInstance: AxiosInstance,
    options: AuthInterceptorOptions,
  ) {
    this.axiosInstance = axiosInstance;
    this.options = {
      refreshTokenEndpoint: '/auth/refresh',
      authHeaderPrefix: 'Bearer',
      excludeUrls: [],
      onTokenRefreshFailed: () => console.log('Token refresh failed'),
      onUnauthorized: () => console.log('Unauthorized (401)'),
      ...options,
    };
  }

  /**
   * Setup interceptors
   * Phase 102: Request and response interceptors
   */
  public setup(): void {
    // Request interceptor: Add JWT token
    this.axiosInstance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this),
    );

    // Response interceptor: Handle 401 and refresh token
    this.axiosInstance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this),
    );

    console.log('Auth interceptor setup complete');
  }

  /**
   * Handle outgoing request
   * Phase 102: JWT token auto-injection
   *
   * @param config Request configuration
   * @returns Modified request configuration
   */
  private async handleRequest(
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> {
    // Check if URL should be excluded
    const shouldExclude = this.options.excludeUrls.some((url) =>
      config.url?.includes(url),
    );

    if (shouldExclude) {
      return config;
    }

    // Get access token
    const accessToken = await this.options.tokenStorage.getAccessToken();

    // Add token to Authorization header
    if (accessToken) {
      config.headers.Authorization = `${this.options.authHeaderPrefix} ${accessToken}`;

      if (__DEV__) {
        console.log('Added auth token to request:', config.url);
      }
    }

    return config;
  }

  /**
   * Handle request error
   *
   * @param error Request error
   * @returns Rejected promise
   */
  private handleRequestError(error: AxiosError): Promise<AxiosError> {
    console.error('Request error in auth interceptor:', error);
    return Promise.reject(error);
  }

  /**
   * Handle incoming response
   *
   * @param response Axios response
   * @returns Response
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    return response;
  }

  /**
   * Handle response error
   * Phase 102: 401 handling and token refresh
   *
   * @param error Response error
   * @returns Rejected or retry promise
   */
  private async handleResponseError(error: AxiosError): Promise<any> {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if this is the refresh token endpoint itself
      if (originalRequest.url === this.options.refreshTokenEndpoint) {
        console.error('Refresh token request failed');
        this.handleRefreshTokenFailed();
        return Promise.reject(error);
      }

      // Mark request as retried
      originalRequest._retry = true;

      if (this.isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          this.failedQueue.push({resolve, reject});
        })
          .then((token) => {
            originalRequest.headers.Authorization = `${this.options.authHeaderPrefix} ${token}`;
            return this.axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      this.isRefreshing = true;

      try {
        // Refresh token
        const newAccessToken = await this.refreshToken();

        // Update failed queue
        this.processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `${this.options.authHeaderPrefix} ${newAccessToken}`;
        return this.axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed
        this.processQueue(refreshError, null);
        this.handleRefreshTokenFailed();
        return Promise.reject(refreshError);
      } finally {
        this.isRefreshing = false;
      }
    }

    // Call unauthorized callback
    if (error.response?.status === 401) {
      this.options.onUnauthorized();
    }

    return Promise.reject(error);
  }

  /**
   * Refresh access token
   * Phase 102: Token refresh logic
   *
   * @returns New access token
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = await this.options.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Call refresh token endpoint
      const response = await this.axiosInstance.post<RefreshTokenResponse>(
        this.options.refreshTokenEndpoint,
        {refreshToken},
        {
          headers: {
            // Don't add auth header to refresh request
            Authorization: undefined,
          },
        },
      );

      const {accessToken, refreshToken: newRefreshToken} = response.data;

      // Store new tokens
      await this.options.tokenStorage.setTokens(accessToken, newRefreshToken);

      console.log('Token refreshed successfully');

      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Process failed queue
   * Phase 102: Retry queued requests
   *
   * @param error Error if refresh failed
   * @param token New token if refresh succeeded
   */
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Handle token refresh failed
   * Phase 102: Refresh failure handling
   */
  private async handleRefreshTokenFailed(): Promise<void> {
    // Clear tokens
    await this.options.tokenStorage.clearTokens();

    // Call callback
    this.options.onTokenRefreshFailed();

    console.log('Token refresh failed - tokens cleared');
  }

  /**
   * Check if token is expired
   * Phase 102: Token expiration detection
   *
   * @param token JWT token
   * @returns True if token is expired
   */
  public static isTokenExpired(token: string): boolean {
    try {
      // Decode JWT token (simple base64 decode)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );

      const payload = JSON.parse(jsonPayload);

      // Check expiration (exp is in seconds)
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true; // Assume expired if can't decode
    }
  }

  /**
   * Get token expiration date
   * Phase 102: Token expiration info
   *
   * @param token JWT token
   * @returns Expiration date or null
   */
  public static getTokenExpiration(token: string): Date | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );

      const payload = JSON.parse(jsonPayload);

      if (payload.exp) {
        return new Date(payload.exp * 1000);
      }

      return null;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
}

/**
 * Export default
 */
export default AuthInterceptor;
