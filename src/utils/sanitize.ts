import { ErrorDetails } from '../services/error';

// Sensitive data patterns to redact
const SENSITIVE_PATTERNS = {
  email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  password: /(?:password["']?\s*[:=]\s*["']?)([^"'\s]+)(?:["']?)/gi,
  token: /(?:bearer token:\s*["']?)([^"'\s]+)(?:["']?)/gi,
  creditCard: /(\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b)/g,
  phoneNumber: /(\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/g,
  ssn: /(\b\d{3}[-]?\d{2}[-]?\d{4}\b)/g,
  bearerToken: /Bearer\s+([a-zA-Z0-9._-]+)/gi,
};

// List of sensitive keys to remove entirely
const SENSITIVE_KEYS = [
  'password',
  'token',
  'auth',
  'authorization',
  'credit',
  'ssn',
  'refresh',
  'secret',
  'key',
];

// List of keys to redact but keep
const REDACT_KEYS = ['phone', 'email'];

// Error codes for different types of errors
export enum ErrorCode {
  AUTH_FAILED = 'AUTH_001',
  NETWORK_ERROR = 'NET_001',
  DATA_ERROR = 'DATA_001',
  VALIDATION_ERROR = 'VAL_001',
  UNKNOWN_ERROR = 'UNK_001',
}

interface SanitizedError {
  code: ErrorCode;
  message: string;
  category: string;
  severity: string;
  timestamp: number;
  sanitizedData: Record<string, unknown>;
}

/**
 * Redacts sensitive information from a string
 * @param text The text to sanitize
 * @returns Sanitized text with sensitive information redacted
 */
export function redactSensitiveInfo(text: string): string {
  let sanitized = text;

  // First handle the special case of "bearer token:"
  if (sanitized.toLowerCase().includes('bearer token:')) {
    return sanitized.replace(/bearer token:\s*["']?[^"'\s]+["']?/gi, match => {
      // Preserve the case of "bearer token:"
      const prefix = match.substring(0, match.indexOf(':') + 1);
      return `${prefix} [REDACTED_TOKEN]`;
    });
  }

  // Then handle other patterns
  Object.entries(SENSITIVE_PATTERNS).forEach(([key, pattern]) => {
    if (key === 'bearerToken') {
      sanitized = sanitized.replace(pattern, 'Bearer [REDACTED_TOKEN]');
    } else if (key === 'password') {
      sanitized = sanitized.replace(pattern, match => {
        // Preserve the case of "password:"
        const prefix = match.substring(0, match.indexOf(':') + 1);
        return `${prefix} [REDACTED_PASSWORD]`;
      });
    } else if (key !== 'token') {
      // Skip token as it's handled above
      sanitized = sanitized.replace(pattern, (match, _, offset) => {
        // Find the label before the sensitive data
        const beforeMatch = sanitized.substring(0, offset);
        const label = beforeMatch.match(/(\w+):\s*$/)?.[1];

        // If there's a label, preserve its case
        if (label) {
          return `[REDACTED_${key.toUpperCase()}]`;
        }
        return `[REDACTED_${key.toUpperCase()}]`;
      });
    }
  });

  return sanitized;
}

/**
 * Determines the appropriate error code based on error details
 */
function determineErrorCode(details: ErrorDetails): ErrorCode {
  const message = details.error.message.toLowerCase();

  if (message.includes('auth') || message.includes('unauthorized')) {
    return ErrorCode.AUTH_FAILED;
  }
  if (message.includes('network') || message.includes('fetch')) {
    return ErrorCode.NETWORK_ERROR;
  }
  if (message.includes('data') || message.includes('parse')) {
    return ErrorCode.DATA_ERROR;
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorCode.VALIDATION_ERROR;
  }

  return ErrorCode.UNKNOWN_ERROR;
}

/**
 * Checks if a key contains sensitive information
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k));
}

/**
 * Checks if a key should be redacted but kept
 */
function isRedactKey(key: string): boolean {
  return REDACT_KEYS.some(k => key.toLowerCase().includes(k));
}

/**
 * Sanitizes an object recursively
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip sensitive keys entirely
    if (isSensitiveKey(key)) {
      continue;
    }

    // Handle keys that should be redacted but kept
    if (isRedactKey(key)) {
      sanitized[key] = `[REDACTED_${key.toUpperCase()}]`;
      continue;
    }

    // Handle nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const sanitizedNested = sanitizeObject(value as Record<string, unknown>);
      // Always include headers object, even if empty
      if (key === 'headers' || Object.keys(sanitizedNested).length > 0) {
        sanitized[key] = sanitizedNested;
      }
    }
    // Sanitize string values
    else if (typeof value === 'string') {
      const sanitizedValue = redactSensitiveInfo(value);
      // Only include the value if it wasn't completely redacted
      if (!SENSITIVE_KEYS.some(k => sanitizedValue === `[REDACTED_${k.toUpperCase()}]`)) {
        sanitized[key] = sanitizedValue;
      }
    }
    // Keep other values as is
    else if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitizes error details for safe logging
 * @param details The error details to sanitize
 * @returns Sanitized error object safe for logging
 */
export function sanitizeErrorDetails(details: ErrorDetails): SanitizedError {
  // Sanitize additional data if it exists
  const sanitizedData = details.additionalData ? sanitizeObject(details.additionalData) : {};

  return {
    code: determineErrorCode(details),
    message: redactSensitiveInfo(details.error.message),
    category: details.category,
    severity: details.severity,
    timestamp: details.timestamp,
    sanitizedData,
  };
}

/**
 * Creates a safe error message for user display
 * @param code The error code
 * @returns User-friendly error message
 */
export function getUserFriendlyError(code: ErrorCode): string {
  switch (code) {
    case ErrorCode.AUTH_FAILED:
      return 'Authentication failed. Please try logging in again.';
    case ErrorCode.NETWORK_ERROR:
      return 'Network connection issue. Please check your internet connection.';
    case ErrorCode.DATA_ERROR:
      return 'There was an issue processing your request. Please try again.';
    case ErrorCode.VALIDATION_ERROR:
      return 'The provided information is invalid. Please check your input.';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
}
