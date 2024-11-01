import { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const twoFactorSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Form Types
export type LoginFormData = z.infer<typeof loginSchema>;
export type TwoFactorFormData = z.infer<typeof twoFactorSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Auth State Types
export interface AuthState {
  session: SupabaseSession | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  isTwoFactorRequired: boolean;
}

// API Response Types
export interface AuthResponse {
  session: SupabaseSession | null;
  error: Error | null;
}

export interface AuthError extends Error {
  status?: number;
  code?: string;
}

// Two-Factor Types
export interface TwoFactorCode {
  id: string;
  email: string;
  code: string;
  created_at: string;
  expires_at: string;
}

// Auth Store Types
export interface AuthStore extends AuthState {
  signIn: (data: LoginFormData) => Promise<AuthResponse>;
  signUp: (data: RegisterFormData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyTwoFactorCode: (email: string, code: string) => Promise<boolean>;
  updateSession: (session: SupabaseSession | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => Promise<void>;
}

// Type guard to check if a user has an email
export function hasEmail(user: SupabaseUser | null): user is SupabaseUser & { email: string } {
  return user !== null && typeof user.email === 'string';
}
