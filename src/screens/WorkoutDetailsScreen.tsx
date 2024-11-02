import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { styled } from 'nativewind';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Exercise, WorkoutSession } from '../types/workout';
import { useOfflineSync } from '../hooks/useOfflineSync';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledPressable = styled(Pressable);

type WorkoutStackParamList = {
  WorkoutDetails: {
    exercise: Exercise;
  };
};

type WorkoutDetailsScreenProps = {
  navigation: NativeStackNavigationProp<WorkoutStackParamList, 'WorkoutDetails'>;
  route: RouteProp<WorkoutStackParamList, 'WorkoutDetails'>;
};

export const WorkoutDetailsScreen: React.FC<WorkoutDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { exercise } = route.params;
  const {
    data: workoutSession,
    isLoading,
    error,
    updateData,
  } = useOfflineSync<WorkoutSession>({
    key: `workout_${exercise.id}`,
    onSync: async data => {
      // TODO: Implement backend sync
      console.log('Syncing workout:', data);
    },
  });

  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center" testID="loading-indicator">
        <ActivityIndicator size="large" color="#0000ff" />
      </StyledView>
    );
  }

  if (error) {
    return (
      <StyledView className="flex-1 items-center justify-center p-4">
        <StyledText className="text-red-500 text-lg text-center">
          Failed to load workout details
        </StyledText>
      </StyledView>
    );
  }

  const handleSetCompletion = async (setId: string) => {
    if (!workoutSession) return;

    const updatedSession = {
      ...workoutSession,
      exercises: workoutSession.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => (set.id === setId ? { ...set, completed: true } : set)),
      })),
    };

    await updateData(updatedSession);
  };

  return (
    <StyledView className="flex-1 bg-white">
      <StyledView className="flex-row items-center p-4 border-b border-gray-200">
        <StyledPressable onPress={() => navigation.goBack()} className="p-2" testID="back-button">
          <StyledText>←</StyledText>
        </StyledPressable>
        <StyledText className="text-xl font-bold ml-2">{exercise.name}</StyledText>
      </StyledView>

      <StyledScrollView className="flex-1 p-4">
        <StyledText className="text-lg mb-4">{exercise.description}</StyledText>

        <StyledView className="mb-6">
          <StyledText className="text-lg font-semibold mb-2">Instructions</StyledText>
          <StyledView testID="exercise-instructions">
            {exercise.instructions.map((instruction, index) => (
              <StyledText key={index} className="text-gray-700 mb-2">
                {index + 1}. {instruction}
              </StyledText>
            ))}
          </StyledView>
        </StyledView>

        {workoutSession?.exercises.map((ex, exIndex) => (
          <StyledView key={exIndex} className="mb-6">
            <StyledText className="text-lg font-semibold mb-2">Sets</StyledText>
            {ex.sets.map((set, setIndex) => (
              <StyledPressable
                key={set.id}
                onPress={() => handleSetCompletion(set.id)}
                className={`p-4 mb-2 rounded-lg border ${
                  set.completed ? 'bg-green-100 border-green-500' : 'border-gray-300'
                }`}
                testID={`complete-set-${setIndex + 1}`}
              >
                <StyledText>
                  Set {setIndex + 1}
                  {set.reps && ` - ${set.reps} reps`}
                  {set.weight && ` @ ${set.weight}kg`}
                  {set.duration && ` - ${set.duration}s`}
                  {set.distance && ` - ${set.distance}m`}
                </StyledText>
              </StyledPressable>
            ))}
          </StyledView>
        ))}
      </StyledScrollView>
    </StyledView>
  );
};
