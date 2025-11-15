/**
 * Authentication Store
 * Phase 144: Auth state management using Zustand
 *
 * Features:
 * - User information
 * - Token management
 * - Login state
 * - Login/Logout actions
 * - Auto-login support
 * - Session persistence
 */

import {create} from 'zustand';
import {authApi, AuthResponse} from '../api/auth';
import {tokenStorage} from '../api/storage/tokenStorage';

/**
 * User information interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Auth state interface
 */
interface AuthState {
  // User data
  user: User | null;
  isAuthenticated: boolean;

  // Loading states
  isLoading: boolean;
  isInitializing: boolean;

  // Error handling
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

/**
 * Auth Store
 * Phase 144: Zustand-based authentication state management
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  /**
   * Login action
   * Phase 144: Authenticate user with email and password
   *
   * @param email User email
   * @param password User password
   */
  login: async (email: string, password: string) => {
    set({isLoading: true, error: null});

    try {
      // Call login API
      const response = await authApi.login({email, password});

      if (response.success && response.data) {
        const {user, accessToken, refreshToken} = response.data;

        // Store tokens (already done in authApi, but ensuring)
        await tokenStorage.setTokens(accessToken, refreshToken);

        // Update state
        set({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        console.log('Login successful:', user.email);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      set({
        error: error.message || '로그인 중 오류가 발생했습니다.',
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  /**
   * Register action
   * Phase 144: Register new user
   *
   * @param name User name
   * @param email User email
   * @param password User password
   */
  register: async (name: string, email: string, password: string) => {
    set({isLoading: true, error: null});

    try {
      // Call register API
      const response = await authApi.register({name, email, password});

      if (response.success && response.data) {
        const {user, accessToken, refreshToken} = response.data;

        // Store tokens
        await tokenStorage.setTokens(accessToken, refreshToken);

        // Update state
        set({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        console.log('Registration successful:', user.email);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      set({
        error: error.message || '회원가입 중 오류가 발생했습니다.',
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  /**
   * Logout action
   * Phase 144: Logout user and clear tokens
   */
  logout: async () => {
    set({isLoading: true});

    try {
      // Call logout API (optional)
      await authApi.logout();

      // Clear tokens
      await tokenStorage.clearTokens();

      // Reset state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if API fails, clear local state
      await tokenStorage.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Refresh auth action
   * Phase 144: Refresh access token
   */
  refreshAuth: async () => {
    try {
      const newAccessToken = await authApi.refreshToken();

      if (newAccessToken) {
        console.log('Token refreshed successfully');
      } else {
        // If refresh fails, logout
        await get().logout();
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout
      await get().logout();
    }
  },

  /**
   * Check auth action
   * Phase 144: Check if user is authenticated (auto-login)
   */
  checkAuth: async () => {
    set({isInitializing: true});

    try {
      // Check if tokens exist
      const hasTokens = await tokenStorage.hasTokens();

      if (hasTokens) {
        const accessToken = await tokenStorage.getAccessToken();

        if (accessToken) {
          // TODO: Optionally verify token with server or decode JWT
          // For now, assume valid if exists
          // In production, you should verify the token or fetch user info

          // Mock user data (in production, fetch from server)
          // This is a placeholder - you should implement /auth/me endpoint
          console.log('Auto-login: Tokens found, user should be authenticated');

          // For now, we'll just mark as authenticated
          // In a real app, you'd call an endpoint to get user info
          set({
            isAuthenticated: true,
            isInitializing: false,
          });
        } else {
          set({
            isAuthenticated: false,
            isInitializing: false,
          });
        }
      } else {
        set({
          isAuthenticated: false,
          isInitializing: false,
        });
      }
    } catch (error: any) {
      console.error('Check auth error:', error);
      set({
        isAuthenticated: false,
        isInitializing: false,
        error: error.message || '인증 확인 중 오류가 발생했습니다.',
      });
    }
  },

  /**
   * Clear error action
   * Phase 144: Clear error message
   */
  clearError: () => {
    set({error: null});
  },

  /**
   * Set user action
   * Phase 144: Manually set user data
   *
   * @param user User data or null
   */
  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  /**
   * Reset action
   * Phase 144: Reset auth state to initial
   */
  reset: () => {
    set(initialState);
  },
}));

/**
 * Export auth store hooks
 */
export default useAuthStore;

/**
 * Selectors for common use cases
 * Phase 144: Optimized selectors to prevent unnecessary re-renders
 */
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectIsInitializing = (state: AuthState) => state.isInitializing;
