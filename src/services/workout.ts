import { PostgrestError, PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { DatabaseError } from '../utils/supabase';
import {
  Exercise,
  WorkoutSet,
  WorkoutSession,
  ExerciseHistory,
  WorkoutProgress,
  WorkoutSummary,
  Database,
  MuscleGroup,
} from '../types/workout';

type Tables = Database['public']['Tables'];

function assertSingleResponse<T>(response: PostgrestSingleResponse<unknown>, message: string): T {
  if (response.error) throw new DatabaseError(response.error.message);
  if (!response.data) throw new DatabaseError(message);
  return response.data as T;
}

function assertArrayResponse<T>(response: PostgrestResponse<unknown>, message: string): T[] {
  if (response.error) throw new DatabaseError(response.error.message);
  return (response.data || []) as T[];
}

class WorkoutService {
  // Exercise Management
  async getExercise(id: string): Promise<Exercise> {
    try {
      const response = await supabase
        .from('exercises')
        .select()
        .eq('id', id)
        .single();

      return assertSingleResponse<Exercise>(response, 'Exercise not found');
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to get exercise');
    }
  }

  async searchExercises(query: string, muscleGroups?: MuscleGroup[]): Promise<Exercise[]> {
    try {
      let queryBuilder = supabase
        .from('exercises')
        .select();

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      if (muscleGroups && muscleGroups.length > 0) {
        queryBuilder = queryBuilder.contains('muscleGroups', muscleGroups);
      }

      const response = await queryBuilder;
      return assertArrayResponse<Exercise>(response, 'Failed to search exercises');
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to search exercises');
    }
  }

  async createExercise(exercise: Tables['exercises']['Insert']): Promise<Exercise> {
    try {
      const response = await supabase
        .from('exercises')
        .insert([exercise])
        .select()
        .single();

      return assertSingleResponse<Exercise>(response, 'Failed to create exercise');
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to create exercise');
    }
  }

  // Workout Session Management
  async startWorkoutSession(userId: string, name?: string): Promise<WorkoutSession> {
    try {
      const session: Tables['workout_sessions']['Insert'] = {
        userId,
        name,
        date: new Date().toISOString(),
        duration: 0,
        sets: [],
      };

      const response = await supabase
        .from('workout_sessions')
        .insert([session])
        .select()
        .single();

      return assertSingleResponse<WorkoutSession>(response, 'Failed to start workout session');
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to start workout session');
    }
  }

  async addSetToSession(
    userId: string,
    sessionId: string,
    exerciseId: string,
    setData: Omit<WorkoutSet, 'id' | 'userId' | 'exerciseId' | 'sessionId' | 'createdAt'>
  ): Promise<WorkoutSet> {
    try {
      const workoutSet: Tables['workout_sets']['Insert'] = {
        userId,
        sessionId,
        exerciseId,
        ...setData,
      };

      const response = await supabase
        .from('workout_sets')
        .insert([workoutSet])
        .select()
        .single();

      const newSet = assertSingleResponse<WorkoutSet>(response, 'Failed to add set');
      await this.updateExerciseHistory(userId, sessionId, exerciseId, newSet);

      return newSet;
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to add set');
    }
  }

  async updateSessionDuration(sessionId: string, duration: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ duration })
        .eq('id', sessionId);

      if (error) throw new DatabaseError(error.message);
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to update session duration');
    }
  }

  async getWorkoutHistory(userId: string): Promise<WorkoutSummary[]> {
    try {
      const response = await supabase
        .from('workout_sessions')
        .select()
        .eq('userId', userId)
        .order('date', { ascending: false });

      const sessions = assertArrayResponse<WorkoutSession>(response, 'Failed to get workout history');
      
      return Promise.all(
        sessions.map(session => this.getWorkoutSummary(session.id))
      );
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to get workout history');
    }
  }

  async getWorkoutSummary(sessionId: string): Promise<WorkoutSummary> {
    try {
      type SetWithExercise = WorkoutSet & { exercise: Exercise };

      const [sessionResponse, setsResponse] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select()
          .eq('id', sessionId)
          .single(),
        supabase
          .from('workout_sets')
          .select('*, exercise:exercises(*)')
          .eq('sessionId', sessionId),
      ]);

      const session = assertSingleResponse<WorkoutSession>(sessionResponse, 'Session not found');
      const sets = assertArrayResponse<SetWithExercise>(setsResponse, 'No sets found');

      const exerciseMap = new Map<string, { exercise: Exercise; sets: WorkoutSet[] }>();
      const muscleGroups = new Set<MuscleGroup>();

      sets.forEach(({ exercise, ...setData }) => {
        if (!exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, { exercise, sets: [] });
          exercise.muscleGroups.forEach(group => muscleGroups.add(group));
        }
        exerciseMap.get(exercise.id)?.sets.push(setData);
      });

      return {
        session,
        exercises: Array.from(exerciseMap.values()),
        duration: session.duration,
        totalSets: sets.length,
        muscleGroups: Array.from(muscleGroups),
      };
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to get workout summary');
    }
  }

  // Exercise History & Progress
  private async updateExerciseHistory(
    userId: string,
    sessionId: string,
    exerciseId: string,
    set: WorkoutSet
  ): Promise<void> {
    try {
      const previousBest = await this.getPersonalBest(exerciseId, userId);
      const isPersonalBest = this.isNewPersonalBest(set, previousBest);

      const historyEntry: Tables['exercise_history']['Insert'] = {
        userId,
        exerciseId,
        sessionId,
        personalBest: isPersonalBest,
        weight: set.weight,
        reps: set.reps,
        duration: set.duration,
        distance: set.distance,
        notes: set.notes,
      };

      const { error } = await supabase
        .from('exercise_history')
        .insert([historyEntry]);

      if (error) throw new DatabaseError(error.message);
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to update exercise history');
    }
  }

  async getExerciseProgress(exerciseId: string, userId: string): Promise<WorkoutProgress> {
    try {
      const [exercise, historyResponse] = await Promise.all([
        this.getExercise(exerciseId),
        supabase
          .from('exercise_history')
          .select()
          .eq('exerciseId', exerciseId)
          .eq('userId', userId)
          .order('createdAt', { ascending: false }),
      ]);

      const history = assertArrayResponse<ExerciseHistory>(historyResponse, 'Failed to get exercise history');

      const personalBests = {
        weight: Math.max(...history.map(h => h.weight || 0)),
        reps: Math.max(...history.map(h => h.reps || 0)),
        duration: Math.max(...history.map(h => h.duration || 0)),
        distance: Math.max(...history.map(h => h.distance || 0)),
      };

      return {
        exercise,
        history,
        personalBests,
        recentSets: history.slice(0, 5) as WorkoutSet[],
      };
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to get exercise progress');
    }
  }

  private async getPersonalBest(exerciseId: string, userId: string): Promise<ExerciseHistory | null> {
    try {
      const response = await supabase
        .from('exercise_history')
        .select()
        .eq('exerciseId', exerciseId)
        .eq('userId', userId)
        .eq('personalBest', true)
        .single();

      if (response.error && response.error.code !== 'PGRST116') {
        throw new DatabaseError(response.error.message);
      }

      return response.data as ExerciseHistory | null;
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to get personal best');
    }
  }

  private isNewPersonalBest(currentSet: WorkoutSet, previousBest: ExerciseHistory | null): boolean {
    if (!previousBest) return true;

    if (currentSet.weight && previousBest.weight) {
      return currentSet.weight > previousBest.weight;
    }

    if (currentSet.reps && previousBest.reps) {
      return currentSet.reps > previousBest.reps;
    }

    if (currentSet.duration && previousBest.duration) {
      return currentSet.duration > previousBest.duration;
    }

    if (currentSet.distance && previousBest.distance) {
      return currentSet.distance > previousBest.distance;
    }

    return false;
  }
}

export const workoutService = new WorkoutService();
