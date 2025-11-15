/**
 * API Client
 * Phase 101: Axios setup and configuration
 * Phase 102: Authentication interceptor integration
 *
 * Features:
 * - Base URL configuration
 * - Timeout settings
 * - Default headers
 * - Interceptors (request/response)
 * - Error handling
 * - JWT authentication
 * - Token refresh
 */

import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError} from 'axios';
import {AuthInterceptor, AuthInterceptorOptions} from './interceptors/authInterceptor';
import {tokenStorage} from './storage/tokenStorage';
import {envConfig} from '../config/env';
import {logger} from '../utils/logger';

/**
 * API configuration
 */
export interface ApiConfig {
  baseURL: string;
  timeout?: number; // milliseconds
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * Default API configuration
 * Phase 101: Base URL and timeout settings
 * Updated: Using centralized environment configuration
 */
const DEFAULT_CONFIG: ApiConfig = {
  baseURL: envConfig.API_BASE_URL,
  timeout: envConfig.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
};

/**
 * API Client Class
 * Phase 101: Axios instance wrapper
 * Phase 102: Authentication integration
 */
export class ApiClient {
  private instance: AxiosInstance;
  private config: ApiConfig;
  private authInterceptor?: AuthInterceptor;

  /**
   * Constructor
   *
   * @param config API configuration
   * @param enableAuth Enable authentication interceptor (default: true)
   */
  constructor(
    config: Partial<ApiConfig> = {},
    enableAuth: boolean = true,
  ) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      headers: {
        ...DEFAULT_CONFIG.headers,
        ...config.headers,
      },
    };

    // Create Axios instance
    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
      withCredentials: this.config.withCredentials,
    });

    // Setup basic interceptors
    this.setupRequestInterceptors();
    this.setupResponseInterceptors();

    // Setup authentication interceptor
    // Phase 102: Auth interceptor integration
    if (enableAuth) {
      this.setupAuthInterceptor();
    }

    logger.log('API Client initialized:', this.config.baseURL);
  }

  /**
   * Setup authentication interceptor
   * Phase 102: JWT token management
   *
   * @param options Auth interceptor options
   */
  public setupAuthInterceptor(
    options?: Partial<AuthInterceptorOptions>,
  ): void {
    this.authInterceptor = new AuthInterceptor(this.instance, {
      tokenStorage,
      refreshTokenEndpoint: '/auth/refresh',
      authHeaderPrefix: 'Bearer',
      excludeUrls: ['/auth/login', '/auth/register', '/auth/refresh'],
      ...options,
    });

    this.authInterceptor.setup();
    logger.log('Auth interceptor enabled');
  }

  /**
   * Setup request interceptors
   * Phase 101: Placeholder (will be implemented in Phase 102)
   */
  private setupRequestInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        // Log request (development only)
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Setup response interceptors
   * Phase 101: Placeholder (will be implemented in Phase 102)
   */
  private setupResponseInterceptors(): void {
    this.instance.interceptors.response.use(
      (response) => {
        // Log response (development only)
        logger.debug(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        logger.error('Response interceptor error:', error);
        return Promise.reject(this.handleError(error));
      },
    );
  }

  /**
   * Handle API errors
   * Phase 101: Basic error handling
   *
   * @param error Axios error
   * @returns Formatted error response
   */
  private handleError(error: AxiosError): ApiErrorResponse {
    if (error.response) {
      // Server responded with error status
      const {status, data} = error.response;
      return {
        message: (data as any)?.message || error.message || 'Server error',
        code: (data as any)?.code,
        status,
        details: data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Network error: No response from server',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Request setup error
      return {
        message: error.message || 'Request error',
        code: 'REQUEST_ERROR',
      };
    }
  }

  /**
   * GET request
   * Phase 101: HTTP GET method
   *
   * @param url Request URL
   * @param config Request configuration
   * @returns Response data
   */
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   * Phase 101: HTTP POST method
   *
   * @param url Request URL
   * @param data Request body
   * @param config Request configuration
   * @returns Response data
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   * Phase 101: HTTP PUT method
   *
   * @param url Request URL
   * @param data Request body
   * @param config Request configuration
   * @returns Response data
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   * Phase 101: HTTP PATCH method
   *
   * @param url Request URL
   * @param data Request body
   * @param config Request configuration
   * @returns Response data
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   * Phase 101: HTTP DELETE method
   *
   * @param url Request URL
   * @param config Request configuration
   * @returns Response data
   */
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Get Axios instance (for advanced usage)
   * Phase 101: Direct access to Axios instance
   *
   * @returns Axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * Update base URL
   * Phase 101: Dynamic base URL update
   *
   * @param baseURL New base URL
   */
  public setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    this.instance.defaults.baseURL = baseURL;
    logger.log('API base URL updated:', baseURL);
  }

  /**
   * Update default headers
   * Phase 101: Dynamic header update
   *
   * @param headers Headers to merge
   */
  public setHeaders(headers: Record<string, string>): void {
    this.config.headers = {
      ...this.config.headers,
      ...headers,
    };
    Object.assign(this.instance.defaults.headers.common, headers);
    logger.log('API headers updated:', headers);
  }

  /**
   * Remove header
   * Phase 101: Remove specific header
   *
   * @param headerName Header name to remove
   */
  public removeHeader(headerName: string): void {
    delete this.instance.defaults.headers.common[headerName];
  }

  /**
   * Get current configuration
   * Phase 101: Get API config
   *
   * @returns Current API configuration
   */
  public getConfig(): ApiConfig {
    return {...this.config};
  }
}

/**
 * Default API client instance
 * Phase 101: Singleton pattern
 */
export const apiClient = new ApiClient();

/**
 * Export default
 */
export default apiClient;
