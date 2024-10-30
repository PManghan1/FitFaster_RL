import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { progressService } from '../services/progress';
import { ProgressStore } from '../types/progress';

const initialState = {
  recentWorkouts: [],
  metrics: {
    totalWorkouts: 0,
    currentStreak: 0,
    weeklyCount: 0,
    totalVolume: 0,
    mostUsedExercises: [],
  },
  isLoading: false,
  error: null,
};

export const useProgressStore = create<ProgressStore>()(
  devtools(
    (set) => ({
      ...initialState,

      loadProgress: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          const metrics = await progressService.getProgressMetrics(userId);
          set({ metrics });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load progress',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      loadRecentWorkouts: async (userId: string, limit?: number) => {
        try {
          set({ isLoading: true, error: null });
          const recentWorkouts = await progressService.getRecentWorkouts(userId, limit);
          set({ recentWorkouts });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load recent workouts',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'progress-store' }
  )
);
