import { render } from '@testing-library/react-native';
import React from 'react';

import { WorkoutDetailsScreen } from '../../screens/WorkoutDetailsScreen';
import type { WorkoutSession } from '../../types/workout';
import { mockWorkout } from '../utils/test-data';

// Mock the entire module
jest.mock('../../store/workout.store', () => ({
  useWorkoutDetails: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: { workoutId: '1' },
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Import the mocked module
const workoutStore = jest.requireMock('../../store/workout.store');

describe('WorkoutDetailsScreen', () => {
  const defaultMockStore = {
    workout: mockWorkout,
    loading: false,
    error: null,
    loadWorkout: jest.fn(async (workoutId: string) => {
      // Mock implementation
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    workoutStore.useWorkoutDetails.mockReturnValue(defaultMockStore);
  });

  describe('Rendering States', () => {
    it('should render workout details when data is available', () => {
      const { getByText } = render(<WorkoutDetailsScreen />);

      expect(getByText('Monday Workout')).toBeTruthy();
      expect(getByText('Bench Press')).toBeTruthy();
      expect(getByText('100 lbs × 10')).toBeTruthy();
    });

    it('should display loading indicator when loading', () => {
      workoutStore.useWorkoutDetails.mockReturnValue({
        ...defaultMockStore,
        workout: null,
        loading: true,
      });

      const { getByTestId } = render(<WorkoutDetailsScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should display error message when error occurs', () => {
      const errorMessage = 'Failed to load workout';
      workoutStore.useWorkoutDetails.mockReturnValue({
        ...defaultMockStore,
        workout: null,
        error: errorMessage,
      });

      const { getByText } = render(<WorkoutDetailsScreen />);
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  describe('Workout Loading', () => {
    it('should load workout on mount', () => {
      const mockLoadWorkout = jest.fn();
      workoutStore.useWorkoutDetails.mockReturnValue({
        ...defaultMockStore,
        loadWorkout: mockLoadWorkout,
      });

      render(<WorkoutDetailsScreen />);
      expect(mockLoadWorkout).toHaveBeenCalledWith('1');
    });

    it('should handle workout updates', () => {
      const updatedWorkout: WorkoutSession = {
        ...mockWorkout,
        name: 'Updated Workout',
      };

      workoutStore.useWorkoutDetails.mockReturnValue({
        ...defaultMockStore,
        workout: updatedWorkout,
      });

      const { getByText } = render(<WorkoutDetailsScreen />);
      expect(getByText('Updated Workout')).toBeTruthy();
    });
  });
});
