import { Exercise, ExerciseWithSets, Set, WorkoutSession } from '../types/workout';

import { analyticsService } from './analytics';
import { performanceMonitoring } from './performance';
import { supabase } from './supabase';

export class WorkoutService {
  private static instance: WorkoutService;

  private constructor() {}

  static getInstance(): WorkoutService {
    if (!WorkoutService.instance) {
      WorkoutService.instance = new WorkoutService();
    }
    return WorkoutService.instance;
  }

  async startWorkout(userId: string, name: string): Promise<WorkoutSession> {
    try {
      const session: WorkoutSession = {
        id: Date.now().toString(),
        userId,
        name,
        exerciseData: [],
        date: new Date().toISOString(),
        duration: 0,
        totalSets: 0,
        totalVolume: 0,
        createdAt: new Date().toISOString(),
      };

      const promise = Promise.resolve().then(() =>
        supabase
          .from('workout_sessions')
          .insert([session])
          .then(({ error }) => {
            if (error) throw error;
            return session;
          }),
      );

      const result = await performanceMonitoring.measureApiCall(promise, 'start_workout', {
        userId,
      });

      analyticsService.trackWorkout('start', { sessionId: session.id });
      return result;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  async endWorkout(sessionId: string): Promise<void> {
    try {
      const promise = Promise.resolve().then(() =>
        supabase
          .from('workout_sessions')
          .update({ endTime: new Date().toISOString() })
          .eq('id', sessionId)
          .then(({ error }) => {
            if (error) throw error;
          }),
      );

      await performanceMonitoring.measureApiCall(promise, 'end_workout', { sessionId });

      analyticsService.trackWorkout('complete', { sessionId });
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  async addExercise(sessionId: string, exercise: Exercise): Promise<void> {
    try {
      const exerciseData: ExerciseWithSets = {
        exercise,
        sets: [],
      };

      const promise = Promise.resolve().then(() =>
        supabase
          .from('workout_exercises')
          .insert([{ sessionId, exerciseId: exercise.id, exerciseData }])
          .then(({ error }) => {
            if (error) throw error;
          }),
      );

      await performanceMonitoring.measureApiCall(promise, 'add_exercise', {
        sessionId,
        exerciseId: exercise.id,
      });

      analyticsService.trackWorkout('start', {
        sessionId,
        exerciseId: exercise.id,
      });
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  async addSet(sessionId: string, exerciseId: string, set: Omit<Set, 'id'>): Promise<void> {
    try {
      const promise = Promise.resolve().then(() =>
        supabase
          .from('workout_sets')
          .insert([{ ...set, sessionId, exerciseId }])
          .then(({ error }) => {
            if (error) throw error;
          }),
      );

      await performanceMonitoring.measureApiCall(promise, 'add_set', { sessionId, exerciseId });

      analyticsService.trackWorkout('complete', {
        sessionId,
        exerciseId,
        weight: set.weight,
        reps: set.reps,
      });
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }
}

export const workoutService = WorkoutService.getInstance();
