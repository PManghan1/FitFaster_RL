import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExerciseLibraryScreen } from '../../screens/ExerciseLibraryScreen';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import type { Exercise } from '../../types/workout';
import { MuscleGroup, ExerciseType, Difficulty } from '../../types/workout';

jest.mock('../../hooks/useOfflineSync');

const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Push-up',
    description: 'Basic push-up exercise',
    muscleGroups: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
    difficulty: Difficulty.BEGINNER,
    equipment: [],
    instructions: ['Start in plank position', 'Lower body', 'Push back up'],
    type: ExerciseType.STRENGTH,
    videoUrl: null,
  },
  {
    id: '2',
    name: 'Squat',
    description: 'Basic squat exercise',
    muscleGroups: [MuscleGroup.LEGS],
    difficulty: Difficulty.BEGINNER,
    equipment: [],
    instructions: ['Stand with feet shoulder-width apart', 'Lower body', 'Stand back up'],
    type: ExerciseType.STRENGTH,
    videoUrl: null,
  },
];

const mockNavigation = {
  navigate: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  addListener: jest.fn(() => () => {}),
  removeListener: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
};

describe('ExerciseLibraryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: mockExercises,
      isLoading: false,
      error: null,
    });
  });

  it('renders correctly', () => {
    const { getByTestId, getByText, getByLabelText } = render(
      <ExerciseLibraryScreen navigation={mockNavigation} />
    );

    expect(getByTestId('exercise-search-input')).toBeTruthy();
    expect(getByLabelText('Search exercises')).toBeTruthy();
    expect(getByTestId('exercise-list')).toBeTruthy();
    expect(getByText('Push-up')).toBeTruthy();
    expect(getByText('Squat')).toBeTruthy();
  });

  it('filters exercises based on search query', () => {
    const { getByTestId, getByText, queryByText } = render(
      <ExerciseLibraryScreen navigation={mockNavigation} />
    );

    const searchInput = getByTestId('exercise-search-input');
    fireEvent.changeText(searchInput, 'push');

    expect(getByText('Push-up')).toBeTruthy();
    expect(queryByText('Squat')).toBeNull();
  });

  it('filters exercises based on muscle group', () => {
    const { getByTestId, getByText, queryByText } = render(
      <ExerciseLibraryScreen navigation={mockNavigation} />
    );

    const searchInput = getByTestId('exercise-search-input');
    fireEvent.changeText(searchInput, 'legs');

    expect(queryByText('Push-up')).toBeNull();
    expect(getByText('Squat')).toBeTruthy();
  });

  it('shows loading state', () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    const { getByText } = render(<ExerciseLibraryScreen navigation={mockNavigation} />);

    expect(getByText('Loading exercises...')).toBeTruthy();
  });

  it('shows empty state when no exercises are available', () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    const { getByText } = render(<ExerciseLibraryScreen navigation={mockNavigation} />);

    expect(getByText('No exercises available')).toBeTruthy();
  });

  it('shows no results message when search has no matches', () => {
    const { getByTestId, getByText } = render(
      <ExerciseLibraryScreen navigation={mockNavigation} />
    );

    const searchInput = getByTestId('exercise-search-input');
    fireEvent.changeText(searchInput, 'xyz');

    expect(getByText('No exercises found matching your search')).toBeTruthy();
  });

  it('navigates to exercise details when exercise is pressed', () => {
    const { getByTestId } = render(<ExerciseLibraryScreen navigation={mockNavigation} />);

    fireEvent.press(getByTestId('exercise-item-1'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('WorkoutDetails', {
      exercise: mockExercises[0],
    });
  });

  it('displays muscle groups for each exercise', () => {
    const { getByText } = render(<ExerciseLibraryScreen navigation={mockNavigation} />);

    mockExercises[0].muscleGroups.forEach(group => {
      expect(getByText(group)).toBeTruthy();
    });
  });

  it('has proper accessibility labels', () => {
    const { getByLabelText } = render(<ExerciseLibraryScreen navigation={mockNavigation} />);

    expect(getByLabelText('Search exercises')).toBeTruthy();
    expect(getByLabelText('Push-up exercise')).toBeTruthy();
    expect(getByLabelText('Squat exercise')).toBeTruthy();
  });
});
