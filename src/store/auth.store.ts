import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '../services/supabase';
import type { Session, User, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error?: AuthError }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initialize: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            set({
              user: data.session.user,
              session: data.session,
              isAuthenticated: true,
            });
          }
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
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
        } catch (error: any) {
          set({ error: error.message });
          return { user: null, session: null, error };
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
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
        } catch (error: any) {
          set({ error: error.message });
          return { user: null, session: null, error };
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.auth.signOut();

          if (error) throw error;

          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.auth.resetPasswordForEmail(email);

          if (error) throw error;
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: 'auth-store' }
  )
);
