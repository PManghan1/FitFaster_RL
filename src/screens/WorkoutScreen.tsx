import React, { useEffect, useCallback, useState } from 'react';
import { 
  View, 
  ScrollView, 
  Alert, 
  Text, 
  TouchableOpacity, 
  Modal,
  StyleSheet 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { Plus, X } from 'react-native-feather';
import { 
  ExerciseList, 
  SetInput, 
  WorkoutTimer, 
  WorkoutHistory 
} from '../components/workout';
import { useCurrentWorkout, useExerciseLibrary } from '../store/workout.store';
import { Exercise, MuscleGroup } from '../types/workout';
import { AppStackParamList } from '../navigation/AppNavigator';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f3f4f6;
`;

const Header = styled(View)`
  padding: 16px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const HeaderText = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #1f2937;
`;

const Content = styled(ScrollView)`
  flex: 1;
`;

const ActionBar = styled(View)`
  padding: 16px;
  background-color: white;
  border-top-width: 1px;
  border-top-color: #e5e7eb;
`;

const ActionButton = styled(TouchableOpacity)`
  background-color: #3b82f6;
  padding: 12px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ActionButtonText = styled(Text)`
  color: white;
  text-align: center;
  font-weight: 600;
  margin-left: 8px;
`;

const AddExerciseButton = styled(TouchableOpacity)`
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: #3b82f6;
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const ModalContainer = styled(View)`
  flex: 1;
  background-color: white;
`;

const ModalHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const ModalTitle = styled(Text)`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const CloseButton = styled(TouchableOpacity)`
  padding: 8px;
`;

type WorkoutScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Workout'>;
type WorkoutScreenRouteProp = RouteProp<AppStackParamList, 'Workout'>;

export const WorkoutScreen: React.FC = () => {
  const navigation = useNavigation<WorkoutScreenNavigationProp>();
  const route = useRoute<WorkoutScreenRouteProp>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = React.useState<Set<MuscleGroup>>(new Set());
  
  const { 
    session,
    isActive,
    currentExercise,
    restTimer,
    startWorkout,
    endWorkout,
    selectExercise,
    addSet,
    startRestTimer,
    stopRestTimer
  } = useCurrentWorkout();

  const {
    exercises,
    searchResults,
    isSearching,
    searchExercises
  } = useExerciseLibrary();

  useEffect(() => {
    // Load initial exercises
    searchExercises('');
  }, []);

  useEffect(() => {
    // Handle selected exercise from ExerciseLibrary
    if (route.params?.selectedExercise) {
      selectExercise(route.params.selectedExercise);
      // Clear the param to prevent re-selection on screen focus
      navigation.setParams({ selectedExercise: undefined });
    }
  }, [route.params?.selectedExercise, selectExercise]);

  const handleStartWorkout = useCallback(async () => {
    try {
      // TODO: Get actual user ID from auth context
      await startWorkout('user-id', 'New Workout');
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout');
    }
  }, [startWorkout]);

  const handleEndWorkout = useCallback(async () => {
    try {
      await endWorkout();
      // Navigate back or to summary
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to end workout');
    }
  }, [endWorkout, navigation]);

  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    selectExercise(exercise);
    setIsModalVisible(false);
  }, [selectExercise]);

  const handleSetComplete = useCallback(async (setData: any) => {
    if (!currentExercise) return;
    
    try {
      await addSet('user-id', currentExercise.id, setData);
      // Start rest timer with default time based on exercise type
      startRestTimer(90); // Using default STRENGTH rest time
    } catch (error) {
      Alert.alert('Error', 'Failed to save set');
    }
  }, [currentExercise, addSet, startRestTimer]);

  const handleRestComplete = useCallback(() => {
    stopRestTimer();
  }, [stopRestTimer]);

  const handleFilterChange = useCallback((muscleGroups: Set<MuscleGroup>) => {
    setSelectedMuscleGroups(muscleGroups);
    searchExercises('', Array.from(muscleGroups));
  }, [searchExercises]);

  return (
    <Container>
      <StatusBar style="dark" />
      
      <Header>
        <HeaderText>
          {isActive ? session?.name || 'Current Workout' : 'Start Workout'}
        </HeaderText>
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
        {isActive ? (
          <>
            <ExerciseList
              exercises={searchResults.length ? searchResults : exercises}
              onSelectExercise={handleExerciseSelect}
              selectedMuscleGroups={selectedMuscleGroups}
              onFilterChange={handleFilterChange}
            />
            
            {currentExercise && (
              <SetInput
                exercise={currentExercise}
                onSave={handleSetComplete}
              />
            )}
          </>
        ) : (
          <WorkoutHistory
            workouts={[]} // TODO: Load from store
            onSelectWorkout={() => {}}
          />
        )}
      </Content>

      <ActionBar>
        <ActionButton onPress={isActive ? handleEndWorkout : handleStartWorkout}>
          <ActionButtonText>
            {isActive ? 'End Workout' : 'Start Workout'}
          </ActionButtonText>
        </ActionButton>
      </ActionBar>

      {isActive && (
        <AddExerciseButton onPress={() => setIsModalVisible(true)}>
          <Plus width={24} height={24} color="white" />
        </AddExerciseButton>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ModalContainer>
          <ModalHeader>
            <ModalTitle>Select Exercise</ModalTitle>
            <CloseButton onPress={() => setIsModalVisible(false)}>
              <X width={24} height={24} color="#6b7280" />
            </CloseButton>
          </ModalHeader>
          <ExerciseList
            exercises={searchResults.length ? searchResults : exercises}
            onSelectExercise={handleExerciseSelect}
            selectedMuscleGroups={selectedMuscleGroups}
            onFilterChange={handleFilterChange}
          />
        </ModalContainer>
      </Modal>
    </Container>
  );
};
