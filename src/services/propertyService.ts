/**
 * Property Service Module
 * Handles all property-related API operations
 */
import { api, ApiResponse } from '../utils/api';
import { API_CONFIG } from '../utils/config';

// Property interfaces
export interface Property {
  ical_feed_url:string
  id: string;
  created_at: string;
  name: string;
  vrbo_id?: string;
  airbnb_id?: string;
  booking_id?: string;
  status: 'active' | 'inactive' | 'maintenance';
  updated_at: string;
}

export interface CreatePropertyRequest {
  name: string;
  vrbo_id?: string;
  airbnb_id?: string;
  booking_id?: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface UpdatePropertyRequest {
  name?: string;
  vrbo_id?: string;
  airbnb_id?: string;
  booking_id?: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface PropertyStats {
  total_properties: number;
  active_properties: number;
  inactive_properties: number;
  maintenance_properties: number;
}

export interface PropertyApiResponse {
  data: Property[];  // this is the array of properties
  total: number;
  page: number;
  limit: number;
}

// Mock data for development
const mockProperties: Property[] = [
  {
    id: '1',
    created_at: '2024-01-15T10:30:00Z',
    name: 'Sunset Villa',
    vrbo_id: 'VRBO12345',
    airbnb_id: 'AB67890',
    booking_id: 'BK11111',
    status: 'active',
    ical_feed_url:'http://127.0.0.1:8000/api/v1/property/1.ics',
    updated_at: '2024-01-20T14:20:00Z'
  }
];

// Property service methods
export const propertyService = {
  /**
   * Get all properties with pagination
   */
  async getProperties(page: number = 1, limit: number = 10): Promise<ApiResponse<PropertyApiResponse>> {
    const response = await api.get<any>(
      `${API_CONFIG.VERSION}/property?page=${page}&limit=${limit}`
    );

    if (!response.success) {
      return {
        success: false,
        data: { data: [], total: 0, page, limit },
        error: response.error,
      };
    }

    const backend = response.data;
    const envelope = backend?.data;
    let dataArray: Property[] = [];
    let total = 0;

    if (Array.isArray(envelope?.data)) {
      dataArray = envelope.data;
      total = typeof envelope.total === 'number' ? envelope.total : envelope.data.length;
    } else if (Array.isArray(backend?.data)) {
      dataArray = backend.data;
      total = backend.data.length;
    } else if (Array.isArray(backend)) {
      dataArray = backend;
      total = backend.length;
    }

    // Normalize IDs to strings to keep UI and delete endpoint consistent
    const normalized = dataArray.map((p: any) => ({
      ...p,
      id: String(p.id),
    }));

    return {
      success: true,
      data: {
        data: normalized as Property[],
        total,
        page,
        limit,
      },
    };
  },


  /**
   * Get active properties
   */
  async getActiveProperties(): Promise<ApiResponse<Property[]>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeProperties = mockProperties.filter(p => p.status === 'active');
        resolve({ success: true, data: activeProperties });
      }, 300);
    });
  },

  /**
   * Create new property
   */
  async createProperty(propertyData: CreatePropertyRequest): Promise<ApiResponse<Property>> {
    return api.post<Property>(`${API_CONFIG.VERSION}/property`, propertyData);
  },

  /**
   * Delete property by id
   */
  async deleteProperty(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${API_CONFIG.VERSION}/property/${id}`);
  },


  /**
   * Search properties by name
   */
  async searchProperties(query: string): Promise<ApiResponse<Property[]>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredProperties = mockProperties.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        resolve({ success: true, data: filteredProperties });
      }, 300);
    });
  },

  /**
   * Get property statistics
   */
  async getPropertyStats(): Promise<ApiResponse<PropertyStats>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats: PropertyStats = {
          total_properties: mockProperties.length,
          active_properties: mockProperties.filter(p => p.status === 'active').length,
          inactive_properties: mockProperties.filter(p => p.status === 'inactive').length,
          maintenance_properties: mockProperties.filter(p => p.status === 'maintenance').length
        };
        resolve({ success: true, data: stats });
      }, 300);
    });
  },

  /**
   * Export property data
   */
  async exportProperties(_format: 'csv' | 'json' = 'json'): Promise<ApiResponse<Blob>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const dataStr = JSON.stringify(mockProperties, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        resolve({ success: true, data: blob });
      }, 500);
    });
  }
};

export default propertyService;