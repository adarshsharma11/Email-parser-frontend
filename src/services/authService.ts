import { api, ApiResponse, apiClient } from '../utils/api';
import { AUTH_ENDPOINTS } from '../utils/endpoints';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
    const res = await api.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, payload);
    if (res.success) {
      const anyData: any = res.data as any;
      const token = anyData?.token ?? anyData?.data?.token;
      try {
        localStorage.setItem('auth_token', token);
      } catch { void 0; }
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    }
    return res;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    const res = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, payload);
    if (res.success) {
      const anyData: any = res.data as any;
      const token = anyData?.token ?? anyData?.data?.token;
      try {
        localStorage.setItem('auth_token', token);
      } catch { void 0; }
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    }
    return res;
  },

  async logout(): Promise<ApiResponse<{ message?: string }>> {
    const res = await api.post<{ message?: string }>(AUTH_ENDPOINTS.LOGOUT, {});
    try {
      localStorage.removeItem('auth_token');
    } catch { void 0; }
    delete apiClient.defaults.headers.Authorization;
    return res;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<AuthResponse>> {
    const res = await api.put<AuthResponse>(AUTH_ENDPOINTS.PROFILE, payload);
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
