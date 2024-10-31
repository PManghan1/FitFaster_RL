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
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
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
      setError: state.setError,
      clearError: state.clearError,
      reset: state.reset,
    }),
    shallow,
  );
