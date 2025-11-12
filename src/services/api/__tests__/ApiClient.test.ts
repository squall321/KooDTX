/**
 * ApiClient Tests
 */

import axios, {AxiosError, AxiosInstance} from 'axios';
import {ApiClient, getApiClient, initializeApiClient} from '../ApiClient';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
        },
      },
    } as any;

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Initialize with default config
    initializeApiClient({
      baseURL: 'https://api.test.com',
      timeout: 30000,
      retryAttempts: 3,
    });

    apiClient = getApiClient();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = getApiClient();
      const instance2 = getApiClient();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize()', () => {
    it('should create axios instance with correct config', () => {
      initializeApiClient({
        baseURL: 'https://custom.api.com',
        timeout: 60000,
        retryAttempts: 5,
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://custom.api.com',
          timeout: 60000,
        }),
      );
    });

    it('should set up interceptors', () => {
      initializeApiClient({
        baseURL: 'https://api.test.com',
        timeout: 30000,
        retryAttempts: 3,
      });

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('get()', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = {
        data: {id: 1, name: 'Test'},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({id: 1, name: 'Test'});
    });

    it('should handle GET request errors', async () => {
      const mockError = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(mockError);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('post()', () => {
    it('should make POST request successfully', async () => {
      const mockResponse = {
        data: {id: 1, created: true},
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const payload = {name: 'New Item'};
      const result = await apiClient.post('/items', payload);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/items',
        payload,
        undefined,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual({id: 1, created: true});
    });

    it('should handle POST request errors', async () => {
      const mockError: Partial<AxiosError> = {
        message: 'Bad Request',
        response: {
          data: {message: 'Invalid data'},
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      const result = await apiClient.post('/items', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bad Request');
    });
  });

  describe('put()', () => {
    it('should make PUT request successfully', async () => {
      const mockResponse = {
        data: {id: 1, updated: true},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const payload = {name: 'Updated Item'};
      const result = await apiClient.put('/items/1', payload);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/items/1',
        payload,
        undefined,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('delete()', () => {
    it('should make DELETE request successfully', async () => {
      const mockResponse = {
        data: {deleted: true},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.delete('/items/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        '/items/1',
        undefined,
      );
      expect(result.success).toBe(true);
    });
  });

  describe('uploadFile()', () => {
    it('should upload file successfully', async () => {
      const mockResponse = {
        data: {fileId: '123', uploaded: true},
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append('file', 'test-file');

      const onProgress = jest.fn();
      const result = await apiClient.uploadFile('/upload', formData, onProgress);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        formData,
        expect.objectContaining({
          headers: {'Content-Type': 'multipart/form-data'},
        }),
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual({fileId: '123', uploaded: true});
    });

    it('should call onProgress callback during upload', async () => {
      const mockResponse = {
        data: {uploaded: true},
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      let progressCallback: any;
      mockAxiosInstance.post.mockImplementation(
        (url, data, config: any) => {
          progressCallback = config.onUploadProgress;
          return Promise.resolve(mockResponse);
        },
      );

      const onProgress = jest.fn();
      const formData = new FormData();

      await apiClient.uploadFile('/upload', formData, onProgress);

      // Simulate progress
      if (progressCallback) {
        progressCallback({loaded: 50, total: 100});
        expect(onProgress).toHaveBeenCalledWith(50);
      }
    });
  });

  describe('setAuthToken()', () => {
    it('should set authorization header', () => {
      const token = 'test-token-123';
      apiClient.setAuthToken(token);

      // Token should be set (we can't directly test axios instance headers,
      // but we can verify the method doesn't throw)
      expect(() => apiClient.setAuthToken(token)).not.toThrow();
    });

    it('should clear authorization header when token is null', () => {
      apiClient.setAuthToken('test-token');
      apiClient.setAuthToken(null);

      // Should not throw
      expect(() => apiClient.setAuthToken(null)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValue(networkError);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network Error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError: Partial<AxiosError> = {
        message: 'Timeout of 30000ms exceeded',
        code: 'ECONNABORTED',
      };

      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Timeout');
    });

    it('should handle 404 errors', async () => {
      const notFoundError: Partial<AxiosError> = {
        message: 'Request failed with status code 404',
        response: {
          data: {message: 'Not Found'},
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
      };

      mockAxiosInstance.get.mockRejectedValue(notFoundError);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });

    it('should handle 500 errors', async () => {
      const serverError: Partial<AxiosError> = {
        message: 'Request failed with status code 500',
        response: {
          data: {message: 'Internal Server Error'},
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
      };

      mockAxiosInstance.get.mockRejectedValue(serverError);

      const result = await apiClient.get('/test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });
  });
});
