import {
  Exercise,
  ExerciseType,
  MuscleGroup,
  Difficulty,
  Set,
  ExerciseWithSets,
  WorkoutSession,
  Workout,
} from '../../types/workout';

export const mockExercise: Exercise = {
  id: '1',
  name: 'Bench Press',
  description: 'Barbell bench press exercise',
  type: ExerciseType.STRENGTH,
  muscleGroups: [MuscleGroup.CHEST],
  difficulty: Difficulty.INTERMEDIATE,
  equipment: ['Barbell', 'Bench'],
  instructions: ['Lie on bench', 'Lower bar to chest', 'Press up'],
  videoUrl: null,
};

export const mockSet: Set = {
  id: '1',
  exerciseId: '1',
  reps: 10,
  weight: 100,
  completed: false,
};

export const mockExerciseWithSets: ExerciseWithSets = {
  exercise: mockExercise,
  sets: [mockSet],
};

export const mockWorkout: Workout = {
  id: '1',
  name: 'Chest Day',
  description: 'Focus on chest exercises',
  sets: [
    {
      id: '1',
      exerciseId: '1',
      reps: 10,
      weight: 100,
      completed: false,
    },
  ],
  createdAt: '2024-01-01T09:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  userId: 'user123',
};

export const mockWorkoutSession: WorkoutSession = {
  id: '1',
  name: 'Morning Workout',
  startTime: '2024-01-01T09:00:00Z',
  endTime: '2024-01-01T10:00:00Z',
  exercises: [mockExerciseWithSets],
  notes: 'Great workout!',
  userId: 'user123',
  completed: true,
};

export const mockCardioExercise: Exercise = {
  id: '2',
  name: 'Running',
  description: 'Outdoor running',
  type: ExerciseType.CARDIO,
  muscleGroups: [MuscleGroup.LEGS],
  difficulty: Difficulty.BEGINNER,
  equipment: [],
  instructions: ['Start slow', 'Maintain pace', 'Cool down'],
  videoUrl: null,
};

export const mockCardioSet: Set = {
  id: '2',
  exerciseId: '2',
  duration: 1800, // 30 minutes in seconds
  distance: 5000, // 5km
  completed: false,
};

export const mockCardioExerciseWithSets: ExerciseWithSets = {
  exercise: mockCardioExercise,
  sets: [mockCardioSet],
};
