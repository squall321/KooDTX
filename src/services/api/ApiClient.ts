/**
 * ApiClient
 *
 * HTTP API 통신을 위한 클라이언트
 * - Axios 기반
 * - 인증 토큰 관리
 * - 에러 핸들링
 * - 재시도 로직
 * - 요청/응답 인터셉터
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import {logger} from '../../utils/logger';

/**
 * API 응답 타입
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * API 에러 타입
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * API 클라이언트 설정
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * 재시도 가능한 HTTP 메서드
 */
const RETRYABLE_METHODS = ['GET', 'PUT', 'DELETE'];

/**
 * 재시도 가능한 HTTP 상태 코드
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * API 클라이언트 클래스 (Singleton)
 */
export class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private config: ApiClientConfig;
  private authToken: string | null = null;

  private constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000, // 30초 기본 타임아웃
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Singleton 인스턴스 가져오기
   */
  public static getInstance(config?: ApiClientConfig): ApiClient {
    if (!ApiClient.instance) {
      if (!config) {
        throw new Error('ApiClient configuration is required for first initialization');
      }
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  /**
   * 인터셉터 설정
   */
  private setupInterceptors(): void {
    // 요청 인터셉터
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // 인증 토큰 추가
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        logger.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('[API Request Error]', error);
        return Promise.reject(error);
      },
    );

    // 응답 인터셉터
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        logger.error('[API Response Error]', error.message);

        // 재시도 로직
        const config = error.config;
        if (config && this.shouldRetry(error, config)) {
          const retryCount = (config as any).__retryCount || 0;
          (config as any).__retryCount = retryCount + 1;

          if (retryCount < (this.config.retryAttempts || 3)) {
            logger.log(`[API Retry] Attempt ${retryCount + 1}/${this.config.retryAttempts}`);

            // 재시도 딜레이
            await this.delay((this.config.retryDelay || 1000) * Math.pow(2, retryCount));

            return this.axiosInstance(config);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * 재시도 여부 판단
   */
  private shouldRetry(error: AxiosError, config: AxiosRequestConfig): boolean {
    // 네트워크 에러는 재시도
    if (!error.response) {
      return true;
    }

    // 재시도 가능한 메서드 확인
    if (!config.method || !RETRYABLE_METHODS.includes(config.method.toUpperCase())) {
      return false;
    }

    // 재시도 가능한 상태 코드 확인
    return RETRYABLE_STATUS_CODES.includes(error.response.status);
  }

  /**
   * 딜레이 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 인증 토큰 설정
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * 인증 토큰 가져오기
   */
  public getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * GET 요청
   */
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * POST 요청
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * PUT 요청
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * DELETE 요청
   */
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Multipart/form-data POST 요청 (파일 업로드)
   */
  public async uploadFile<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percentCompleted);
          }
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * 에러 핸들링
   */
  private handleError<T>(error: any): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // 네트워크 에러
      if (!axiosError.response) {
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: '네트워크 연결을 확인해주세요.',
            details: axiosError.message,
          },
        };
      }

      // HTTP 에러
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;

      return {
        success: false,
        error: {
          code: data?.code || `HTTP_${status}`,
          message: data?.message || this.getDefaultErrorMessage(status),
          details: data,
        },
      };
    }

    // 기타 에러
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: '알 수 없는 오류가 발생했습니다.',
        details: error,
      },
    };
  }

  /**
   * HTTP 상태 코드에 따른 기본 에러 메시지
   */
  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return '잘못된 요청입니다.';
      case 401:
        return '인증이 필요합니다.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 408:
        return '요청 시간이 초과되었습니다.';
      case 429:
        return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버 내부 오류가 발생했습니다.';
      case 502:
        return '게이트웨이 오류가 발생했습니다.';
      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.';
      case 504:
        return '게이트웨이 시간 초과가 발생했습니다.';
      default:
        return `서버 오류가 발생했습니다. (${status})`;
    }
  }
}

/**
 * API 클라이언트 인스턴스 가져오기
 */
export function getApiClient(): ApiClient {
  return ApiClient.getInstance();
}

/**
 * API 클라이언트 초기화
 */
export function initializeApiClient(config: ApiClientConfig): ApiClient {
  return ApiClient.getInstance(config);
}
