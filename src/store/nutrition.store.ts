import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { nutritionService } from '../services/nutrition';
import { DailyNutrition, FoodItem, MealEntry, MealType, NutritionGoal } from '../types/nutrition';

export interface NutritionState {
  // Current State
  currentDate: string;
  dailyNutrition: DailyNutrition | null;
  nutritionGoal: NutritionGoal | null;
  isLoading: boolean;
  error: string | null;

  // Food Items
  searchResults: FoodItem[];
  selectedFoodItem: FoodItem | null;
  isSearching: boolean;
  searchError: string | null;

  // Actions
  setCurrentDate: (date: string) => void;
  loadDailyNutrition: (userId: string, date: string) => Promise<void>;
  searchFoodItems: (query: string) => Promise<void>;
  selectFoodItem: (foodItem: FoodItem | null) => void;
  addMealEntry: (
    userId: string,
    foodId: string,
    mealType: MealType,
    servingIndex: number,
    servingAmount: number,
    notes?: string,
  ) => Promise<void>;
  updateMealEntry: (
    entryId: string,
    updates: Partial<Omit<MealEntry, 'id' | 'userId' | 'createdAt'>>,
  ) => Promise<void>;
  deleteMealEntry: (entryId: string) => Promise<void>;
  setNutritionGoal: (
    userId: string,
    goal: Omit<NutritionGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ) => Promise<void>;
  addFoodItem: (foodItem: FoodItem) => void;
  reset: () => void;
}

const initialState = {
  currentDate: new Date().toISOString().split('T')[0],
  dailyNutrition: null,
  nutritionGoal: null,
  isLoading: false,
  error: null,
  searchResults: [],
  selectedFoodItem: null,
  isSearching: false,
  searchError: null,
};

export const useNutritionStore = create<NutritionState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentDate: date => {
        set({ currentDate: date });
      },

      loadDailyNutrition: async (userId, date) => {
        try {
          set({ isLoading: true, error: null });
          const dailyNutrition = await nutritionService.getDailyNutrition(userId, date);
          set({ dailyNutrition });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load nutrition data' });
        } finally {
          set({ isLoading: false });
        }
      },

      searchFoodItems: async query => {
        try {
          set({ isSearching: true, searchError: null });
          const results = await nutritionService.searchFoodItems(query);
          set({ searchResults: results });
        } catch (error) {
          set({
            searchError: error instanceof Error ? error.message : 'Failed to search food items',
          });
        } finally {
          set({ isSearching: false });
        }
      },

      selectFoodItem: foodItem => {
        set({ selectedFoodItem: foodItem });
      },

      addMealEntry: async (userId, foodId, mealType, servingIndex, servingAmount, notes) => {
        try {
          set({ isLoading: true, error: null });
          const entry = {
            userId,
            foodId,
            mealType,
            servingIndex,
            servingAmount,
            date: get().currentDate,
            notes,
          };
          await nutritionService.addMealEntry(entry);
          await get().loadDailyNutrition(userId, get().currentDate);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add meal entry' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateMealEntry: async (entryId, updates) => {
        try {
          set({ isLoading: true, error: null });
          await nutritionService.updateMealEntry(entryId, updates);
          const { dailyNutrition } = get();
          if (dailyNutrition) {
            const firstMealType = Object.keys(dailyNutrition.meals)[0] as MealType;
            const firstEntry = dailyNutrition.meals[firstMealType][0];
            if (firstEntry) {
              await get().loadDailyNutrition(firstEntry.entry.userId, get().currentDate);
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update meal entry' });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteMealEntry: async entryId => {
        try {
          set({ isLoading: true, error: null });
          await nutritionService.deleteMealEntry(entryId);
          const { dailyNutrition } = get();
          if (dailyNutrition) {
            const firstMealType = Object.keys(dailyNutrition.meals)[0] as MealType;
            const firstEntry = dailyNutrition.meals[firstMealType][0];
            if (firstEntry) {
              await get().loadDailyNutrition(firstEntry.entry.userId, get().currentDate);
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete meal entry' });
        } finally {
          set({ isLoading: false });
        }
      },

      setNutritionGoal: async (userId, goal) => {
        try {
          set({ isLoading: true, error: null });
          await nutritionService.setNutritionGoal({ ...goal, userId });
          await get().loadDailyNutrition(userId, get().currentDate);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to set nutrition goal' });
        } finally {
          set({ isLoading: false });
        }
      },

      addFoodItem: foodItem => {
        set(state => ({
          searchResults: [...state.searchResults, foodItem],
        }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'nutrition-store' },
  ),
);

// Selector hooks for common state combinations
export const useNutritionData = () => {
  return useNutritionStore(state => ({
    currentDate: state.currentDate,
    dailyNutrition: state.dailyNutrition,
    nutritionGoal: state.nutritionGoal,
    isLoading: state.isLoading,
    error: state.error,
    setCurrentDate: state.setCurrentDate,
    loadDailyNutrition: state.loadDailyNutrition,
  }));
};

export const useFoodSearch = () => {
  return useNutritionStore(state => ({
    searchResults: state.searchResults,
    selectedFoodItem: state.selectedFoodItem,
    isSearching: state.isSearching,
    error: state.searchError,
    searchFoodItems: state.searchFoodItems,
    selectFoodItem: state.selectFoodItem,
  }));
};

export const useMealActions = () => {
  return useNutritionStore(state => ({
    addMealEntry: state.addMealEntry,
    updateMealEntry: state.updateMealEntry,
    deleteMealEntry: state.deleteMealEntry,
  }));
};
