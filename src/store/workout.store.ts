import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist } from './middleware/persist';
import type { WorkoutStore, WorkoutState, WorkoutSession, Exercise, ExerciseId, Set } from '../types/workout';
import type { PersistApi } from './middleware/persist';
import { workoutService } from '../services/workout';
import { useAuthStore } from './auth.store';

const initialState: WorkoutState = {
  activeWorkout: null,
  workoutHistory: [],
  exercises: [],
  isLoading: false,
  error: null,
};

type WorkoutStoreWithPersist = WorkoutStore & PersistApi;

export const useWorkoutStore = create<WorkoutStoreWithPersist>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        startWorkout: async () => {
          try {
            set({ isLoading: true, error: null });
            const userId = useAuthStore.getState().user?.id;
            if (!userId) throw new Error('User not authenticated');

            const session = await workoutService.startWorkoutSession(userId);
            set({ activeWorkout: session });
          } catch (error: any) {
            set({ error: error.message });
          } finally {
            set({ isLoading: false });
          }
        },

        endWorkout: async () => {
          try {
            set({ isLoading: true, error: null });
            const { activeWorkout } = get();
            if (!activeWorkout) throw new Error('No active workout');
            
            await workoutService.updateSessionDuration(
              activeWorkout.id,
              activeWorkout.duration
            );

            const summary = await workoutService.getWorkoutSummary(activeWorkout.id);
            set(state => ({
              activeWorkout: null,
              workoutHistory: [summary.session, ...state.workoutHistory],
            }));
          } catch (error: any) {
            set({ error: error.message });
          } finally {
            set({ isLoading: false });
          }
        },

        addExercise: (exercise: Exercise) => {
          set((state: WorkoutState) => {
            if (!state.activeWorkout) return state;
            return {
              ...state,
              activeWorkout: {
                ...state.activeWorkout,
                exercises: [...state.activeWorkout.exercises, exercise],
              },
            };
          });
        },

        removeExercise: (exerciseId: ExerciseId) => {
          set((state: WorkoutState) => {
            if (!state.activeWorkout) return state;
            return {
              ...state,
              activeWorkout: {
                ...state.activeWorkout,
                exercises: state.activeWorkout.exercises.filter(exercise => exercise.id !== exerciseId),
              },
            };
          });
        },

        updateSet: async (exerciseId: ExerciseId, setIndex: number, data: Partial<Set>) => {
          try {
            const { activeWorkout } = get();
            if (!activeWorkout) throw new Error('No active workout');

            const userId = useAuthStore.getState().user?.id;
            if (!userId) throw new Error('User not authenticated');

            const newSet = await workoutService.addSetToSession(
              userId,
              activeWorkout.id,
              exerciseId,
              data
            );

            set((state: WorkoutState) => {
              if (!state.activeWorkout) return state;
              return {
                ...state,
                activeWorkout: {
                  ...state.activeWorkout,
                  exercises: state.activeWorkout.exercises.map(exercise => {
                    if (exercise.id !== exerciseId) return exercise;
                    return {
                      ...exercise,
                      sets: exercise.sets.map((s, index) => 
                        index === setIndex ? newSet : s
                      ),
                    };
                  }),
                },
              };
            });
          } catch (error: any) {
            set({ error: error.message });
          }
        },

        loadWorkoutHistory: async () => {
          try {
            set({ isLoading: true, error: null });
            const userId = useAuthStore.getState().user?.id;
            if (!userId) throw new Error('User not authenticated');

            const history = await workoutService.getWorkoutHistory(userId);
            // Convert WorkoutSummary[] to WorkoutSession[]
            const sessions = history.map(summary => summary.session);
            set({ workoutHistory: sessions });
          } catch (error: any) {
            set({ error: error.message });
          } finally {
            set({ isLoading: false });
          }
        },

        loadExercises: async () => {
          try {
            set({ isLoading: true, error: null });
            const exercises = await workoutService.searchExercises('');
            set({ exercises });
          } catch (error: any) {
            set({ error: error.message });
          } finally {
            set({ isLoading: false });
          }
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'workout-store',
        version: 1,
        blacklist: ['isLoading', 'error'],
      }
    ),
    { name: 'workout-store' }
  )
);
