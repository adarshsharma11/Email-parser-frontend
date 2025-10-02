/**
 * Booking API Service
 * Handles all booking-related API calls
 */

import { api, ApiResponse } from '../utils/api';
import { BOOKING_ENDPOINTS, ENDPOINT_PATTERNS } from '../utils/endpoints';

// Types
export interface Booking {
  reservation_id: string;
  platform: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  check_in_date: string;
  check_out_date: string;
  property_id: string | null;
  property_name: string;
  number_of_guests: number | null;
  total_amount: number;
  currency: string;
  booking_date: string;
  email_id: string;
  created_at: string;
  updated_at: string;
  raw_data: {
    guest_name: string;
    guest_phone: string;
    total_amount: number;
    check_in_date: string;
    property_name: string;
    check_out_date: string;
    reservation_id: string;
  };
}

export interface CreateBookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  notes?: string;
}

export interface UpdateBookingRequest {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceType?: string;
  bookingDate?: string;
  bookingTime?: string;
  duration?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

// API Response Types
export interface BookingApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    bookings: Booking[];
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Booking Service
export const bookingService = {
  // Get all bookings with pagination
  getBookings: async (page = 1, limit = 10): Promise<ApiResponse<BookingApiResponse>> => {
    const endpoint = ENDPOINT_PATTERNS.WITH_PAGINATION(BOOKING_ENDPOINTS.LIST, page, limit);
    return api.get<BookingApiResponse>(endpoint);
  },

  // Get single booking by ID
  getBookingById: async (id: string): Promise<ApiResponse<Booking>> => {
    return api.get<Booking>(BOOKING_ENDPOINTS.DETAIL(id));
  },

  // Create new booking
  createBooking: async (data: CreateBookingRequest): Promise<ApiResponse<Booking>> => {
    return api.post<Booking>(BOOKING_ENDPOINTS.CREATE, data);
  },

  // Update booking
  updateBooking: async (id: string, data: UpdateBookingRequest): Promise<ApiResponse<Booking>> => {
    return api.patch<Booking>(BOOKING_ENDPOINTS.UPDATE(id), data);
  },

  // Delete booking
  deleteBooking: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(BOOKING_ENDPOINTS.DELETE(id));
  },

  // Get bookings by status
  getBookingsByStatus: async (status: string, page = 1, limit = 10): Promise<ApiResponse<Booking[]>> => {
    const endpoint = BOOKING_ENDPOINTS.BY_STATUS(status);
    const paginatedEndpoint = ENDPOINT_PATTERNS.WITH_PAGINATION(endpoint, page, limit);
    return api.get<Booking[]>(paginatedEndpoint);
  },

  // Get bookings by date
  getBookingsByDate: async (date: string): Promise<ApiResponse<Booking[]>> => {
    return api.get<Booking[]>(BOOKING_ENDPOINTS.BY_DATE(date));
  },

  // Search bookings
  searchBookings: async (query: string, page = 1, limit = 10): Promise<ApiResponse<Booking[]>> => {
    const endpoint = ENDPOINT_PATTERNS.WITH_SEARCH(BOOKING_ENDPOINTS.SEARCH, query);
    const paginatedEndpoint = ENDPOINT_PATTERNS.WITH_PAGINATION(endpoint, page, limit);
    return api.get<Booking[]>(paginatedEndpoint);
  },

  // Get booking statistics
  getBookingStats: async (): Promise<ApiResponse<BookingStats>> => {
    return api.get<BookingStats>(BOOKING_ENDPOINTS.STATS);
  },

  // Export bookings
  exportBookings: async (format: 'csv' | 'pdf' = 'csv'): Promise<ApiResponse<Blob>> => {
    return api.post<Blob>(BOOKING_ENDPOINTS.EXPORT, { format }, {
      responseType: 'blob',
    });
  },

  // Confirm booking
  confirmBooking: async (id: string): Promise<ApiResponse<Booking>> => {
    return api.patch<Booking>(`${BOOKING_ENDPOINTS.DETAIL(id)}/confirm`);
  },

  // Cancel booking
  cancelBooking: async (id: string, reason?: string): Promise<ApiResponse<Booking>> => {
    return api.patch<Booking>(`${BOOKING_ENDPOINTS.DETAIL(id)}/cancel`, { reason });
  },
};

export default bookingService;