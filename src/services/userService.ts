import { api, ApiResponse } from '../utils/api';
import { API_CONFIG } from '../utils/config';

export interface User {
  email: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'inactive' | string;
}

export interface UpsertUserRequest {
  email: string;
  password: string;
}

export interface UpdatePasswordRequest {
  password: string;
}

export interface UsersApiResponse {
  data: User[];
  total?: number;
  page?: number;
  limit?: number;
}

export const userService = {
  async getUsers(page: number = 1, limit: number = 50): Promise<ApiResponse<UsersApiResponse | User[]>> {
    const endpoint = `${API_CONFIG.VERSION}/users?page=${page}&limit=${limit}`;
    return api.get<UsersApiResponse | User[]>(endpoint);
  },

  async upsertUser(payload: UpsertUserRequest): Promise<ApiResponse<User>> {
    const endpoint = `${API_CONFIG.VERSION}/users`;
    return api.post<User>(endpoint, payload);
  },

  async updatePassword(email: string, payload: UpdatePasswordRequest): Promise<ApiResponse<User>> {
    const endpoint = `${API_CONFIG.VERSION}/users/${encodeURIComponent(email)}`;
    return api.put<User>(endpoint, payload);
  },

  async deleteUser(email: string): Promise<ApiResponse<void>> {
    const endpoint = `${API_CONFIG.VERSION}/users/${encodeURIComponent(email)}`;
    return api.delete<void>(endpoint);
  },

  async connectUser(email: string): Promise<ApiResponse<any>> {
    const endpoint = `${API_CONFIG.VERSION}/users/${encodeURIComponent(email)}/connect`;
    return api.post<any>(endpoint, {});
  },
};

export default userService;