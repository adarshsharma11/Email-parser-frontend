/**
 * API Endpoints Constants
 * Centralized endpoint definitions for all API calls
 */

import { API_CONFIG } from './config';

// Helper function to build full API endpoint
const buildEndpoint = (path: string): string => `${API_CONFIG.VERSION}${path}`;

// Booking Endpoints
export const BOOKING_ENDPOINTS = {
  // Base booking endpoints
  LIST:buildEndpoint(`/bookings`),
  DETAIL: (id: string) => buildEndpoint(`/bookings/${id}`),
  CREATE: buildEndpoint('/bookings'),
  UPDATE: (id: string) => buildEndpoint(`/bookings/${id}`),
  DELETE: (id: string) => buildEndpoint(`/bookings/${id}`),
  
  // Booking-specific endpoints
  BY_STATUS: (status: string) => buildEndpoint(`/bookings/status/${status}`),
  BY_DATE: (date: string) => buildEndpoint(`/bookings/date/${date}`),
  SEARCH: buildEndpoint('/bookings/search'),
  STATS: buildEndpoint('/bookings/stats'),
  EXPORT: buildEndpoint('/bookings/export'),
  PROPERTY:(platform: string) => buildEndpoint(`/bookings/propertyData/${platform}`),

} as const;

// User Endpoints
export const USER_ENDPOINTS = {
  LIST: buildEndpoint('/users'),
  DETAIL: (id: string) => buildEndpoint(`/users/${id}`),
  UPSERT: buildEndpoint('/users'),
  UPDATE_PASSWORD: (email: string) => buildEndpoint(`/users/${encodeURIComponent(email)}`),
  CONNECT: (email: string) => buildEndpoint(`/users/${encodeURIComponent(email)}/connect`),
  PROFILE: buildEndpoint('/users/profile'),
} as const;

// Dashboard Endpoints
export const DASHBOARD_ENDPOINTS = {
  METRICS: buildEndpoint('/dashboard'),
  BY_PLATFORM: (platform: string) => `${buildEndpoint('/dashboard')}?platform=${encodeURIComponent(platform)}`,
} as const;

// Email Endpoints
export const EMAIL_ENDPOINTS = {
  LIST: buildEndpoint('/emails'),
  DETAIL: (id: string) => buildEndpoint(`/emails/${id}`),
  PARSE: buildEndpoint('/emails/parse'),
  UPLOAD: buildEndpoint('/emails/upload'),
  SEARCH: buildEndpoint('/emails/search'),
  STATS: buildEndpoint('/emails/stats'),
} as const;

// Auth Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: buildEndpoint('/auth/login'),
  LOGOUT: buildEndpoint('/auth/logout'),
  REFRESH: buildEndpoint('/auth/refresh'),
  FORGOT_PASSWORD: buildEndpoint('/auth/forgot-password'),
  RESET_PASSWORD: buildEndpoint('/auth/reset-password'),
} as const;

// Common endpoint patterns
export const ENDPOINT_PATTERNS = {
  // Pagination
  WITH_PAGINATION: (endpoint: string, page: number, limit: number ,platform: string) => 
    `${endpoint}?page=${page}&limit=${limit}&platform=${platform}`,
  
  // Search
  WITH_SEARCH: (endpoint: string, query: string,platform: string) => 
    `${endpoint}?q=${encodeURIComponent(query)}&platform=${platform}`,
  
  // Date range
  WITH_DATE_RANGE: (endpoint: string, startDate: string, endDate: string,platform: string) => 
    `${endpoint}?start=${startDate}&end=${endDate}&platform=${platform}`,
  
  // Status filtering
  WITH_STATUS: (endpoint: string, status: string,platform: string) => 
    `${endpoint}?status=${status}&platform=${platform}`,
} as const;