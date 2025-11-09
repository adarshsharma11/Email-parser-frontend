/**
 * Property Service Module
 * Handles all property-related API operations
 */
import { ApiResponse } from '../utils/api';

// Property interfaces
export interface Property {
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
  data: Property[];
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
    updated_at: '2024-01-20T14:20:00Z'
  },
  {
    id: '2',
    created_at: '2024-01-16T09:15:00Z',
    name: 'Mountain Retreat',
    vrbo_id: 'VRBO67890',
    airbnb_id: 'AB54321',
    booking_id: 'BK22222',
    status: 'active',
    updated_at: '2024-01-18T16:45:00Z'
  },
  {
    id: '3',
    created_at: '2024-01-17T11:45:00Z',
    name: 'Beach House Paradise',
    vrbo_id: 'VRBO11111',
    airbnb_id: 'AB99999',
    booking_id: 'BK33333',
    status: 'maintenance',
    updated_at: '2024-01-19T12:30:00Z'
  },
  {
    id: '4',
    created_at: '2024-01-18T14:20:00Z',
    name: 'City Center Apartment',
    vrbo_id: 'VRBO44444',
    airbnb_id: 'AB77777',
    booking_id: 'BK44444',
    status: 'inactive',
    updated_at: '2024-01-21T09:15:00Z'
  },
  {
    id: '5',
    created_at: '2024-01-19T16:30:00Z',
    name: 'Lakeside Cabin',
    vrbo_id: 'VRBO55555',
    airbnb_id: 'AB88888',
    booking_id: 'BK55555',
    status: 'active',
    updated_at: '2024-01-22T10:45:00Z'
  }
];

// Property service methods
export const propertyService = {
  /**
   * Get all properties with pagination
   */
  async getProperties(page: number = 1, limit: number = 10): Promise<ApiResponse<PropertyApiResponse>> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            data: mockProperties,
            total: mockProperties.length,
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
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProperty: Property = {
          id: String(mockProperties.length + 1),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active',
          ...propertyData
        };
        mockProperties.push(newProperty);
        resolve({ success: true, data: newProperty });
      }, 500);
    });
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