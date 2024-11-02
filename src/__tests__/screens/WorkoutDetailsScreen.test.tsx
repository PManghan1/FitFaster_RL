import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WorkoutDetailsScreen } from '../../screens/WorkoutDetailsScreen';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { mockExercise, mockWorkoutSession } from '../utils/test-data';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

jest.mock('../../hooks/useOfflineSync');

type WorkoutStackParamList = {
  WorkoutDetails: {
    exercise: typeof mockExercise;
  };
};

const createMockNavigation = () =>
  ({
    navigate: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(() => ({
      key: 'stack-1',
      index: 0,
      routeNames: ['WorkoutDetails'],
      routes: [{ key: 'WorkoutDetails-1', name: 'WorkoutDetails' }],
      stale: false,
      type: 'stack',
    })),
    addListener: jest.fn(() => () => {}),
    removeListener: jest.fn(),
    setParams: jest.fn(),
    setOptions: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
  }) as unknown as NativeStackNavigationProp<WorkoutStackParamList, 'WorkoutDetails'>;

const createMockRoute = () =>
  ({
    key: 'WorkoutDetails-1',
    name: 'WorkoutDetails' as const,
    params: { exercise: mockExercise },
  }) as RouteProp<WorkoutStackParamList, 'WorkoutDetails'>;

describe('WorkoutDetailsScreen', () => {
  let mockNavigation: ReturnType<typeof createMockNavigation>;
  let mockRoute: ReturnType<typeof createMockRoute>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigation = createMockNavigation();
    mockRoute = createMockRoute();
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: mockWorkoutSession,
      isLoading: false,
      error: null,
      updateData: jest.fn(),
    });
  });

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(
      <WorkoutDetailsScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText(mockExercise.name)).toBeTruthy();
    expect(getByText(mockExercise.description)).toBeTruthy();
    expect(getByTestId('exercise-instructions')).toBeTruthy();
  });

  it('displays exercise instructions', () => {
    const { getByText } = render(
      <WorkoutDetailsScreen navigation={mockNavigation} route={mockRoute} />
    );

    mockExercise.instructions.forEach(instruction => {
      expect(getByText(instruction)).toBeTruthy();
    });
  });

  it('handles set completion', () => {
    const mockUpdateData = jest.fn();
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: mockWorkoutSession,
      isLoading: false,
      error: null,
      updateData: mockUpdateData,
    });

    const { getByTestId } = render(
      <WorkoutDetailsScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByTestId('complete-set-1'));

    expect(mockUpdateData).toHaveBeenCalledWith({
      ...mockWorkoutSession,
      exercises: mockWorkoutSession.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({
          ...set,
          completed: true,
        })),
      })),
    });
  });

  it('shows loading state', () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      updateData: jest.fn(),
    });

    const { getByTestId } = render(
      <WorkoutDetailsScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('shows error state', () => {
    (useOfflineSync as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Test error'),
      updateData: jest.fn(),
    });

    const { getByText } = render(
      <WorkoutDetailsScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('Failed to load workout details')).toBeTruthy();
  });

  it('navigates back on press of back button', () => {
    const { getByTestId } = render(
      <WorkoutDetailsScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByTestId('back-button'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
