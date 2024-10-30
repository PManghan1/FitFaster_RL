import React from 'react';
import { View, FlatList, ListRenderItem } from 'react-native';
import styled from 'styled-components/native';
import { Calendar, ChevronRight } from 'react-native-feather';
import { WorkoutSummary, MuscleGroup } from '../../types/workout';

const Container = styled.View`
  flex: 1;
`;

const WorkoutCard = styled.TouchableOpacity`
  background-color: white;
  border-radius: 12px;
  margin-vertical: 4px;
  padding: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DateContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const DateText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-left: 8px;
`;

const StatsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
`;

const StatValue = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #1F2937;
`;

const MuscleGroupsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const MuscleGroupTag = styled.View`
  background-color: #E5E7EB;
  border-radius: 12px;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  margin-right: 4px;
  margin-bottom: 4px;
`;

const MuscleGroupText = styled.Text`
  font-size: 12px;
  color: #4B5563;
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

interface WorkoutHistoryProps {
  workouts: WorkoutSummary[];
  onSelectWorkout?: (workout: WorkoutSummary) => void;
  emptyMessage?: string;
  testID?: string;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  workouts,
  onSelectWorkout,
  emptyMessage = 'No workout history',
  testID,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderWorkoutCard: ListRenderItem<WorkoutSummary> = ({ item: workout }) => (
    <WorkoutCard
      onPress={() => onSelectWorkout?.(workout)}
      testID={`${testID}-workout-${workout.session.id}`}
    >
      <Header>
        <DateContainer>
          <Calendar width={20} height={20} color="#6B7280" />
          <DateText>{formatDate(workout.session.date)}</DateText>
        </DateContainer>
        {onSelectWorkout && (
          <ChevronRight width={20} height={20} color="#9CA3AF" />
        )}
      </Header>

      <StatsContainer>
        <StatItem>
          <StatLabel>Duration</StatLabel>
          <StatValue>{formatDuration(workout.duration)}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Exercises</StatLabel>
          <StatValue>{workout.exercises.length}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Sets</StatLabel>
          <StatValue>{workout.totalSets}</StatValue>
        </StatItem>
      </StatsContainer>

      <MuscleGroupsContainer>
        {workout.muscleGroups.map((group) => (
          <MuscleGroupTag key={group}>
            <MuscleGroupText>{group.replace('_', ' ')}</MuscleGroupText>
          </MuscleGroupTag>
        ))}
      </MuscleGroupsContainer>
    </WorkoutCard>
  );

  if (workouts.length === 0) {
    return (
      <EmptyState testID={`${testID}-empty`}>
        <Calendar width={32} height={32} color="#9CA3AF" />
        <EmptyStateText>{emptyMessage}</EmptyStateText>
      </EmptyState>
    );
  }

  return (
    <Container testID={testID}>
      <FlatList<WorkoutSummary>
        data={workouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.session.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 8 }}
        testID={`${testID}-list`}
      />
    </Container>
  );
};
