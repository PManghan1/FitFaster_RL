import { errorReporting, ErrorCategory, ErrorSeverity } from '../../services/error';
import { createLogger } from '../../utils/logger';

jest.mock('../../utils/logger');
jest.mock('@sentry/react-native');
jest.mock('../services/analytics');

// Create logger for test environment
createLogger('error-test');

describe('ErrorReportingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error Categorization', () => {
    it('correctly categorizes network errors', () => {
      const error = new Error('network connection failed');
      const category = errorReporting.categorizeError(error);
      expect(category).toBe(ErrorCategory.NETWORK);
    });

    it('correctly categorizes auth errors', () => {
      const error = new Error('unauthorized access');
      const category = errorReporting.categorizeError(error);
      expect(category).toBe(ErrorCategory.AUTH);
    });

    it('correctly categorizes data errors', () => {
      const error = new Error('failed to parse data');
      const category = errorReporting.categorizeError(error);
      expect(category).toBe(ErrorCategory.DATA);
    });

    it('defaults to unknown category', () => {
      const error = new Error('some random error');
      const category = errorReporting.categorizeError(error);
      expect(category).toBe(ErrorCategory.UNKNOWN);
    });
  });

  describe('Severity Determination', () => {
    it('assigns high severity to auth errors', () => {
      const error = new Error('auth failed');
      const category = ErrorCategory.AUTH;
      const severity = errorReporting.determineSeverity(error, category);
      expect(severity).toBe(ErrorSeverity.HIGH);
    });

    it('assigns medium severity to network errors', () => {
      const error = new Error('network failed');
      const category = ErrorCategory.NETWORK;
      const severity = errorReporting.determineSeverity(error, category);
      expect(severity).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe('Error Recovery', () => {
    it('identifies recoverable network errors', () => {
      const error = new Error('network timeout');
      expect(errorReporting.isRecoverable(error)).toBe(true);
    });

    it('identifies recoverable auth errors', () => {
      const error = new Error('invalid token');
      expect(errorReporting.isRecoverable(error)).toBe(true);
    });

    it('identifies non-recoverable errors', () => {
      const error = new Error('fatal error');
      expect(errorReporting.isRecoverable(error)).toBe(false);
    });
  });

  describe('User Messages', () => {
    it('provides user-friendly messages for network errors', () => {
      const message = errorReporting.getUserFriendlyMessage(
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM
      );
      expect(message).toContain('internet connection');
    });

    it('provides user-friendly messages for auth errors', () => {
      const message = errorReporting.getUserFriendlyMessage(ErrorCategory.AUTH, ErrorSeverity.HIGH);
      expect(message).toContain('session has expired');
    });

    it('provides appropriate recovery actions', () => {
      const action = errorReporting.getRecoveryAction(ErrorCategory.NETWORK);
      expect(action).toContain('internet connection');
    });
  });

  describe('Retry Operations', () => {
    it('retries failed operations up to max attempts', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success');

      const result = await errorReporting.retryOperation(operation, 3);
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('throws after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('persistent fail'));

      await expect(errorReporting.retryOperation(operation, 2)).rejects.toThrow('persistent fail');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
});
