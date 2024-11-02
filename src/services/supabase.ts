import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import config from '../config';
import { Exercise, ExerciseHistory, Set, WorkoutSession } from '../types/workout';

// Database type definition
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string;
        };
        Insert: {
          full_name?: string | null;
          avatar_url?: string | null;
          email: string;
        };
      };
      two_factor_codes: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          code: string;
          expires_at: string;
        };
        Insert: {
          email: string;
          code: string;
          expires_at?: string;
        };
      };
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>;
      };
      workout_sessions: {
        Row: WorkoutSession;
        Insert: Omit<
          WorkoutSession,
          'id' | 'createdAt' | 'updatedAt' | 'exercises' | 'sets' | 'totalSets' | 'totalVolume'
        >;
      };
      workout_sets: {
        Row: Set & { userId: string; sessionId: string; createdAt: string };
        Insert: Omit<Set & { userId: string; sessionId: string }, 'id' | 'createdAt'>;
      };
      exercise_history: {
        Row: ExerciseHistory;
        Insert: Omit<ExerciseHistory, 'id' | 'createdAt'>;
      };
    };
  };
};

type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

// Custom storage adapter using expo-secure-store
const secureStore = {
  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

// Initialize the Supabase client with secure storage
export const supabase = createClient<Database>(config.supabase.url, config.supabase.anonKey, {
  auth: {
    storage: secureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Enhanced Supabase service with query optimization
 */
export class SupabaseService {
  /**
   * Optimized select query with monitoring
   */
  protected async selectQuery<T extends keyof Database['public']['Tables']>(
    table: T,
    fields: (keyof TableRow<T>)[],
    options: {
      page?: number;
      pageSize?: number;
      filters?: Partial<Record<keyof TableRow<T>, string | number | boolean | null>>;
    } = {},
  ): Promise<TableRow<T>[]> {
    const { page, pageSize, filters } = options;
    let query = supabase.from(table).select(fields.join(','));

    // Apply filters if provided
    if (filters) {
      (Object.entries(filters) as [string, string | number | boolean | null][]).forEach(
        ([key, value]) => {
          query = query.eq(key, value);
        },
      );
    }

    // Apply pagination if provided
    if (page && pageSize) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const response = await query;
    if (response.error) throw response.error;

    // Safely cast the response data to the correct type
    const data = response.data as unknown as TableRow<T>[];
    return data || [];
  }

  /**
   * Optimized insert operation
   */
  protected async insertQuery<T extends keyof Database['public']['Tables']>(
    table: T,
    data: TableInsert<T>,
  ): Promise<TableRow<T>> {
    const response = await supabase.from(table).insert(data).select().single();

    if (response.error) throw response.error;
    if (!response.data) throw new Error('No data returned from insert');

    // Safely cast the response data to the correct type
    return response.data as unknown as TableRow<T>;
  }

  /**
   * Optimized update operation
   */
  protected async updateQuery<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string,
    data: Partial<TableRow<T>>,
  ): Promise<TableRow<T>> {
    const response = await supabase.from(table).update(data).eq('id', id).select().single();

    if (response.error) throw response.error;
    if (!response.data) throw new Error('No data returned from update');

    // Safely cast the response data to the correct type
    return response.data as unknown as TableRow<T>;
  }

  /**
   * Optimized delete operation
   */
  protected async deleteQuery(
    table: keyof Database['public']['Tables'],
    id: string,
  ): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  }
}

// Custom error class for Supabase errors
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}
