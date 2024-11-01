import { SupabaseClient } from '@supabase/supabase-js';

import {
  DailyNutrition,
  Database,
  FoodItem,
  MealEntry,
  Nutrients,
  NutritionGoal,
} from '../types/nutrition';

import { supabase } from './supabase';

interface MealEntryWithFood extends MealEntry {
  food: FoodItem;
}

class NutritionService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = supabase;
  }

  // Food Items
  async getFoodItem(id: string): Promise<FoodItem> {
    const { data, error } = await this.supabase.from('food_items').select().eq('id', id).single();

    if (error) throw error;
    if (!data) throw new Error('Food item not found');
    return data as unknown as FoodItem;
  }

  async searchFoodItems(query: string): Promise<FoodItem[]> {
    const { data, error } = await this.supabase
      .from('food_items')
      .select()
      .ilike('name', `%${query}%`);

    if (error) throw error;
    return (data || []) as unknown as FoodItem[];
  }

  async createFoodItem(
    foodItem: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FoodItem> {
    const { data, error } = await this.supabase
      .from('food_items')
      .insert([foodItem])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create food item');
    return data as unknown as FoodItem;
  }

  // Meal Entries
  async getMealEntries(userId: string, date: string): Promise<MealEntryWithFood[]> {
    const { data, error } = await this.supabase
      .from('meal_entries')
      .select(
        `
        *,
        food:food_items (*)
      `,
      )
      .eq('userId', userId)
      .eq('date', date);

    if (error) throw error;
    return (data || []) as unknown as MealEntryWithFood[];
  }

  async addMealEntry(entry: Omit<MealEntry, 'id' | 'createdAt'>): Promise<MealEntry> {
    const { data, error } = await this.supabase
      .from('meal_entries')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to add meal entry');
    return data as unknown as MealEntry;
  }

  async updateMealEntry(
    id: string,
    updates: Partial<Omit<MealEntry, 'id' | 'createdAt'>>,
  ): Promise<MealEntry> {
    const { data, error } = await this.supabase
      .from('meal_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update meal entry');
    return data as unknown as MealEntry;
  }

  async deleteMealEntry(id: string): Promise<void> {
    const { error } = await this.supabase.from('meal_entries').delete().eq('id', id);

    if (error) throw error;
  }

  // Nutrition Goals
  async getNutritionGoal(userId: string): Promise<NutritionGoal | null> {
    const { data, error } = await this.supabase
      .from('nutrition_goals')
      .select()
      .eq('userId', userId)
      .is('endDate', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as unknown as NutritionGoal | null;
  }

  async setNutritionGoal(
    goal: Omit<NutritionGoal, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<NutritionGoal> {
    // End current active goal if exists
    await this.supabase
      .from('nutrition_goals')
      .update({ endDate: new Date().toISOString() })
      .eq('userId', goal.userId)
      .is('endDate', null);

    // Create new goal
    const { data, error } = await this.supabase
      .from('nutrition_goals')
      .insert([goal])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to set nutrition goal');
    return data as unknown as NutritionGoal;
  }

  // Fetch Food Item by Barcode using OpenFoodFacts API
  async fetchFoodItemByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      );

      if (!response.ok) {
        console.error('OpenFoodFacts API error:', response.statusText);
        return null;
      }

      const data = await response.json();

      if (!data || !data.product || data.status !== 1) {
        return null;
      }

      const product = data.product;

      // Convert OpenFoodFacts data to our FoodItem format
      const foodItem: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'> = {
        name: product.product_name || 'Unknown Product',
        brand: product.brands || 'Unknown Brand',
        servings: [
          {
            amount: parseFloat(product.serving_quantity) || 100,
            unit: this.determineUnit(product.serving_quantity_unit),
            nutrients: {
              calories: parseFloat(product.nutriments['energy-kcal_100g']) || 0,
              protein: parseFloat(product.nutriments.proteins_100g) || 0,
              carbs: parseFloat(product.nutriments.carbohydrates_100g) || 0,
              fat: parseFloat(product.nutriments.fat_100g) || 0,
              fiber: parseFloat(product.nutriments.fiber_100g) || undefined,
              sugar: parseFloat(product.nutriments.sugars_100g) || undefined,
              sodium: parseFloat(product.nutriments.sodium_100g) || undefined,
            },
          },
        ],
        defaultServing: 0,
        barcode,
        isCustom: false,
      };

      // Check if the food item already exists in the database
      const { data: existingItem, error: existingError } = await this.supabase
        .from('food_items')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existingItem) {
        return existingItem as unknown as FoodItem;
      }

      // Create the food item in the database
      const createdFoodItem = await this.createFoodItem(foodItem);
      return createdFoodItem;
    } catch (error) {
      console.error('Failed to fetch food item by barcode:', error);
      return null;
    }
  }

  // Helper method to determine the unit from OpenFoodFacts data
  private determineUnit(
    unit?: string,
  ): 'G' | 'ML' | 'OZ' | 'CUP' | 'TBSP' | 'TSP' | 'PIECE' | 'SERVING' {
    if (!unit) return 'SERVING';

    const normalizedUnit = unit.toLowerCase();
    if (normalizedUnit.includes('g')) return 'G';
    if (normalizedUnit.includes('ml')) return 'ML';
    if (normalizedUnit.includes('oz')) return 'OZ';
    if (normalizedUnit.includes('cup')) return 'CUP';
    if (normalizedUnit.includes('tbsp') || normalizedUnit.includes('tablespoon')) return 'TBSP';
    if (normalizedUnit.includes('tsp') || normalizedUnit.includes('teaspoon')) return 'TSP';
    if (normalizedUnit.includes('piece') || normalizedUnit.includes('pc')) return 'PIECE';

    return 'SERVING';
  }

  // Helper Methods
  async getDailyNutrition(userId: string, date: string): Promise<DailyNutrition> {
    const [entries, goal] = await Promise.all([
      this.getMealEntries(userId, date),
      this.getNutritionGoal(userId),
    ]);

    const meals = entries.reduce(
      (acc, entry) => {
        const mealType = entry.mealType;
        if (!acc[mealType]) {
          acc[mealType] = [];
        }

        const serving = entry.food.servings[entry.servingIndex];
        const nutrients: Nutrients = {
          calories: serving.nutrients.calories * entry.servingAmount,
          protein: serving.nutrients.protein * entry.servingAmount,
          carbs: serving.nutrients.carbs * entry.servingAmount,
          fat: serving.nutrients.fat * entry.servingAmount,
          fiber: serving.nutrients.fiber
            ? serving.nutrients.fiber * entry.servingAmount
            : undefined,
          sugar: serving.nutrients.sugar
            ? serving.nutrients.sugar * entry.servingAmount
            : undefined,
          sodium: serving.nutrients.sodium
            ? serving.nutrients.sodium * entry.servingAmount
            : undefined,
        };

        acc[mealType].push({ entry, food: entry.food, nutrients });
        return acc;
      },
      {} as DailyNutrition['meals'],
    );

    const totals = entries.reduce(
      (acc, entry) => {
        const serving = entry.food.servings[entry.servingIndex];
        const multiplier = entry.servingAmount;

        acc.calories += serving.nutrients.calories * multiplier;
        acc.protein += serving.nutrients.protein * multiplier;
        acc.carbs += serving.nutrients.carbs * multiplier;
        acc.fat += serving.nutrients.fat * multiplier;
        if (serving.nutrients.fiber)
          acc.fiber = (acc.fiber || 0) + serving.nutrients.fiber * multiplier;
        if (serving.nutrients.sugar)
          acc.sugar = (acc.sugar || 0) + serving.nutrients.sugar * multiplier;
        if (serving.nutrients.sodium)
          acc.sodium = (acc.sodium || 0) + serving.nutrients.sodium * multiplier;

        return acc;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      } as Nutrients,
    );

    return {
      date,
      meals,
      totals,
      goal: goal || undefined,
    };
  }
}

export const nutritionService = new NutritionService();
