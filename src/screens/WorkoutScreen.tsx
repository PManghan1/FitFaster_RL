import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, DevSettings, Modal, ScrollView, Text, View } from 'react-native';
import { Plus, X } from 'react-native-feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import {
  ActionButton,
  ActionButtonText,
  Card,
  CardTitle,
  FloatingActionButton,
  IconButton,
  ListRow,
  ListText,
  ModalContainer,
  ModalHeader,
  ModalTitle,
} from '../components/common/styled';
import { withErrorBoundary } from '../components/hoc/withErrorBoundary';
import { ExerciseList, SetInput, WorkoutErrorFallback, WorkoutTimer } from '../components/workout';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useWorkoutStore } from '../store/workout.store';
import { theme } from '../theme';
import { Exercise, MuscleGroup, Set as WorkoutSet } from '../types/workout';
import { formatDuration } from '../utils/time';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${theme.colors.background.light};
`;

const Header = styled(View)`
  padding: ${theme.spacing.md}px;
  background-color: ${theme.colors.background.default};
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border.default};
`;

const HeaderText = styled(Text)`
  font-size: ${theme.typography.fontSize.lg}px;
  font-weight: 700;
  color: ${theme.colors.text.default};
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding: ${theme.spacing.md}px;
`;

const ActionBar = styled(View)`
  padding: ${theme.spacing.md}px;
  background-color: ${theme.colors.background.default};
  border-top-width: 1px;
  border-top-color: ${theme.colors.border.default};
`;

type WorkoutScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Workout'>;
type WorkoutScreenRouteProp = RouteProp<AppStackParamList, 'Workout'>;

type WorkoutSetInput = Omit<WorkoutSet, 'id' | 'exerciseId' | 'completed'>;

const WorkoutScreenComponent: React.FC = () => {
  const navigation = useNavigation<WorkoutScreenNavigationProp>();
  const route = useRoute<WorkoutScreenRouteProp>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([]);

  const {
    currentWorkout,
    currentExercise,
    restTimer,
    isActive,
    startWorkout,
    endWorkout,
    selectExercise,
    addSet,
    startRestTimer,
    stopRestTimer,
  } = useWorkoutStore();

  const performance = usePerformanceMonitoring({
    screenName: 'WorkoutScreen',
    componentName: 'WorkoutScreen',
    enableRenderTracking: true,
  });

  useEffect(() => {
    if (route.params?.selectedExercise) {
      performance.measureInteraction('select_exercise', () => {
        if (route.params?.selectedExercise) {
          selectExercise(route.params.selectedExercise);
          navigation.setParams({ selectedExercise: undefined });
        }
      });
    }
  }, [route.params?.selectedExercise, selectExercise, navigation, performance]);

  const handleStartWorkout = useCallback(async () => {
    try {
      await startWorkout('user-id', 'New Workout');
      performance.measureApiCall(Promise.resolve(), 'start_workout', { userId: 'user-id' });
    } catch (error) {
      Alert.alert('Error', `Failed to start workout: ${(error as Error).message}`);
    }
  }, [startWorkout, performance]);

  const handleEndWorkout = useCallback(async () => {
    try {
      await endWorkout();
      performance.measureApiCall(Promise.resolve(), 'end_workout');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', `Failed to end workout: ${(error as Error).message}`);
    }
  }, [endWorkout, navigation, performance]);

  const handleExerciseSelect = useCallback(
    (exercise: Exercise) => {
      performance.measureInteraction('select_exercise_from_list', () => {
        selectExercise(exercise);
        setIsModalVisible(false);
      });
    },
    [selectExercise, performance],
  );

  const handleSetComplete = useCallback(
    async (setData: WorkoutSetInput) => {
      if (!currentExercise) return;

      try {
        await addSet(currentExercise.id, {
          ...setData,
          completed: false,
        });
        performance.measureApiCall(Promise.resolve(), 'add_set', {
          exerciseId: currentExercise.id,
        });
        startRestTimer(90);
      } catch (error) {
        Alert.alert('Error', `Failed to save set: ${(error as Error).message}`);
      }
    },
    [currentExercise, addSet, startRestTimer, performance],
  );

  const handleRestComplete = useCallback(() => {
    performance.measureInteraction('complete_rest', () => {
      stopRestTimer();
    });
  }, [stopRestTimer, performance]);

  if (!currentWorkout || !isActive) {
    return (
      <Container>
        <StatusBar style="dark" />
        <ActionBar>
          <ActionButton onPress={handleStartWorkout}>
            <ActionButtonText>Start Workout</ActionButtonText>
          </ActionButton>
        </ActionBar>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar style="dark" />

      <Header>
        <HeaderText>{currentWorkout.name || 'Current Workout'}</HeaderText>
        {restTimer !== null && (
          <WorkoutTimer
            initialTime={restTimer}
            onComplete={handleRestComplete}
            presets={[30, 60, 90, 120]}
            label="Rest Timer"
          />
        )}
      </Header>

      <Content>
        {currentWorkout.exerciseData.map(exerciseData => (
          <Card key={exerciseData.exercise.id}>
            <CardTitle>{exerciseData.exercise.name}</CardTitle>
            {exerciseData.sets.map((set, index) => (
              <ListRow key={set.id}>
                <ListText>Set {index + 1}</ListText>
                <ListText>
                  {set.weight ? `${set.weight}kg × ` : ''}
                  {set.reps ? `${set.reps} reps` : ''}
                  {set.duration ? `${formatDuration(set.duration)}` : ''}
                  {set.distance ? `${set.distance}m` : ''}
                </ListText>
              </ListRow>
            ))}
          </Card>
        ))}

        {currentExercise && <SetInput exercise={currentExercise} onSave={handleSetComplete} />}
      </Content>

      <ActionBar>
        <ActionButton onPress={handleEndWorkout}>
          <ActionButtonText>End Workout</ActionButtonText>
        </ActionButton>
      </ActionBar>

      <FloatingActionButton onPress={() => setIsModalVisible(true)}>
        <Plus width={24} height={24} color={theme.colors.background.default} />
      </FloatingActionButton>

      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <ModalContainer>
          <ModalHeader>
            <ModalTitle>Select Exercise</ModalTitle>
            <IconButton onPress={() => setIsModalVisible(false)}>
              <X width={24} height={24} color={theme.colors.text.light} />
            </IconButton>
          </ModalHeader>
          <ExerciseList
            exercises={[]}
            onSelectExercise={handleExerciseSelect}
            selectedMuscleGroups={new Set(selectedMuscleGroups)}
            onFilterChange={groups => setSelectedMuscleGroups(Array.from(groups))}
          />
        </ModalContainer>
      </Modal>
    </Container>
  );
};

export const WorkoutScreen = withErrorBoundary(WorkoutScreenComponent, {
  fallback: (
    <WorkoutErrorFallback
      onRetry={() => {
        if (__DEV__) {
          DevSettings.reload();
        }
      }}
    />
  ),
});
