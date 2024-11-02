import { PostgrestError } from '@supabase/supabase-js';

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof Error) {
    throw new DatabaseError(error.message);
  }
  throw new DatabaseError('An unknown error occurred');
}

export function assertData<T>(response: { data: T | null; error: PostgrestError | null }): T {
  if (response.error) throw new DatabaseError(response.error.message);
  if (!response.data) throw new DatabaseError('No data found');
  return response.data;
}

export function assertArrayData<T>(response: {
  data: T[] | null;
  error: PostgrestError | null;
}): T[] {
  if (response.error) throw new DatabaseError(response.error.message);
  return response.data || [];
}

export function assertOptionalData<T>(response: {
  data: T | null;
  error: PostgrestError | null;
}): T | null {
  if (response.error && response.error.code !== 'PGRST116') {
    throw new DatabaseError(response.error.message);
  }
  return response.data;
}
