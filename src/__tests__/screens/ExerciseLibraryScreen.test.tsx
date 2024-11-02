import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { ExerciseLibraryScreen } from '../../screens/ExerciseLibraryScreen';
import type { MuscleGroup } from '../../types/workout';
import { mockExercises } from '../utils/test-data';

// Mock the entire module
jest.mock('../../store/workout.store', () => ({
  useExerciseLibrary: jest.fn(),
}));

// Import the mocked module
const workoutStore = jest.requireMock('../../store/workout.store');

describe('ExerciseLibraryScreen', () => {
  const mockStore = {
    exercises: mockExercises,
    searchResults: mockExercises,
    isSearching: false,
    searchExercises: jest.fn(async (query: string, muscleGroups: MuscleGroup[]) => {
      // Mock implementation
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (workoutStore.useExerciseLibrary as jest.Mock).mockReturnValue(mockStore);
  });

  describe('Exercise List Display', () => {
    it('should render all exercises when no filters are applied', () => {
      const { getByText } = render(<ExerciseLibraryScreen />);

      expect(getByText('Bench Press')).toBeTruthy();
      expect(getByText('Running')).toBeTruthy();
    });

    it('should display exercise descriptions', () => {
      const { getByText } = render(<ExerciseLibraryScreen />);

      expect(getByText('Barbell bench press for chest development')).toBeTruthy();
      expect(getByText('Outdoor or treadmill running')).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('should update search term when user types in search input', () => {
      const mockSearchExercises = jest.fn();
      const customStore = {
        ...mockStore,
        searchExercises: mockSearchExercises,
      };
      (workoutStore.useExerciseLibrary as jest.Mock).mockReturnValue(customStore);

      const { getByPlaceholderText } = render(<ExerciseLibraryScreen />);
      const searchInput = getByPlaceholderText('Search exercises...');

      fireEvent.changeText(searchInput, 'bench');
      expect(mockSearchExercises).toHaveBeenCalledWith('bench', []);
    });

    it('should display only filtered exercises based on search term', () => {
      const filteredResults = [mockExercises[0]];
      const customStore = {
        ...mockStore,
        searchResults: filteredResults,
      };
      (workoutStore.useExerciseLibrary as jest.Mock).mockReturnValue(customStore);

      const { getByText, queryByText } = render(<ExerciseLibraryScreen />);

      expect(getByText('Bench Press')).toBeTruthy();
      expect(queryByText('Running')).toBeNull();
    });
  });

  describe('Muscle Group Filtering', () => {
    it('should filter exercises by selected muscle group', () => {
      const filteredResults = [mockExercises[0]];
      const customStore = {
        ...mockStore,
        searchResults: filteredResults,
      };
      (workoutStore.useExerciseLibrary as jest.Mock).mockReturnValue(customStore);

      const { getByText, queryByText } = render(<ExerciseLibraryScreen />);

      expect(getByText('Bench Press')).toBeTruthy();
      expect(queryByText('Running')).toBeNull();
    });

    it('should update selected muscle group when filter is changed', () => {
      const mockSearchExercises = jest.fn();
      const customStore = {
        ...mockStore,
        searchExercises: mockSearchExercises,
      };
      (workoutStore.useExerciseLibrary as jest.Mock).mockReturnValue(customStore);

      const { getByText } = render(<ExerciseLibraryScreen />);
      const chestFilter = getByText('Chest');

      fireEvent.press(chestFilter);
      expect(mockSearchExercises).toHaveBeenCalledWith('', ['CHEST']);
    });
  });
});
