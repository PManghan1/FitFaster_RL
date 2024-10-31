import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { WorkoutDetailsScreen } from '../../screens/WorkoutDetailsScreen';
import { useWorkoutDetails } from '../../store/workout.store';
import { mockSet, mockWorkout } from '../utils/test-data';

jest.mock('../../store/workout.store');
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: { workoutId: '1' },
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('WorkoutDetailsScreen', () => {
  const defaultMockStore = {
    workout: mockWorkout,
    loading: false,
    error: null,
    updateSet: jest.fn(),
    addSet: jest.fn(),
    removeSet: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWorkoutDetails as jest.Mock).mockReturnValue(defaultMockStore);
  });

  describe('Rendering States', () => {
    it('should render workout details when data is available', () => {
      const { getByText } = render(<WorkoutDetailsScreen />);

      expect(getByText('Monday Workout')).toBeTruthy();
      expect(getByText('Bench Press')).toBeTruthy();
      expect(getByText('100 lbs × 10')).toBeTruthy();
    });

    it('should display loading indicator when loading', () => {
      (useWorkoutDetails as jest.Mock).mockReturnValue({
        ...defaultMockStore,
        workout: null,
        loading: true,
      });

      const { getByTestId } = render(<WorkoutDetailsScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should display error message when error occurs', () => {
      const errorMessage = 'Failed to load workout';
      (useWorkoutDetails as jest.Mock).mockReturnValue({
        ...defaultMockStore,
        workout: null,
        error: errorMessage,
      });

      const { getByText } = render(<WorkoutDetailsScreen />);
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  describe('Set Management', () => {
    it('should handle set completion toggle', () => {
      const mockUpdateSet = jest.fn();
      (useWorkoutDetails as jest.Mock).mockReturnValue({
        ...defaultMockStore,
        updateSet: mockUpdateSet,
      });

      const { getByTestId } = render(<WorkoutDetailsScreen />);
      const setCheckbox = getByTestId('set-1-checkbox');

      fireEvent.press(setCheckbox);
      expect(mockUpdateSet).toHaveBeenCalledWith({
        ...mockSet,
        completed: true,
      });
    });

    it('should handle adding new sets', () => {
      const mockAddSet = jest.fn();
      (useWorkoutDetails as jest.Mock).mockReturnValue({
        ...defaultMockStore,
        addSet: mockAddSet,
      });

      const { getByTestId } = render(<WorkoutDetailsScreen />);
      const addSetButton = getByTestId('add-set-button');

      fireEvent.press(addSetButton);
      expect(mockAddSet).toHaveBeenCalled();
    });

    it('should handle removing sets', () => {
      const mockRemoveSet = jest.fn();
      (useWorkoutDetails as jest.Mock).mockReturnValue({
        ...defaultMockStore,
        removeSet: mockRemoveSet,
      });

      const { getByTestId } = render(<WorkoutDetailsScreen />);
      const removeSetButton = getByTestId('remove-set-1-button');

      fireEvent.press(removeSetButton);
      expect(mockRemoveSet).toHaveBeenCalledWith(mockSet.id);
    });
  });
});
