import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, DevSettings, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Plus, X } from 'react-native-feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

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

const ActionButton = styled(TouchableOpacity)`
  background-color: ${theme.colors.primary.default};
  padding: ${theme.spacing.md}px;
  border-radius: ${theme.borderRadius.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ActionButtonText = styled(Text)`
  color: ${theme.colors.background.default};
  text-align: center;
  font-weight: 700;
  margin-left: ${theme.spacing.sm}px;
`;

const AddExerciseButton = styled(TouchableOpacity)`
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${theme.colors.primary.default};
  align-items: center;
  justify-content: center;
  elevation: 5;
`;

const ExerciseCard = styled(View)`
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const ExerciseName = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
`;

const SetRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const SetText = styled(Text)`
  font-size: 14px;
  color: #4b5563;
`;

const ModalHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border.default};
`;

const ModalTitle = styled(Text)`
  font-size: ${theme.typography.fontSize.lg}px;
  font-weight: 700;
  color: ${theme.colors.text.default};
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
          <ExerciseCard key={exerciseData.exercise.id}>
            <ExerciseName>{exerciseData.exercise.name}</ExerciseName>
            {exerciseData.sets.map((set, index) => (
              <SetRow key={set.id}>
                <SetText>Set {index + 1}</SetText>
                <SetText>
                  {set.weight ? `${set.weight}kg × ` : ''}
                  {set.reps ? `${set.reps} reps` : ''}
                  {set.duration ? `${formatDuration(set.duration)}` : ''}
                  {set.distance ? `${set.distance}m` : ''}
                </SetText>
              </SetRow>
            ))}
          </ExerciseCard>
        ))}

        {currentExercise && <SetInput exercise={currentExercise} onSave={handleSetComplete} />}
      </Content>

      <ActionBar>
        <ActionButton onPress={handleEndWorkout}>
          <ActionButtonText>End Workout</ActionButtonText>
        </ActionButton>
      </ActionBar>

      <AddExerciseButton onPress={() => setIsModalVisible(true)}>
        <Plus width={24} height={24} color="white" />
      </AddExerciseButton>

      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: theme.colors.background.default }}>
          <ModalHeader>
            <ModalTitle>Select Exercise</ModalTitle>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ padding: 8 }}>
              <X width={24} height={24} color={theme.colors.text.light} />
            </TouchableOpacity>
          </ModalHeader>
          <ExerciseList
            exercises={[]}
            onSelectExercise={handleExerciseSelect}
            selectedMuscleGroups={new Set(selectedMuscleGroups)}
            onFilterChange={groups => setSelectedMuscleGroups(Array.from(groups))}
          />
        </View>
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
