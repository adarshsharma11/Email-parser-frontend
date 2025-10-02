/**
 * Email API Service
 * Handles all email-related API calls
 */

import { api, ApiResponse } from '../utils/api';

// Types
export interface Email {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  content: string;
  receivedAt: string;
  isRead: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface ParseEmailRequest {
  emailId: string;
  content: string;
}

export interface ParseEmailResponse {
  parsedData: {
    entities: string[];
    keywords: string[];
    sentiment: string;
    summary: string;
  };
}

// Email Service
export const emailService = {
  // Get all emails
  getEmails: async (page = 1, limit = 10): Promise<ApiResponse<Email[]>> => {
    return api.get<Email[]>(`/emails?page=${page}&limit=${limit}`);
  },

  // Get single email by ID
  getEmailById: async (id: string): Promise<ApiResponse<Email>> => {
    return api.get<Email>(`/emails/${id}`);
  },

  // Parse email content
  parseEmail: async (data: ParseEmailRequest): Promise<ApiResponse<ParseEmailResponse>> => {
    return api.post<ParseEmailResponse>('/emails/parse', data);
  },

  // Upload email file
  uploadEmail: async (file: File): Promise<ApiResponse<Email>> => {
    return api.post<Email>('/emails/upload', { file });
  },

  // Mark email as read
  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    return api.patch<void>(`/emails/${id}/read`);
  },

  // Delete email
  deleteEmail: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/emails/${id}`);
  },

  // Search emails
  searchEmails: async (query: string): Promise<ApiResponse<Email[]>> => {
    return api.get<Email[]>(`/emails/search?q=${encodeURIComponent(query)}`);
  },

  // Get email statistics
  getEmailStats: async (): Promise<ApiResponse<{
    totalEmails: number;
    unreadCount: number;
    parsedCount: number;
  }>> => {
    return api.get('/emails/stats');
  },
};

export default emailService;