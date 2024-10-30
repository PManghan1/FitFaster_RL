import React from 'react';
import { View, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import styled from 'styled-components/native';
import { Plus, ChevronRight, Star } from 'react-native-feather';
import { Exercise, MuscleGroup } from '../../types/workout';

const Container = styled.View`
  flex: 1;
`;

const ExerciseItem = styled.TouchableOpacity`
  background-color: white;
  border-radius: 12px;
  margin-vertical: 4px;
  padding: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const ItemHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ItemTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  flex: 1;
  margin-right: 8px;
`;

const MuscleGroupTag = styled.View`
  background-color: #E5E7EB;
  border-radius: 12px;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  margin-right: 4px;
`;

const MuscleGroupText = styled.Text`
  font-size: 12px;
  color: #4B5563;
`;

const MuscleGroupsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: 8px;
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  color: #6B7280;
  text-align: center;
  margin-top: 12px;
`;

const FilterContainer = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    padding: 8,
  },
})`
  margin-bottom: 8px;
`;

const FilterButton = styled.TouchableOpacity<{ isSelected?: boolean }>`
  background-color: ${props => props.isSelected ? '#3B82F6' : '#E5E7EB'};
  border-radius: 20px;
  padding-horizontal: 12px;
  padding-vertical: 6px;
  margin-right: 8px;
`;

const FilterText = styled.Text<{ isSelected?: boolean }>`
  color: ${props => props.isSelected ? 'white' : '#4B5563'};
  font-weight: ${props => props.isSelected ? '600' : '400'};
`;

interface ExerciseListProps {
  exercises: Exercise[];
  onSelectExercise?: (exercise: Exercise) => void;
  onAddExercise?: () => void;
  onFavorite?: (exercise: Exercise) => void;
  favorites?: Set<string>;
  selectedMuscleGroups?: Set<MuscleGroup>;
  onFilterChange?: (muscleGroups: Set<MuscleGroup>) => void;
  emptyMessage?: string;
  testID?: string;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onSelectExercise,
  onAddExercise,
  onFavorite,
  favorites = new Set(),
  selectedMuscleGroups = new Set(),
  onFilterChange,
  emptyMessage = 'No exercises found',
  testID,
}) => {
  const handleFilterToggle = (muscleGroup: MuscleGroup) => {
    if (!onFilterChange) return;

    const newSelection = new Set(selectedMuscleGroups);
    if (newSelection.has(muscleGroup)) {
      newSelection.delete(muscleGroup);
    } else {
      newSelection.add(muscleGroup);
    }
    onFilterChange(newSelection);
  };

  const renderMuscleGroupFilter = () => (
    <FilterContainer testID={`${testID}-filters`}>
      {Object.values(MuscleGroup).map((group) => (
        <FilterButton
          key={group}
          isSelected={selectedMuscleGroups.has(group)}
          onPress={() => handleFilterToggle(group)}
          testID={`${testID}-filter-${group}`}
        >
          <FilterText isSelected={selectedMuscleGroups.has(group)}>
            {group.replace('_', ' ')}
          </FilterText>
        </FilterButton>
      ))}
    </FilterContainer>
  );

  const renderExerciseItem: ListRenderItem<Exercise> = ({ item: exercise }) => (
    <ExerciseItem
      onPress={() => onSelectExercise?.(exercise)}
      testID={`${testID}-item-${exercise.id}`}
    >
      <ItemHeader>
        <ItemTitle numberOfLines={1}>{exercise.name}</ItemTitle>
        <View style={{ flexDirection: 'row' }}>
          {onFavorite && (
            <ActionButton
              onPress={() => onFavorite(exercise)}
              testID={`${testID}-favorite-${exercise.id}`}
            >
              <Star
                width={20}
                height={20}
                color={favorites.has(exercise.id) ? '#EF4444' : '#9CA3AF'}
                fill={favorites.has(exercise.id) ? '#EF4444' : 'none'}
              />
            </ActionButton>
          )}
          {onSelectExercise && (
            <ChevronRight width={20} height={20} color="#9CA3AF" />
          )}
        </View>
      </ItemHeader>

      <MuscleGroupsContainer>
        {exercise.muscleGroups.map((group) => (
          <MuscleGroupTag key={group}>
            <MuscleGroupText>{group.replace('_', ' ')}</MuscleGroupText>
          </MuscleGroupTag>
        ))}
      </MuscleGroupsContainer>
    </ExerciseItem>
  );

  if (exercises.length === 0) {
    return (
      <Container testID={testID}>
        {onFilterChange && renderMuscleGroupFilter()}
        <EmptyState testID={`${testID}-empty`}>
          <EmptyStateText>{emptyMessage}</EmptyStateText>
          {onAddExercise && (
            <ActionButton
              onPress={onAddExercise}
              testID={`${testID}-add-new`}
            >
              <Plus width={24} height={24} color="#3B82F6" />
            </ActionButton>
          )}
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container testID={testID}>
      {onFilterChange && renderMuscleGroupFilter()}
      <FlatList<Exercise>
        data={exercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 8 }}
        testID={`${testID}-list`}
      />
      {onAddExercise && (
        <ActionButton
          onPress={onAddExercise}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: '#3B82F6',
            borderRadius: 28,
            width: 56,
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          testID={`${testID}-add-fab`}
        >
          <Plus width={24} height={24} color="white" />
        </ActionButton>
      )}
    </Container>
  );
};
