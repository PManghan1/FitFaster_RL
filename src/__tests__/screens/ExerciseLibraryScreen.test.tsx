import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ExerciseLibraryScreen } from '../../screens/ExerciseLibraryScreen';
import { useExerciseLibrary } from '../../store/workout.store';
import { Exercise, ExerciseType } from '../../types/workout';

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock the workout store
jest.mock('../../store/workout.store', () => ({
  useExerciseLibrary: jest.fn(),
}));

const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    type: ExerciseType.enum.STRENGTH,
    muscleGroups: ['CHEST'],
    isCustom: false,
    description: 'Barbell bench press for chest development',
    instructions: 'Lie on bench, grip bar, lower to chest, press up',
    equipment: ['BARBELL'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Squats',
    type: ExerciseType.enum.STRENGTH,
    muscleGroups: ['LEGS'],
    isCustom: false,
    description: 'Barbell squats for leg development',
    instructions: 'Place bar on shoulders, squat down, stand up',
    equipment: ['BARBELL'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('ExerciseLibraryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useExerciseLibrary as jest.Mock).mockReturnValue({
      exercises: mockExercises,
      searchResults: [],
      isSearching: false,
      error: null,
      searchExercises: jest.fn(),
    });
  });

  it('renders correctly', () => {
    const { getByTestId, getByPlaceholderText } = render(<ExerciseLibraryScreen />);
    
    expect(getByTestId('exercise-library')).toBeTruthy();
    expect(getByPlaceholderText('Search exercises...')).toBeTruthy();
  });

  it('displays exercises', () => {
    const { getByText } = render(<ExerciseLibraryScreen />);
    
    expect(getByText('Bench Press')).toBeTruthy();
    expect(getByText('Squats')).toBeTruthy();
  });

  it('handles search input', async () => {
    const mockSearchExercises = jest.fn();
    (useExerciseLibrary as jest.Mock).mockReturnValue({
      exercises: mockExercises,
      searchResults: [],
      isSearching: false,
      error: null,
      searchExercises: mockSearchExercises,
    });

    const { getByPlaceholderText } = render(<ExerciseLibraryScreen />);
    const searchInput = getByPlaceholderText('Search exercises...');
    
    fireEvent.changeText(searchInput, 'bench');
    
    await waitFor(() => {
      expect(mockSearchExercises).toHaveBeenCalledWith('bench', []);
    });
  });

  it('handles exercise selection', () => {
    const { getByText } = render(<ExerciseLibraryScreen />);
    
    fireEvent.press(getByText('Bench Press'));
    
    expect(mockNavigate).toHaveBeenCalledWith('Workout', {
      selectedExercise: mockExercises[0],
    });
  });

  it('displays loading state', () => {
    (useExerciseLibrary as jest.Mock).mockReturnValue({
      exercises: [],
      searchResults: [],
      isSearching: true,
      error: null,
      searchExercises: jest.fn(),
    });

    const { getByText } = render(<ExerciseLibraryScreen />);
    
    expect(getByText('Loading exercises...')).toBeTruthy();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load exercises';
    (useExerciseLibrary as jest.Mock).mockReturnValue({
      exercises: [],
      searchResults: [],
      isSearching: false,
      error: errorMessage,
      searchExercises: jest.fn(),
    });

    const { getByText } = render(<ExerciseLibraryScreen />);
    
    expect(getByText(errorMessage)).toBeTruthy();
  });
});
