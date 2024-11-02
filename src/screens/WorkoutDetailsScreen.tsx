import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Calendar, ChevronRight, Clock } from 'react-native-feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { Dumbbell } from '../constants/icons';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useWorkoutDetails } from '../store/workout.store';
import { Set } from '../types/workout';
import { formatDuration } from '../utils/time';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f9fafb;
`;

const Header = styled(View)`
  padding: 16px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const HeaderText = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
`;

const MetricsContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
  background-color: white;
  margin-top: 8px;
`;

const MetricItem = styled(View)`
  align-items: center;
`;

const MetricValue = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-top: 4px;
`;

const MetricLabel = styled.Text`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
`;

const ExerciseList = styled(ScrollView)`
  flex: 1;
  padding: 16px;
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

const ExerciseName = styled.Text`
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

const SetText = styled.Text`
  font-size: 14px;
  color: #4b5563;
`;

const ErrorContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const ErrorText = styled.Text`
  color: #ef4444;
  text-align: center;
  margin-top: 8px;
`;

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

type WorkoutDetailsScreenRouteProp = RouteProp<AppStackParamList, 'WorkoutDetails'>;

export const WorkoutDetailsScreen: React.FC = () => {
  const route = useRoute<WorkoutDetailsScreenRouteProp>();
  const { workout, loading, error, loadWorkout } = useWorkoutDetails();

  useEffect(() => {
    if (route.params?.workoutId) {
      loadWorkout(route.params.workoutId);
    }
  }, [route.params?.workoutId, loadWorkout]);

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#3b82f6" testID="loading-indicator" />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
      </ErrorContainer>
    );
  }

  if (!workout) {
    return (
      <ErrorContainer>
        <ErrorText>Workout not found</ErrorText>
      </ErrorContainer>
    );
  }

  const calculateSetVolume = (set: Set): number => {
    return (set.weight || 0) * (set.reps || 0);
  };

  const totalVolume = workout.exerciseData.reduce((total: number, exerciseData) => {
    return (
      total +
      exerciseData.sets.reduce(
        (setTotal: number, set: Set) => setTotal + calculateSetVolume(set),
        0,
      )
    );
  }, 0);

  return (
    <Container>
      <Header>
        <HeaderText>{workout.name || new Date(workout.date).toLocaleDateString()}</HeaderText>
      </Header>

      <MetricsContainer>
        <MetricItem>
          <Clock width={20} height={20} color="#6b7280" />
          <MetricValue>{formatDuration(workout.duration)}</MetricValue>
          <MetricLabel>Duration</MetricLabel>
        </MetricItem>
        <MetricItem>
          <Dumbbell width={20} height={20} color="#6b7280" />
          <MetricValue>{workout.exerciseData.length}</MetricValue>
          <MetricLabel>Exercises</MetricLabel>
        </MetricItem>
        <MetricItem>
          <ChevronRight width={20} height={20} color="#6b7280" />
          <MetricValue>{workout.totalSets}</MetricValue>
          <MetricLabel>Sets</MetricLabel>
        </MetricItem>
        <MetricItem>
          <Calendar width={20} height={20} color="#6b7280" />
          <MetricValue>{Math.round(totalVolume)}</MetricValue>
          <MetricLabel>Volume (kg)</MetricLabel>
        </MetricItem>
      </MetricsContainer>

      <ExerciseList>
        {workout.exerciseData.map(exerciseData => (
          <ExerciseCard key={exerciseData.exercise.id}>
            <ExerciseName>{exerciseData.exercise.name}</ExerciseName>
            {exerciseData.sets.map((set: Set, index: number) => (
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
      </ExerciseList>
    </Container>
  );
};
