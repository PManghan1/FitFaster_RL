import { PostgrestError, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';
import { 
  EssentialProfile, 
  HealthData, 
  ConsentRecord, 
  PrivacySettings,
  EncryptedHealthData,
  DecryptedHealthData,
} from '../types/profile';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) return error;
  if (error instanceof Error) {
    return new DatabaseError(error.message);
  }
  return new DatabaseError('Unknown error occurred');
}

export function handleDatabaseError(error: PostgrestError): DatabaseError {
  return new DatabaseError(error.message, error.code, error.details);
}

export function assertDataExists<T>(
  response: PostgrestSingleResponse<T>,
  errorMessage = 'Data not found'
): asserts response is PostgrestSingleResponse<T> & { data: T } {
  if (response.error) {
    throw handleDatabaseError(response.error);
  }
  if (!response.data) {
    throw new DatabaseError(errorMessage);
  }
}

export function assertArrayDataExists<T>(
  response: PostgrestResponse<T>,
  errorMessage = 'Data not found'
): asserts response is PostgrestResponse<T> & { data: T[] } {
  if (response.error) {
    throw handleDatabaseError(response.error);
  }
  if (!response.data) {
    throw new DatabaseError(errorMessage);
  }
}

export function isProfile(data: unknown): data is EssentialProfile {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    'full_name' in data
  );
}

export function isHealthData(data: unknown): data is HealthData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'user_id' in data &&
    'encrypted' in data
  );
}

export function isConsentRecord(data: unknown): data is ConsentRecord {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'user_id' in data &&
    'purpose' in data &&
    'granted' in data
  );
}

export function isPrivacySettings(data: unknown): data is PrivacySettings {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'user_id' in data &&
    'data_retention_period' in data &&
    'marketing_preferences' in data &&
    'data_sharing_preferences' in data
  );
}

export function assertType<T>(
  data: unknown,
  typeGuard: (data: unknown) => data is T,
  errorMessage = 'Invalid data type'
): asserts data is T {
  if (!typeGuard(data)) {
    throw new DatabaseError(errorMessage);
  }
}

// Helper functions for array handling
export function ensureStringArray(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return [];
}

export function stringifyHealthArray(value: string | string[] | null | undefined): string {
  const arr = ensureStringArray(value);
  return JSON.stringify(arr);
}

// Helper function to convert DecryptedHealthData to EncryptedHealthData
export function encryptHealthData(data: Partial<DecryptedHealthData>): Partial<EncryptedHealthData> {
  const { medical_conditions, allergies, medications, ...rest } = data;
  return {
    ...rest,
    medical_conditions: medical_conditions ? stringifyHealthArray(medical_conditions) : undefined,
    allergies: allergies ? stringifyHealthArray(allergies) : undefined,
    medications: medications ? stringifyHealthArray(medications) : undefined,
  };
}

// Helper function to convert EncryptedHealthData to DecryptedHealthData
export function decryptHealthData(data: EncryptedHealthData): DecryptedHealthData {
  const { medical_conditions, allergies, medications, ...rest } = data;
  return {
    ...rest,
    medical_conditions: ensureStringArray(medical_conditions),
    allergies: ensureStringArray(allergies),
    medications: ensureStringArray(medications),
  };
}

// Helper function to safely spread objects
export function safeSpread<T extends object>(obj: T | null | undefined): Partial<T> {
  if (!obj || typeof obj !== 'object') return {};
  return { ...obj };
}

// Helper function to ensure array type
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

// Helper function to safely get object property
export function safeGet<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  try {
    return obj[key];
  } catch {
    return undefined;
  }
}
