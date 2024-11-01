import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

import { supabase } from '../services/supabase';

import type { AuthError, Session, User } from '@supabase/supabase-js';

/** Auth State Interface */
interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isTwoFactorRequired: boolean;
}

/** Auth Actions Interface */
interface AuthActions {
  initialize: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; session: Session | null; error?: AuthError }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; session: Session | null; error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyTwoFactorCode: (email: string, code: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

/** Auth Store Interface */
export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    set => ({
      /** User State */
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isTwoFactorRequired: false,

      /** Initialize Auth State */
      initialize: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.getSession();

          if (error) throw error;

          if (data.session) {
            set({
              user: data.session.user,
              session: data.session,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message });
        } finally {
          set({ isLoading: false });
        }
      },

      /** Sign In User */
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Generate and send 2FA code
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 10);

          // Save the code to the database
          await supabase.from('two_factor_codes').insert({
            email,
            code,
            expires_at: expiresAt.toISOString(),
          });

          // Set state to require 2FA verification
          set({
            isTwoFactorRequired: true,
            isAuthenticated: false,
            user: null,
            session: null,
          });

          return { user: null, session: null };
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message });
          return { user: null, session: null, error: authError };
        } finally {
          set({ isLoading: false });
        }
      },

      /** Verify Two-Factor Authentication Code */
      verifyTwoFactorCode: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const now = new Date().toISOString();

          // Get the code and check if it's valid and not expired
          const { data, error } = await supabase
            .from('two_factor_codes')
            .select('*')
            .eq('email', email)
            .eq('code', code)
            .gt('expires_at', now)
            .single();

          if (error || !data) {
            set({ error: 'Invalid verification code.' });
            return false;
          }

          // Delete the code after successful verification
          await supabase.from('two_factor_codes').delete().eq('email', email);

          // Retrieve the current session
          const sessionResult = await supabase.auth.getSession();

          if (sessionResult.error || !sessionResult.data.session) {
            throw sessionResult.error || new Error('No active session found.');
          }

          set({
            user: sessionResult.data.session.user,
            session: sessionResult.data.session,
            isAuthenticated: true,
            isTwoFactorRequired: false,
          });

          return true;
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      /** Sign Up User */
      signUp: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: !!data.session,
          });

          return { user: data.user, session: data.session };
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message });
          return { user: null, session: null, error: authError };
        } finally {
          set({ isLoading: false });
        }
      },

      /** Sign Out User */
      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isTwoFactorRequired: false,
          });
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message });
        } finally {
          set({ isLoading: false });
        }
      },

      /** Reset Password */
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);

          if (error) throw error;
        } catch (error) {
          const authError = error as AuthError;
          set({ error: authError.message });
        } finally {
          set({ isLoading: false });
        }
      },

      /** Set Error */
      setError: (error: string | null) => set({ error }),

      /** Clear Error */
      clearError: () => set({ error: null }),

      /** Reset Auth State */
      reset: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isTwoFactorRequired: false,
        }),
    }),
    { name: 'auth-store' },
  ),
);

/** Auth Store Selectors */
export const useAuthState = () =>
  useAuthStore(
    state => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      isTwoFactorRequired: state.isTwoFactorRequired,
    }),
    shallow,
  );

export const useAuthActions = () =>
  useAuthStore(
    state => ({
      initialize: state.initialize,
      signIn: state.signIn,
      signUp: state.signUp,
      signOut: state.signOut,
      resetPassword: state.resetPassword,
      verifyTwoFactorCode: state.verifyTwoFactorCode,
      setError: state.setError,
      clearError: state.clearError,
      reset: state.reset,
    }),
    shallow,
  );
