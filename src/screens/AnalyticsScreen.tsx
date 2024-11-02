import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { AnalyticsCard } from '../components/analytics/AnalyticsCard';
import { AnalyticsChart } from '../components/analytics/AnalyticsChart';

const StyledScrollView = styled(ScrollView);

const MOCK_WORKOUT_DATA = [
  { label: 'Mon', value: 45 },
  { label: 'Tue', value: 30 },
  { label: 'Wed', value: 60 },
  { label: 'Thu', value: 45 },
  { label: 'Fri', value: 75 },
  { label: 'Sat', value: 50 },
  { label: 'Sun', value: 40 },
];

const MOCK_NUTRITION_DATA = [
  { label: 'Mon', value: 2100 },
  { label: 'Tue', value: 1950 },
  { label: 'Wed', value: 2200 },
  { label: 'Thu', value: 2000 },
  { label: 'Fri', value: 2300 },
  { label: 'Sat', value: 2150 },
  { label: 'Sun', value: 1900 },
];

export const AnalyticsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Implement data refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <StyledScrollView
      className="flex-1 bg-gray-50 px-4 pt-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      testID="analytics-screen"
    >
      {/* Workout Summary */}
      <AnalyticsCard
        title="Weekly Workouts"
        value="5"
        subtitle="Total workouts this week"
        trend={{ value: 25, isPositive: true }}
        testID="workout-summary-card"
      />

      <AnalyticsChart
        data={MOCK_WORKOUT_DATA}
        maxValue={100}
        color="#3B82F6"
        testID="workout-chart"
      />

      {/* Nutrition Summary */}
      <AnalyticsCard
        title="Calorie Intake"
        value="2,100"
        subtitle="Daily average this week"
        trend={{ value: 5, isPositive: false }}
        testID="nutrition-summary-card"
      />

      <AnalyticsChart
        data={MOCK_NUTRITION_DATA}
        maxValue={2500}
        color="#10B981"
        testID="nutrition-chart"
      />

      {/* Progress Metrics */}
      <AnalyticsCard
        title="Weight Training"
        value="12,500 kg"
        subtitle="Total volume this week"
        trend={{ value: 15, isPositive: true }}
        testID="weight-training-card"
      />

      <AnalyticsCard
        title="Protein Intake"
        value="145g"
        subtitle="Daily average this week"
        trend={{ value: 10, isPositive: true }}
        testID="protein-intake-card"
      />
    </StyledScrollView>
  );
};
