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

const FloatingActionButton = styled(TouchableOpacity)`
  position: absolute;
  bottom: ${theme.spacing.xl}px;
  right: ${theme.spacing.xl}px;
  width: ${theme.spacing.xl * 2}px;
  height: ${theme.spacing.xl * 2}px;
  border-radius: ${theme.spacing.xl}px;
  background-color: ${theme.colors.primary.default};
  align-items: center;
  justify-content: center;
  elevation: 5;
`;

const Card = styled(View)`
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.borderRadius.lg}px;
  padding: ${theme.spacing.md}px;
  margin-bottom: ${theme.spacing.md}px;
  shadow-color: ${theme.colors.text.dark};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const CardTitle = styled(Text)`
  font-size: ${theme.typography.fontSize.md}px;
  font-weight: 600;
  color: ${theme.colors.text.default};
  margin-bottom: ${theme.spacing.sm}px;
`;

const ListRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding: ${theme.spacing.sm}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border.light};
`;

const ListText = styled(Text)`
  font-size: ${theme.typography.fontSize.sm}px;
  color: ${theme.colors.text.light};
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

const ModalContainer = styled(View)`
  flex: 1;
  background-color: ${theme.colors.background.default};
`;

const IconButton = styled(TouchableOpacity)`
  padding: ${theme.spacing.sm}px;
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
