import * as Sentry from '@sentry/react-native';
import { appMetrics, performanceAlerts } from '../monitoring';
import { analyticsService } from './analytics';
import { sanitizeErrorDetails, getUserFriendlyError } from '../utils/sanitize';
import {
  ErrorSeverity,
  ErrorCategory,
  ErrorCode,
  ErrorDetails,
  ErrorPattern,
  ErrorRecoveryStrategy,
  ErrorResponse,
  ErrorAnalytics,
  ErrorMetrics,
} from '../types/errors';

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // milliseconds
  private readonly PATTERN_ANALYSIS_INTERVAL = 3600000; // 1 hour
  private readonly ERROR_THRESHOLD = 10; // Errors per hour for pattern detection

  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recoveryMetrics: Map<ErrorCode, { attempts: number; successes: number }> = new Map();

  private constructor() {
    setInterval(() => void this.analyzeErrorPatterns(), this.PATTERN_ANALYSIS_INTERVAL);
  }

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  /**
   * Convert ErrorMetrics to a plain object for analytics
   */
  private metricsToRecord(metrics?: ErrorMetrics): Record<string, unknown> | undefined {
    if (!metrics) return undefined;
    return {
      timestamp: metrics.timestamp,
      duration: metrics.duration,
      retryCount: metrics.retryCount,
      memoryUsage: metrics.memoryUsage,
      cpuUsage: metrics.cpuUsage,
    };
  }

  /**
   * Convert sanitized error to Sentry context
   */
  private errorToContext(
    sanitizedError: ReturnType<typeof sanitizeErrorDetails>
  ): Record<string, unknown> {
    return {
      message: sanitizedError.message,
      severity: sanitizedError.severity,
      category: sanitizedError.category,
      context: sanitizedError.context || {},
      data: sanitizedError.sanitizedData || {},
    };
  }

  async reportError(details: ErrorDetails): Promise<ErrorResponse> {
    const startTime = Date.now();
    const correlationId = `${details.category}-${startTime}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Start performance tracking
      await appMetrics.trackOperation('error-handling', async () => {
        // Sanitize error details before logging
        const sanitizedError = sanitizeErrorDetails(details);

        // Track error pattern
        this.trackErrorPattern(details, startTime);

        // Log sanitized error in development
        if (__DEV__) {
          console.error('Error Report:', {
            correlationId,
            code: details.code,
            message: sanitizedError.message,
            severity: details.severity,
            category: details.category,
            context: sanitizedError.context,
          });
        }

        // Report to Sentry
        Sentry.captureException(details.error, {
          level: details.severity === ErrorSeverity.CRITICAL ? 'fatal' : 'error',
          tags: {
            code: details.code,
            category: details.category,
            correlationId,
          },
          contexts: {
            performance: this.metricsToRecord(details.metrics),
            error: this.errorToContext(sanitizedError),
          },
        });

        // Report to analytics with sanitized data
        await analyticsService.trackError(
          {
            sessionId: details.context?.sessionId || correlationId,
            platform: 'react-native',
            appVersion: '1.0.0', // Should come from app config
            deviceInfo: {
              os: 'unknown',
              version: 'unknown',
              model: 'unknown',
            },
            performanceMetrics: {
              responseTime: Date.now() - startTime,
            },
            context: sanitizedError.context,
            message: sanitizedError.message,
          },
          {
            code: details.code,
            severity: details.severity,
            category: details.category,
            correlationId,
          }
        );

        // Check for critical performance impact
        if (details.category === ErrorCategory.PERFORMANCE) {
          performanceAlerts.createAlert(
            'api',
            details.severity === ErrorSeverity.CRITICAL ? 'critical' : 'warning',
            sanitizedError.message,
            this.metricsToRecord(details.metrics)
          );
        }

        // Apply recovery strategy if available
        const strategy = this.getRecoveryStrategy(details);
        if (strategy) {
          await this.applyRecoveryStrategy(strategy, details);
        }
      });

      // Return user-friendly error response
      return {
        success: false,
        error: {
          code: details.code,
          message: sanitizeErrorDetails(details).message,
          userMessage: this.getUserFriendlyMessage(details),
          recoveryAction: this.getRecoveryAction(details.category),
          correlationId,
        },
      };
    } catch (error) {
      // Handle errors in the error reporting itself
      if (__DEV__) {
        console.error('Error reporting failed:', error);
      }

      // Report internal error to Sentry
      Sentry.captureException(error, {
        level: 'fatal',
        tags: {
          code: ErrorCode.DATA_CORRUPT,
          category: ErrorCategory.UNKNOWN,
          correlationId,
        },
      });

      // Return a generic error response
      return {
        success: false,
        error: {
          code: ErrorCode.DATA_CORRUPT,
          message: 'Error reporting failed',
          userMessage: 'An unexpected error occurred',
          correlationId,
        },
      };
    }
  }

  private trackErrorPattern(details: ErrorDetails, timestamp: number): void {
    const key = `${details.category}:${details.code}`;
    const existing = this.errorPatterns.get(key);

    if (existing) {
      existing.count++;
      existing.lastOccurrence = timestamp;
      existing.averageDuration = existing.averageDuration
        ? (existing.averageDuration + (details.metrics?.duration || 0)) / 2
        : details.metrics?.duration;
    } else {
      this.errorPatterns.set(key, {
        code: details.code,
        category: details.category,
        count: 1,
        firstOccurrence: timestamp,
        lastOccurrence: timestamp,
        averageDuration: details.metrics?.duration,
      });
    }
  }

  private getRecoveryStrategy(details: ErrorDetails): ErrorRecoveryStrategy | null {
    switch (details.category) {
      case ErrorCategory.NETWORK:
        return {
          retry: true,
          maxAttempts: this.MAX_RETRY_ATTEMPTS,
          validation: async () => await this.checkNetworkConnection(),
          cleanup: async () => await this.clearNetworkCache(),
        };
      case ErrorCategory.SECURITY:
        return {
          retry: false,
          cleanup: async () => await this.handleSecurityBreach(),
        };
      case ErrorCategory.PERFORMANCE:
        return {
          retry: true,
          maxAttempts: 2,
          validation: async () => await this.checkResourceAvailability(),
          cleanup: async () => await this.cleanupResources(),
        };
      case ErrorCategory.SYNC:
        return {
          retry: true,
          maxAttempts: 3,
          fallback: async () => await this.loadOfflineData(),
        };
      default:
        return null;
    }
  }

  private async applyRecoveryStrategy(
    strategy: ErrorRecoveryStrategy,
    details: ErrorDetails
  ): Promise<boolean> {
    const key = details.code;
    const metrics = this.recoveryMetrics.get(key) || { attempts: 0, successes: 0 };
    metrics.attempts++;

    try {
      if (strategy.cleanup) {
        await strategy.cleanup();
      }

      if (strategy.retry && strategy.maxAttempts) {
        const success = await this.retryOperation(async () => {
          if (strategy.validation) {
            return await strategy.validation();
          }
          return true;
        }, strategy.maxAttempts);

        if (success) {
          metrics.successes++;
          this.recoveryMetrics.set(key, metrics);
          return true;
        }
      }

      if (strategy.fallback) {
        await strategy.fallback();
        metrics.successes++;
        this.recoveryMetrics.set(key, metrics);
        return true;
      }

      return false;
    } catch (error) {
      this.recoveryMetrics.set(key, metrics);
      return false;
    }
  }

  private async analyzeErrorPatterns(): Promise<ErrorAnalytics> {
    const now = Date.now();
    let criticalPatterns = 0;
    let totalErrors = 0;
    let totalRecoveryAttempts = 0;
    let totalRecoverySuccesses = 0;
    let totalDuration = 0;

    const patterns = Array.from(this.errorPatterns.values()).filter(pattern => {
      const isRecent = now - pattern.lastOccurrence < this.PATTERN_ANALYSIS_INTERVAL;
      if (isRecent) {
        totalErrors += pattern.count;
        if (pattern.count > this.ERROR_THRESHOLD) {
          criticalPatterns++;
        }
        if (pattern.averageDuration) {
          totalDuration += pattern.averageDuration * pattern.count;
        }
        return true;
      }
      return false;
    });

    // Calculate recovery metrics
    for (const metrics of this.recoveryMetrics.values()) {
      totalRecoveryAttempts += metrics.attempts;
      totalRecoverySuccesses += metrics.successes;
    }

    const analytics: ErrorAnalytics = {
      patterns,
      totalErrors,
      recoveryRate: totalRecoveryAttempts ? totalRecoverySuccesses / totalRecoveryAttempts : 0,
      averageResponseTime: totalErrors ? totalDuration / totalErrors : 0,
      criticalErrorCount: criticalPatterns,
      timestamp: now,
    };

    // Report critical patterns
    if (criticalPatterns > 0) {
      performanceAlerts.createAlert(
        'api',
        'critical',
        `Detected ${criticalPatterns} critical error patterns`,
        { patterns: analytics.patterns }
      );
    }

    // Clear old patterns
    this.errorPatterns.clear();
    return analytics;
  }

  private async checkNetworkConnection(): Promise<boolean> {
    // Implementation would depend on network checking logic
    return true;
  }

  private async checkResourceAvailability(): Promise<boolean> {
    // Implementation would depend on resource monitoring
    return true;
  }

  private async clearNetworkCache(): Promise<void> {
    // Implementation would depend on caching strategy
    console.log('Clearing network cache...');
  }

  private async handleSecurityBreach(): Promise<void> {
    // Implementation would depend on security protocols
    console.log('Handling security breach...');
  }

  private async cleanupResources(): Promise<void> {
    // Implementation would depend on resource management
    console.log('Cleaning up resources...');
  }

  private async loadOfflineData(): Promise<void> {
    // Implementation would depend on offline storage
    console.log('Loading offline data...');
  }

  private getUserFriendlyMessage(details: ErrorDetails): string {
    return getUserFriendlyError(details.code);
  }

  private getRecoveryAction(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.SECURITY:
        return 'Please log out and back in to continue';
      case ErrorCategory.PERFORMANCE:
        return 'Try closing other apps or restarting the app';
      case ErrorCategory.SYNC:
        return 'Check your connection and try syncing again';
      default:
        return 'Please try again or contact support if the issue persists';
    }
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
        if (attempt === maxAttempts) break;
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
      }
    }

    throw lastError || new Error('Operation failed after multiple attempts');
  }
}

export const errorReporting = ErrorReportingService.getInstance();
