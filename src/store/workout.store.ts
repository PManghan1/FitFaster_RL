import { z } from 'zod';
import { create } from 'zustand';

import { Exercise, MuscleGroup, Set, Workout } from '../types/workout';

interface WorkoutStore {
  workouts: Workout[];
  currentWorkout: Workout | null;
  exercises: Exercise[];
  searchTerm: string;
  selectedMuscleGroup: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  addWorkout: (workout: Workout) => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  setCurrentWorkout: (workout: Workout | null) => void;
  addSet: (workoutId: string, set: Set) => void;
  updateSet: (workoutId: string, set: Set) => void;
  removeSet: (workoutId: string, setId: string) => void;
  setSearchTerm: (term: string) => void;
  setSelectedMuscleGroup: (group: string | null) => void;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutStore>(setState => ({
  workouts: [],
  currentWorkout: null,
  exercises: [],
  searchTerm: '',
  selectedMuscleGroup: null,
  loading: false,
  error: null,

  addWorkout: (workout: Workout) =>
    setState((state: WorkoutStore) => ({
      workouts: [...state.workouts, workout],
    })),

  updateWorkout: (workout: Workout) =>
    setState((state: WorkoutStore) => ({
      workouts: state.workouts.map(w => (w.id === workout.id ? workout : w)),
    })),

  deleteWorkout: (id: string) =>
    setState((state: WorkoutStore) => ({
      workouts: state.workouts.filter(w => w.id !== id),
    })),

  setCurrentWorkout: (workout: Workout | null) => setState({ currentWorkout: workout }),

  addSet: (workoutId: string, newSet: Set) =>
    setState((state: WorkoutStore) => ({
      workouts: state.workouts.map(w =>
        w.id === workoutId ? { ...w, sets: [...w.sets, newSet] } : w,
      ),
    })),

  updateSet: (workoutId: string, updatedSet: Set) =>
    setState((state: WorkoutStore) => ({
      workouts: state.workouts.map(w =>
        w.id === workoutId
          ? { ...w, sets: w.sets.map(s => (s.id === updatedSet.id ? updatedSet : s)) }
          : w,
      ),
    })),

  removeSet: (workoutId: string, setId: string) =>
    setState((state: WorkoutStore) => ({
      workouts: state.workouts.map(w =>
        w.id === workoutId ? { ...w, sets: w.sets.filter(s => s.id !== setId) } : w,
      ),
    })),

  setSearchTerm: (term: string) => setState({ searchTerm: term }),

  setSelectedMuscleGroup: (group: string | null) => setState({ selectedMuscleGroup: group }),

  reset: () =>
    setState({
      workouts: [],
      currentWorkout: null,
      exercises: [],
      searchTerm: '',
      selectedMuscleGroup: null,
      loading: false,
      error: null,
    }),
}));

// Custom hooks for specific functionality
export const useWorkoutDetails = (workoutId: string) => {
  const workout = useWorkoutStore(state => state.workouts.find(w => w.id === workoutId));
  const { updateSet, addSet, removeSet } = useWorkoutStore();
  const loading = useWorkoutStore(state => state.loading);
  const error = useWorkoutStore(state => state.error);

  return {
    workout,
    loading,
    error,
    updateSet: (set: Set) => updateSet(workoutId, set),
    addSet: (set: Set) => addSet(workoutId, set),
    removeSet: (setId: string) => removeSet(workoutId, setId),
  };
};

// Hook for exercise library functionality
export const useExerciseLibrary = () => {
  const exercises = useWorkoutStore(state => state.exercises);
  const searchTerm = useWorkoutStore(state => state.searchTerm);
  const selectedMuscleGroup = useWorkoutStore(state => state.selectedMuscleGroup);
  const { setSearchTerm, setSelectedMuscleGroup } = useWorkoutStore();

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup =
      !selectedMuscleGroup ||
      exercise.muscleGroups.includes(selectedMuscleGroup as z.infer<typeof MuscleGroup>);
    return matchesSearch && matchesMuscleGroup;
  });

  return {
    exercises,
    searchTerm,
    setSearchTerm,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    filteredExercises,
  };
};
