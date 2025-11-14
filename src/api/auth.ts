/**
 * Authentication API
 * Phase 104: Auth API functions
 */

import {apiClient} from './client';
import {tokenStorage} from './storage/tokenStorage';
import {ApiResponse} from './types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.success && response.data) {
      await tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response;
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    if (response.success && response.data) {
      await tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response;
  },

  async logout(): Promise<void> {
    await tokenStorage.clearTokens();
    await apiClient.post('/auth/logout');
  },

  async refreshToken(): Promise<string> {
    const refreshToken = await tokenStorage.getRefreshToken();
    const response = await apiClient.post<{accessToken: string; refreshToken: string}>(
      '/auth/refresh',
      {refreshToken},
    );
    await tokenStorage.setTokens(response.accessToken, response.refreshToken);
    return response.accessToken;
  },
};
