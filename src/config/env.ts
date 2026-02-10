/**
 * Environment Configuration
 * Centralized environment variables with type safety
 */

const ENV = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
  
  // App Environment
  APP_ENV: (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'production' | 'staging',
  
  // Feature Flags
  ENABLE_LOGS: import.meta.env.VITE_ENABLE_LOGS === 'true',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  
  // App Configuration
  APP_NAME: 'Quản Lý Bán Hàng',
  APP_VERSION: '2.0.0',
} as const;

// Type-safe environment access
export type Environment = typeof ENV;

// Validate required environment variables
function validateEnv() {
  if (!ENV.API_URL) {
    throw new Error('VITE_API_URL is required but not defined');
  }
  
  // Log configuration in development
  if (ENV.APP_ENV === 'development' && ENV.ENABLE_LOGS) {
    console.log('🔧 Environment Configuration:', {
      API_URL: ENV.API_URL,
      APP_ENV: ENV.APP_ENV,
      ENABLE_LOGS: ENV.ENABLE_LOGS,
    });
  }
}

validateEnv();

export default ENV;
