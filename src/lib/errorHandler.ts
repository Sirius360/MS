/**
 * Centralized Error Handler
 * Provides consistent error handling and user feedback across the application
 */

import { ApiError } from './httpClient';
import type { toast as ToastType } from '@/hooks/use-toast';

export interface ErrorHandlerOptions {
  /** Custom title for the error toast */
  title?: string;
  /** Show a retry button */
  showRetry?: boolean;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Log error to console */
  logToConsole?: boolean;
}

/**
 * Handle API errors consistently with user-friendly messages
 */
export function handleApiError(
  error: unknown,
  toast: ReturnType<typeof ToastType>,
  options: ErrorHandlerOptions = {}
) {
  const {
    title,
    showRetry = false,
    onRetry,
    logToConsole = true,
  } = options;

  // Log to console in development
  if (logToConsole && process.env.NODE_ENV === 'development') {
    console.error('Error caught by handleApiError:', error);
  }

  // Handle ApiError instances
  if (error instanceof ApiError) {
    // Validation errors (422) with field-level details
    if (error.isValidationError() && error.details) {
      const messages = Object.entries(error.details)
        .map(([field, errors]) => `• ${field}: ${errors.join(', ')}`)
        .join('\n');

      toast({
        title: title || 'Dữ liệu không hợp lệ',
        description: messages,
        variant: 'destructive',
      });
      return;
    }

    // Not found errors (404)
    if (error.isNotFoundError()) {
      toast({
        title: title || 'Không tìm thấy',
        description: error.message || 'Dữ liệu không tồn tại hoặc đã bị xóa',
        variant: 'destructive',
      });
      return;
    }

    // Network errors
    if (error.isNetworkError()) {
      toast({
        title: title || 'Lỗi kết nối',
        description:
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
        variant: 'destructive',
        ...(showRetry &&
          onRetry && {
            action: {
              label: 'Thử lại',
              onClick: onRetry,
            },
          }),
      });
      return;
    }

    // Authentication errors (handled automatically by httpClient, but just in case)
    if (error.isAuthError()) {
      toast({
        title: 'Phiên đăng nhập hết hạn',
        description: 'Vui lòng đăng nhập lại để tiếp tục',
        variant: 'destructive',
      });
      return;
    }

    // Generic API errors
    toast({
      title: title || 'Có lỗi xảy ra',
      description: error.message || 'Vui lòng thử lại sau',
      variant: 'destructive',
      ...(showRetry &&
        onRetry && {
          action: {
            label: 'Thử lại',
            onClick: onRetry,
          },
        }),
    });
    return;
  }

  // Handle native Error instances
  if (error instanceof Error) {
    toast({
      title: title || 'Lỗi',
      description: error.message,
      variant: 'destructive',
    });
    return;
  }

  // Unknown error types
  toast({
    title: title || 'Lỗi không xác định',
    description: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
    variant: 'destructive',
  });
}

/**
 * Extract user-friendly error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isValidationError() && error.details) {
      return Object.entries(error.details)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('; ');
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Check if error is a specific type
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.isValidationError();
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.isNotFoundError();
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.isNetworkError();
}
