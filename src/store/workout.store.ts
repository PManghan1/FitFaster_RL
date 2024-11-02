import create from 'zustand';

import { Exercise, ExerciseWithSets, MuscleGroup, Set, WorkoutSession } from '../types/workout';

interface WorkoutState {
  currentWorkout: WorkoutSession | null;
  currentExercise: Exercise | null;
  restTimer: number | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  startWorkout: (userId: string, name: string) => Promise<void>;
  endWorkout: () => Promise<void>;
  selectExercise: (exercise: Exercise) => void;
  addSet: (exerciseId: string, setData: Omit<Set, 'id' | 'exerciseId'>) => void;
  startRestTimer: (duration: number) => void;
  stopRestTimer: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

interface ExerciseLibraryState {
  exercises: Exercise[];
  searchResults: Exercise[];
  isSearching: boolean;
  searchExercises: (query: string, muscleGroups: MuscleGroup[]) => Promise<void>;
}

interface WorkoutDetailsState {
  workout: WorkoutSession | null;
  loading: boolean;
  error: string | null;
  loadWorkout: (workoutId: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>(set => ({
  currentWorkout: null,
  currentExercise: null,
  restTimer: null,
  isActive: false,
  isLoading: false,
  error: null,
  startWorkout: async (userId: string, name: string) => {
    set({ isLoading: true });
    try {
      const workout: WorkoutSession = {
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
      set({ currentWorkout: workout, isActive: true, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  endWorkout: async () => {
    set({ currentWorkout: null, currentExercise: null, restTimer: null, isActive: false });
  },
  selectExercise: (exercise: Exercise) => {
    set({ currentExercise: exercise });
  },
  addSet: (exerciseId: string, setData: Omit<Set, 'id' | 'exerciseId'>) => {
    set((state: WorkoutState) => {
      if (!state.currentWorkout) return state;

      const newSet: Set = {
        id: Date.now().toString(),
        exerciseId,
        ...setData,
      };

      const exerciseIndex = state.currentWorkout.exerciseData.findIndex(
        data => data.exercise.id === exerciseId,
      );

      if (exerciseIndex === -1) {
        const exercise = state.currentExercise;
        if (!exercise) return state;

        const newExerciseData: ExerciseWithSets = {
          exercise,
          sets: [newSet],
        };

        return {
          ...state,
          currentWorkout: {
            ...state.currentWorkout,
            exerciseData: [...state.currentWorkout.exerciseData, newExerciseData],
            totalSets: state.currentWorkout.totalSets + 1,
            totalVolume:
              state.currentWorkout.totalVolume + (newSet.weight || 0) * (newSet.reps || 0),
          },
        };
      }

      const updatedExerciseData = [...state.currentWorkout.exerciseData];
      updatedExerciseData[exerciseIndex] = {
        ...updatedExerciseData[exerciseIndex],
        sets: [...updatedExerciseData[exerciseIndex].sets, newSet],
      };

      return {
        ...state,
        currentWorkout: {
          ...state.currentWorkout,
          exerciseData: updatedExerciseData,
          totalSets: state.currentWorkout.totalSets + 1,
          totalVolume: state.currentWorkout.totalVolume + (newSet.weight || 0) * (newSet.reps || 0),
        },
      };
    });
  },
  startRestTimer: (duration: number) => set({ restTimer: duration }),
  stopRestTimer: () => set({ restTimer: null }),
  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

export const useExerciseLibrary = create<ExerciseLibraryState>((set, get) => ({
  exercises: [],
  searchResults: [],
  isSearching: false,
  searchExercises: async (query: string, muscleGroups: MuscleGroup[]) => {
    set({ isSearching: true });
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const exercises = get().exercises;
      const searchTerm = query.toLowerCase();

      const results = exercises.filter(exercise => {
        const matchesQuery = !searchTerm || exercise.name.toLowerCase().includes(searchTerm);
        const matchesMuscleGroups =
          !muscleGroups.length || exercise.muscleGroups.some(group => muscleGroups.includes(group));
        return matchesQuery && matchesMuscleGroups;
      });

      set({ searchResults: results, isSearching: false });
    } catch (error) {
      set({ isSearching: false });
      throw error;
    }
  },
}));

export const useWorkoutDetails = create<WorkoutDetailsState>(set => ({
  workout: null,
  loading: false,
  error: null,
  loadWorkout: async (workoutId: string) => {
    set({ loading: true });
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const workout: WorkoutSession = {
        id: workoutId,
        userId: 'user-123',
        name: 'Sample Workout',
        exerciseData: [],
        date: new Date().toISOString(),
        duration: 0,
        totalSets: 0,
        totalVolume: 0,
        createdAt: new Date().toISOString(),
      };
      set({ workout, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
