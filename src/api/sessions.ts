/**
 * Sessions API
 * Phase 105: Session CRUD operations
 */

import {apiClient} from './client';
import {ApiResponse, PaginatedResponse, PaginationParams} from './types';

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  sensorTypes: string[];
  hasAudio: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  deviceId: string;
  sensorTypes: string[];
  hasAudio: boolean;
  metadata?: any;
}

export interface UpdateSessionRequest {
  endTime?: number;
  metadata?: any;
}

export const sessionsApi = {
  async createSession(data: CreateSessionRequest): Promise<ApiResponse<Session>> {
    return await apiClient.post<ApiResponse<Session>>('/sessions', data);
  },

  async getSessions(params?: PaginationParams): Promise<PaginatedResponse<Session>> {
    return await apiClient.get<PaginatedResponse<Session>>('/sessions', {params});
  },

  async getSession(id: string): Promise<ApiResponse<Session>> {
    return await apiClient.get<ApiResponse<Session>>(`/sessions/${id}`);
  },

  async updateSession(id: string, data: UpdateSessionRequest): Promise<ApiResponse<Session>> {
    return await apiClient.patch<ApiResponse<Session>>(`/sessions/${id}`, data);
  },

  async deleteSession(id: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<ApiResponse<void>>(`/sessions/${id}`);
  },
};
