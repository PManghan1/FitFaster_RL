import { ErrorCode, ErrorCategory, ErrorSeverity, ErrorDetails } from '../types/errors';

export interface SanitizedError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  context?: {
    route?: string;
    action?: string;
    component?: string;
  };
  sanitizedData?: Record<string, unknown>;
}

// Sensitive data patterns
const SENSITIVE_PATTERNS = {
  email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  password: /(?:password["']?\s*[:=]\s*["']?)([^"'\s]+)(?:["']?)/gi,
  token: /(?:bearer token:\s*["']?)([^"'\s]+)(?:["']?)/gi,
  creditCard: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
};

// Keys that should be removed from error data
const SENSITIVE_KEYS = ['password', 'token', 'auth', 'authorization', 'credit', 'secret', 'key'];

/**
 * Sanitize error details for safe logging and reporting
 */
export function sanitizeErrorDetails(details: ErrorDetails): SanitizedError {
  const sanitizedMessage = sanitizeString(details.error.message);
  const sanitizedData = sanitizeObject(details.additionalData || {});

  const sanitizedContext = details.context
    ? {
        route: details.context.route,
        action: details.context.action,
        component: details.context.component,
      }
    : undefined;

  return {
    code: details.code,
    message: sanitizedMessage,
    severity: details.severity,
    category: details.category,
    timestamp: details.timestamp,
    context: sanitizedContext,
    sanitizedData,
  };
}

/**
 * Sanitize a string by removing sensitive information
 */
function sanitizeString(input: string): string {
  let sanitized = input;

  // Replace sensitive patterns with placeholders
  Object.entries(SENSITIVE_PATTERNS).forEach(([key, pattern]) => {
    sanitized = sanitized.replace(pattern, `[REDACTED_${key.toUpperCase()}]`);
  });

  return sanitized;
}

/**
 * Recursively sanitize an object by removing sensitive data
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip sensitive keys
    if (SENSITIVE_KEYS.some(sensitive => key.toLowerCase().includes(sensitive))) {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Get a user-friendly error message based on error code
 */
export function getUserFriendlyError(code: ErrorCode): string {
  switch (code) {
    // Network errors
    case ErrorCode.NETWORK_OFFLINE:
      return 'Please check your internet connection and try again';
    case ErrorCode.NETWORK_TIMEOUT:
      return 'The request timed out. Please try again';

    // Auth errors
    case ErrorCode.AUTH_INVALID:
      return 'Invalid credentials. Please check your login details';
    case ErrorCode.AUTH_EXPIRED:
      return 'Your session has expired. Please log in again';
    case ErrorCode.AUTH_REQUIRED:
      return 'Please log in to continue';

    // Security errors
    case ErrorCode.SECURITY_BREACH:
      return 'A security issue was detected. Please log in again';
    case ErrorCode.ENCRYPTION_FAILED:
      return 'Unable to secure your data. Please try again';
    case ErrorCode.DECRYPTION_FAILED:
      return 'Unable to access encrypted data. Please try again';

    // Performance errors
    case ErrorCode.PERFORMANCE_THRESHOLD:
      return 'The app is running slowly. Please try again in a moment';
    case ErrorCode.MEMORY_LIMIT:
      return 'The app is running low on memory. Please restart the app';
    case ErrorCode.SLOW_OPERATION:
      return 'This operation is taking longer than expected';

    // Sync errors
    case ErrorCode.SYNC_CONFLICT:
      return 'Unable to sync your changes. Please refresh and try again';
    case ErrorCode.SYNC_FAILED:
      return 'Failed to sync with the server. Changes saved locally';

    // API errors
    case ErrorCode.API_ERROR:
      return 'Unable to complete the request. Please try again';
    case ErrorCode.API_VALIDATION:
      return 'Please check your input and try again';
    case ErrorCode.API_RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again';

    // Data errors
    case ErrorCode.DATA_INVALID:
      return 'Invalid data format. Please check your input';
    case ErrorCode.DATA_CORRUPT:
      return 'Data corruption detected. Please contact support';

    // UI errors
    case ErrorCode.UI_RENDER:
      return 'Display error occurred. Please refresh the app';
    case ErrorCode.UI_INTERACTION:
      return 'Unable to process your action. Please try again';

    default:
      return 'An unexpected error occurred. Please try again';
  }
}
