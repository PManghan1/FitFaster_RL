import { errorReporting, ErrorCategory, ErrorSeverity, ErrorDetails } from '../../services/error';
import { analyticsService } from '../../services/analytics';

// Mock analytics service
jest.mock('../../services/analytics', () => ({
  analyticsService: {
    trackError: jest.fn(),
  },
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
}));

describe('ErrorReportingService Integration Tests', () => {
  // Setup console spies
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup spies before each test
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Mock __DEV__ to true for testing console output
    (global as any).__DEV__ = true;

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console spies after each test
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Authentication Error Scenarios', () => {
    it('should handle login failures securely', async () => {
      const loginError: ErrorDetails = {
        error: new Error('Authentication failed for user@example.com with invalid credentials'),
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTH,
        timestamp: Date.now(),
        additionalData: {
          email: 'user@example.com',
          password: 'secretpass123',
          provider: 'email',
        },
      };

      await errorReporting.reportError(loginError);

      // Verify console output in dev mode
      expect(consoleErrorSpy).toHaveBeenCalled();
      const consoleOutput = consoleErrorSpy.mock.calls[0][1];

      // Check that sensitive data is not present in logs
      expect(consoleOutput.message).not.toContain('user@example.com');
      expect(consoleOutput.message).not.toContain('secretpass123');
      expect(consoleOutput.additionalData).not.toHaveProperty('password');

      // Verify analytics tracking
      expect(analyticsService.trackError).toHaveBeenCalled();
      const analyticsCall = (analyticsService.trackError as jest.Mock).mock.calls[0];
      expect(analyticsCall[1].email).not.toContain('@');
      expect(analyticsCall[1]).not.toHaveProperty('password');
    });
  });

  describe('Network Error Scenarios', () => {
    it('should handle API failures with tokens securely', async () => {
      const networkError: ErrorDetails = {
        error: new Error('Failed to fetch data: Bearer token: xyz123abc'),
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        timestamp: Date.now(),
        additionalData: {
          url: 'https://api.example.com/data',
          token: 'Bearer xyz123abc',
          headers: {
            Authorization: 'Bearer xyz123abc',
          },
        },
      };

      await errorReporting.reportError(networkError);

      // Verify console output
      expect(consoleErrorSpy).toHaveBeenCalled();
      const consoleOutput = consoleErrorSpy.mock.calls[0][1];

      // Check that sensitive data is not present in logs
      expect(consoleOutput.message).not.toContain('xyz123abc');
      expect(consoleOutput.additionalData).not.toHaveProperty('token');
      expect(consoleOutput.additionalData?.headers).not.toHaveProperty('Authorization');
    });
  });

  describe('Data Error Scenarios', () => {
    it('should handle personal data errors securely', async () => {
      const dataError: ErrorDetails = {
        error: new Error('Failed to process user data for John Doe (123-45-6789)'),
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATA,
        timestamp: Date.now(),
        additionalData: {
          name: 'John Doe',
          ssn: '123-45-6789',
          phone: '555-0123',
          creditCard: '4111-1111-1111-1111',
        },
      };

      await errorReporting.reportError(dataError);

      // Verify console output
      expect(consoleErrorSpy).toHaveBeenCalled();
      const consoleOutput = consoleErrorSpy.mock.calls[0][1];

      // Check that sensitive data is not present in logs
      expect(consoleOutput.message).not.toContain('123-45-6789');
      expect(consoleOutput.additionalData).not.toHaveProperty('ssn');
      expect(consoleOutput.additionalData).not.toHaveProperty('creditCard');
      expect(consoleOutput.additionalData?.phone).not.toContain('555-0123');
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should attempt recovery for network errors', async () => {
      const networkError: ErrorDetails = {
        error: new Error('Network timeout'),
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.NETWORK,
        timestamp: Date.now(),
      };

      await errorReporting.reportError(networkError);

      // Verify recovery attempt
      expect(consoleLogSpy).toHaveBeenCalledWith('Clearing network cache...');
    });

    it('should handle auth recovery securely', async () => {
      const authError: ErrorDetails = {
        error: new Error('Token expired for user@example.com'),
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTH,
        timestamp: Date.now(),
        additionalData: {
          token: 'expired_token_xyz',
          refreshToken: 'refresh_token_abc',
        },
      };

      await errorReporting.reportError(authError);

      // Verify recovery attempt without exposing sensitive data
      expect(consoleLogSpy).toHaveBeenCalledWith('Handling auth error...');

      // Verify no sensitive data in logs
      const consoleOutput = consoleErrorSpy.mock.calls[0][1];
      expect(consoleOutput.message).not.toContain('user@example.com');
      expect(consoleOutput.additionalData).not.toHaveProperty('token');
      expect(consoleOutput.additionalData).not.toHaveProperty('refreshToken');
    });
  });

  describe('Error Pattern Analysis', () => {
    it('should track error patterns without exposing sensitive data', async () => {
      // Simulate multiple auth errors
      const authError: ErrorDetails = {
        error: new Error('Auth failed for user@example.com'),
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.AUTH,
        timestamp: Date.now(),
      };

      // Report same error multiple times
      for (let i = 0; i < 11; i++) {
        await errorReporting.reportError(authError);
      }

      // Force pattern analysis
      (errorReporting as any).analyzeErrorPatterns();

      // Verify pattern analysis doesn't expose sensitive data
      expect(consoleErrorSpy).toHaveBeenCalled();
      const allCalls = consoleErrorSpy.mock.calls;
      allCalls.forEach(call => {
        const output = call[1];
        if (output?.message) {
          expect(output.message).not.toContain('user@example.com');
        }
      });
    });
  });
});
