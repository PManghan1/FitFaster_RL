import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { WorkoutDetailsScreen } from '../../screens/WorkoutDetailsScreen';
import { useWorkoutDetails } from '../../store/workout.store';
import { ExerciseType, WorkoutSummary } from '../../types/workout';

// Mock navigation
const mockRoute = {
  params: { sessionId: '123' },
};

jest.mock('@react-navigation/native', () => ({
  useRoute: () => mockRoute,
}));

// Mock the workout store
jest.mock('../../store/workout.store', () => ({
  useWorkoutDetails: jest.fn(),
}));

const mockWorkout: WorkoutSummary = {
  session: {
    id: '123',
    userId: 'user-1',
    name: 'Morning Workout',
    date: new Date().toISOString(),
    duration: 3600, // 1 hour
    sets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  exercises: [
    {
      exercise: {
        id: '1',
        name: 'Bench Press',
        type: ExerciseType.enum.STRENGTH,
        muscleGroups: ['CHEST'],
        isCustom: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      sets: [
        {
          id: 'set-1',
          userId: 'user-1',
          exerciseId: '1',
          sessionId: '123',
          weight: 80,
          reps: 10,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ],
  duration: 3600,
  totalSets: 1,
  muscleGroups: ['CHEST'],
};

describe('WorkoutDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useWorkoutDetails as jest.Mock).mockReturnValue({
      workout: null,
      isLoading: true,
      error: null,
      loadWorkout: jest.fn(),
    });

    const { getByTestId } = render(<WorkoutDetailsScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders error state', () => {
    const errorMessage = 'Failed to load workout';
    (useWorkoutDetails as jest.Mock).mockReturnValue({
      workout: null,
      isLoading: false,
      error: errorMessage,
      loadWorkout: jest.fn(),
    });

    const { getByText } = render(<WorkoutDetailsScreen />);
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('renders workout details', async () => {
    const mockLoadWorkout = jest.fn();
    (useWorkoutDetails as jest.Mock).mockReturnValue({
      workout: mockWorkout,
      isLoading: false,
      error: null,
      loadWorkout: mockLoadWorkout,
    });

    const { getByText } = render(<WorkoutDetailsScreen />);

    await waitFor(() => {
      expect(mockLoadWorkout).toHaveBeenCalledWith('123');
      expect(getByText('Morning Workout')).toBeTruthy();
      expect(getByText('1h 0m')).toBeTruthy();
      expect(getByText('Bench Press')).toBeTruthy();
      expect(getByText('80kg × 10 reps')).toBeTruthy();
    });
  });

  it('calculates workout metrics correctly', () => {
    (useWorkoutDetails as jest.Mock).mockReturnValue({
      workout: mockWorkout,
      isLoading: false,
      error: null,
      loadWorkout: jest.fn(),
    });

    const { getByText } = render(<WorkoutDetailsScreen />);

    // Duration
    expect(getByText('1h 0m')).toBeTruthy();
    // Exercise count
    expect(getByText('1')).toBeTruthy();
    // Total sets
    expect(getByText('1')).toBeTruthy();
    // Total volume (weight * reps)
    expect(getByText('800')).toBeTruthy();
  });
});
