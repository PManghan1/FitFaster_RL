import type { WorkoutId as WId, ExerciseId as EId } from './branded';
import type { BaseStore } from '../store/types';

// Re-export the branded types
export type WorkoutId = WId;
export type ExerciseId = EId;

export interface Set {
  id: string;
  weight?: number;
  reps?: number;
  duration?: number;
  distance?: number;
  notes?: string;
}

export interface Exercise {
  id: ExerciseId;
  name: string;
  category: string;
  description?: string;
  sets: Set[];
}

export interface WorkoutSession {
  id: WorkoutId;
  date: string;
  name?: string;
  duration: number;
  exercises: Exercise[];
  notes?: string;
}

export interface ExerciseWithSets {
  exercise: Exercise;
  sets: Set[];
}

export interface WorkoutSummary {
  id: WorkoutId;
  date: string;
  name?: string;
  duration: number;
  exercises: ExerciseWithSets[];
  session: WorkoutSession;
  totalSets: number;
  muscleGroups: string[];
}

export interface WorkoutState {
  activeWorkout: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
}

export interface WorkoutStore extends WorkoutState, BaseStore {
  startWorkout: () => Promise<void>;
  endWorkout: () => Promise<void>;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: ExerciseId) => void;
  updateSet: (exerciseId: ExerciseId, setIndex: number, data: Partial<Set>) => void;
  loadWorkoutHistory: () => Promise<void>;
  loadExercises: () => Promise<void>;
}
