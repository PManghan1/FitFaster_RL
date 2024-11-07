import { ErrorDetails } from '../types/errors';

/**
 * Sanitize error details for logging
 */
export function sanitizeErrorDetails(details: ErrorDetails): Record<string, unknown> {
  return {
    code: details.code,
    message: details.message,
    category: details.category,
    severity: details.severity,
    timestamp: details.timestamp,
    context: details.context
      ? {
          route: details.context.route,
          action: details.context.action,
          component: details.context.component,
          sessionId: details.context.sessionId,
        }
      : undefined,
    error: details.error
      ? {
          name: details.error.name,
          message: details.error.message,
          stack: details.error.stack,
        }
      : undefined,
    userMessage: details.userMessage,
    recoveryAction: details.recoveryAction,
    correlationId: details.correlationId,
    additionalData: details.additionalData,
    metrics: details.metrics,
  };
}

/**
 * Sanitize error for logging
 */
export function sanitizeError(error: Error): Record<string, unknown> {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

/**
 * Sanitize error response for logging
 */
export function sanitizeErrorResponse(response: {
  error?: ErrorDetails;
  recoverable?: boolean;
  metadata?: Record<string, unknown>;
}): Record<string, unknown> {
  return {
    error: response.error ? sanitizeErrorDetails(response.error) : undefined,
    recoverable: response.recoverable,
    metadata: response.metadata,
  };
}
