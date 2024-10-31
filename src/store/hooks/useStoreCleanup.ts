import { useEffect } from 'react';

import { useAuthStore } from '../auth.store';
import { useProgressStore } from '../progress.store';
import { useWorkoutStore } from '../workout.store';

/**
 * Hook to handle cleanup of store state when the app is closed or user logs out
 */
export const useStoreCleanup = () => {
  const authReset = useAuthStore(state => state.reset);
  const progressReset = useProgressStore(state => state.reset);
  const workoutReset = useWorkoutStore(state => state.reset);

  useEffect(() => {
    const cleanup = () => {
      authReset();
      progressReset();
      workoutReset();
    };

    // Add event listener for app state changes
    if (__DEV__) {
      // In development, log when cleanup occurs
      console.log('Store cleanup registered');
    }

    return () => {
      cleanup();
      if (__DEV__) {
        console.log('Store cleanup executed');
      }
    };
  }, [authReset, progressReset, workoutReset]);
};
