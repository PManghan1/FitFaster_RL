import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { WorkoutScreen } from '../screens/WorkoutScreen';
import { ExerciseLibraryScreen } from '../screens/ExerciseLibraryScreen';
import { WorkoutDetailsScreen } from '../screens/WorkoutDetailsScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { Exercise } from '../types/workout';

export type AppStackParamList = {
  Home: undefined;
  Workout: { selectedExercise?: Exercise };
  ExerciseLibrary: undefined;
  WorkoutDetails: { sessionId: string };
  Progress: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen 
        name="ExerciseLibrary" 
        component={ExerciseLibraryScreen}
        options={{
          headerShown: true,
          title: 'Exercise Library',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen 
        name="WorkoutDetails" 
        component={WorkoutDetailsScreen}
        options={{
          headerShown: true,
          title: 'Workout Details',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          headerShown: true,
          title: 'Progress',
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};
