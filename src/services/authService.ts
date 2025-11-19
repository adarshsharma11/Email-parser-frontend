import { api, ApiResponse, apiClient } from '../utils/api';
import { AUTH_ENDPOINTS } from '../utils/endpoints';

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
}

export const authService = {
  async register(payload: AuthPayload): Promise<ApiResponse<AuthResponse>> {
    const res = await api.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, payload);
    if (res.success && res.data?.token) {
      const token = res.data.token;
      try {
        localStorage.setItem('auth_token', token);
      } catch { void 0; }
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    }
    return res;
  },

  async login(payload: AuthPayload): Promise<ApiResponse<AuthResponse>> {
    const res = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, payload);
    if (res.success && res.data?.token) {
      const token = res.data.token;
      try {
        localStorage.setItem('auth_token', token);
      } catch { void 0; }
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    }
    return res;
  },

  initTokenFromStorage(): void {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      }
    } catch { void 0; }
  },
};

export default authService;