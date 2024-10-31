import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import { WorkoutDetailsScreen } from '../../screens/WorkoutDetailsScreen';
import { WorkoutScreen } from '../../screens/WorkoutScreen';
import { useWorkoutStore } from '../../store/workout.store';
import { Workout } from '../../types/workout';

const Stack = createNativeStackNavigator();

/**
 * Test navigation wrapper component
 */
const TestNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

/**
 * Creates a mock workout for testing
 */
const createMockWorkout = (includeSet = false): Workout => ({
  id: '1',
  name: 'Morning Workout',
  exercises: [
    {
      id: '1',
      name: 'Bench Press',
      type: 'STRENGTH',
      muscleGroups: ['CHEST'],
      isCustom: false,
      createdAt: new Date().toISOString(),
    },
  ],
  sets: includeSet
    ? [
        {
          id: '1',
          exerciseId: '1',
          weight: 135,
          reps: 10,
          completed: true,
        },
      ]
    : [],
  createdAt: new Date().toISOString(),
});

describe('Workout Flow Integration Tests', () => {
  beforeEach(() => {
    const store = useWorkoutStore.getState();
    store.reset();
  });

  it('should create and track a workout session', async () => {
    const { getByText, getByTestId } = render(<TestNavigator />);

    // Start new workout
    fireEvent.press(getByText('Start Workout'));

    // Add exercise
    fireEvent.press(getByTestId('add-exercise-button'));
    fireEvent.press(getByText('Bench Press'));

    // Create and add workout
    const workout = createMockWorkout(false);
    const store = useWorkoutStore.getState();
    store.addWorkout(workout);

    // Verify UI updates
    await waitFor(() => {
      expect(getByTestId('workout-summary')).toBeTruthy();
      expect(getByText('Bench Press')).toBeTruthy();
    });

    // Verify store updates
    const savedWorkouts = store.workouts;
    expect(savedWorkouts).toHaveLength(1);
    expect(savedWorkouts[0].exercises[0].name).toBe('Bench Press');
  });

  it('should navigate to workout details and display set information', async () => {
    const { getByText } = render(<TestNavigator />);

    // Create and add workout with sets
    const workout = createMockWorkout(true);
    const store = useWorkoutStore.getState();
    store.addWorkout(workout);

    // Navigate to details
    fireEvent.press(getByText('View Details'));

    // Verify details view
    await waitFor(() => {
      expect(getByText('Workout Details')).toBeTruthy();
      expect(getByText('Bench Press')).toBeTruthy();
      expect(getByText('135 lbs × 10')).toBeTruthy();
    });
  });
});
