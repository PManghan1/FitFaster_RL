import React, { useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { Clock, Calendar, ChevronRight } from 'react-native-feather';
import { Dumbbell } from '../constants/icons';
import { useWorkoutDetails } from '../store/workout.store';
import { AppStackParamList } from '../navigation/AppNavigator';
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
  font-weight: bold;
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
  font-weight: bold;
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
  const { workout, isLoading, error, loadWorkout } = useWorkoutDetails();

  useEffect(() => {
    if (route.params?.sessionId) {
      loadWorkout(route.params.sessionId);
    }
  }, [route.params?.sessionId]);

  if (isLoading) {
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

  const totalVolume = workout.exercises.reduce((total, { exercise, sets }) => {
    return total + sets.reduce((setTotal, set) => setTotal + (set.weight || 0) * (set.reps || 0), 0);
  }, 0);

  return (
    <Container>
      <Header>
        <HeaderText>
          {workout.session.name || new Date(workout.session.date).toLocaleDateString()}
        </HeaderText>
      </Header>

      <MetricsContainer>
        <MetricItem>
          <Clock width={20} height={20} color="#6b7280" />
          <MetricValue>{formatDuration(workout.duration)}</MetricValue>
          <MetricLabel>Duration</MetricLabel>
        </MetricItem>
        <MetricItem>
          <Dumbbell width={20} height={20} color="#6b7280" />
          <MetricValue>{workout.exercises.length}</MetricValue>
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
        {workout.exercises.map(({ exercise, sets }) => (
          <ExerciseCard key={exercise.id}>
            <ExerciseName>{exercise.name}</ExerciseName>
            {sets.map((set, index) => (
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
