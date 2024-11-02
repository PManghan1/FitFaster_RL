import type { Exercise, WorkoutId, WorkoutSession, WorkoutStore } from '../../types/workout';

// Memoized selectors for workout data
export const workoutSelectors = {
  // Get active workout session
  getActiveWorkout: (state: WorkoutStore) => state.activeWorkout,

  // Get completed workouts for the current week
  getCurrentWeekWorkouts: (state: WorkoutStore) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return state.workoutHistory.filter((workout: WorkoutSession) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startOfWeek;
    });
  },

  // Get total volume for a specific workout
  getWorkoutVolume: (state: WorkoutStore, workoutId: WorkoutId) => {
    const workout = state.workoutHistory.find(w => w.id === workoutId);
    if (!workout) return 0;
    return workout.exercises.reduce((total: number, exercise: Exercise) => {
      return (
        total +
        exercise.sets.reduce((setTotal: number, set) => {
          return setTotal + (set.weight || 0) * (set.reps || 0);
        }, 0)
      );
    }, 0);
  },

  // Get favorite exercises based on frequency
  getFavoriteExercises: (state: WorkoutStore) => {
    const exerciseCounts = new Map<string, number>();
    state.workoutHistory.forEach((workout: WorkoutSession) => {
      workout.exercises.forEach((exercise: Exercise) => {
        const count = exerciseCounts.get(exercise.id) || 0;
        exerciseCounts.set(exercise.id, count + 1);
      });
    });
    return Array.from(exerciseCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => state.exercises.find(e => e.id === id)!)
      .filter(Boolean);
  },

  // Get workout streak
  getWorkoutStreak: (state: WorkoutStore) => {
    let streak = 0;
    const sortedWorkouts = [...state.workoutHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    if (sortedWorkouts.length === 0) return 0;

    const today = new Date();
    const currentDate = new Date(sortedWorkouts[0].date);

    // Check if the most recent workout was today or yesterday
    const daysDiff = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0;

    for (let i = 0; i < sortedWorkouts.length - 1; i++) {
      const current = new Date(sortedWorkouts[i].date);
      const next = new Date(sortedWorkouts[i + 1].date);
      const diff = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak + 1; // Add 1 to include the current day
  },
};

// Memoized selector creators for dynamic queries
export const createWorkoutSelectors = {
  // Get workouts for a specific date range
  getWorkoutsInRange: (startDate: Date, endDate: Date) => (state: WorkoutStore) => {
    return state.workoutHistory.filter((workout: WorkoutSession) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  },

  // Get workouts by exercise type
  getWorkoutsByExercise: (exerciseId: string) => (state: WorkoutStore) => {
    return state.workoutHistory.filter((workout: WorkoutSession) =>
      workout.exercises.some((e: Exercise) => e.id === exerciseId),
    );
  },

  // Get progress for a specific exercise
  getExerciseProgress: (exerciseId: string) => (state: WorkoutStore) => {
    return state.workoutHistory
      .filter((workout: WorkoutSession) =>
        workout.exercises.some((e: Exercise) => e.id === exerciseId),
      )
      .map((workout: WorkoutSession) => {
        const exercise = workout.exercises.find((e: Exercise) => e.id === exerciseId)!;
        return {
          date: workout.date,
          volume: exercise.sets.reduce(
            (total: number, set) => total + (set.weight || 0) * (set.reps || 0),
            0,
          ),
          maxWeight: Math.max(...exercise.sets.map(set => set.weight || 0)),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
};
