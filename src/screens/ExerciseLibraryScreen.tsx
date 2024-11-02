import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { styled } from 'nativewind';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Exercise } from '../types/workout';
import { useOfflineSync } from '../hooks/useOfflineSync';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);

type ExerciseStackParamList = {
  ExerciseLibrary: undefined;
  WorkoutDetails: { exercise: Exercise };
};

type ExerciseLibraryScreenProps = {
  navigation: NativeStackNavigationProp<ExerciseStackParamList, 'ExerciseLibrary'>;
};

export const ExerciseLibraryScreen: React.FC<ExerciseLibraryScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: exercises = [],
    isLoading,
    error,
  } = useOfflineSync<Exercise[]>({
    key: 'exercises',
  });

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exercises;

    const query = searchQuery.toLowerCase();
    return exercises.filter(
      exercise =>
        exercise.name.toLowerCase().includes(query) ||
        exercise.description.toLowerCase().includes(query) ||
        exercise.muscleGroups.some(group => group.toLowerCase().includes(query))
    );
  }, [exercises, searchQuery]);

  const handleExercisePress = useCallback(
    (exercise: Exercise) => {
      navigation.navigate('WorkoutDetails', { exercise });
    },
    [navigation]
  );

  const renderExerciseItem: ListRenderItem<Exercise> = useCallback(
    ({ item: exercise }) => (
      <StyledPressable
        className="p-4 bg-white mb-2 rounded-lg shadow-sm"
        testID={`exercise-item-${exercise.id}`}
        onPress={() => handleExercisePress(exercise)}
        accessibilityRole="button"
        accessibilityLabel={`${exercise.name} exercise`}
      >
        <StyledText className="text-lg font-semibold text-gray-800">{exercise.name}</StyledText>
        <StyledText className="text-sm text-gray-600 mt-1">{exercise.description}</StyledText>
        <StyledView className="flex-row mt-2 flex-wrap">
          {exercise.muscleGroups.map(group => (
            <StyledText
              key={group}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-1"
            >
              {group}
            </StyledText>
          ))}
        </StyledView>
      </StyledPressable>
    ),
    [handleExercisePress]
  );

  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <StyledText className="mt-4 text-gray-600">Loading exercises...</StyledText>
      </StyledView>
    );
  }

  if (error) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-gray-50">
        <StyledText className="text-red-500 text-lg">Failed to load exercises</StyledText>
        <StyledText className="mt-2 text-gray-600">Please try again later</StyledText>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 bg-gray-50 p-4">
      <StyledTextInput
        className="bg-white px-4 py-3 rounded-lg mb-4 text-gray-800"
        placeholder="Search exercises..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        testID="exercise-search-input"
        accessibilityLabel="Search exercises"
        accessibilityHint="Enter text to search for exercises"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {exercises.length === 0 ? (
        <StyledView className="flex-1 items-center justify-center">
          <StyledText className="text-gray-600 text-lg">No exercises available</StyledText>
        </StyledView>
      ) : filteredExercises.length === 0 ? (
        <StyledView className="flex-1 items-center justify-center">
          <StyledText className="text-gray-600 text-lg">
            No exercises found matching your search
          </StyledText>
        </StyledView>
      ) : (
        <FlatList<Exercise>
          data={filteredExercises}
          renderItem={renderExerciseItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          testID="exercise-list"
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 16 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </StyledView>
  );
};
