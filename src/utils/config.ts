/**
 * Centralized configuration for environment variables
 * This file exports all environment variables in a type-safe manner
 */

// API Configuration
export const API_CONFIG = {
  URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  KEY: import.meta.env.VITE_API_KEY || '',
  VERSION: '/api/v1',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Email Parser Frontend',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENV: import.meta.env.VITE_APP_ENV || 'development',
} as const;

// Feature Flags (you can add more as needed)
export const FEATURE_FLAGS = {
  ENABLE_DEBUG: APP_CONFIG.ENV === 'development',
  ENABLE_ANALYTICS: APP_CONFIG.ENV === 'production',
} as const;

// Helper function to validate required environment variables
export const validateConfig = (): void => {
  const requiredEnvVars = [
    { key: 'VITE_API_URL', value: API_CONFIG.URL },
  ];

  const missingVars = requiredEnvVars.filter(({ value }) => !value);
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.map(({ key }) => key));
  }
};

// Initialize validation
validateConfig();