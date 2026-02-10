/**
 * Standard API Response Types
 * Consistent response format for all API calls
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string[]>; // Field-level validation errors
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * List response (simple array wrapper)
 */
export interface ListResponse<T> {
  data: T[];
  total?: number;
}
