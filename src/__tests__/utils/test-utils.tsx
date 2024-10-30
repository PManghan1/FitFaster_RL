import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import type { Session, User, AuthError } from '@supabase/supabase-js';

interface MockAuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error?: AuthError }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Mock auth store implementation
const mockAuthStore: MockAuthStore = {
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
      },
    } as Session;

    mockAuthStore.session = mockSession;
    mockAuthStore.user = mockSession.user as User;
    mockAuthStore.isAuthenticated = true;
  },

  signIn: async (email: string, password: string) => {
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      user: {
        id: 'mock-user-id',
        email,
      },
    } as Session;

    mockAuthStore.session = mockSession;
    mockAuthStore.user = mockSession.user as User;
    mockAuthStore.isAuthenticated = true;

    return {
      user: mockSession.user as User,
      session: mockSession,
    };
  },

  signUp: async (email: string, password: string) => {
    const mockSession = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      user: {
        id: 'mock-user-id',
        email,
      },
    } as Session;

    mockAuthStore.session = mockSession;
    mockAuthStore.user = mockSession.user as User;
    mockAuthStore.isAuthenticated = true;

    return {
      user: mockSession.user as User,
      session: mockSession,
    };
  },

  signOut: async () => {
    mockAuthStore.session = null;
    mockAuthStore.user = null;
    mockAuthStore.isAuthenticated = false;
  },

  resetPassword: async (email: string) => {
    // Mock implementation
  },

  setError: (error: string | null) => {
    mockAuthStore.error = error;
  },

  clearError: () => {
    mockAuthStore.error = null;
  },
};

// Mock the auth store
jest.mock('../../store/auth.store', () => ({
  useAuthStore: () => mockAuthStore,
}));

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <NavigationContainer>
      {children}
    </NavigationContainer>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react-native';

// override render method
export { customRender as render };
export { mockAuthStore };
