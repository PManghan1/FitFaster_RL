import {
  redactSensitiveInfo,
  sanitizeErrorDetails,
  ErrorCode,
  getUserFriendlyError,
} from '../../utils/sanitize';
import { ErrorCategory, ErrorSeverity } from '../../services/error';

describe('sanitize utils', () => {
  describe('redactSensitiveInfo', () => {
    it('should redact email addresses', () => {
      const text = 'User email: test@example.com';
      expect(redactSensitiveInfo(text)).toBe('User email: [REDACTED_EMAIL]');
    });

    it('should redact passwords', () => {
      const text = 'password: "mySecretPass123"';
      expect(redactSensitiveInfo(text)).toBe('password: [REDACTED_PASSWORD]');
    });

    it('should redact auth tokens', () => {
      const text = 'bearer token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"';
      expect(redactSensitiveInfo(text)).toBe('bearer token: [REDACTED_TOKEN]');
    });

    it('should redact credit card numbers', () => {
      const text = 'Card: 4111-1111-1111-1111';
      expect(redactSensitiveInfo(text)).toBe('Card: [REDACTED_CREDITCARD]');
    });

    it('should redact phone numbers', () => {
      const text = 'Phone: 123-456-7890';
      expect(redactSensitiveInfo(text)).toBe('Phone: [REDACTED_PHONENUMBER]');
    });

    it('should handle multiple sensitive data types in one string', () => {
      const text = 'Email: user@example.com, Phone: 123-456-7890';
      expect(redactSensitiveInfo(text)).toBe(
        'Email: [REDACTED_EMAIL], Phone: [REDACTED_PHONENUMBER]'
      );
    });
  });

  describe('sanitizeErrorDetails', () => {
    const mockError = {
      error: new Error('Failed to authenticate user@example.com'),
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.AUTH,
      timestamp: Date.now(),
      additionalData: {
        email: 'user@example.com',
        password: 'secret123',
        attempts: 3,
        deviceId: 'device-123',
      },
    };

    it('should sanitize error message and sensitive data', () => {
      const sanitized = sanitizeErrorDetails(mockError);

      expect(sanitized.message).not.toContain('user@example.com');
      expect(sanitized.message).toContain('[REDACTED_EMAIL]');
      expect(sanitized.sanitizedData).toBeDefined();
      expect(sanitized.sanitizedData?.email).toBe('[REDACTED_EMAIL]');
      expect(sanitized.sanitizedData?.password).toBeUndefined();
      expect(sanitized.sanitizedData?.attempts).toBe(3);
      expect(sanitized.sanitizedData?.deviceId).toBe('device-123');
    });

    it('should assign appropriate error code', () => {
      const sanitized = sanitizeErrorDetails(mockError);
      expect(sanitized.code).toBe(ErrorCode.AUTH_FAILED);
    });

    it('should preserve non-sensitive metadata', () => {
      const sanitized = sanitizeErrorDetails(mockError);
      expect(sanitized.category).toBe(ErrorCategory.AUTH);
      expect(sanitized.severity).toBe(ErrorSeverity.HIGH);
      expect(sanitized.timestamp).toBe(mockError.timestamp);
    });
  });

  describe('getUserFriendlyError', () => {
    it('should return appropriate message for auth errors', () => {
      expect(getUserFriendlyError(ErrorCode.AUTH_FAILED)).toBe(
        'Authentication failed. Please try logging in again.'
      );
    });

    it('should return appropriate message for network errors', () => {
      expect(getUserFriendlyError(ErrorCode.NETWORK_ERROR)).toBe(
        'Network connection issue. Please check your internet connection.'
      );
    });

    it('should return appropriate message for data errors', () => {
      expect(getUserFriendlyError(ErrorCode.DATA_ERROR)).toBe(
        'There was an issue processing your request. Please try again.'
      );
    });

    it('should return appropriate message for validation errors', () => {
      expect(getUserFriendlyError(ErrorCode.VALIDATION_ERROR)).toBe(
        'The provided information is invalid. Please check your input.'
      );
    });

    it('should return generic message for unknown errors', () => {
      expect(getUserFriendlyError(ErrorCode.UNKNOWN_ERROR)).toBe(
        'An unexpected error occurred. Please try again later.'
      );
    });
  });
});
