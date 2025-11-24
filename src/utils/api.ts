/**
 * API Utility Module
 * Provides centralized HTTP request handling with Axios
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from './config';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  // CORS configuration
 // withCredentials: true, // Include credentials in requests
});

const redirectToLogin = () => {
  delete apiClient.defaults.headers.Authorization;
  if (typeof window !== 'undefined') {
    try { window.dispatchEvent(new CustomEvent('auth:tokenChange')); } catch { void 0; }
    if (window.location.pathname !== '/signin') {
      const target = `${window.location.origin}/signin`;
      window.location.replace(target);
    }
  }
};

const handleUnauthorized = () => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_first_name');
    localStorage.removeItem('auth_last_name');
  } catch { void 0; }
  redirectToLogin();
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage if available; fallback to API key
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (API_CONFIG.KEY) {
        config.headers.Authorization = `Bearer ${API_CONFIG.KEY}`;
      }
    } catch {
      if (API_CONFIG.KEY) {
        config.headers.Authorization = `Bearer ${API_CONFIG.KEY}`;
      }
    }
    
    // Add any other request modifications here
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const data: any = response?.data as any;
    const bodyStatus = data?.status ?? data?.code ?? data?.detail?.status;
    if (response.status === 401 || bodyStatus === 401) {
      handleUnauthorized();
      return Promise.reject({ response });
    }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'An error occurred';
      console.error('API Error:', errorMessage);
      
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          handleUnauthorized();
          break;
        case 403:
          // Handle forbidden access
          console.error('Forbidden access');
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        case 500:
          // Handle server error
          console.error('Server error');
          break;
        default:
          console.error('Unknown error:', error.response.status);
      }
    } else if (error.request) {
      // No response received (network/CORS). If user had a token, treat as invalid and redirect.
      try {
        const hasToken = Boolean(localStorage.getItem('auth_token'));
        if (hasToken) {
          handleUnauthorized();
        }
      } catch { void 0; }
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await apiClient({
      method,
      url: endpoint,
      data,
      ...config,
    });

    return {
      success: true,
      data: response.data,
      message: 'Request successful',
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    const respData: any = axiosError.response?.data as any;
    const message = respData?.detail?.message || respData?.message || respData?.error || axiosError.message || 'Request failed';
    if (axiosError.response?.status === 401) {
      handleUnauthorized();
    }
    return {
      success: false,
      data: {} as T,
      error: message,
    };
  }
};

// Convenience methods for common HTTP operations
export const api = {
  get: <T = any>(endpoint: string, config?: AxiosRequestConfig) =>
    apiRequest<T>('GET', endpoint, undefined, config),

  post: <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>('POST', endpoint, data, config),

  put: <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>('PUT', endpoint, data, config),

  patch: <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>('PATCH', endpoint, data, config),

  delete: <T = any>(endpoint: string, config?: AxiosRequestConfig) =>
    apiRequest<T>('DELETE', endpoint, undefined, config),
};

// File upload utility
export const uploadFile = async <T = any>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<ApiResponse<T>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });
  }

  try {
    const response: AxiosResponse<T> = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data: response.data,
      message: 'File uploaded successfully',
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.status === 401) {
      handleUnauthorized();
    }
    return {
      success: false,
      data: {} as T,
      error: axiosError.response?.data?.message || axiosError.message || 'File upload failed',
    };
  }
};

// Export the axios instance for advanced use cases
export { apiClient };