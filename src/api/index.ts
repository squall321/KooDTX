/**
 * API Module Exports
 * Phase 101-107: Complete API client
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
export {uploadApi, type UploadOptions, type UploadProgress, type UploadResponse} from './upload';
export {
  syncApi,
  SyncDirection,
  SyncStatus,
  type SyncItem,
  type SyncPushRequest,
  type SyncPushResponse,
  type SyncPullRequest,
  type SyncPullResponse,
  type SyncStats,
} from './sync';

export default apiClient;
