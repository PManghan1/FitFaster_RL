import { DatabaseError } from '../utils/supabase';
import { workoutService } from './workout';
import { ProgressMetrics, WorkoutHistoryItem } from '../types/progress';
import { WorkoutSummary } from '../types/workout';

class ProgressService {
  async getProgressMetrics(userId: string): Promise<ProgressMetrics> {
    try {
      const workouts = await workoutService.getWorkoutHistory(userId);
      
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);

      const exerciseCounts = new Map<string, { name: string; count: number }>();
      let totalVolume = 0;
      let weeklyCount = 0;
      let currentStreak = 0;
      let lastWorkoutDate: Date | null = null;

      workouts.forEach(workout => {
        // Calculate total volume and exercise counts
        workout.exercises.forEach(({ exercise, sets }) => {
          const exerciseVolume = sets.reduce((total, set) => 
            total + (set.weight || 0) * (set.reps || 0), 0);
          totalVolume += exerciseVolume;

          const current = exerciseCounts.get(exercise.id) || { name: exercise.name, count: 0 };
          exerciseCounts.set(exercise.id, {
            name: exercise.name,
            count: current.count + 1
          });
        });

        // Calculate weekly workouts
        const workoutDate = new Date(workout.session.date);
        if (workoutDate >= startOfWeek) {
          weeklyCount++;
        }

        // Calculate streak
        if (!lastWorkoutDate) {
          lastWorkoutDate = workoutDate;
          currentStreak = 1;
        } else {
          const dayDiff = Math.floor(
            (lastWorkoutDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (dayDiff === 1) {
            currentStreak++;
            lastWorkoutDate = workoutDate;
          } else if (dayDiff > 1) {
            currentStreak = 1;
            lastWorkoutDate = workoutDate;
          }
        }
      });

      const mostUsedExercises = Array.from(exerciseCounts.entries())
        .map(([exerciseId, { name, count }]) => ({ exerciseId, name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalWorkouts: workouts.length,
        currentStreak,
        weeklyCount,
        totalVolume,
        mostUsedExercises,
      };
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to get progress metrics');
    }
  }

  async getRecentWorkouts(userId: string, limit = 10): Promise<WorkoutHistoryItem[]> {
    try {
      const workouts = await workoutService.getWorkoutHistory(userId);
      
      return workouts
        .slice(0, limit)
        .map(workout => this.mapWorkoutSummaryToHistoryItem(workout));
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to get recent workouts');
    }
  }

  private mapWorkoutSummaryToHistoryItem(workout: WorkoutSummary): WorkoutHistoryItem {
    const totalVolume = workout.exercises.reduce((total, { sets }) => 
      total + sets.reduce((setTotal, set) => 
        setTotal + (set.weight || 0) * (set.reps || 0), 0), 0);

    return {
      id: workout.session.id,
      date: workout.session.date,
      exerciseCount: workout.exercises.length,
      totalVolume,
      duration: workout.duration,
      name: workout.session.name,
    };
  }
}

export const progressService = new ProgressService();
