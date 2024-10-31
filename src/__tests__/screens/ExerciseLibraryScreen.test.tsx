import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { ExerciseLibraryScreen } from '../../screens/ExerciseLibraryScreen';
import { useExerciseLibrary } from '../../store/workout.store';
import { mockExercises } from '../utils/test-data';

jest.mock('../../store/workout.store');

describe('ExerciseLibraryScreen', () => {
  const defaultMockStore = {
    exercises: mockExercises,
    searchTerm: '',
    setSearchTerm: jest.fn(),
    selectedMuscleGroup: null,
    setSelectedMuscleGroup: jest.fn(),
    filteredExercises: mockExercises,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useExerciseLibrary as jest.Mock).mockReturnValue(defaultMockStore);
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
      const mockSetSearchTerm = jest.fn();
      (useExerciseLibrary as jest.Mock).mockReturnValue({
        ...defaultMockStore,
        setSearchTerm: mockSetSearchTerm,
      });

      const { getByPlaceholderText } = render(<ExerciseLibraryScreen />);
      const searchInput = getByPlaceholderText('Search exercises...');

      fireEvent.changeText(searchInput, 'bench');
      expect(mockSetSearchTerm).toHaveBeenCalledWith('bench');
    });

    it('should display only filtered exercises based on search term', () => {
      (useExerciseLibrary as jest.Mock).mockReturnValue({
        ...defaultMockStore,
        searchTerm: 'bench',
        filteredExercises: [mockExercises[0]],
      });

      const { getByText, queryByText } = render(<ExerciseLibraryScreen />);

      expect(getByText('Bench Press')).toBeTruthy();
      expect(queryByText('Running')).toBeNull();
    });
  });

  describe('Muscle Group Filtering', () => {
    it('should filter exercises by selected muscle group', () => {
      (useExerciseLibrary as jest.Mock).mockReturnValue({
        ...defaultMockStore,
        selectedMuscleGroup: 'CHEST',
        filteredExercises: [mockExercises[0]],
      });

      const { getByText, queryByText } = render(<ExerciseLibraryScreen />);

      expect(getByText('Bench Press')).toBeTruthy();
      expect(queryByText('Running')).toBeNull();
    });

    it('should update selected muscle group when filter is changed', () => {
      const mockSetSelectedMuscleGroup = jest.fn();
      (useExerciseLibrary as jest.Mock).mockReturnValue({
        ...defaultMockStore,
        setSelectedMuscleGroup: mockSetSelectedMuscleGroup,
      });

      const { getByText } = render(<ExerciseLibraryScreen />);
      const chestFilter = getByText('Chest');

      fireEvent.press(chestFilter);
      expect(mockSetSelectedMuscleGroup).toHaveBeenCalledWith('CHEST');
    });
  });
});
