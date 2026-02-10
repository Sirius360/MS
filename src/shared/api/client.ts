import type { RequestConfig, ApiError } from './types';

/**
 * Base API client configuration
 */
interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * HTTP client for making API requests
 */
class HttpClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Build headers with auth token
   */
  private buildHeaders(customHeaders?: Record<string, string>): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...customHeaders,
    });

    const token = this.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.config.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Make HTTP request
   */
  private async request<T>(method: string, endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const headers = this.buildHeaders(config?.headers as Record<string, string>);

    const requestConfig: RequestInit = {
      method,
      headers,
      ...config,
    };

    // Add body for non-GET requests
    if (config?.body && method !== 'GET') {
      requestConfig.body = JSON.stringify(config.body);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Parse response
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw this.createError(data, response.status);
      }

      return data as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('aborted')) {
        throw this.createError({ error: 'Request timeout' }, 408);
      }
      throw error;
    }
  }

  /**
   * Create API error object
   */
  private createError(data: any, statusCode: number): ApiError {
    return {
      message: data.error || data.message || `HTTP ${statusCode}`,
      code: data.code,
      statusCode,
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, config);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, { ...config, body: data });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...config, body: data });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, { ...config, body: data });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, config);
  }
}

/**
 * Get API base URL from environment
 */
const getApiBaseURL = (): string => {
  // Check if using mock API
  const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';
  if (useMock) {
    return 'http://localhost:3002/api'; // Mock will intercept
  }

  return import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
};

/**
 * Singleton API client instance
 */
export const apiClient = new HttpClient({
  baseURL: getApiBaseURL(),
  timeout: 30000,
});

export default apiClient;
