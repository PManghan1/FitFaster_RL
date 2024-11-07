import { ErrorCode, ErrorCategory, ErrorSeverity } from '../types/errors';
import { analyticsService } from './analytics';
import { performanceAlerts } from '../monitoring';
import { ErrorDetails, ErrorPattern, ErrorRecoveryStrategy, ErrorResponse } from '../types/errors';

/**
 * Error service implementation
 */
export class ErrorService {
  private static instance: ErrorService;
  private patterns: Map<string, ErrorPattern> = new Map();

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Handle error
   */
  async handleError(details: ErrorDetails): Promise<ErrorResponse> {
    try {
      // Track error pattern
      await this.trackPattern(details);

      // Get recovery strategy
      const strategy = this.getRecoveryStrategy(details);

      // Create response
      const response: ErrorResponse = {
        error: details,
        recoverable: !!strategy,
        strategy,
        metadata: {
          timestamp: Date.now(),
        },
      };

      // Track analytics
      await this.trackAnalytics(details);

      return response;
    } catch (error) {
      // Handle service error
      const serviceError = this.createErrorDetails(
        ErrorCode.UNKNOWN_ERROR,
        'Error service failure',
        ErrorCategory.UNKNOWN,
        ErrorSeverity.HIGH,
        {
          error: error as Error,
        }
      );

      return {
        error: serviceError,
        recoverable: false,
      };
    }
  }

  /**
   * Create data error
   */
  createDataError(message: string, options?: Partial<ErrorDetails>): ErrorResponse {
    const details = this.createErrorDetails(
      ErrorCode.DATA_CORRUPT,
      message,
      ErrorCategory.DATA,
      ErrorSeverity.HIGH,
      options
    );

    return {
      error: details,
      recoverable: true,
      strategy: this.getDataRecoveryStrategy(),
    };
  }

  /**
   * Track error pattern
   */
  private async trackPattern(details: ErrorDetails): Promise<void> {
    const key = `${details.category}:${details.code}`;
    const existing = this.patterns.get(key);

    const pattern: ErrorPattern = {
      code: details.code,
      category: details.category,
      count: (existing?.count || 0) + 1,
      frequency: existing ? existing.frequency + 1 : 1,
      lastOccurred: Date.now(),
      averageDuration: details.metrics?.duration || 0,
      metadata: {
        ...existing?.metadata,
        lastError: details,
      },
    };

    this.patterns.set(key, pattern);

    // Monitor pattern
    if (pattern.frequency > 10) {
      performanceAlerts.createAlert('api', 'warning', 'High error frequency detected', {
        pattern,
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.MEDIUM,
      });
    }
  }

  /**
   * Get recovery strategy
   */
  private getRecoveryStrategy(details: ErrorDetails): ErrorRecoveryStrategy | undefined {
    switch (details.category) {
      case ErrorCategory.DATA:
        return this.getDataRecoveryStrategy();
      case ErrorCategory.NETWORK:
        return this.getNetworkRecoveryStrategy();
      case ErrorCategory.PERFORMANCE:
        return this.getPerformanceRecoveryStrategy();
      default:
        return undefined;
    }
  }

  /**
   * Get data recovery strategy
   */
  private getDataRecoveryStrategy(): ErrorRecoveryStrategy {
    return {
      code: ErrorCode.DATA_CORRUPT,
      category: ErrorCategory.DATA,
      maxRetries: 3,
      backoffFactor: 1.5,
      timeout: 5000,
      maxAttempts: 3,
      retry: {
        maxAttempts: 3,
        delay: 1000,
        strategy: 'exponential',
      },
      validation: {
        checks: ['data', 'schema'],
        timeout: 3000,
      },
    };
  }

  /**
   * Get network recovery strategy
   */
  private getNetworkRecoveryStrategy(): ErrorRecoveryStrategy {
    return {
      code: ErrorCode.NETWORK_ERROR,
      category: ErrorCategory.NETWORK,
      maxRetries: 5,
      backoffFactor: 2,
      timeout: 10000,
      maxAttempts: 5,
      retry: {
        maxAttempts: 5,
        delay: 2000,
        strategy: 'exponential',
      },
      validation: {
        checks: ['connectivity'],
        timeout: 5000,
      },
    };
  }

  /**
   * Get performance recovery strategy
   */
  private getPerformanceRecoveryStrategy(): ErrorRecoveryStrategy {
    return {
      code: ErrorCode.PERFORMANCE_DEGRADED,
      category: ErrorCategory.PERFORMANCE,
      maxRetries: 2,
      backoffFactor: 1,
      timeout: 3000,
      maxAttempts: 2,
      retry: {
        maxAttempts: 2,
        delay: 500,
        strategy: 'linear',
      },
      validation: {
        checks: ['resources'],
        timeout: 1000,
      },
    };
  }

  /**
   * Create error details
   */
  private createErrorDetails(
    code: ErrorCode,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    options?: Partial<ErrorDetails>
  ): ErrorDetails {
    return {
      code,
      message,
      category,
      severity,
      timestamp: Date.now(),
      ...options,
    };
  }

  /**
   * Track analytics
   */
  private async trackAnalytics(details: ErrorDetails): Promise<void> {
    await analyticsService.trackError(
      {
        sessionId: `error_${Date.now()}`,
        platform: 'react-native',
        appVersion: '1.0.0',
        deviceInfo: {
          os: 'unknown',
          version: 'unknown',
          model: 'unknown',
        },
        message: `Error: ${details.code}`,
      },
      {
        code: details.code,
        message: details.message,
        category: details.category,
        severity: details.severity,
        metadata: details.additionalData,
      }
    );
  }
}

export const errorService = ErrorService.getInstance();
