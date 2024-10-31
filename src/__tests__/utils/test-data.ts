import { Exercise, Set, Workout } from '../../types/workout';

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

export const mockWorkout: Workout = {
  id: '1',
  name: 'Monday Workout',
  exercises: [mockExercise],
  sets: [mockSet],
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
