import { ErrorCode, ErrorCategory, ErrorSeverity, ErrorDetails } from '../../types/errors';
import { errorService } from '../../services/error';

/**
 * Track user error
 */
export async function trackUserError(error: Error): Promise<void> {
  const details: ErrorDetails = {
    code: ErrorCode.DATA_INVALID,
    message: error.message,
    category: ErrorCategory.DATA,
    severity: ErrorSeverity.LOW,
    timestamp: Date.now(),
    error,
    additionalData: {
      stack: error.stack,
      name: error.name,
      type: 'user_error',
    },
  };

  await errorService.handleError(details);
}

/**
 * Track validation error
 */
export async function trackValidationError(
  message: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const details: ErrorDetails = {
    code: ErrorCode.VALIDATION_FAILED,
    message,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    timestamp: Date.now(),
    additionalData: {
      ...metadata,
      type: 'validation_error',
    },
  };

  await errorService.handleError(details);
}

/**
 * Track performance error
 */
export async function trackPerformanceError(
  message: string,
  duration: number,
  metadata: Record<string, unknown>
): Promise<void> {
  // Create error category counts
  const errorsByCategory: Record<ErrorCategory, number> = {
    [ErrorCategory.DATA]: 0,
    [ErrorCategory.NETWORK]: 0,
    [ErrorCategory.PERFORMANCE]: 1,
    [ErrorCategory.SYNC]: 0,
    [ErrorCategory.VALIDATION]: 0,
    [ErrorCategory.WORKER]: 0,
    [ErrorCategory.SECURITY]: 0,
    [ErrorCategory.AUTH]: 0,
    [ErrorCategory.API]: 0,
    [ErrorCategory.UI]: 0,
    [ErrorCategory.UNKNOWN]: 0,
  };

  // Create error severity counts
  const errorsBySeverity: Record<ErrorSeverity, number> = {
    [ErrorSeverity.LOW]: 0,
    [ErrorSeverity.MEDIUM]: 0,
    [ErrorSeverity.HIGH]: 1,
    [ErrorSeverity.CRITICAL]: 0,
  };

  const now = Date.now();

  const details: ErrorDetails = {
    code: ErrorCode.PERFORMANCE_DEGRADED,
    message,
    category: ErrorCategory.PERFORMANCE,
    severity: ErrorSeverity.HIGH,
    timestamp: now,
    metrics: {
      duration,
      retryCount: 0,
      memoryUsage: 0, // Memory usage not available in React Native
      cpuUsage: 0, // CPU usage not available in React Native
      totalErrors: 1,
      errorsByCategory,
      errorsBySeverity,
      topErrors: [],
      timestamp: now,
      timeRange: {
        start: now,
        end: now,
      },
    },
    additionalData: {
      ...metadata,
      type: 'performance_error',
    },
  };

  await errorService.handleError(details);
}
