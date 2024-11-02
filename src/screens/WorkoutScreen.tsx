import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

import { ExerciseList } from '../components/workout/ExerciseList';
import { ExerciseSelectionSheet } from '../components/workout/ExerciseSelectionSheet';
import { SetInput } from '../components/workout/SetInput';
import { WorkoutTimer } from '../components/workout/WorkoutTimer';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import { analyticsService } from '../services/analytics';
import { workoutService } from '../services/workout';
import { useWorkoutStore } from '../store/workout.store';
import { Exercise, Set } from '../types/workout';

const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.light};
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const WorkoutScreen: React.FC = () => {
  const { currentWorkout, currentExercise, selectExercise, addSet } = useWorkoutStore();
  const [showExerciseSheet, setShowExerciseSheet] = useState(false);

  const performanceMonitor = usePerformanceMonitoring({
    screenName: 'WorkoutScreen',
    componentName: 'WorkoutScreen',
    enableRenderTracking: true,
  });

  useEffect(() => {
    performanceMonitor.measureInteraction('screen_load', () => {
      analyticsService.trackScreenView('Workout', {
        workoutId: currentWorkout?.id,
        exerciseCount: currentWorkout?.exerciseData.length,
      });
    });
  }, [currentWorkout?.id, currentWorkout?.exerciseData.length, performanceMonitor]);

  const handleExerciseSelect = useCallback(
    async (exercise: Exercise) => {
      if (!currentWorkout) return;

      try {
        await performanceMonitor.measureApiCall(
          workoutService.addExercise(currentWorkout.id, exercise),
          'add_exercise',
        );

        selectExercise(exercise);

        analyticsService.trackWorkout('add_exercise', {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          workoutId: currentWorkout.id,
        });

        setShowExerciseSheet(false);
      } catch (error) {
        analyticsService.trackError(error as Error, {
          operation: 'add_exercise',
          screen: 'Workout',
        });
        Alert.alert('Error', 'Failed to add exercise');
      }
    },
    [currentWorkout, performanceMonitor, selectExercise],
  );

  const handleSetSave = useCallback(
    (setData: Omit<Set, 'id' | 'exerciseId' | 'completed'>) => {
      if (!currentWorkout || !currentExercise) return;

      try {
        workoutService
          .addSet(currentWorkout.id, currentExercise.id, {
            ...setData,
            exerciseId: currentExercise.id,
            completed: true,
          })
          .then(() => {
            addSet(currentExercise.id, {
              ...setData,
              completed: true,
            });

            analyticsService.trackWorkout('add_set', {
              sessionId: currentWorkout.id,
              exerciseId: currentExercise.id,
              weight: setData.weight,
              reps: setData.reps,
            });
          })
          .catch(error => {
            analyticsService.trackError(error as Error, {
              operation: 'add_set',
              screen: 'Workout',
            });
            Alert.alert('Error', 'Failed to save set');
          });
      } catch (error) {
        analyticsService.trackError(error as Error, {
          operation: 'add_set',
          screen: 'Workout',
        });
        Alert.alert('Error', 'Failed to save set');
      }
    },
    [currentWorkout, currentExercise, addSet],
  );

  const exercises = currentWorkout?.exerciseData.map(data => data.exercise) || [];

  if (currentExercise && currentExercise.type === 'STRENGTH') {
    return (
      <Container>
        <Content>
          <WorkoutTimer />
          <ExerciseList
            exercises={exercises}
            onSelectExercise={handleExerciseSelect}
            onAddExercise={() => setShowExerciseSheet(true)}
            testID="workout-exercise-list"
          />
          <SetInput exercise={currentExercise} onSave={handleSetSave} testID="workout-set-input" />
        </Content>
        {showExerciseSheet && (
          <ExerciseSelectionSheet onClose={() => setShowExerciseSheet(false)} />
        )}
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <WorkoutTimer />
        <ExerciseList
          exercises={exercises}
          onSelectExercise={handleExerciseSelect}
          onAddExercise={() => setShowExerciseSheet(true)}
          testID="workout-exercise-list"
        />
      </Content>
      {showExerciseSheet && <ExerciseSelectionSheet onClose={() => setShowExerciseSheet(false)} />}
    </Container>
  );
};
