import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { ChevronRight, Plus, Star } from 'react-native-feather';
import styled from 'styled-components/native';

import { colors, shadows } from '../../theme';
import { Exercise, MuscleGroup } from '../../types/workout';

const Container = styled.View`
  flex: 1;
`;

const ExerciseItem = styled.TouchableOpacity`
  background-color: ${colors.background.default};
  border-radius: 12px;
  margin-vertical: 4px;
  padding: 12px;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${`${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px`};
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
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
  color: ${colors.text.default};
  flex: 1;
  margin-right: 8px;
`;

const MuscleGroupTag = styled.View`
  background-color: ${colors.background.dark};
  border-radius: 12px;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  margin-right: 4px;
`;

const MuscleGroupText = styled.Text`
  font-size: 12px;
  color: ${colors.text.light};
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
  color: ${colors.text.light};
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

interface FilterButtonProps {
  isSelected?: boolean;
}

const FilterButton = styled.TouchableOpacity<FilterButtonProps>`
  background-color: ${(props: FilterButtonProps) =>
    props.isSelected ? colors.primary.default : colors.background.dark};
  border-radius: 20px;
  padding-horizontal: 12px;
  padding-vertical: 6px;
  margin-right: 8px;
`;

interface FilterTextProps {
  isSelected?: boolean;
}

const FilterText = styled.Text<FilterTextProps>`
  color: ${(props: FilterTextProps) =>
    props.isSelected ? colors.background.default : colors.text.light};
  font-weight: ${(props: FilterTextProps) => (props.isSelected ? '600' : '400')};
`;

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
  },
  fabButton: {
    alignItems: 'center',
    backgroundColor: colors.primary.default,
    borderRadius: 28,
    bottom: 16,
    elevation: shadows.md.elevation,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    shadowColor: shadows.md.shadowColor,
    shadowOffset: shadows.md.shadowOffset,
    shadowOpacity: shadows.md.shadowOpacity,
    shadowRadius: shadows.md.shadowRadius,
    width: 56,
  },
  listContent: {
    padding: 8,
  },
});

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

export const ExerciseList: React.FC<ExerciseListProps> = React.memo(
  ({
    exercises,
    onSelectExercise,
    onAddExercise,
    onFavorite,
    favorites = new Set<string>(),
    selectedMuscleGroups = new Set<MuscleGroup>(),
    onFilterChange,
    emptyMessage = 'No exercises found',
    testID,
  }) => {
    const handleFilterToggle = useCallback(
      (muscleGroup: MuscleGroup) => {
        if (!onFilterChange) return;

        const newSelection = new Set<MuscleGroup>(selectedMuscleGroups);
        if (newSelection.has(muscleGroup)) {
          newSelection.delete(muscleGroup);
        } else {
          newSelection.add(muscleGroup);
        }
        onFilterChange(newSelection);
      },
      [onFilterChange, selectedMuscleGroups],
    );

    const renderMuscleGroupFilter = useCallback(
      () => (
        <FilterContainer testID={`${testID}-filters`}>
          {Object.values(MuscleGroup).map(group => (
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
      ),
      [handleFilterToggle, selectedMuscleGroups, testID],
    );

    const renderExerciseItem = useCallback<ListRenderItem<Exercise>>(
      ({ item: exercise }) => (
        <ExerciseItem
          onPress={() => onSelectExercise?.(exercise)}
          testID={`${testID}-item-${exercise.id}`}
        >
          <ItemHeader>
            <ItemTitle numberOfLines={1}>{exercise.name}</ItemTitle>
            <View style={styles.actionRow}>
              {onFavorite && (
                <ActionButton
                  onPress={() => onFavorite(exercise)}
                  testID={`${testID}-favorite-${exercise.id}`}
                >
                  <Star
                    width={20}
                    height={20}
                    color={favorites.has(exercise.id) ? colors.error.default : colors.border.dark}
                    fill={favorites.has(exercise.id) ? colors.error.default : 'none'}
                  />
                </ActionButton>
              )}
              {onSelectExercise && (
                <ChevronRight width={20} height={20} color={colors.border.dark} />
              )}
            </View>
          </ItemHeader>

          <MuscleGroupsContainer>
            {exercise.muscleGroups.map(group => (
              <MuscleGroupTag key={group}>
                <MuscleGroupText>{group.replace('_', ' ')}</MuscleGroupText>
              </MuscleGroupTag>
            ))}
          </MuscleGroupsContainer>
        </ExerciseItem>
      ),
      [onSelectExercise, onFavorite, favorites, testID],
    );

    const keyExtractor = useCallback((item: Exercise) => item.id, []);

    if (exercises.length === 0) {
      return (
        <Container testID={testID}>
          {onFilterChange && renderMuscleGroupFilter()}
          <EmptyState testID={`${testID}-empty`}>
            <EmptyStateText>{emptyMessage}</EmptyStateText>
            {onAddExercise && (
              <ActionButton onPress={onAddExercise} testID={`${testID}-add-new`}>
                <Plus width={24} height={24} color={colors.primary.default} />
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
          keyExtractor={keyExtractor}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews
          updateCellsBatchingPeriod={30}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          testID={`${testID}-list`}
        />
        {onAddExercise && (
          <ActionButton
            onPress={onAddExercise}
            style={styles.fabButton}
            testID={`${testID}-add-fab`}
          >
            <Plus width={24} height={24} color={colors.background.default} />
          </ActionButton>
        )}
      </Container>
    );
  },
);

ExerciseList.displayName = 'ExerciseList';
