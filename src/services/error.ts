import { ErrorInfo } from 'react';
import * as Sentry from '@sentry/react-native';
import { PerformanceMonitor } from '../utils/performance';
import { analyticsService } from './analytics';
import { sanitizeErrorDetails, getUserFriendlyError } from '../utils/sanitize';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'authentication',
  DATA = 'data',
  UI = 'ui',
  UNKNOWN = 'unknown',
}

export interface ErrorDetails {
  error: Error;
  errorInfo?: ErrorInfo;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  componentStack?: string;
  additionalData?: Record<string, unknown>;
}

interface ErrorRecoveryStrategy {
  retry?: boolean;
  maxAttempts?: number;
  fallback?: () => Promise<void>;
  cleanup?: () => Promise<void>;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // milliseconds
  private errorPatterns: Map<string, number> = new Map(); // Track error frequencies

  private constructor() {
    // Private constructor to enforce singleton
    setInterval(() => this.analyzeErrorPatterns(), 3600000); // Analyze patterns hourly
  }

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  async reportError(details: ErrorDetails): Promise<void> {
    PerformanceMonitor.start('error-reporting');

    try {
      // Sanitize error details before logging
      const sanitizedError = sanitizeErrorDetails(details);

      // Log to console in development with sanitized data
      if (__DEV__) {
        console.error('Error Report:', {
          code: sanitizedError.code,
          message: sanitizedError.message,
          severity: sanitizedError.severity,
          category: sanitizedError.category,
          timestamp: new Date(sanitizedError.timestamp).toISOString(),
          componentStack: details.errorInfo?.componentStack,
          additionalData: sanitizedError.sanitizedData,
        });
      }

      // Track error pattern with sanitized message
      const errorKey = `${sanitizedError.category}:${sanitizedError.code}`;
      this.errorPatterns.set(errorKey, (this.errorPatterns.get(errorKey) || 0) + 1);

      // Send to analytics with sanitized data
      analyticsService.trackError(new Error(sanitizedError.message), {
        code: sanitizedError.code,
        severity: sanitizedError.severity,
        category: sanitizedError.category,
        componentStack: details.errorInfo?.componentStack,
        ...sanitizedError.sanitizedData,
      });

      // Apply recovery strategy if available
      const strategy = this.getRecoveryStrategy(details.category, details.error);
      if (strategy) {
        await this.applyRecoveryStrategy(strategy, details);
      }

      // Log performance metrics
      const duration = PerformanceMonitor.end('error-reporting');
      if (duration > 1000) {
        console.warn(`Slow error reporting detected: ${duration}ms`);
      }
    } catch (_error) {
      // We intentionally ignore errors in the error reporting service
      // to prevent infinite loops, but we still want to log them in dev
      if (__DEV__) {
        console.error('Failed to report error:', _error);
      }
    }
  }

  private getRecoveryStrategy(
    category: ErrorCategory,
    _error: Error
  ): ErrorRecoveryStrategy | null {
    switch (category) {
      case ErrorCategory.NETWORK:
        return {
          retry: true,
          maxAttempts: this.MAX_RETRY_ATTEMPTS,
          cleanup: async () => {
            await this.clearNetworkCache();
          },
        };
      case ErrorCategory.AUTH:
        return {
          fallback: async () => {
            await this.handleAuthError();
          },
        };
      case ErrorCategory.DATA:
        return {
          retry: true,
          maxAttempts: 2,
          fallback: async () => {
            await this.loadFallbackData();
          },
        };
      default:
        return null;
    }
  }

  private async applyRecoveryStrategy(
    strategy: ErrorRecoveryStrategy,
    details: ErrorDetails
  ): Promise<void> {
    try {
      if (strategy.cleanup) {
        await strategy.cleanup();
      }

      if (strategy.retry) {
        // Implementation would depend on the specific operation that failed
        console.log('Retrying operation...');
      }

      if (strategy.fallback) {
        await strategy.fallback();
      }
    } catch (_error) {
      if (__DEV__) {
        // Create proper ErrorDetails object for the recovery error
        const recoveryError: ErrorDetails = {
          error: _error as Error,
          severity: ErrorSeverity.HIGH,
          category: ErrorCategory.UNKNOWN,
          timestamp: Date.now(),
        };
        const sanitizedError = sanitizeErrorDetails(recoveryError);
        console.error('Recovery strategy failed:', sanitizedError);
      }
    }
  }

  private async clearNetworkCache(): Promise<void> {
    // Implementation would depend on caching strategy
    console.log('Clearing network cache...');
  }

  private async handleAuthError(): Promise<void> {
    // Implementation would depend on auth setup
    console.log('Handling auth error...');
  }

  private async loadFallbackData(): Promise<void> {
    // Implementation would depend on data structure
    console.log('Loading fallback data...');
  }

  private analyzeErrorPatterns(): void {
    for (const [errorKey, count] of this.errorPatterns.entries()) {
      if (count > 10) {
        // Alert for frequently occurring errors
        Sentry.addBreadcrumb({
          category: 'error_patterns',
          message: 'Frequent error detected',
          data: {
            error_key: errorKey,
            count,
            timeframe: '1h',
          },
        });
      }
    }
    // Reset counters after analysis
    this.errorPatterns.clear();
  }

  categorizeError(error: Error): ErrorCategory {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return ErrorCategory.AUTH;
    }
    if (error.message.includes('data') || error.message.includes('parse')) {
      return ErrorCategory.DATA;
    }
    if (error.message.includes('render') || error.message.includes('component')) {
      return ErrorCategory.UI;
    }
    return ErrorCategory.UNKNOWN;
  }

  determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    // Authentication errors are typically high severity
    if (category === ErrorCategory.AUTH) {
      return ErrorSeverity.HIGH;
    }

    // Network errors might be medium severity
    if (category === ErrorCategory.NETWORK) {
      return ErrorSeverity.MEDIUM;
    }

    // UI errors might be low severity
    if (category === ErrorCategory.UI) {
      return ErrorSeverity.LOW;
    }

    // Data errors could be high severity
    if (category === ErrorCategory.DATA) {
      return ErrorSeverity.HIGH;
    }

    return ErrorSeverity.MEDIUM;
  }

  isRecoverable(error: Error): boolean {
    // Network errors are typically recoverable
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return true;
    }

    // Authentication errors might be recoverable through re-login
    if (error.message.includes('auth') || error.message.includes('token')) {
      return true;
    }

    // Some data errors might be recoverable
    if (error.message.includes('parse')) {
      return true;
    }

    return false;
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = this.MAX_RETRY_ATTEMPTS
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
      }
    }

    throw lastError || new Error('Operation failed after multiple attempts');
  }

  getRecoveryAction(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Check your internet connection and try again';
      case ErrorCategory.AUTH:
        return 'Please log in again to continue';
      case ErrorCategory.DATA:
        return 'Try refreshing the page or restarting the app';
      case ErrorCategory.UI:
        return 'Try navigating back and forth or restarting the app';
      default:
        return 'Please try again or contact support if the issue persists';
    }
  }

  getUserFriendlyMessage(category: ErrorCategory, severity: ErrorSeverity): string {
    if (severity === ErrorSeverity.CRITICAL) {
      return 'A critical error has occurred. Please try again later.';
    }

    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection.';
      case ErrorCategory.AUTH:
        return 'Your session has expired. Please log in again.';
      case ErrorCategory.DATA:
        return 'There was an issue processing your data. Please try again.';
      case ErrorCategory.UI:
        return 'Something went wrong with the display. Please refresh the app.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

export const errorReporting = ErrorReportingService.getInstance();
