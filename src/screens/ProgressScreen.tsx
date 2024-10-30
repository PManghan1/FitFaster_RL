import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProgressStore } from '../store/progress.store';
import { useAuthStore } from '../store/auth.store';
import { ErrorBoundary } from '../components/ErrorBoundary';

const ProgressScreenContent = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuthStore();
  const {
    metrics,
    recentWorkouts,
    isLoading,
    error,
    loadProgress,
    loadRecentWorkouts,
  } = useProgressStore();

  const [newWeight, setNewWeight] = useState('');
  const [measurementType, setMeasurementType] = useState('');
  const [measurementValue, setMeasurementValue] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Auth' as never);
      return;
    }
    // TODO: Get actual user ID from auth context
    const userId = 'user-id';
    loadProgress(userId);
    loadRecentWorkouts(userId);
  }, [isAuthenticated, navigation, loadProgress, loadRecentWorkouts]);

  const handleAddWeight = () => {
    if (newWeight) {
      // TODO: Implement weight addition logic
      setNewWeight('');
    }
  };

  const handleAddMeasurement = () => {
    if (measurementType && measurementValue) {
      // TODO: Implement measurement addition logic
      setMeasurementType('');
      setMeasurementValue('');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="loading-indicator">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Weight Progress</Text>
        <View testID="weight-chart" style={styles.chart}>
          {metrics.totalWorkouts > 0 && (
            <Text style={styles.metricText}>{metrics.totalWorkouts} Total Workouts</Text>
          )}
          {metrics.currentStreak > 0 && (
            <Text style={styles.metricText}>{metrics.currentStreak} Day Streak</Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter weight"
            value={newWeight}
            onChangeText={setNewWeight}
            keyboardType="numeric"
          />
          <TouchableOpacity
            testID="add-weight-button"
            style={styles.button}
            onPress={handleAddWeight}
          >
            <Text style={styles.buttonText}>Add Weight</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Body Measurements</Text>
        <View testID="measurements-chart" style={styles.chart}>
          {metrics.mostUsedExercises.map((exercise) => (
            <Text key={exercise.exerciseId} style={styles.measurementText}>
              {exercise.name}: {exercise.count} times
            </Text>
          ))}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            testID="measurement-type-input"
            style={styles.input}
            placeholder="Measurement type"
            value={measurementType}
            onChangeText={setMeasurementType}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter measurement"
            value={measurementValue}
            onChangeText={setMeasurementValue}
            keyboardType="numeric"
          />
          <TouchableOpacity
            testID="add-measurement-button"
            style={styles.button}
            onPress={handleAddMeasurement}
          >
            <Text style={styles.buttonText}>Add Measurement</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Recent Workouts</Text>
        {recentWorkouts.map(workout => (
          <View key={workout.id} style={styles.workoutCard}>
            <Text style={styles.workoutTitle}>
              {workout.name || new Date(workout.date).toLocaleDateString()}
            </Text>
            <Text style={styles.workoutDetail}>
              {workout.exerciseCount} exercises • {Math.round(workout.duration / 60)} min
            </Text>
            <Text style={styles.workoutDetail}>
              Total Volume: {Math.round(workout.totalVolume)}kg
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const ProgressScreen = () => (
  <ErrorBoundary>
    <ProgressScreenContent />
  </ErrorBoundary>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  metricText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  measurementText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  workoutDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});

export default ProgressScreen;
