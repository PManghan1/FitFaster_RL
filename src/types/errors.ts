import { ErrorInfo } from 'react';

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
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  SYNC = 'sync',
  API = 'api',
  UNKNOWN = 'unknown',
}

export enum ErrorCode {
  // Network errors
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',

  // Auth errors
  AUTH_INVALID = 'AUTH_INVALID',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  AUTH_REQUIRED = 'AUTH_REQUIRED',

  // Security errors
  SECURITY_BREACH = 'SECURITY_BREACH',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',

  // Performance errors
  PERFORMANCE_THRESHOLD = 'PERFORMANCE_THRESHOLD',
  MEMORY_LIMIT = 'MEMORY_LIMIT',
  SLOW_OPERATION = 'SLOW_OPERATION',

  // Sync errors
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  SYNC_FAILED = 'SYNC_FAILED',

  // API errors
  API_ERROR = 'API_ERROR',
  API_VALIDATION = 'API_VALIDATION',
  API_RATE_LIMIT = 'API_RATE_LIMIT',

  // Data errors
  DATA_INVALID = 'DATA_INVALID',
  DATA_CORRUPT = 'DATA_CORRUPT',

  // UI errors
  UI_RENDER = 'UI_RENDER',
  UI_INTERACTION = 'UI_INTERACTION',
}

export interface ErrorMetrics {
  timestamp: number;
  duration?: number;
  retryCount?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  action?: string;
  component?: string;
  recoveryAttempted?: boolean;
  recoverySuccessful?: boolean;
}

export interface ErrorDetails {
  error: Error;
  errorInfo?: ErrorInfo;
  code: ErrorCode;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  componentStack?: string;
  context?: ErrorContext;
  metrics?: ErrorMetrics;
  additionalData?: Record<string, unknown>;
}

export interface ErrorPattern {
  code: ErrorCode;
  category: ErrorCategory;
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
  averageDuration?: number;
  recoveryRate?: number;
}

export interface ErrorRecoveryStrategy {
  retry?: boolean;
  maxAttempts?: number;
  fallback?: () => Promise<void>;
  cleanup?: () => Promise<void>;
  validation?: () => Promise<boolean>;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    userMessage: string;
    recoveryAction?: string;
    correlationId?: string;
  };
}

export interface ErrorAnalytics {
  patterns: ErrorPattern[];
  totalErrors: number;
  recoveryRate: number;
  averageResponseTime: number;
  criticalErrorCount: number;
  timestamp: number;
}
