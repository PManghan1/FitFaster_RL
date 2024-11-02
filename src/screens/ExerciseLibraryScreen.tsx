import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Search } from 'react-native-feather';
import styled from 'styled-components/native';

import { ExerciseList } from '../components/workout/ExerciseList';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useExerciseLibrary } from '../store/workout.store';
import { Exercise, MuscleGroup } from '../types/workout';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f9fafb;
`;

const SearchContainer = styled.View`
  padding: 16px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const SearchInput = styled.TextInput`
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 8px 16px;
  padding-left: 40px;
  font-size: 16px;
  color: #1f2937;
`;

const SearchIcon = styled(View)`
  position: absolute;
  left: 28px;
  top: 26px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  font-size: 16px;
  color: #6b7280;
  margin-top: 8px;
`;

const ErrorText = styled.Text`
  color: #ef4444;
  text-align: center;
  margin: 16px;
`;

type ExerciseLibraryScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'ExerciseLibrary'
>;

export const ExerciseLibraryScreen: React.FC = () => {
  const navigation = useNavigation<ExerciseLibraryScreenNavigationProp>();
  const { exercises, searchResults, isSearching, error, searchExercises } = useExerciseLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<Set<MuscleGroup>>(new Set());

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchExercises(searchQuery, Array.from(selectedMuscleGroups));
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedMuscleGroups, searchExercises]);

  const handleExerciseSelect = (exercise: Exercise) => {
    navigation.navigate('Workout', { selectedExercise: exercise });
  };

  const handleFilterChange = (muscleGroups: Set<MuscleGroup>) => {
    setSelectedMuscleGroups(muscleGroups);
  };

  const displayedExercises =
    searchQuery || selectedMuscleGroups.size > 0 ? searchResults : exercises;

  return (
    <Container>
      <SearchContainer>
        <SearchIcon>
          <Search width={20} height={20} color="#6B7280" />
        </SearchIcon>
        <SearchInput
          placeholder="Search exercises..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          testID="exercise-search-input"
        />
      </SearchContainer>

      {error ? (
        <ErrorText>{error}</ErrorText>
      ) : isSearching ? (
        <LoadingContainer>
          <LoadingText>Loading exercises...</LoadingText>
        </LoadingContainer>
      ) : (
        <ExerciseList
          exercises={displayedExercises}
          onSelectExercise={handleExerciseSelect}
          selectedMuscleGroups={selectedMuscleGroups}
          onFilterChange={handleFilterChange}
          emptyMessage={searchQuery ? 'No exercises found' : 'No exercises available'}
          testID="exercise-library"
        />
      )}
    </Container>
  );
};
