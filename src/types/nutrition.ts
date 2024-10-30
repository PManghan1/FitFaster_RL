import { z } from 'zod';
import type { BaseStore } from '../store/types';

// Enums
export const MealType = z.enum([
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
]);

export const ServingUnit = z.enum([
  'G',
  'ML',
  'OZ',
  'CUP',
  'TBSP',
  'TSP',
  'PIECE',
  'SERVING',
]);

// Base Schemas
export const nutrientSchema = z.object({
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
});

export const servingSchema = z.object({
  amount: z.number().min(0),
  unit: ServingUnit,
  nutrients: nutrientSchema,
});

export const foodItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  brand: z.string().optional(),
  servings: z.array(servingSchema),
  defaultServing: z.number().min(0),
  barcode: z.string().optional(),
  isCustom: z.boolean().default(false),
  userId: z.string().uuid().optional(), // For custom foods
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const mealEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  foodId: z.string().uuid(),
  mealType: MealType,
  servingIndex: z.number().min(0),
  servingAmount: z.number().min(0),
  notes: z.string().optional(),
  date: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const nutritionGoalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Export Types
export type MealType = z.infer<typeof MealType>;
export type ServingUnit = z.infer<typeof ServingUnit>;
export type Nutrients = z.infer<typeof nutrientSchema>;
export type Serving = z.infer<typeof servingSchema>;
export type FoodItem = z.infer<typeof foodItemSchema>;
export type MealEntry = z.infer<typeof mealEntrySchema>;
export type NutritionGoal = z.infer<typeof nutritionGoalSchema>;

// Store Types
export interface NutritionState {
  foodItems: FoodItem[];
  mealEntries: MealEntry[];
  nutritionGoal: NutritionGoal | null;
  dailyNutrition: DailyNutrition | null;
  isLoading: boolean;
  error: string | null;
}

export interface NutritionStore extends NutritionState, BaseStore {
  // Food Items
  loadFoodItems: () => Promise<void>;
  addFoodItem: (food: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFoodItem: (id: string, data: Partial<FoodItem>) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;

  // Meal Entries
  loadMealEntries: (date: string) => Promise<void>;
  addMealEntry: (entry: Omit<MealEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateMealEntry: (id: string, data: Partial<MealEntry>) => Promise<void>;
  deleteMealEntry: (id: string) => Promise<void>;

  // Nutrition Goals
  loadNutritionGoal: () => Promise<void>;
  updateNutritionGoal: (goal: Partial<NutritionGoal>) => Promise<void>;

  // Daily Nutrition
  loadDailyNutrition: (date: string) => Promise<void>;
}

// Database Types
export interface Database {
  public: {
    Tables: {
      food_items: {
        Row: FoodItem;
        Insert: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      meal_entries: {
        Row: MealEntry;
        Insert: Omit<MealEntry, 'id' | 'createdAt'>;
        Update: Partial<Omit<MealEntry, 'id' | 'createdAt'>>;
      };
      nutrition_goals: {
        Row: NutritionGoal;
        Insert: Omit<NutritionGoal, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<NutritionGoal, 'id' | 'createdAt' | 'updatedAt'>>;
      };
    };
  };
}

// Helper Types
export interface DailyNutrition {
  date: string;
  meals: {
    [K in MealType]: Array<{
      entry: MealEntry;
      food: FoodItem;
      nutrients: Nutrients;
    }>;
  };
  totals: Nutrients;
  goal?: NutritionGoal;
}

export interface NutritionSummary {
  date: string;
  calories: {
    current: number;
    goal: number;
    remaining: number;
  };
  macros: {
    protein: { current: number; goal: number };
    carbs: { current: number; goal: number };
    fat: { current: number; goal: number };
  };
  meals: {
    [K in MealType]: {
      count: number;
      calories: number;
    };
  };
}

// Constants
export const DEFAULT_NUTRITION_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  fiber: 30,
} as const;

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
} as const;

export const SERVING_UNIT_LABELS: Record<ServingUnit, string> = {
  G: 'grams',
  ML: 'milliliters',
  OZ: 'ounces',
  CUP: 'cups',
  TBSP: 'tablespoons',
  TSP: 'teaspoons',
  PIECE: 'pieces',
  SERVING: 'servings',
} as const;
