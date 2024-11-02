import { z } from 'zod';

export const ExerciseTypeSchema = z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY']);
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

export const MuscleGroupSchema = z.enum([
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'LEGS',
  'CORE',
]);
export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;

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

export interface ExerciseWithSets {
  exercise: Exercise;
  sets: Set[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  name: string;
  exerciseData: ExerciseWithSets[];
  date: string;
  duration: number;
  totalSets: number;
  totalVolume: number;
  createdAt: string;
  updatedAt?: string;
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
