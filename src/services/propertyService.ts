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
     const dataArray = Array.isArray(response.data?.data)
      ? response.data?.data
      : [];
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            data: dataArray,
            total: response.data.total,
            page,
            limit
          }
        });
      }, 500);
    });
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
    // Mock implementation
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     const newProperty: Property = {
    //       id: String(mockProperties.length + 1),
    //       created_at: new Date().toISOString(),
    //       updated_at: new Date().toISOString(),
    //       status: 'active',
    //       ...propertyData
    //     };
    //     mockProperties.push(newProperty);
    //     resolve({ success: true, data: newProperty });
    //   }, 500);
    // });
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