import type { Exercise, ExerciseWithSets, Set, WorkoutSession } from '../../types/workout';

export const mockExercise: Exercise = {
  id: '1',
  name: 'Bench Press',
  type: 'STRENGTH',
  muscleGroups: ['CHEST'],
  isCustom: false,
  description: 'Barbell bench press for chest development',
  createdAt: new Date().toISOString(),
};

export const mockSet: Set = {
  id: '1',
  exerciseId: '1',
  weight: 100,
  reps: 10,
  completed: false,
};

export const mockExerciseWithSets: ExerciseWithSets = {
  exercise: mockExercise,
  sets: [mockSet],
};

export const mockWorkout: WorkoutSession = {
  id: '1',
  userId: 'user-1',
  name: 'Monday Workout',
  exerciseData: [mockExerciseWithSets],
  date: new Date().toISOString(),
  duration: 3600, // 1 hour in seconds
  totalSets: 1,
  totalVolume: 1000,
  createdAt: new Date().toISOString(),
};

export const mockExercises: Exercise[] = [
  mockExercise,
  {
    id: '2',
    name: 'Running',
    type: 'CARDIO',
    muscleGroups: ['LEGS'],
    isCustom: false,
    description: 'Outdoor or treadmill running',
    createdAt: new Date().toISOString(),
  },
];
