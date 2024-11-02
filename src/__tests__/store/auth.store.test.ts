import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/auth.store';
import '@testing-library/jest-native/extend-expect';

// Mock the Supabase client
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

describe('AuthStore', () => {
  const mockSession = {
    user: { id: '123', email: 'test@example.com' },
    access_token: 'token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      session: null,
      error: null,
      isLoading: false,
      isAuthenticated: false,
    });
  });

  describe('initialize', () => {
    it('should initialize the store with current session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.session).toBeDefined();
      expect(state.session?.access_token).toBe(mockSession.access_token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should handle initialization error', async () => {
      const error = { message: 'Failed to get session' };
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error,
      });

      await useAuthStore.getState().initialize();

      const state = useAuthStore.getState();
      expect(state.error).toBe(error.message);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      });

      const result = await useAuthStore.getState().signIn('test@example.com', 'password');

      expect(result.session).toBeDefined();
      expect(result.session?.access_token).toBe(mockSession.access_token);
      const state = useAuthStore.getState();
      expect(state.session?.access_token).toBe(mockSession.access_token);
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should handle sign in error', async () => {
      const error = { message: 'Invalid credentials' };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: null, session: null },
        error,
      });

      const result = await useAuthStore.getState().signIn('test@example.com', 'wrong-password');

      expect(result.error).toBeDefined();
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.error).toBe(error.message);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      });

      const result = await useAuthStore.getState().signUp('test@example.com', 'password');

      expect(result.session).toBeDefined();
      expect(result.session?.access_token).toBe(mockSession.access_token);
      const state = useAuthStore.getState();
      expect(state.session?.access_token).toBe(mockSession.access_token);
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should handle sign up error', async () => {
      const error = { message: 'Email already exists' };
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: null, session: null },
        error,
      });

      const result = await useAuthStore.getState().signUp('existing@example.com', 'password');

      expect(result.error).toBeDefined();
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.error).toBe(error.message);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should handle sign out error', async () => {
      const error = { message: 'Failed to sign out' };
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error,
      });

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.error).toBe(error.message);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
        data: {},
        error: null,
      });

      await useAuthStore.getState().resetPassword('test@example.com');

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should handle reset password error', async () => {
      const error = { message: 'Invalid email' };
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
        data: null,
        error,
      });

      await useAuthStore.getState().resetPassword('invalid@example.com');

      const state = useAuthStore.getState();
      expect(state.error).toBe(error.message);
      expect(state.isLoading).toBe(false);
    });
  });
});
