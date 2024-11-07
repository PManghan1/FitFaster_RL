/**
 * Error categories
 */
export enum ErrorCategory {
  DATA = 'data',
  NETWORK = 'network',
  PERFORMANCE = 'performance',
  SYNC = 'sync',
  VALIDATION = 'validation',
  WORKER = 'worker',
  SECURITY = 'security',
  AUTH = 'auth',
  API = 'api',
  UI = 'ui',
  UNKNOWN = 'unknown',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error codes
 */
export enum ErrorCode {
  // Data errors
  DATA_CORRUPT = 'DATA_CORRUPT',
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_INVALID = 'DATA_INVALID',

  // Network errors
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Performance errors
  PERFORMANCE_TIMEOUT = 'PERFORMANCE_TIMEOUT',
  PERFORMANCE_DEGRADED = 'PERFORMANCE_DEGRADED',
  PERFORMANCE_THRESHOLD = 'PERFORMANCE_THRESHOLD',
  MEMORY_LIMIT = 'MEMORY_LIMIT',
  SLOW_OPERATION = 'SLOW_OPERATION',

  // Sync errors
  SYNC_FAILED = 'SYNC_FAILED',
  SYNC_CONFLICT = 'SYNC_CONFLICT',

  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_EXPIRED = 'VALIDATION_EXPIRED',

  // Worker errors
  WORKER_ERROR = 'WORKER_ERROR',
  WORKER_TIMEOUT = 'WORKER_TIMEOUT',

  // Security errors
  SECURITY_ERROR = 'SECURITY_ERROR',
  SECURITY_EXPIRED = 'SECURITY_EXPIRED',
  SECURITY_BREACH = 'SECURITY_BREACH',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',

  // Auth errors
  AUTH_INVALID = 'AUTH_INVALID',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  AUTH_REQUIRED = 'AUTH_REQUIRED',

  // API errors
  API_ERROR = 'API_ERROR',
  API_VALIDATION = 'API_VALIDATION',
  API_RATE_LIMIT = 'API_RATE_LIMIT',

  // UI errors
  UI_RENDER = 'UI_RENDER',
  UI_INTERACTION = 'UI_INTERACTION',

  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Alert types
 */
export type AlertType = 'api' | 'worker' | 'sync' | 'security' | 'performance' | 'system';

/**
 * Alert severity
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Error metrics data
 */
export interface ErrorMetricsData {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  topErrors: ErrorPattern[];
  timestamp: number;
  duration: number;
  retryCount: number;
  memoryUsage: number;
  cpuUsage: number;
  timeRange: {
    start: number;
    end: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Error details
 */
export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  context?: {
    route?: string;
    action?: string;
    component?: string;
    sessionId?: string;
  };
  error?: Error;
  userMessage?: string;
  recoveryAction?: string;
  correlationId?: string;
  additionalData?: Record<string, unknown>;
  metrics?: ErrorMetricsData;
}

/**
 * Error pattern
 */
export interface ErrorPattern {
  code: ErrorCode;
  category: ErrorCategory;
  count: number;
  frequency: number;
  lastOccurred: number;
  averageDuration: number;
  metadata?: Record<string, unknown>;
}

/**
 * Error validation
 */
export interface ErrorValidation {
  checks: string[];
  timeout: number;
  validate?: () => Promise<boolean>;
}

/**
 * Error retry strategy
 */
export interface ErrorRetryStrategy {
  maxAttempts: number;
  delay: number;
  strategy: 'linear' | 'exponential';
  enabled?: boolean;
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  code: ErrorCode;
  category: ErrorCategory;
  maxRetries: number;
  backoffFactor: number;
  timeout: number;
  maxAttempts: number;
  retry: ErrorRetryStrategy;
  validation: ErrorValidation;
  cleanup?: () => Promise<void>;
  fallback?: () => Promise<void>;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: ErrorDetails;
  recoverable: boolean;
  strategy?: ErrorRecoveryStrategy;
  metadata?: Record<string, unknown>;
}

/**
 * Error analytics
 */
export interface ErrorAnalytics {
  type: 'error' | 'warning' | 'critical';
  code: ErrorCode;
  category: ErrorCategory;
  severity: ErrorSeverity;
  count: number;
  firstSeen: number;
  lastSeen: number;
  patterns: ErrorPattern[];
  totalErrors: number;
  recoveryRate?: number;
  criticalErrorCount?: number;
  averageResponseTime?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Error metrics
 */
export type ErrorMetrics = ErrorMetricsData;

/**
 * Error with metadata
 */
export interface ErrorWithMetadata {
  code: ErrorCode;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  metadata?: Record<string, unknown>;
}
