import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProgressScreen from '../../screens/ProgressScreen';
import { mockZustandStore } from '../utils/store-utils';
import { createUserId } from '../../types/branded';

// Define store types
interface ProgressStore {
  metrics: {
    totalWorkouts: number;
    currentStreak: number;
    weeklyCount: number;
    totalVolume: number;
    mostUsedExercises: Array<{
      exerciseId: string;
      name: string;
      count: number;
    }>;
  };
  recentWorkouts: Array<{
    id: string;
    date: string;
    exerciseCount: number;
    totalVolume: number;
    duration: number;
    name: string;
  }>;
  isLoading: boolean;
  error: string | null;
  loadProgress: (userId: string) => Promise<void>;
  loadRecentWorkouts: (userId: string) => Promise<void>;
  reset: () => void;
}

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Mock the stores
jest.mock('../../store/progress.store', () => ({
  useProgressStore: jest.fn(),
}));

jest.mock('../../store/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('ProgressScreen', () => {
  const mockUserId = createUserId('test');
  
  const mockProgressStore = mockZustandStore<ProgressStore>({
    metrics: {
      totalWorkouts: 10,
      currentStreak: 3,
      weeklyCount: 2,
      totalVolume: 1000,
      mostUsedExercises: [
        { exerciseId: 'exercise_1', name: 'Bench Press', count: 5 },
        { exerciseId: 'exercise_2', name: 'Squats', count: 3 },
      ],
    },
    recentWorkouts: [
      {
        id: 'workout_1',
        date: new Date().toISOString(),
        exerciseCount: 5,
        totalVolume: 500,
        duration: 3600,
        name: 'Morning Workout',
      },
    ],
    isLoading: false,
    error: null,
    loadProgress: jest.fn().mockResolvedValue(undefined),
    loadRecentWorkouts: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn(),
  });

  const mockAuthStore = mockZustandStore<AuthStore>({
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (mockProgressStore as jest.Mock).mockClear();
    (mockAuthStore as jest.Mock).mockClear();
    require('../../store/progress.store').useProgressStore.mockImplementation(() => mockProgressStore());
    require('../../store/auth.store').useAuthStore.mockImplementation(() => mockAuthStore());
  });

  it('renders progress data correctly', async () => {
    const { getByText } = render(<ProgressScreen />);

    await waitFor(() => {
      // Verify store methods were called
      expect(mockProgressStore.getState().loadProgress).toHaveBeenCalledWith(mockUserId);
      expect(mockProgressStore.getState().loadRecentWorkouts).toHaveBeenCalledWith(mockUserId);

      // Check metrics
      expect(getByText('10 Total Workouts')).toBeTruthy();
      expect(getByText('3 Day Streak')).toBeTruthy();

      // Check exercise list
      expect(getByText('Bench Press: 5 times')).toBeTruthy();
      expect(getByText('Squats: 3 times')).toBeTruthy();

      // Check workout details
      expect(getByText('Morning Workout')).toBeTruthy();
      expect(getByText('5 exercises • 60 min')).toBeTruthy();
      expect(getByText('Total Volume: 500kg')).toBeTruthy();
    });
  });

  it('displays loading state', () => {
    mockProgressStore.setState({ isLoading: true });

    const { getByTestId } = render(<ProgressScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load progress data';
    mockProgressStore.setState({ error: errorMessage });

    const { getByText } = render(<ProgressScreen />);
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('redirects to login if not authenticated', () => {
    mockAuthStore.setState({ isAuthenticated: false });

    render(<ProgressScreen />);
    expect(mockNavigate).toHaveBeenCalledWith('Auth');
  });

  it('handles adding new weight entry', async () => {
    const { getByPlaceholderText, getByTestId } = render(<ProgressScreen />);

    const input = getByPlaceholderText('Enter weight');
    const button = getByTestId('add-weight-button');

    fireEvent.changeText(input, '75');
    fireEvent.press(button);

    // Verify input was cleared
    expect(input.props.value).toBe('');
  });

  it('handles adding new measurement', async () => {
    const { getByPlaceholderText, getByTestId } = render(<ProgressScreen />);

    const typeInput = getByTestId('measurement-type-input');
    const valueInput = getByPlaceholderText('Enter measurement');
    const button = getByTestId('add-measurement-button');

    fireEvent.changeText(typeInput, 'Chest');
    fireEvent.changeText(valueInput, '95');
    fireEvent.press(button);

    // Verify inputs were cleared
    expect(typeInput.props.value).toBe('');
    expect(valueInput.props.value).toBe('');
  });
});
