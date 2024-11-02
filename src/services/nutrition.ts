import { analyticsService } from './analytics';
import { performanceMonitoring } from './performance';
import { supabase } from './supabase';

interface NutritionLogEntry {
  id: string;
  userId: string;
  type: 'meal' | 'supplement';
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  timestamp: string;
}

class NutritionService {
  private static instance: NutritionService;

  private constructor() {}

  static getInstance(): NutritionService {
    if (!NutritionService.instance) {
      NutritionService.instance = new NutritionService();
    }
    return NutritionService.instance;
  }

  async logMeal(
    data: Omit<NutritionLogEntry, 'id' | 'userId' | 'timestamp' | 'type'>,
  ): Promise<void> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const entry: Omit<NutritionLogEntry, 'id'> = {
        userId: user.id,
        type: 'meal',
        timestamp: new Date().toISOString(),
        ...data,
      };

      const insertPromise = async () => {
        const { error } = await supabase.from('nutrition_logs').insert([entry]);
        if (error) throw error;
      };

      await performanceMonitoring.measureApiCall(insertPromise(), 'log_meal', {
        mealName: data.name,
      });

      // Track analytics
      analyticsService.trackNutrition('meal', {
        meal_name: data.name,
        calories: data.calories,
        success: true,
      });
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  async logSupplement(
    data: Omit<NutritionLogEntry, 'id' | 'userId' | 'timestamp' | 'type'>,
  ): Promise<void> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const entry: Omit<NutritionLogEntry, 'id'> = {
        userId: user.id,
        type: 'supplement',
        timestamp: new Date().toISOString(),
        ...data,
      };

      const insertPromise = async () => {
        const { error } = await supabase.from('nutrition_logs').insert([entry]);
        if (error) throw error;
      };

      await performanceMonitoring.measureApiCall(insertPromise(), 'log_supplement', {
        supplementName: data.name,
      });

      // Track analytics
      analyticsService.trackNutrition('supplement', {
        supplement_name: data.name,
        success: true,
      });
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  async scanFood(barcode: string): Promise<void> {
    try {
      // TODO: Implement food scanning API integration
      const promise = new Promise<void>(resolve => {
        setTimeout(resolve, 1000);
      });

      await performanceMonitoring.measureApiCall(promise, 'scan_food', { barcode });

      // Track analytics
      analyticsService.trackNutrition('scan', {
        barcode,
        success: true,
      });
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }
}

export const nutritionService = NutritionService.getInstance();
