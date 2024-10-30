import { useEffect } from 'react';
import { useAuthStore } from '../auth.store';
import { useWorkoutStore } from '../workout.store';
import { useProgressStore } from '../progress.store';
import { useNutritionStore } from '../nutrition.store';
import type { WorkoutStore } from '../../types/workout';
import type { ProgressStore } from '../../types/progress';
import type { NutritionStore } from '../../types/nutrition';
import type { StoreWithPersist } from '../types';

export const useStoreCleanup = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Get store instances with proper typing
  const workoutStore = useWorkoutStore() as unknown as StoreWithPersist<WorkoutStore>;
  const progressStore = useProgressStore() as unknown as StoreWithPersist<ProgressStore>;
  const nutritionStore = useNutritionStore() as unknown as StoreWithPersist<NutritionStore>;

  useEffect(() => {
    const cleanup = async () => {
      if (!isAuthenticated) {
        try {
          // Clear all stores when user logs out
          workoutStore.reset();
          progressStore.reset();
          nutritionStore.reset();

          // Clear persisted state
          await Promise.all([
            workoutStore.clearPersistedState(),
            progressStore.clearPersistedState(),
            nutritionStore.clearPersistedState(),
          ]);
        } catch (error) {
          console.error('Failed to cleanup stores:', error);
        }
      }
    };

    cleanup();
  }, [isAuthenticated]);
};
