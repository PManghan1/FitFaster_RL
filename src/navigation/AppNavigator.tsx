import { Exercise } from '../types/workout';

export type AppStackParamList = {
  Home: undefined;
  Workout: {
    selectedExercise?: Exercise;
  };
  ExerciseLibrary: undefined;
  WorkoutDetails: {
    workoutId: string;
  };
  Progress: undefined;
};
