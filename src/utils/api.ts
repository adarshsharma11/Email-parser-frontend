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

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (API_CONFIG.KEY) {
      config.headers.Authorization = `Bearer ${API_CONFIG.KEY}`;
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
          // Handle unauthorized access
          console.error('Unauthorized access - redirect to login');
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
      // Request made but no response received
      console.error('No response received:', error.request);
      
      // Check for CORS issues
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS') || error.message.includes('Network Error')) {
        console.error('Possible CORS issue detected. Check server CORS configuration.');
        console.error('Make sure the server allows requests from this origin.');
      }
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
    return {
      success: false,
      data: {} as T,
      error: axiosError.response?.data?.message || axiosError.message || 'Request failed',
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
    return {
      success: false,
      data: {} as T,
      error: axiosError.response?.data?.message || axiosError.message || 'File upload failed',
    };
  }
};

// Export the axios instance for advanced use cases
export { apiClient };