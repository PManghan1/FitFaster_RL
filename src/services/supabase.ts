import { createClient, Provider } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

// Simplified Database type until we generate the actual types from Supabase
type Database = {
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
      };
    };
  };
};

// Initialize the Supabase client
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Custom error class for Supabase errors
export class SupabaseError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = "SupabaseError";
  }
}

// Auth helper functions with proper error handling and types
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new SupabaseError(error.message, error.name);
    return user;
  } catch (error) {
    if (config.isDevelopment) {
      console.error("Error getting current user:", error);
    }
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new SupabaseError(error.message, error.name);
    return session;
  } catch (error) {
    if (config.isDevelopment) {
      console.error("Error getting current session:", error);
    }
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new SupabaseError(error.message, error.name);
  } catch (error) {
    if (config.isDevelopment) {
      console.error("Error signing out:", error);
    }
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new SupabaseError(error.message, error.name);
    return data;
  } catch (error) {
    if (config.isDevelopment) {
      console.error("Error signing in:", error);
    }
    throw error;
  }
};

export const signInWithSocialProvider = async (provider: Provider) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${config.appUrl}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw new SupabaseError(error.message, error.name);
    return data;
  } catch (error) {
    if (config.isDevelopment) {
      console.error(`Error signing in with ${provider}:`, error);
    }
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  fullName: string
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw new SupabaseError(error.message, error.name);
    return data;
  } catch (error) {
    if (config.isDevelopment) {
      console.error("Error signing up:", error);
    }
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new SupabaseError(error.message, error.name);
  } catch (error) {
    if (config.isDevelopment) {
      console.error("Error resetting password:", error);
    }
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw new SupabaseError(error.message, error.name);
  } catch (error) {
    if (config.isDevelopment) {
      console.error("Error updating password:", error);
    }
    throw error;
  }
};

// Export types
export type { Database };
