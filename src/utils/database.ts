import { PostgrestResponse } from '@supabase/supabase-js';
import { AES, enc } from 'crypto-js';

import config from '../config';
import {
  ConsentRecord,
  DecryptedHealthData,
  EncryptedHealthData,
  EssentialProfile,
  PrivacySettings,
} from '../types/profile';

import { PerformanceMonitor } from './performance';

interface QueryMetrics {
  queryTime: number;
  cacheHit: boolean;
  rowCount: number;
  timestamp: number;
}

type DecryptedDataValue = string | number | boolean | null | Record<string, unknown>;
type DecryptedDataRecord = Record<string, DecryptedDataValue>;

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const handleError = (error: unknown): DatabaseError => {
  if (error instanceof DatabaseError) return error;
  if (error instanceof Error) return new DatabaseError(error.message);
  return new DatabaseError('An unknown error occurred');
};

export function assertType<T>(
  data: unknown,
  typeGuard: (data: unknown) => data is T,
  errorMessage: string,
): asserts data is T {
  if (!typeGuard(data)) {
    throw new DatabaseError(errorMessage);
  }
}

export function assertDataExists<T>(
  result: { data: T | null; error: unknown | null },
  errorMessage: string,
): asserts result is { data: T; error: null } {
  if (!result.data || result.error) {
    throw new DatabaseError(errorMessage);
  }
}

export function assertArrayDataExists<T>(
  result: { data: T[] | null; error: unknown | null },
  errorMessage: string,
): asserts result is { data: T[]; error: null } {
  if (!result.data || result.error) {
    throw new DatabaseError(errorMessage);
  }
}

export const isProfile = (data: unknown): data is EssentialProfile => {
  const profile = data as EssentialProfile;
  return (
    typeof profile === 'object' &&
    profile !== null &&
    typeof profile.id === 'string' &&
    typeof profile.email === 'string'
  );
};

export const isHealthData = (data: unknown): data is EncryptedHealthData => {
  const healthData = data as EncryptedHealthData;
  return (
    typeof healthData === 'object' &&
    healthData !== null &&
    typeof healthData.id === 'string' &&
    typeof healthData.user_id === 'string' &&
    typeof healthData.encrypted === 'boolean'
  );
};

export const isConsentRecord = (data: unknown): data is ConsentRecord => {
  const record = data as ConsentRecord;
  return (
    typeof record === 'object' &&
    record !== null &&
    typeof record.id === 'string' &&
    typeof record.user_id === 'string' &&
    typeof record.granted === 'boolean'
  );
};

export const isPrivacySettings = (data: unknown): data is PrivacySettings => {
  const settings = data as PrivacySettings;
  return (
    typeof settings === 'object' &&
    settings !== null &&
    typeof settings.id === 'string' &&
    typeof settings.user_id === 'string'
  );
};

export const encryptHealthData = (
  data: Partial<DecryptedHealthData>,
): Partial<EncryptedHealthData> => {
  const encryptedData = Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = AES.encrypt(JSON.stringify(value), config.security.encryptionKey).toString();
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  return {
    ...encryptedData,
    encrypted: true,
  };
};

export const decryptHealthData = (data: EncryptedHealthData): DecryptedHealthData => {
  const decryptedData = Object.entries(data).reduce((acc, [key, value]) => {
    if (key !== 'encrypted' && typeof value === 'string') {
      try {
        const decrypted = AES.decrypt(value, config.security.encryptionKey).toString(enc.Utf8);
        acc[key] = JSON.parse(decrypted) as DecryptedDataValue;
      } catch (error) {
        console.error(`Failed to decrypt ${key}:`, error);
        acc[key] = null;
      }
    }
    return acc;
  }, {} as DecryptedDataRecord);

  return {
    id: data.id,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    encrypted: true,
    ...decryptedData,
  };
};

/**
 * Database query monitoring and optimization utilities
 */
export class DatabaseMonitor {
  private static metrics: Map<string, QueryMetrics[]> = new Map();
  private static readonly MAX_METRICS_PER_QUERY = 100;
  private static readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second

  static recordMetrics(queryId: string, metrics: QueryMetrics): void {
    if (!this.metrics.has(queryId)) {
      this.metrics.set(queryId, []);
    }

    const queryMetrics = this.metrics.get(queryId)!;
    queryMetrics.push(metrics);

    // Keep only the last MAX_METRICS_PER_QUERY metrics
    if (queryMetrics.length > this.MAX_METRICS_PER_QUERY) {
      queryMetrics.shift();
    }

    // Alert on slow queries
    if (metrics.queryTime > this.SLOW_QUERY_THRESHOLD) {
      console.warn(`Slow query detected: ${queryId} took ${metrics.queryTime}ms`);
    }
  }

  static getQueryMetrics(queryId: string): QueryMetrics[] {
    return this.metrics.get(queryId) || [];
  }

  static getAverageQueryTime(queryId: string): number {
    const metrics = this.getQueryMetrics(queryId);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, metric) => sum + metric.queryTime, 0);
    return total / metrics.length;
  }

  static getCacheHitRate(queryId: string): number {
    const metrics = this.getQueryMetrics(queryId);
    if (metrics.length === 0) return 0;

    const cacheHits = metrics.filter(metric => metric.cacheHit).length;
    return (cacheHits / metrics.length) * 100;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

/**
 * Enhanced Supabase query builder with monitoring
 */
export const createOptimizedQuery = async <T>(
  query: Promise<PostgrestResponse<T>>,
  queryId: string,
  options: {
    monitoring?: boolean;
  } = {},
): Promise<T[]> => {
  const { monitoring = true } = options;
  const cacheKey = `query-${queryId}`;

  PerformanceMonitor.start(cacheKey);

  try {
    const startTime = Date.now();
    const result = await query;
    const endTime = Date.now();

    if (result.error) throw result.error;

    if (monitoring) {
      DatabaseMonitor.recordMetrics(queryId, {
        queryTime: endTime - startTime,
        cacheHit: false,
        rowCount: Array.isArray(result.data) ? result.data.length : 0,
        timestamp: endTime,
      });
    }

    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error(`Query failed for ${queryId}:`, error);
    throw error;
  }
};
