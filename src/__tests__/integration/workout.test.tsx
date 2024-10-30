import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutScreen } from '../../screens/WorkoutScreen';
import { WorkoutDetailsScreen } from '../../screens/WorkoutDetailsScreen';
import { useWorkoutStore } from '../../store/workout.store';
import { createMockStoreHook, MockStoreHook } from '../utils/store-utils';
import type { WorkoutStore } from '../../types/workout';
import type { PersistApi } from '../../store/middleware/persist';
import { createWorkoutId, createExerciseId } from '../../types/branded';

const Stack = createNativeStackNavigator();

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

type MockStore = WorkoutStore & PersistApi;

// Mock the store module
jest.mock('../../store/workout.store', () => ({
  useWorkoutStore: jest.fn(),
}));

describe('Workout Flow Integration', () => {
  const mockStore = createMockStoreHook<MockStore>({
    activeWorkout: null,
    workoutHistory: [],
    exercises: [
      {
        id: createExerciseId('1'),
        name: 'Bench Press',
        category: 'Chest',
        sets: [],
      },
      {
        id: createExerciseId('2'),
        name: 'Squats',
        category: 'Legs',
        sets: [],
      },
    ],
    isLoading: false,
    error: null,
    startWorkout: jest.fn(),
    endWorkout: jest.fn(),
    addExercise: jest.fn(),
    removeExercise: jest.fn(),
    updateSet: jest.fn(),
    loadWorkoutHistory: jest.fn(),
    loadExercises: jest.fn(),
    reset: jest.fn(),
    clearPersistedState: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useWorkoutStore as unknown as MockStoreHook<MockStore>).mockImplementation(() => mockStore());
  });

  it('should start a new workout and add exercises', async () => {
    const { getByTestId, getByText } = render(<TestNavigator />);

    // Start new workout
    fireEvent.press(getByTestId('start-workout-button'));
    expect(mockStore.getState().startWorkout).toHaveBeenCalled();

    // Add exercises
    fireEvent.press(getByTestId('add-exercise-button'));
    fireEvent.press(getByText('Bench Press'));
    
    await waitFor(() => {
      expect(mockStore.getState().addExercise).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Bench Press' })
      );
    });

    // Add sets
    fireEvent.press(getByTestId('add-set-button'));
    const weightInput = getByTestId('weight-input-0');
    const repsInput = getByTestId('reps-input-0');

    fireEvent.changeText(weightInput, '100');
    fireEvent.changeText(repsInput, '10');

    await waitFor(() => {
      expect(mockStore.getState().updateSet).toHaveBeenCalledWith(
        createExerciseId('1'),
        0,
        expect.objectContaining({ weight: 100, reps: 10 })
      );
    });

    // End workout
    fireEvent.press(getByTestId('end-workout-button'));
    expect(mockStore.getState().endWorkout).toHaveBeenCalled();
  });

  it('should load and display workout history', async () => {
    mockStore.setState({
      workoutHistory: [
        {
          id: createWorkoutId('1'),
          date: new Date().toISOString(),
          duration: 3600,
          exercises: [
            {
              id: createExerciseId('1'),
              name: 'Bench Press',
              category: 'Chest',
              sets: [
                { id: '1', weight: 100, reps: 10 },
                { id: '2', weight: 100, reps: 10 },
              ],
            },
          ],
        },
      ],
    });

    const { getByText, getByTestId } = render(<TestNavigator />);

    fireEvent.press(getByTestId('history-tab'));

    await waitFor(() => {
      expect(getByText('Bench Press')).toBeTruthy();
      expect(getByText('2 sets • 2000kg total')).toBeTruthy();
    });
  });
});
