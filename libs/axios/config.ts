import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '@/libs/store/authStore';

/**
 * Create Axios instance with base configuration
 * Uses environment variable for API URL (set in .env.local or via Expo)
 */
export const api: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor - Add JWT token to headers
 * Retrieves token from Zustand auth store
 */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle token refresh and error states
 * Automatically refreshes tokens on 401 responses
 * Logs out user if refresh fails or no refresh token available
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    /**
     * Handle 401 Unauthorized - Attempt token refresh
     */
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        
        if (!refreshToken) {
          // No refresh token available - logout user
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        // Attempt to refresh token with backend
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
          { refreshToken }
        );

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update auth store with new tokens
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - logout user and reject
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    /**
     * Log specific error scenarios
     */
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
    }

    if (error.response?.status === 429) {
      console.error('Rate limited - too many requests:', error.response.data);
    }

    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;