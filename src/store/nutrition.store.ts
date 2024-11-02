import create from 'zustand';

import { NutritionLogEntry } from '../types/nutrition';

interface NutritionState {
  meals: NutritionLogEntry[];
  isLoading: boolean;
  error: string | null;
  addMeal: (meal: NutritionLogEntry) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useNutritionStore = create<NutritionState>(set => ({
  meals: [],
  isLoading: false,
  error: null,
  addMeal: meal => set(state => ({ meals: [...state.meals, meal] })),
  setError: error => set({ error }),
  setLoading: loading => set({ isLoading: loading }),
}));
