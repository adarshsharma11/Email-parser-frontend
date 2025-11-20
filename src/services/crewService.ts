/**
 * Crew Service Module
 * Handles all crew-related API operations
 */

import { api } from '../utils/api';
import { ApiResponse } from '../utils/api';
import { API_CONFIG } from '../utils/config';

// Crew interfaces based on API response
export interface Crew {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  active: boolean;
  updated_at: string;
  property_id: string;
}

export interface CreateCrewRequest {
  name: string;
  phone: string;
  email: string;
  property_id: string;
  active?: boolean;
}

export interface UpdateCrewRequest {
  name?: string;
  phone?: string;
  email?: string;
  property_id?: string;
  active?: boolean;
}

export interface CrewStats {
  total_crews: number;
  active_crews: number;
  inactive_crews: number;
  recent_crews: number;
}

export interface CrewApiResponse {
  data: Crew[];
  total: number;
  page: number;
  limit: number;
}

// Crew service methods
export const crewService = {
  /**
 * Get all crew members with pagination
   */
  async getCrews(page: number = 1, limit: number = 10): Promise<ApiResponse<CrewApiResponse>> {
    const response = await api.get<any>(`${API_CONFIG.VERSION}/crews?page=${page}&limit=${limit}`);
    
    // Handle different response structures
    if (response.success && response.data) {
      // If data is already an array, return it directly
      if (Array.isArray(response.data)) {
        return response;
      }
      // If data has a crews property, extract it
      else if (response.data.crews && Array.isArray(response.data.crews)) {
        return {
          ...response,
          data: response.data.crews
        };
      }
      // If data is an object with other structure, try to find the array
      else {
        console.warn('Unexpected API response structure:', response.data);
        return response;
      }
    }
    
    return response;
  },

  /**
   * Get crew member by ID
   */
  async getCrewById(id: string): Promise<ApiResponse<Crew>> {
    return api.get<Crew>(`${API_CONFIG.VERSION}/crews/${id}`);
  },

  /**
 * Get active crew members
   */
  async getActiveCrews(): Promise<ApiResponse<Crew[]>> {
    return api.get<Crew[]>(`${API_CONFIG.VERSION}/crews/active`);
  },

  /**
   * Create new crew member
   */
  async createCrew(crewData: CreateCrewRequest): Promise<ApiResponse<Crew>> {
    return api.post<Crew>(`${API_CONFIG.VERSION}/crews`, crewData);
  },

  /**
   * Update crew member
   */
  async updateCrew(id: string, crewData: UpdateCrewRequest): Promise<ApiResponse<Crew>> {
    return api.put<Crew>(`${API_CONFIG.VERSION}/crews/${id}`, crewData);
  },

  /**
   * Delete crew member
   */
  async deleteCrew(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${API_CONFIG.VERSION}/crews/${id}`);
  },

  /**
   * Toggle crew member status (active/inactive)
   */
  async toggleCrewStatus(id: string): Promise<ApiResponse<Crew>> {
    return api.patch<Crew>(`${API_CONFIG.VERSION}/crews/${id}/toggle-status`);
  },

  /**
 * Search crew members by name or email
   */
  async searchCrews(query: string): Promise<ApiResponse<Crew[]>> {
    return api.get<Crew[]>(`${API_CONFIG.VERSION}/crews/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get crew statistics
   */
  async getCrewStats(): Promise<ApiResponse<CrewStats>> {
    return api.get<CrewStats>(`${API_CONFIG.VERSION}/crews/stats`);
  },

  /**
 * Get crew members by property
   */
  async getCrewsByProperty(propertyId: string): Promise<ApiResponse<Crew[]>> {
    return api.get<Crew[]>(`${API_CONFIG.VERSION}/crews/property/${propertyId}`);
  },

  /**
   * Export crew data
   */
  async exportCrews(format: 'csv' | 'json' = 'json'): Promise<ApiResponse<Blob>> {
    return api.get<Blob>(`${API_CONFIG.VERSION}/crews/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};

export default crewService;