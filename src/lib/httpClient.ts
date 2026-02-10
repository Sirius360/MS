/**
 * HTTP Client
 * Centralized API client with authentication, error handling, and type safety
 */

import ENV from '@/config/env';

/**
 * Custom API Error class with additional metadata
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a validation error (422 or specific code)
   */
  isValidationError(): boolean {
    return this.statusCode === 422 || this.code === 'VALIDATION_ERROR';
  }

  /**
   * Check if error is a not found error (404)
   */
  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if error is an authentication error (401)
   */
  isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Check if error is a network error (no response)
   */
  isNetworkError(): boolean {
    return this.statusCode === 0 || this.code === 'NETWORK_ERROR';
  }
}

/**
 * HTTP Client class for making API requests
 */
export class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Generic request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        // Redirect to login page (adjust path as needed)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // Response is not JSON
        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}`,
            response.status,
            'INVALID_RESPONSE'
          );
        }
        data = null;
      }

      // Handle non-OK responses
      if (!response.ok) {
        throw new ApiError(
          data?.error?.message || data?.message || `HTTP ${response.status}`,
          response.status,
          data?.error?.code || 'HTTP_ERROR',
          data?.error?.details
        );
      }

      return data;
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Network errors (fetch failed)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
          0,
          'NETWORK_ERROR'
        );
      }

      // Unknown errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

/**
 * Singleton HTTP client instance
 */
export const httpClient = new HttpClient(ENV.API_URL);

/**
 * Default export for convenience
 */
export default httpClient;
