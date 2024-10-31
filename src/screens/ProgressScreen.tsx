import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { useProgressStore } from '../store/progress.store';
import { colors } from '../theme';

const ProgressScreen: React.FC = () => {
  const { metrics } = useProgressStore();

  const chartConfig = {
    backgroundGradientFrom: colors.background.default,
    backgroundGradientTo: colors.background.default,
    color: () => colors.primary.default,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
  };

  const workoutData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: Array(7).fill(metrics?.weeklyCount || 0),
        color: () => colors.primary.default,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <LineChart
          data={workoutData}
          width={350}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{metrics?.totalWorkouts || 0}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{metrics?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{metrics?.totalVolume || 0}</Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Used Exercises</Text>
        {metrics?.mostUsedExercises.map(exercise => (
          <View key={exercise.exerciseId} style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseCount}>{exercise.count} times</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chart: {
    borderRadius: 16,
    marginTop: 12,
  },
  container: {
    backgroundColor: colors.background.default,
    flex: 1,
    padding: 16,
  },
  exerciseCount: {
    color: colors.text.light,
    fontSize: 14,
  },
  exerciseItem: {
    alignItems: 'center',
    backgroundColor: colors.background.light,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 12,
  },
  exerciseName: {
    color: colors.text.default,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text.default,
    fontSize: 18,
    fontWeight: '600',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: colors.background.light,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
  },
  statLabel: {
    color: colors.text.light,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    color: colors.text.default,
    fontSize: 24,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});

export default ProgressScreen;
