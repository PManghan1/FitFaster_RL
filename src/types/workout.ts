import { z } from 'zod';

export const ExerciseType = z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY']);
export type ExerciseType = z.infer<typeof ExerciseType>;

export const MuscleGroup = z.enum([
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'LEGS',
  'CORE',
]);
export type MuscleGroup = z.infer<typeof MuscleGroup>;

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  muscleGroups: MuscleGroup[];
  isCustom: boolean;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Set {
  id: string;
  exerciseId: string;
  weight?: number;
  reps?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  sets: Set[];
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkoutSession extends Workout {
  userId: string;
  date: string;
  duration: number;
  totalSets: number;
  totalVolume: number;
}

export interface ExerciseHistory {
  id: string;
  userId: string;
  exerciseId: string;
  sessionId: string;
  personalBest: boolean;
  weight?: number;
  reps?: number;
  duration?: number;
  distance?: number;
  notes?: string;
  createdAt: string;
}

export interface WorkoutProgress {
  exercise: Exercise;
  history: ExerciseHistory[];
  personalBests: {
    weight: number;
    reps: number;
    duration: number;
    distance: number;
  };
  recentSets: Set[];
}

export interface WorkoutSummary {
  session: WorkoutSession;
  exercises: Array<{
    exercise: Exercise;
    sets: Set[];
  }>;
  duration: number;
  totalSets: number;
  muscleGroups: MuscleGroup[];
}

export type WorkoutId = string;

export interface WorkoutStore {
  currentWorkout: Workout | null;
  workoutHistory: WorkoutSession[];
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  startWorkout: (name?: string) => Promise<void>;
  endWorkout: () => Promise<void>;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string, set: Partial<Set>) => void;
  updateSet: (setId: string, updates: Partial<Set>) => void;
  removeSet: (setId: string) => void;
  loadExercises: () => Promise<void>;
  loadWorkoutHistory: () => Promise<void>;
  reset: () => void;
}
