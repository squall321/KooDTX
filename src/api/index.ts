/**
 * API Module Exports
 * Phase 101-105: Complete API client
 */

export {
  ApiClient,
  apiClient,
  type ApiConfig,
  type ApiErrorResponse,
} from './client';

export {
  type ApiResponse,
  type ApiError,
  type PaginationParams,
  type PaginatedResponse,
  type QueryParams,
} from './types';

export {
  AuthInterceptor,
  tokenStorage,
  type TokenStorage,
  type AuthInterceptorOptions,
} from './interceptors';

export {authApi, type LoginRequest, type RegisterRequest, type AuthResponse} from './auth';
export {sessionsApi, type Session, type CreateSessionRequest, type UpdateSessionRequest} from './sessions';

export default apiClient;
