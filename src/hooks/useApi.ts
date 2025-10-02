/**
 * Custom Hook for API Calls
 * Provides a clean way to handle API requests with loading and error states
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiResponse, ApiError } from '../utils/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<ApiResponse<T>>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMounted = useRef(true);

  const execute = useCallback(
    async (...args: any[]): Promise<ApiResponse<T>> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await apiFunction(...args);
        
        if (isMounted.current) {
          if (response.success) {
            setState({
              data: response.data,
              loading: false,
              error: null,
            });
          } else {
            setState({
              data: null,
              loading: false,
              error: { message: response.error || 'Request failed' },
            });
          }
        }
        
        return response;
      } catch (error) {
        const apiError: ApiError = {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        };
        
        if (isMounted.current) {
          setState({
            data: null,
            loading: false,
            error: apiError,
          });
        }
        
        return {
          success: false,
          data: null as T,
          error: apiError.message,
        };
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for making API calls on component mount
export function useApiOnMount<T = any>(
  apiFunction: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiReturn<T> {
  const api = useApi(apiFunction);

  useEffect(() => {
    api.execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);


  return api;
}