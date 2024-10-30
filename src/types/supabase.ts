import { PostgrestError } from '@supabase/supabase-js';
import {
  EssentialProfile,
  HealthData,
  ConsentRecord,
  ProcessingLog,
  PrivacySettings,
} from './profile';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: EssentialProfile;
        Insert: Omit<EssentialProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EssentialProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      health_data: {
        Row: HealthData;
        Insert: Omit<HealthData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HealthData, 'id' | 'created_at' | 'updated_at'>>;
      };
      consent_records: {
        Row: ConsentRecord;
        Insert: Omit<ConsentRecord, 'id'>;
        Update: Partial<Omit<ConsentRecord, 'id'>>;
      };
      processing_logs: {
        Row: ProcessingLog;
        Insert: Omit<ProcessingLog, 'id'>;
        Update: never;
      };
      privacy_settings: {
        Row: PrivacySettings;
        Insert: Omit<PrivacySettings, 'id' | 'updated_at'>;
        Update: Partial<Omit<PrivacySettings, 'id' | 'updated_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Helper types for Supabase responses
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type DbResultErr = PostgrestError;

// Type guard for PostgrestError
export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as PostgrestError).code === 'string' &&
    'message' in error &&
    typeof (error as PostgrestError).message === 'string'
  );
}

// Helper type for Supabase query responses
export interface QueryResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface QueryArrayResponse<T> {
  data: T[] | null;
  error: PostgrestError | null;
}

// Helper type for encrypted data
export interface EncryptedData<T> {
  encrypted: boolean;
  data: T;
}

// Helper functions for type checking
export function isQueryResponse<T>(response: unknown): response is QueryResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'error' in response
  );
}

export function isQueryArrayResponse<T>(response: unknown): response is QueryArrayResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'error' in response &&
    (response.data === null || Array.isArray(response.data))
  );
}
